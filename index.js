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
const { User } = require("./db/models");
const token = "6590028032:AAEXCEoI7AvKUTefs2vG3m8rAdvEr6XySmM";

const bot = new TelegramBot(token, { polling: true });

bot.setMyCommands(commands);

bot.on("message", async (msg) => {
  const { text } = msg;
  const chatId = msg.chat.id;
  let userProfile;
  let profile;
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
