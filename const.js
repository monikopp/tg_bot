const commands = [
  { command: "/start", description: "Запустить бота" },
  { command: "/menu", description: "Открыть меню" },
  { command: "/help", description: "Помощь" },
];

const likeKeyboard = [["1.❤️", "2.👎", "3.Вернуться в меню"]];
const menuKeyboard = [
  ["1.Смотреть свою анкету", "2.Изменить анкету"],
  ["3.Смотреть другие анкеты", "4.Закрыть меню"],
];

const editProfileKeyboard = [
  ["1.Имя", "2.Фото/Видео"],
  ["3.Описание", "4.Язык"],
  ["5.Возраст", "6.Пол"],
  ["Назад"],
];

module.exports = {
  likeKeyboard,
  commands,

  menuKeyboard,
  editProfileKeyboard,
};
