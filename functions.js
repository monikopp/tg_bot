async function sendMsgWithKeyboard(bot, chatId, text, keyboard) {
  const board = await bot.sendMessage(chatId, text, {
    reply_markup: {
      keyboard: keyboard,
      resize_keyboard: true,
      force_reply: true,
    },
  });
  return board;
}
async function getProfile(bot, chatId, user, imgUrl) {
  const uProfile = {
    caption: `${user.first_name}, ${user.age} \nИзучаемый язык: ${user.lang_code} \n${user.info}`,
  };
  await bot.sendMessage(chatId, "Вот твоя анкета:");

  const res = await bot.sendPhoto(chatId, imgUrl, uProfile);
  return res;
}

async function getOtherProfile(bot, chatId, user, keyboard, url) {
  const uProfile = {
    caption: `${user.first_name}, ${user.age} \nИзучаемый язык: ${user.lang_code} \n${user.info}`,
  };
  await bot.sendMessage(chatId, "👀", openKeyboard(keyboard));

  const res = await bot.sendPhoto(chatId, url, uProfile);
  return res;
}
function openKeyboard(keyboard) {
  const board = {
    reply_markup: {
      force_reply: true,
      keyboard: keyboard,
      resize_keyboard: true,
      one_time_keyboard: true,
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

module.exports = {
  sendMsgWithKeyboard,
  openKeyboard,
  forceReply,
  getProfile,
  getOtherProfile,
};
