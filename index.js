require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const { Op } = require("sequelize");
const {
  commands,
  commandsForNew,
  // opts,
  menuKeyboard,
  editProfileKeyboard,
  like,
  langKeyboard,
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

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

bot.setMyCommands(commands);
let find;
let liked;
let showingUser;
let prevUser;
bot.on("message", async (msg) => {
  const { text } = msg;
  const chatId = msg.chat.id;
  // console.log(JSON.parse(JSON.stringify(msg)));
  try {
    var originMessageID = msg["message_id"];
    if (text === "lol") {
      bot.sendMessage(chatId, "ahhaha", {
        reply_to_message_id: originMessageID,
      });
    }
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

        bot.onReplyToMessage(chatId, namePrompt.message_id, async (nameMsg) => {
          const name = nameMsg.text;
          user = await User.create({
            username: msg.chat.username,
            chat_id: chatId,
            first_name: name,
          });
          // await user.update({ first_name: name });
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
                            "Отправь фото для анкеты",
                            forceReply()
                          );
                          bot.onReplyToMessage(
                            chatId,
                            photoQuestion.message_id,
                            async (photoAnswer) => {
                              const photo = photoAnswer.photo;
                              const fileInfo = await bot.getFile(
                                photo[2].file_id
                              );
                              await user.update({ photo: fileInfo.file_path });
                              const pfp = await bot.downloadFile(
                                photo[2].file_id,
                                "./photos"
                              );

                              await getProfile(bot, chatId, user);
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
        });
      } else {
        await getProfile(bot, chatId, existingUser);
      }
    }
    const user = await User.findOne({ where: { username: msg.from.username } });
    if (text === "/menu" && existingUser !== null) {
      const mKeyboard = await sendMsgWithKeyboard(
        bot,
        chatId,
        "Меню бота:",
        menuKeyboard
      );
    }
    if (text === "/menu" && existingUser === null) {
      await bot.sendMessage(
        chatId,
        `Сначала придется зарегистрироваться :)\nВведи /start чтобы создать анкету`
      );
    }

    if (text === "❤️" && msg.message_id - 1 === prevUser.message_id) {
      await Like.create({ sender_id: user.id, receiver_id: showingUser.id });
      liked = find.rows.indexOf(showingUser);
      // find.splice(0, 1);
      find = await User.findAndCountAll({
        where: {
          id: { [Op.not]: user.id },
          [Op.or]: [
            { lang_code: { [Op.substring]: user.lang_code } },
            { age: { [Op.between]: [user.age - 1, user.age + 1] } },
          ],
        },
        offset: liked + 1,
        limit: 1,
      });
      console.log(find, "-------------------------");
      if (find.count > 0) {
        showingUser = find.rows[0];
        // console.log(JSON.parse(JSON.stringify(showingUser)));
        prevUser = getOtherProfile(bot, chatId, showingUser, likeKeyboard);
      } else {
        console.log("===========");
        await bot.sendMessage(chatId, "Нет анкет для показа");
      }
    }

    switch (text) {
      case "1.Смотреть свою анкету":
        await getProfile(bot, chatId, user);
        break;
      case "2.Изменить анкету":
        const eKeyboard = await sendMsgWithKeyboard(
          bot,
          chatId,
          "Что меняем?",
          editProfileKeyboard
        );
        break;
      case "3.Смотреть другие анкеты":
        // await bot.sendMessage(chatId, "Пока нельзя, в разработке");
        find = await User.findAndCountAll({
          where: {
            id: { [Op.not]: user.id },
            [Op.or]: [
              { lang_code: { [Op.substring]: user.lang_code } },
              { age: { [Op.between]: [user.age - 1, user.age + 1] } },
            ],
          },
          offset: 0,
          limit: 1,
        });
        console.log(find, "HAHAAHAHAHAHAHAHHA");
        if (find.count > 0) {
          showingUser = find.rows[0];
          prevUser = await getOtherProfile(
            bot,
            chatId,
            showingUser,
            likeKeyboard
          );
        } else {
          await bot.sendMessage(chatId, "Нет анкет для показа");
        }
        break;
      case "4.Закрыть меню":
        bot.sendMessage(chatId, "Меню закрыто", {
          reply_markup: {
            remove_keyboard: true,
          },
        });
        break;
    }

    switch (text) {
      case "1.Имя":
        const nameQ = await bot.sendMessage(
          chatId,
          "Введи новое имя",
          forceReply()
        );
        bot.onReplyToMessage(chatId, nameQ.message_id, async (msg) => {
          first_name = msg.text;
          // console.log(msg, "========");
          await user.update({ first_name: first_name });
          await getProfile(bot, chatId, user);
        });
        break;
      case "2.Фото":
        const photoQ = await bot.sendMessage(
          chatId,
          "Отправь новое фото",
          forceReply()
        );
        bot.onReplyToMessage(chatId, photoQ.message_id, async (photoA) => {
          const photo = photoA.photo;
          const fileInfo = await bot.getFile(photo[2].file_id);
          await user.update({ photo: fileInfo.file_path });
          const pfp = await bot.downloadFile(photo[2].file_id, "./photos");

          await getProfile(bot, chatId, user);
        });
        break;
      case "3.Описание":
        const infoQ = await bot.sendMessage(
          chatId,
          "Отправь новое описание",
          forceReply()
        );
        bot.onReplyToMessage(chatId, infoQ.message_id, async (infoA) => {
          const info = infoA.text;
          await user.update({ info: info });
          await getProfile(bot, chatId, user);
        });
        break;
      case "4.Язык":
        const langQ = await bot.sendMessage(
          chatId,
          "Какой язык изучаешь?",
          forceReply()
        );
        bot.onReplyToMessage(chatId, langQ.message_id, async (langA) => {
          const lang = langA.text;
          await user.update({ lang_code: lang });
          await getProfile(bot, chatId, user);
        });
        break;
      case "5.Возраст":
        const ageQ = await bot.sendMessage(
          chatId,
          "Введи новый возраст",
          forceReply()
        );
        bot.onReplyToMessage(chatId, ageQ.message_id, async (ageA) => {
          const age = ageA.text;
          await user.update({ age: age });
          await getProfile(bot, chatId, user);
        });
        break;
      case "6.Пол":
        const sexQ = await bot.sendMessage(
          chatId,
          "Твой пол?(Парень/Девушка)",
          forceReply()
        );
        bot.onReplyToMessage(chatId, sexQ.message_id, async (sexA) => {
          const sex = sexA.text;
          await user.update({ sex: sex });
          await getProfile(bot, chatId, user);
        });
        break;
      case "Назад":
        const mKeyboard = await sendMsgWithKeyboard(
          bot,
          chatId,
          "Меню бота:",
          menuKeyboard
        );
        break;
    }
  } catch (e) {
    return bot.sendMessage(chatId, "Проблемка тут", console.log(e));
  }
  // return bot.sendMessage(chatId, "ничего не понял(");
});
