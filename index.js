require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(process.env.PROJECT_URL, process.env.API_KEY);
const TelegramBot = require("node-telegram-bot-api");
const { Op } = require("sequelize");
const fs = require("fs");
const {
  commands,
  commandsForNew,
  menuKeyboard,
  editProfileKeyboard,
  like,
  likeKeyboard,
} = require("./const");
const {
  sendMsgWithKeyboard,
  openKeyboard,
  forceReply,
  getProfile,
  getOtherProfile,
} = require("./functions");
require("dotenv").config();
const { User, Like } = require("./db/models");

const bot = new TelegramBot(process.env.API_TOKEN, { polling: true });

bot.setMyCommands(commands);
let find;

let showingUser;
let prevUser;
bot.on("message", async (msg) => {
  const { text } = msg;
  const chatId = msg.chat.id;

  try {
    if (msg.from.username === undefined) {
      await bot.sendMessage(
        chatId,
        "Необходимо имя пользователя чтобы использовать бота"
      );
    } else {
      const existingUser = await User.findOne({
        where: { username: msg.from.username },
      });

      if (text === "/start") {
        if (existingUser === null) {
          let user;

          const namePrompt = await bot.sendMessage(
            chatId,
            `Привет👋🏻, как тебя зовут? `,
            forceReply()
          );

          bot.onReplyToMessage(
            chatId,
            namePrompt.message_id,
            async (nameMsg) => {
              const name = nameMsg.text;
              user = await User.create({
                username: msg.chat.username,
                chat_id: chatId,
                first_name: name,
              });

              const ageQuestion = await bot.sendMessage(
                chatId,
                "Сколько тебе лет?",
                forceReply()
              );
              bot.onReplyToMessage(
                chatId,
                ageQuestion.message_id,
                async (ageAnswer) => {
                  const age = ageAnswer.text;
                  await user.update({ age: age });
                  const sexQuestion = await bot.sendMessage(
                    chatId,
                    "Твой пол?(Парень/Девушка)",
                    forceReply()
                  );

                  bot.onReplyToMessage(
                    chatId,
                    sexQuestion.message_id,
                    async (sexAnswer) => {
                      const sex = sexAnswer.text;
                      await user.update({ sex: sex });

                      const lagQuestion = await bot.sendMessage(
                        chatId,
                        `Какой язык изучаешь? `,
                        forceReply()
                      );

                      bot.onReplyToMessage(
                        chatId,
                        lagQuestion.message_id,
                        async (langAnswer) => {
                          const lang = langAnswer.text;

                          await user.update({ lang_code: lang });
                          await bot.sendMessage(chatId, ` ${lang}, круто!`);
                          const infoQuestion = await bot.sendMessage(
                            chatId,
                            "Добавь описание к своей анкете:",
                            forceReply()
                          );
                          bot.onReplyToMessage(
                            chatId,
                            infoQuestion.message_id,
                            async (infoAnswer) => {
                              const info = infoAnswer.text;
                              await user.update({ info: info });
                              const photoQuestion = await bot.sendMessage(
                                chatId,
                                "Отправь фото/видео(не более 15 секунд!)",
                                forceReply()
                              );
                              bot.onReplyToMessage(
                                chatId,
                                photoQuestion.message_id,
                                async (photoAnswer) => {
                                  if (photoAnswer.photo) {
                                    const photo = photoAnswer.photo;

                                    await user.update({ video: null });
                                    const fileInfo = await bot.getFile(
                                      photo[photo.length - 1].file_id
                                    );
                                    const link = await bot.getFileLink(
                                      photo[photo.length - 1].file_id
                                    );
                                    const res = await fetch(link);
                                    const fileBuffer = await res.arrayBuffer();

                                    const blob = new Blob([fileBuffer], {
                                      type: "image/jpeg",
                                    });

                                    const supPhoto = await supabase.storage
                                      .from("pfp")
                                      .upload(
                                        `photos/${fileInfo.file_unique_id}`,
                                        blob,
                                        {
                                          upsert: true,
                                        }
                                      );
                                    await user.update({
                                      photo: `photos/${fileInfo.file_unique_id}`,
                                    });

                                    const { data } = supabase.storage
                                      .from("pfp")
                                      .getPublicUrl(user.photo);

                                    try {
                                      await getProfile(
                                        bot,
                                        chatId,
                                        user,
                                        data.publicUrl
                                      );
                                    } catch (e) {
                                      console.log(e.stack);
                                    }
                                    await sendMsgWithKeyboard(
                                      bot,
                                      chatId,
                                      `1.Смотреть анкету\n2.Изменить анкету\n3.Смотреть другие анкеты\n4.Закрыть меню`,
                                      menuKeyboard
                                    );
                                  }
                                  if (photoAnswer.video) {
                                    const video = photoAnswer.video;
                                    if (video.duration > 16) {
                                      const prompt = await bot.sendMessage(
                                        chatId,
                                        "Видео должно быть меньше 15 секунд!",
                                        forceReply()
                                      );
                                      bot.onReplyToMessage(
                                        chatId,
                                        prompt.message_id,
                                        async (ans) => {
                                          const video = ans.video;

                                          const fileInfo = await bot.getFile(
                                            video.file_id
                                          );
                                          await user.update({ photo: null });

                                          const link = await bot.getFileLink(
                                            video.file_id
                                          );
                                          const res = await fetch(link);
                                          const fileBuffer =
                                            await res.arrayBuffer();

                                          const blob = new Blob([fileBuffer], {
                                            type: "video/mp4",
                                          });

                                          const supPhoto =
                                            await supabase.storage
                                              .from("pfp")
                                              .upload(
                                                `videos/${fileInfo.file_unique_id}`,
                                                blob,
                                                {
                                                  upsert: true,
                                                }
                                              );
                                          await user.update({
                                            video: `videos/${fileInfo.file_unique_id}`,
                                          });

                                          const { data } = supabase.storage
                                            .from("pfp")
                                            .getPublicUrl(user.video);

                                          try {
                                            await getProfile(
                                              bot,
                                              chatId,
                                              user,
                                              data.publicUrl
                                            );
                                          } catch (e) {
                                            console.log(e.stack);
                                          }
                                          await sendMsgWithKeyboard(
                                            bot,
                                            chatId,
                                            `1.Смотреть анкету\n2.Изменить анкету\n3.Смотреть другие анкеты\n4.Закрыть меню`,
                                            menuKeyboard
                                          );
                                        }
                                      );
                                    } else {
                                      const fileInfo = await bot.getFile(
                                        video.file_id
                                      );
                                      await user.update({ photo: null });

                                      const link = await bot.getFileLink(
                                        video.file_id
                                      );
                                      const res = await fetch(link);
                                      const fileBuffer =
                                        await res.arrayBuffer();

                                      const blob = new Blob([fileBuffer], {
                                        type: "video/mp4",
                                      });

                                      const supPhoto = await supabase.storage
                                        .from("pfp")
                                        .upload(
                                          `videos/${fileInfo.file_unique_id}`,
                                          blob,
                                          {
                                            upsert: true,
                                          }
                                        );
                                      await user.update({
                                        video: `videos/${fileInfo.file_unique_id}`,
                                      });

                                      const { data } = supabase.storage
                                        .from("pfp")
                                        .getPublicUrl(user.video);

                                      try {
                                        await getProfile(
                                          bot,
                                          chatId,
                                          user,
                                          data.publicUrl
                                        );
                                      } catch (e) {
                                        console.log(e.stack);
                                      }
                                      await sendMsgWithKeyboard(
                                        bot,
                                        chatId,
                                        `1.Смотреть анкету\n2.Изменить анкету\n3.Смотреть другие анкеты\n4.Закрыть меню`,
                                        menuKeyboard
                                      );
                                    }
                                  }
                                }
                              );
                            }
                          );
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        } else {
          try {
            const { data } = supabase.storage
              .from("pfp")
              .getPublicUrl(
                existingUser.video ? existingUser.video : existingUser.photo
              );
            await getProfile(bot, chatId, existingUser, data.publicUrl);
            await sendMsgWithKeyboard(
              bot,
              chatId,
              `1.Смотреть анкету\n2.Изменить анкету\n3.Смотреть другие анкеты\n4.Закрыть меню`,
              menuKeyboard
            );
          } catch (e) {
            return bot.sendMessage(
              chatId,
              `Проблемка тут`,
              console.log(e.stack)
            );
          }
        }
      }
    }
    const user = await User.findOne({ where: { username: msg.from.username } });
    if (text === "/menu" && user !== null) {
      try {
        await sendMsgWithKeyboard(bot, chatId, "Меню бота:", menuKeyboard);
      } catch (e) {
        return bot.sendMessage(chatId, `Проблемка тут`, console.log(e.stack));
      }
    }
    if (text === "/menu" && user === null) {
      try {
        await bot.sendMessage(
          chatId,
          `Сначала придется зарегистрироваться :)\nВведи /start чтобы создать анкету`
        );
      } catch (e) {
        return bot.sendMessage(chatId, `Проблемка тут`, console.log(e.stack));
      }
    }
    if (text === "2.👎") {
      try {
        await Like.create({
          senderId: user.id,
          receiverId: showingUser.id,
          type: "dislike",
        });

        if (find.rows.length) {
          showingUser = find.rows[0];
          const { data } = supabase.storage
            .from("pfp")
            .getPublicUrl(
              showingUser.video ? showingUser.video : showingUser.photo
            );

          prevUser = getOtherProfile(
            bot,
            chatId,
            showingUser,
            likeKeyboard,
            data.publicUrl
          );
          find.rows.splice(0, 1);
        } else {
          await bot.sendMessage(chatId, "Это были все анкеты, что мы нашли(");
        }
      } catch (e) {
        return bot.sendMessage(chatId, `Проблемка тут`, console.log(e.stack));
      }
    }
    if (text === "1.❤️") {
      try {
        await Like.create({
          senderId: user.id,
          receiverId: showingUser.id,
          type: "like",
        });
        const liked = await Like.findOne({
          where: { senderId: showingUser.id, receiverId: user.id },
          include: { model: User, as: "Sender" },
        });

        if (liked !== null && liked.type === "like") {
          await bot.sendMessage(
            chatId,
            `Кажется у вас взаимная симпатия! Держи @${liked.Sender.username}`
          );
          await bot.sendMessage(
            liked.Sender.chat_id,
            ` Кажется у вас взаимная симпатия! Держи @${user.username}`
          );
        }
        if (find.rows.length) {
          showingUser = find.rows[0];
          const { data } = supabase.storage
            .from("pfp")
            .getPublicUrl(
              showingUser.video ? showingUser.video : showingUser.photo
            );

          prevUser = getOtherProfile(
            bot,
            chatId,
            showingUser,
            likeKeyboard,
            data.publicUrl
          );
          find.rows.splice(0, 1);
        } else {
          await bot.sendMessage(chatId, "Это были все анкеты, что мы нашли(");
        }
      } catch (e) {
        return bot.sendMessage(chatId, `Проблемка тут`, console.log(e.stack));
      }
    }

    switch (text) {
      case "1.Смотреть свою анкету":
        try {
          const { data } = supabase.storage
            .from("pfp")
            .getPublicUrl(user.video ? user.video : user.photo);
          await getProfile(bot, chatId, user, data.publicUrl);
          await sendMsgWithKeyboard(
            bot,
            chatId,
            `1.Смотреть анкету\n2.Изменить анкету\n3.Смотреть другие анкеты\n4.Закрыть меню`,
            menuKeyboard
          );
        } catch (e) {
          return bot.sendMessage(
            chatId,
            `Проблемка тут}`,
            console.log(e.stack)
          );
        }
        break;
      case "2.Изменить анкету":
        try {
          await sendMsgWithKeyboard(
            bot,
            chatId,
            "Что меняем?",
            editProfileKeyboard
          );
        } catch (e) {
          return bot.sendMessage(chatId, `Проблемка тут`, console.log(e.stack));
        }
        break;
      case "3.Смотреть другие анкеты":
        try {
          find = await User.findAndCountAll({
            where: {
              id: { [Op.not]: user.id },
              [Op.or]: [
                { lang_code: { [Op.substring]: user.lang_code } },
                { age: { [Op.between]: [+user.age - 1, +user.age + 1] } },
              ],
            },
            offset: 0,
          });

          if (find.count > 0) {
            const alreadyLiked = await Like.findAll({
              where: { senderId: user.id },
              as: "Sender",
            });

            for (let i = 0; i < find.rows.length; i++) {
              for (let j = 0; j < alreadyLiked.length; j++) {
                if (find.rows[i]?.id === alreadyLiked[j].receiverId) {
                  find.rows.splice(i, 1);
                }
              }
            }

            if (find.rows.length === 0) {
              await bot.sendMessage(chatId, "Новых анкет пока нет");
            } else {
              showingUser = find.rows[0];
              const { data } = supabase.storage
                .from("pfp")
                .getPublicUrl(
                  showingUser.video ? showingUser.video : showingUser.photo
                );

              prevUser = getOtherProfile(
                bot,
                chatId,
                showingUser,
                likeKeyboard,
                data.publicUrl
              );
              find.rows.splice(0, 1);
            }
            // else {
            //   await bot.sendMessage(chatId, "Новых анкет пока нет");
            // }
          } else {
            await bot.sendMessage(chatId, "Новых анкет пока нет(");
          }
        } catch (e) {
          return bot.sendMessage(chatId, `Проблемка тут`, console.log(e.stack));
        }

        break;
      case "4.Закрыть меню":
        try {
          bot.sendMessage(chatId, "Меню закрыто", {
            reply_markup: {
              remove_keyboard: true,
            },
          });
        } catch (e) {
          return bot.sendMessage(chatId, `Проблемка тут`, console.log(e.stack));
        }
        break;
    }

    switch (text) {
      case "1.Имя":
        try {
          const nameQ = await bot.sendMessage(
            chatId,
            "Введи новое имя",
            forceReply()
          );
          bot.onReplyToMessage(chatId, nameQ.message_id, async (msg) => {
            first_name = msg.text;

            await user.update({ first_name: first_name });
            const { data } = supabase.storage
              .from("pfp")
              .getPublicUrl(user.video ? user.video : user.photo);
            await getProfile(bot, chatId, user, data.publicUrl);
            await sendMsgWithKeyboard(
              bot,
              chatId,
              `1.Смотреть анкету\n2.Изменить анкету\n3.Смотреть другие анкеты\n4.Закрыть меню`,
              menuKeyboard
            );
          });
        } catch (e) {
          return bot.sendMessage(chatId, `Проблемка тут`, console.log(e.stack));
        }
        break;
      case "2.Фото/Видео":
        try {
          const photoQ = await bot.sendMessage(
            chatId,
            "Отправь новое фото/видео(меньше 15 секунд!)",
            forceReply()
          );
          bot.onReplyToMessage(
            chatId,
            photoQ.message_id,
            async (photoAnswer) => {
              if (photoAnswer.photo) {
                const photo = photoAnswer.photo;
                await user.update({ video: null });
                const fileInfo = await bot.getFile(
                  photo[photo.length - 1].file_id
                );
                const link = await bot.getFileLink(
                  photo[photo.length - 1].file_id
                );

                const res = await fetch(link);
                const fileBuffer = await res.arrayBuffer();
                const blob = new Blob([fileBuffer], { type: "image/jpeg" });

                const supPhoto = await supabase.storage
                  .from("pfp")
                  .upload(`photos/${fileInfo.file_unique_id}`, blob, {
                    upsert: true,
                  });

                await user.update({
                  photo: `photos/${fileInfo.file_unique_id}`,
                });

                const { data } = supabase.storage
                  .from("pfp")
                  .getPublicUrl(user.photo);

                try {
                  await getProfile(bot, chatId, user, data.publicUrl);
                } catch (e) {
                  console.log(e.stack);
                }
                await sendMsgWithKeyboard(
                  bot,
                  chatId,
                  `1.Смотреть анкету\n2.Изменить анкету\n3.Смотреть другие анкеты\n4.Закрыть меню`,
                  menuKeyboard
                );
              }
              if (photoAnswer.video) {
                const video = photoAnswer.video;
                if (video.duration > 16) {
                  const prompt = await bot.sendMessage(
                    chatId,
                    "Видео должно быть меньше 15 секунд!",
                    forceReply()
                  );
                  bot.onReplyToMessage(
                    chatId,
                    prompt.message_id,
                    async (ans) => {
                      const video = ans.video;
                      const fileInfo = await bot.getFile(video.file_id);

                      await user.update({ photo: null });

                      const link = await bot.getFileLink(video.file_id);
                      const res = await fetch(link);
                      const fileBuffer = await res.arrayBuffer();

                      const blob = new Blob([fileBuffer], {
                        type: "video/mp4",
                      });

                      const supPhoto = await supabase.storage
                        .from("pfp")
                        .upload(`videos/${fileInfo.file_unique_id}`, blob, {
                          upsert: true,
                        });
                      await user.update({
                        video: `videos/${fileInfo.file_unique_id}`,
                      });

                      const { data } = supabase.storage
                        .from("pfp")
                        .getPublicUrl(user.video);

                      try {
                        await getProfile(bot, chatId, user, data.publicUrl);
                      } catch (e) {
                        console.log(e.stack);
                      }
                      await sendMsgWithKeyboard(
                        bot,
                        chatId,
                        `1.Смотреть анкету\n2.Изменить анкету\n3.Смотреть другие анкеты\n4.Закрыть меню`,
                        menuKeyboard
                      );
                    }
                  );
                } else {
                  const fileInfo = await bot.getFile(video.file_id);
                  await user.update({ photo: null });

                  const link = await bot.getFileLink(video.file_id);
                  const res = await fetch(link);
                  const fileBuffer = await res.arrayBuffer();

                  const blob = new Blob([fileBuffer], {
                    type: "video/mp4",
                  });

                  const supPhoto = await supabase.storage
                    .from("pfp")
                    .upload(`videos/${fileInfo.file_unique_id}`, blob, {
                      upsert: true,
                    });
                  await user.update({
                    video: `videos/${fileInfo.file_unique_id}`,
                  });

                  const { data } = supabase.storage
                    .from("pfp")
                    .getPublicUrl(user.video);

                  try {
                    await getProfile(bot, chatId, user, data.publicUrl);
                  } catch (e) {
                    console.log(e.stack);
                  }
                  await sendMsgWithKeyboard(
                    bot,
                    chatId,
                    `1.Смотреть анкету\n2.Изменить анкету\n3.Смотреть другие анкеты\n4.Закрыть меню`,
                    menuKeyboard
                  );
                }
              }
            }
          );
        } catch (e) {
          return bot.sendMessage(
            chatId,
            `Проблемка тут`,
            console.log(e, e.stack)
          );
        }
        break;
      case "3.Описание":
        try {
          const infoQ = await bot.sendMessage(
            chatId,
            "Отправь новое описание",
            forceReply()
          );
          bot.onReplyToMessage(chatId, infoQ.message_id, async (infoA) => {
            const info = infoA.text;
            await user.update({ info: info });
            const { data } = supabase.storage
              .from("pfp")
              .getPublicUrl(user.video ? user.video : user.photo);
            await getProfile(bot, chatId, user, data.publicUrl);
            await sendMsgWithKeyboard(
              bot,
              chatId,
              `1.Смотреть анкету\n2.Изменить анкету\n3.Смотреть другие анкеты\n4.Закрыть меню`,
              menuKeyboard
            );
          });
        } catch (e) {
          return bot.sendMessage(
            chatId,
            `Проблемка тут}`,
            console.log(e.stack)
          );
        }
        break;
      case "4.Язык":
        try {
          const langQ = await bot.sendMessage(
            chatId,
            "Какой язык изучаешь?",
            forceReply()
          );
          bot.onReplyToMessage(chatId, langQ.message_id, async (langA) => {
            const lang = langA.text;
            await user.update({ lang_code: lang });
            const { data } = supabase.storage
              .from("pfp")
              .getPublicUrl(user.video ? user.video : user.photo);
            await getProfile(bot, chatId, user, data.publicUrl);
            await sendMsgWithKeyboard(
              bot,
              chatId,
              `1.Смотреть анкету\n2.Изменить анкету\n3.Смотреть другие анкеты\n4.Закрыть меню`,
              menuKeyboard
            );
          });
        } catch (e) {
          return bot.sendMessage(
            chatId,
            `Проблемка тут`,
            console.log(e, e.stack)
          );
        }
        break;
      case "5.Возраст":
        try {
          const ageQ = await bot.sendMessage(
            chatId,
            "Введи новый возраст",
            forceReply()
          );
          bot.onReplyToMessage(chatId, ageQ.message_id, async (ageA) => {
            const age = ageA.text;
            await user.update({ age: age });
            const { data } = supabase.storage
              .from("pfp")
              .getPublicUrl(user.video ? user.video : user.photo);
            await getProfile(bot, chatId, user, data.publicUrl);
            await sendMsgWithKeyboard(
              bot,
              chatId,
              `1.Смотреть анкету\n2.Изменить анкету\n3.Смотреть другие анкеты\n4.Закрыть меню`,
              menuKeyboard
            );
          });
        } catch (e) {
          return bot.sendMessage(
            chatId,
            `Проблемка тут`,
            console.log(e, e.stack)
          );
        }
        break;
      case "6.Пол":
        try {
          const sexQ = await bot.sendMessage(
            chatId,
            "Твой пол?(Парень/Девушка)",
            forceReply()
          );
          bot.onReplyToMessage(chatId, sexQ.message_id, async (sexA) => {
            const sex = sexA.text;
            await user.update({ sex: sex });
            const { data } = supabase.storage
              .from("pfp")
              .getPublicUrl(user.video ? user.video : user.photo);
            await getProfile(bot, chatId, user, data.publicUrl);
            await sendMsgWithKeyboard(
              bot,
              chatId,
              `1.Смотреть анкету\n2.Изменить анкету\n3.Смотреть другие анкеты\n4.Закрыть меню`,
              menuKeyboard
            );
          });
        } catch (e) {
          return bot.sendMessage(
            chatId,
            `Проблемка тут`,
            console.log(e, e.stack)
          );
        }
        break;
      case "Назад":
        try {
          const mKeyboard = await sendMsgWithKeyboard(
            bot,
            chatId,
            "Меню бота:",
            menuKeyboard
          );
          break;
        } catch (e) {
          return bot.sendMessage(
            chatId,
            `Проблемка тут`,
            console.log(e, e.stack)
          );
        }
    }
  } catch (e) {
    return bot.sendMessage(chatId, "Проблемка тут", console.log(e.stack));
  }
  // return bot.sendMessage(chatId, "ничего не понял(");
});
