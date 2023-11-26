const commands = [
  { command: "/start", description: "Запустить бота" },
  { command: "/menu", description: "Открыть меню" },
];
const commandsForNew = [{ command: "/start", description: "Запустить бота" }];
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
  ["3.Смотреть другие анкеты", "4.Закрыть меню"],
];

const editProfileKeyboard = [
  ["1.Имя", "2.Фото"],
  ["3.Описание", "4.Язык"],
  ["5.Возраст"],
  ["Назад"],
];

const langKeyboard = [
  ["Английский", "Китайский", "Корейский"],
  ["Японский", "1", "2"],
  ["3", "4", "5"],
];
module.exports = {
  commands,
  opts,
  menuKeyboard,
  editProfileKeyboard,
  langKeyboard,
  commandsForNew,
};
