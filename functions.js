async function sendMsgWithKeyboard(chatId, text, keyboard) {
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
function openKeyboard(keyboard) {
  const board = {
    reply_markup: {
      force_reply: true,
      keyboard: keyboard,
      resize_keyboard: true,
      // one_time_keyboard: true,
    },
  };
  // console.log(board);
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

module.exports = { sendMsgWithKeyboard, openKeyboard, forceReply };
