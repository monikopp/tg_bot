const commands = [
  { command: "/start", description: "Запустить бота" },
  { command: "/menu", description: "Открыть меню" },
];

const opts = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [{ text: "Кнопка 1", callback_data: "1" }],
      [{ text: "Кнопка 2", callback_data: "data 2" }],
      [{ text: "Кнопка 3", callback_data: "text 3" }],
    ],
  }),
};

const menuKeyboard = [
  ["1.Смотреть свою анкету", "2.Изменить анкету"],
  ["3.Смотреть дургие анкеты", "4.Закрыть меню"],
];

const editProfileKeyboard = [
  ["1.Имя", "2.Фото"],
  ["3.Описание", "4.Язык"],
  ["Назад"],
];

module.exports = { commands, opts, menuKeyboard, editProfileKeyboard };
