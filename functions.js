async function sendMsgWithKeyboard(bot, chatId, text, keyboard) {
  const board = await bot.sendMessage(chatId, text, {
    reply_markup: {
      keyboard: keyboard,
      resize_keyboard: true,
      force_reply: true,

      // one_time_keyboard: true,
    },
  });
  return board;
}
async function getProfile(bot, chatId, user) {
  const uProfile = {
    caption: `${user.first_name}, ${user.age} \n${user.lang_code} \n${user.info}`,
    parse_mode: "markdown",
  };
  await bot.sendMessage(chatId, "Вот твоя анкета:");
  const res = await bot.sendPhoto(chatId, user.photo, uProfile);
  return res;
}
function openKeyboard(keyboard) {
  const board = {
    reply_markup: {
      force_reply: true,
      keyboard: keyboard,
      resize_keyboard: true,
    },
  };

  return board;
}
function forceReply() {
  const force = {
    reply_markup: {
      force_reply: true,
    },
  };
  return force;
}

module.exports = { sendMsgWithKeyboard, openKeyboard, forceReply, getProfile };
