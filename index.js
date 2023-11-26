require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const {
  commands,
  // opts,
  menuKeyboard,
  editProfileKeyboard,
  langKeyboard,
} = require("./const");
const {
  sendMsgWithKeyboard,
  openKeyboard,
  forceReply,
  getProfile,
} = require("./functions");
require("dotenv").config();
const { User } = require("./db/models");

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

bot.setMyCommands(commands);

bot.on("message", async (msg) => {
  const { text } = msg;
  const chatId = msg.chat.id;

  try {
    if (text === "/start") {
      const [user, newUser] = await User.findOrCreate({
        where: { username: msg.chat.username },
        defaults: { username: msg.chat.username, chat_id: chatId },
      });
      if (!newUser) {
        await getProfile(bot, chatId, user);
      } else {
        const namePrompt = await bot.sendMessage(
          chatId,
          `Привет👋🏻, как тебя зовут? `,
          forceReply()
        );

        bot.onReplyToMessage(chatId, namePrompt.message_id, async (nameMsg) => {
          const name = nameMsg.text;
          await user.update({ first_name: name });
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
                          const fileInfo = await bot.getFile(photo[2].file_id);
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
        });
      }
    }
    if (text === "/menu") {
      const mKeyboard = await sendMsgWithKeyboard(
        bot,
        chatId,
        "Меню бота:",
        menuKeyboard
      );
    }

    const user = await User.findOne({ where: { username: msg.from.username } });
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
        await bot.sendMessage(chatId, "Пока нельзя, в разработке");
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
          console.log(msg, "========");
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
    return bot.sendMessage(
      chatId,
      "Something went wrong, try again later",
      console.log(e)
    );
  }
  // return bot.sendMessage(chatId, "ничего не понял(");
});
