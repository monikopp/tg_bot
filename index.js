require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const text = require('./const');

const token = '6590028032:AAEXCEoI7AvKUTefs2vG3m8rAdvEr6XySmM';

const bot = new TelegramBot(token, { polling: true });

bot.on('message', async (msg) => {
  const { text } = msg;
  const chatId = msg.chat.id;

  bot.setMyCommands([
    { command: '/start', description: 'Say hi' },
    { command: '/saysmth', description: 'Say smth' },
  ]);

  try {
    if (text === '/start') {
      await bot.sendMessage(chatId, 'Welcome!');
      return bot.sendSticker(
        chatId,
        'https://tlgrm.eu/_/stickers/ccd/a8d/ccda8d5d-d492-4393-8bb7-e33f77c24907/192/20.webp'
      );
    }
    if (text === '/saysmth') {
      await bot.sendMessage(chatId, 'You better be joking');
      return bot.sendSticker(
        chatId,
        'https://tlgrm.eu/_/stickers/ccd/a8d/ccda8d5d-d492-4393-8bb7-e33f77c24907/2.webp'
      );
    }
  } catch (e) {
    return bot.sendMessage(chatId, 'Something went wrong, try again later');
  }
  return bot.sendMessage(chatId, 'Try to send me smth else');
});
