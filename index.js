require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const {
  commands,
  opts,
  menuKeyboard,
  editProfileKeyboard,
} = require("./const");

const token = "6590028032:AAEXCEoI7AvKUTefs2vG3m8rAdvEr6XySmM";

const bot = new TelegramBot(token, { polling: true });

async function openKeyboard(chatId, text, keyboard) {
  const board = await bot.sendMessage(chatId, text, {
    reply_markup: {
      keyboard: keyboard,
      resize_keyboard: true,
      // one_time_keyboard: true,
    },
  });
  return board;
}

bot.setMyCommands(commands);

bot.on("message", async (msg) => {
  const { text } = msg;
  const chatId = msg.chat.id;
  try {
    switch (text) {
      case "/start":
        await bot.sendMessage(chatId, `Привет, ${msg.from.first_name}!👋🏻`);
        await bot.sendSticker(
          chatId,
          "https://tlgrm.eu/_/stickers/ccd/a8d/ccda8d5d-d492-4393-8bb7-e33f77c24907/192/20.webp"
        );
        return;

      case "/menu":
        const mKeyboard = await openKeyboard(chatId, "Меню бота", menuKeyboard);
        return mKeyboard;
      case "4.Закрыть меню":
        return bot.sendMessage(chatId, "Меню закрыто", {
          reply_markup: {
            remove_keyboard: true,
          },
        });

      case "2.Изменить анкету":
        const eKeyboard = await openKeyboard(
          chatId,
          "Что меняем?",
          editProfileKeyboard
        );
        return eKeyboard;

      case "Назад":
        const bKeyboard = await openKeyboard(chatId, "Назад", menuKeyboard);
        return bKeyboard;
    }
  } catch (e) {
    // if (text === "Назад") {
    //   return bot.sendMessage(chatId, "Назад", {
    //     reply_markup: {
    //       keyboard: [
    //         ["1.Смотреть свою анкету", "2.Изменить анкету"],
    //         ["3.Смотреть дургие анкеты", "4.Закрыть меню"],
    //       ],
    //       resize_keyboard: true,
    //     },
    //   });
    // }
    // if (text == "4.Закрыть меню") {
    //   return bot.sendMessage(chatId, "Меню закрыто", {
    //     reply_markup: {
    //       remove_keyboard: true,
    //     },
    //   });
    // }

    // if (text === "/start") {
    //   await bot.sendMessage(chatId, `Привет, ${msg.from.first_name}!👋🏻`);

    //   return bot.sendSticker(
    //     chatId,
    //     "https://tlgrm.eu/_/stickers/ccd/a8d/ccda8d5d-d492-4393-8bb7-e33f77c24907/192/20.webp"
    //   );
    // }
    // if (text === "/menu") {
    //   return bot.sendMessage(chatId, `Меню бота`, {
    //     reply_markup: {
    //       keyboard: [
    //         ["1.Смотреть свою анкету", "2.Изменить анкету"],
    //         ["3.Смотреть дургие анкеты", "4.Закрыть меню"],
    //       ],
    //       resize_keyboard: true,
    //     },
    //   });
    // }
    // if (text === "1.Смотреть свою анкету") {
    //   await bot.sendMessage(chatId, "Твоя анкета:");
    //   return bot.sendMessage(chatId, "АНКЕТА");
    // }
    // if (text === "2.Изменить анкету") {
    //   return bot.sendMessage(chatId, "Что меняем?", {
    //     reply_markup: {
    //       keyboard: [["1.Имя", "2.Фото"], ["3.Описание", "4.Язык"], ["Назад"]],
    //       resize_keyboard: true,
    //     },
    //   });
    // }
    // if (text === "1.Имя") {
    //   return bot.sendMessage(chatId, "Введите имя", {
    //     reply_markup: JSON.stringify({
    //       inline_keyboard: [[{ text: "heeey", callback_data: "1" }]],
    //     }),
    //   });
    // }
    // if (text === "2.Фото") {
    //   return bot.sendMessage(chatId, "Отправьте новое фото");
    // }
    // if (text === "3.Описание") {
    //   return bot.sendMessage(chatId, "Введите описание");
    // }
    // if (text === "4.Язык") {
    //   return bot.sendMessage(chatId, "Какой язык вы изучаете?");
    // }
    // if (text === "Назад") {
    //   return bot.sendMessage(chatId, "Назад", {
    //     reply_markup: {
    //       keyboard: [
    //         ["1.Смотреть свою анкету", "2.Изменить анкету"],
    //         ["3.Смотреть дургие анкеты", "4.Закрыть меню"],
    //       ],
    //       resize_keyboard: true,
    //     },
    //   });
    // }
    // if (text == "4.Закрыть меню") {
    //   return bot.sendMessage(chatId, "Меню закрыто", {
    //     reply_markup: {
    //       remove_keyboard: true,
    //     },
    //   });
    // }
    // if (text === "/saysmth") {
    //   await bot.sendMessage(chatId, "You better be joking");
    //   return bot.sendSticker(
    //     chatId,
    //     "https://tlgrm.eu/_/stickers/ccd/a8d/ccda8d5d-d492-4393-8bb7-e33f77c24907/2.webp"
    //   );
    // }
    return bot.sendMessage(
      chatId,
      "Something went wrong, try again later",
      console.log(e)
    );
  }
  return bot.sendMessage(chatId, "ничего не понял(");
});
