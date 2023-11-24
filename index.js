require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const text = require("./const");

const token = "6590028032:AAEXCEoI7AvKUTefs2vG3m8rAdvEr6XySmM";

const bot = new TelegramBot(token, { polling: true });

bot.on("message", async (msg) => {
  const { text } = msg;
  const chatId = msg.chat.id;

  const commands = [
    { command: "/start", description: "Запустить бота" },
    { command: "/saysmth", description: "Шутка типо" },
    { command: "/menu", description: "Открыть меню" },
  ];

  bot.setMyCommands(commands);
  console.log(msg, "============");

  try {
    if (text === "/start") {
      await bot.sendMessage(chatId, `Привет, ${msg.from.first_name}!👋🏻`);
      //   return bot.sendMessage(chatId, `Привет, ${msg.from.first_name}!`);
      return bot.sendSticker(
        chatId,
        "https://tlgrm.eu/_/stickers/ccd/a8d/ccda8d5d-d492-4393-8bb7-e33f77c24907/192/20.webp"
      );
    }
    if (text === "/menu") {
      return bot.sendMessage(chatId, `Меню бота`, {
        reply_markup: {
          keyboard: [
            ["1.Смотреть свою анкету", "2.Изменить анкету"],
            ["3.Смотреть дургие анкеты", "4.Закрыть меню"],
          ],
          resize_keyboard: true,
        },
      });
    }
    if (text === "1.Смотреть свою анкету") {
      await bot.sendMessage(chatId, "Твоя анкета:");
      return bot.sendMessage(chatId, "АНКЕТА");
    }
    if (text === "2.Изменить анкету") {
      return bot.sendMessage(chatId, "Что меняем?", {
        reply_markup: {
          keyboard: [["1.имя", "2.Фото"], ["3.Описание", "4.Язык"], ["Назад"]],
          resize_keyboard: true,
          //   one_time_keyboard: true,
        },
      });
    }
    if (text === "Назад") {
      return bot.sendMessage(chatId, "Назад", {
        reply_markup: {
          keyboard: [
            ["1.Смотреть свою анкету", "2.Изменить анкету"],
            ["3.Смотреть дургие анкеты", "4.Закрыть меню"],
          ],
          resize_keyboard: true,
        },
      });
    }
    if (text == "4.Закрыть меню") {
      return bot.sendMessage(chatId, "Меню закрыто", {
        reply_markup: {
          remove_keyboard: true,
        },
      });
    }
    if (text === "/saysmth") {
      await bot.sendMessage(chatId, "You better be joking");
      return bot.sendSticker(
        chatId,
        "https://tlgrm.eu/_/stickers/ccd/a8d/ccda8d5d-d492-4393-8bb7-e33f77c24907/2.webp"
      );
    }
  } catch (e) {
    return bot.sendMessage(chatId, "Something went wrong, try again later");
  }
  return bot.sendMessage(chatId, "ничего не понял(");
});
