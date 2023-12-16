require("dotenv").config();
const { User } = require("./db/models");
const { Telegraf, session, Scenes } = require("telegraf");
const { message } = require("telegraf/filters");
const { stage } = require("./scenes");
const { commands } = require("./const");

const bot = new Telegraf(process.env.API_TOKEN, { polling: true });

bot.use(session());
bot.use(stage.middleware());
bot.telegram.setMyCommands(commands);

bot.start(async (ctx) => {
  try {
    if (ctx.from.username === undefined) {
      ctx.reply("Необходимо имя пользователя, чтобы пользоваться ботом(");
      return;
    } else {
    }
    const existingUser = await User.findOne({
      where: { username: ctx.from.username },
    });
    if (existingUser === null || existingUser.photo === null) {
      ctx.scene.enter("name");
    } else {
      ctx.scene.enter("seeMyProfile");
    }
  } catch (e) {
    console.log(e.stack);
    ctx.reply(`Что-то пошло не так`);
  }
});

bot.hears("/menu", async (ctx) => {
  try {
    if (ctx.from.username === undefined) {
      ctx.reply("Необходимо имя пользователя, чтобы пользоваться ботом(");
      return;
    } else {
      let user = await User.findOne({
        where: { username: ctx.from.username },
      });
      if (user?.photo !== null) {
        ctx.scene.enter("menu");
      } else {
        ctx.reply("Необходимо зарегистрироваться, введи /start");
      }
    }
  } catch (e) {
    console.log(e.stack);
  }
});

bot.help((ctx) =>
  ctx.reply(
    `Если у вас возникли проблемы, вы можете написать нам:\n\n  @polyyysh - Создатель стартапа \n  @yaanaaten - разработчик \n\nСообщения должны иметь такой вид: \n1. Ваше имя пользователя/username\n2. Описание проблемы\n3. Фото/видео проблемы`
  )
);
bot.on(message("sticker"), (ctx) => ctx.reply("👍"));

bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
