const commands = [
  { command: "/start", description: "Запустить бота" },
  { command: "/menu", description: "Открыть меню" },
];
const commandsForNew = [{ command: "/start", description: "Запустить бота" }];
const like = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [{ text: "❤️", callback_data: "like" }],
      [{ text: "👎", callback_data: "dislike" }],
    ],
  }),
};
const likeKeyboard = [["❤️", "👎"]];
const menuKeyboard = [
  ["1.Смотреть свою анкету", "2.Изменить анкету"],
  ["3.Смотреть другие анкеты", "4.Закрыть меню"],
];

const editProfileKeyboard = [
  ["1.Имя", "2.Фото"],
  ["3.Описание", "4.Язык"],
  ["5.Возраст", "6.Пол"],
  ["Назад"],
];

const langKeyboard = [
  ["Английский", "Китайский", "Корейский"],
  ["Японский", "1", "2"],
  ["3", "4", "5"],
];

// const sexKeyboard=[
//   ["Мужской", "Женский"],
// ]
module.exports = {
  likeKeyboard,
  commands,
  like,
  menuKeyboard,
  editProfileKeyboard,
  langKeyboard,
  commandsForNew,
};
