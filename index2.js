require("dotenv").config();
const { User } = require("./db/models");
const { Telegraf, session, Scenes } = require("telegraf");
const { message } = require("telegraf/filters");
const { stage } = require("./scenes");

const bot = new Telegraf(process.env.API_TOKEN, { polling: true });

bot.use(session());
bot.use(stage.middleware());

bot.start(async (ctx) => {
  try {
    const existingUser = await User.findOne({
      where: { username: ctx.from.username },
    });
    if (existingUser === null) {
      ctx.scene.enter("name");
    } else {
      ctx.scene.enter("seeMyProfile");
    }
  } catch (e) {
    console.log(e.stack);
    ctx.reply(`Что-то пошло не так:\n ${e.name}`);
  }
});

bot.hears("/menu", async (ctx) => {
  let user = await User.findOne({
    where: { username: ctx.from.username },
  });
  if (user !== null) {
    ctx.scene.enter("menu");
  } else {
    ctx.reply("Необходимо зарегистрироваться, введи /start");
  }
});

bot.on(message("sticker"), (ctx) => ctx.reply("👍"));
bot.hears("hi", (ctx) => ctx.reply("Hey there"));
bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
