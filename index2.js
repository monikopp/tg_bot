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

bot.start(async (ctx) => {
  try {
    const existingUser = await User.findOne({
      where: { username: msg.from.username },
    });
    if (existingUser === null) {
      Scenes.Stage.enter("name");
    } else {
      const { data } = supabase.storage
        .from("pfp")
        .getPublicUrl(existingUser.photo);
      await getProfile(
        ctx.telegram,
        existingUser.chat_id,
        existingUser,
        data.publicUrl
      );
    }
  } catch (e) {
    console.log(e.stack);
    ctx.reply("Что-то пошло не так", e.name);
  }
});
// bot.hears("/reg", Scenes.Stage.enter("name"));
// bot.hears("/menu");
bot.hears("/menu", Scenes.Stage.enter("menu"));
bot.help((ctx) => ctx.reply("Send me a sticker"));
bot.on(message("sticker"), (ctx) => ctx.reply("👍"));
bot.hears("hi", (ctx) => ctx.reply("Hey there"));
bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
