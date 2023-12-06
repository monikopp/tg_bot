const { Markup } = require("telegraf");

exports.getSexKeyboard = () => {
  let getSexKeyboard = Markup.keyboard([["Парень", "Девушка"]]);
  getSexKeyboard = getSexKeyboard.oneTime();
  getSexKeyboard = getSexKeyboard.resize();

  return getSexKeyboard;
};
exports.getBackKeyboard = () => {
  let backKeyboard = Markup.keyboard(["Back"]);
  backKeyboard = backKeyboard.oneTime();
  return backKeyboard;
};
