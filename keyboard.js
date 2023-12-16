const { Markup } = require("telegraf");

exports.getSexKeyboard = () => {
  let getSexKeyboard = Markup.keyboard([["Парень", "Девушка"]]);
  getSexKeyboard = getSexKeyboard.oneTime();
  getSexKeyboard = getSexKeyboard.resize();
  return getSexKeyboard;
};

// exports.getRateKeyboard = () => {
//   let rateKeyboard = Markup.keyboard([["1", "2", "3", "4", "5"]]);
//   rateKeyboard = rateKeyboard.oneTime();
//   rateKeyboard = rateKeyboard.resize();
//   return rateKeyboard;
// };

exports.getBackKeyboard = () => {
  let backKeyboard = Markup.keyboard(["Back"]);
  backKeyboard = backKeyboard.oneTime();
  return backKeyboard;
};
