const { Telegraf } = require("telegraf");
const { message } = require("telegraf/filters");
require("dotenv").config();
const text = require("./const");

const bot = new Telegraf(process.env.BOT_TOKEN);
// bot.use(async (ctx) => {
//   await ctx.reply(JSON.stringify(ctx.update, null, 2));
//   console.log(JSON.stringify(ctx.update, null, 2));
//  });
bot.start((ctx) => ctx.reply("Welcome"));
bot.help((ctx) => ctx.reply(text.commands));

bot.on(message("sticker"), (ctx) => ctx.reply("👍"));

bot.launch().then(() => console.log("Started"));

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
