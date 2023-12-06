require("dotenv").config();
const { Op } = require("sequelize");
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(process.env.PROJECT_URL, process.env.API_KEY);

const { User, Like } = require("./db/models");
const { Telegraf, session, Scenes } = require("telegraf");

const { leave, enter } = Scenes.Stage;
const { message } = require("telegraf/filters");
const { stage } = require("./regScene");

const bot = new Telegraf(process.env.API_TOKEN, { polling: true });

bot.use(session());
bot.use(stage.middleware());

bot.start((ctx) => ctx.reply("Welcome"));

bot.hears("/reg", Scenes.Stage.enter("name"));
bot.hears("3", Scenes.Stage.enter("seeOthers"));
bot.help((ctx) => ctx.reply("Send me a sticker"));
bot.on(message("sticker"), (ctx) => ctx.reply("👍"));
bot.hears("hi", (ctx) => ctx.reply("Hey there"));
bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
