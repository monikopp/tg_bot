require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const {
  commands,
  opts,
  menuKeyboard,
  editProfileKeyboard,
  langKeyboard,
} = require("./const");
const {
  sendMsgWithKeyboard,
  openKeyboard,
  forceReply,
} = require("./functions");
const { User } = require("./db/models");
const token = "6590028032:AAEXCEoI7AvKUTefs2vG3m8rAdvEr6XySmM";

const bot = new TelegramBot(token, { polling: true });

bot.setMyCommands(commands);

bot.on("message", async (msg) => {
  const { text } = msg;
  const chatId = msg.chat.id;

  try {
    // console.log(msg);
    if (text === "/start") {
      const [user, newUser] = await User.findOrCreate({
        where: { username: msg.chat.username },
        defaults: { username: msg.chat.username, chat_id: chatId },
      });
      if (!newUser) {
        console.log(JSON.parse(JSON.stringify(user)), "==========");

        await bot.sendMessage(chatId, "нет").catch((err) => {
          console.log(err.code);
          console.log(err.response.body);
        });
      } else {
        const namePrompt = await bot.sendMessage(
          chatId,
          `Привет👋🏻, как тебя зовут? `,
          forceReply()
        );

        bot.onReplyToMessage(chatId, namePrompt.message_id, async (nameMsg) => {
          const name = nameMsg.text;
          await user.update({ first_name: name });

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
            }
          );
        });
      }
    }
    // bot.onText(/\/start/, async (msg) => {
    // });
  } catch (e) {
    return bot.sendMessage(
      chatId,
      "Something went wrong, try again later",
      console.log(e)
    );
  }
  // return bot.sendMessage(chatId, "ничего не понял(");
});
