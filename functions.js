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
async function getProfile(bot, chatId, user) {
  const uProfile = {
    caption: `${user.first_name}, ${user.age} \nИзучаемый язык: ${user.lang_code} \n${user.info}`,
    parse_mode: "markdown",
  };
  await bot.sendMessage(chatId, "Вот твоя анкета:");
  if (user.photo === null) {
    const res = await bot.sendVideo(chatId, user.video, uProfile);
    return res;
  } else {
    const res = await bot.sendPhoto(chatId, user.photo, uProfile);
    return res;
  }
  // await bot.sendMessage(chatId, "👀", openKeyboard(keyboard));
}

async function getOtherProfile(bot, chatId, user, keyboard) {
  const uProfile = {
    caption: `${user.first_name}, ${user.age} \nИзучаемый язык: ${user.lang_code} \n${user.info}`,
    parse_mode: "markdown",
  };
  await bot.sendMessage(chatId, "👀", openKeyboard(keyboard));
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

module.exports = {
  sendMsgWithKeyboard,
  openKeyboard,
  forceReply,
  getProfile,
  getOtherProfile,
};
