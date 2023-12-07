const { session, Scenes } = require("telegraf");
const { leave, enter } = Scenes.Stage;
const { message, editedMessage } = require("telegraf/filters");
const { User, Like } = require("./db/models");
const { getSexKeyboard, getBackKeyboard } = require("./keyboard");
const { Op } = require("sequelize");
const { createClient } = require("@supabase/supabase-js");
const {
  sendMsgWithKeyboard,
  openKeyboard,
  forceReply,
  getProfile,
  getOtherProfile,
} = require("./functions");
const {
  commands,
  commandsForNew,
  menuKeyboard,
  editProfileKeyboard,
  like,
  likeKeyboard,
} = require("./const");
let user;
let find;
let prevUser;
let showingUser;
const supabase = createClient(process.env.PROJECT_URL, process.env.API_KEY);
const Scene = Scenes.BaseScene;

// ========РЕГА===============================

const nameScene = new Scene("name");
nameScene.enter((ctx) => ctx.reply("Привет👋🏻, как тебя зовут? "));
nameScene.on(message("text"), async (ctx) => {
  user = await User.create({
    username: ctx.chat.username,
    chat_id: ctx.chat.id,
    first_name: ctx.message.text,
  });
  ctx.session.name = ctx.message.text;

  return ctx.scene.enter("age");
});

const ageScene = new Scene("age");
ageScene.enter((ctx) => ctx.reply("Сколько тебе полных лет? "));
ageScene.on(message("text"), async (ctx) => {
  ctx.session.name = ctx.message.text;
  await user.update({ age: ctx.message.text });

  return ctx.scene.enter("sex");
});

const sexScene = new Scene("sex");
sexScene.enter((ctx) => ctx.reply("Твой пол?", getSexKeyboard()));
sexScene.on(message("text"), async (ctx) => {
  ctx.session.name = ctx.message.text;
  await user.update({ sex: ctx.message.text });
  return ctx.scene.enter("lang");
});

const langScene = new Scene("lang");
langScene.enter((ctx) => ctx.reply("Какой язык изучаешь?"));
langScene.on(message("text"), async (ctx) => {
  ctx.session.name = ctx.message.text;
  await user.update({ lang_code: ctx.message.text });
  return ctx.scene.enter("info");
});

const infoScene = new Scene("info");
infoScene.enter((ctx) => ctx.reply("Добавь описание к анкете:"));
infoScene.on(message("text"), async (ctx) => {
  ctx.session.name = ctx.message.text;
  await user.update({ info: ctx.message.text });
  return ctx.scene.enter("pfp");
});

const pfpScene = new Scene("pfp");
pfpScene.enter((ctx) => ctx.reply("Отправь фото для анкеты"));

pfpScene.on(message("photo"), async (ctx) => {
  try {
    const photo = ctx.message.photo;
    const fileInfo = await ctx.telegram.getFile(photo[2].file_id);
    const link = await ctx.telegram.getFileLink(photo[2].file_id);
    const res = await fetch(link);
    const fileBuffer = await res.arrayBuffer();
    const blob = new Blob([fileBuffer], {
      type: "image/jpeg",
    });
    await supabase.storage
      .from("pfp")
      .upload(`photos/${fileInfo.file_unique_id}`, blob, {
        upsert: true,
      });
    await user.update({
      photo: `photos/${fileInfo.file_unique_id}`,
    });
    const { data } = supabase.storage.from("pfp").getPublicUrl(user.photo);
    await getProfile(ctx.telegram, user.chat_id, user, data.publicUrl);
  } catch (e) {
    console.log(e.stack);
  }
  return ctx.scene.leave();
});

// ============ТУТ ЛАЙКИ====================================

const seeOthersScene = new Scene("seeOthers");
seeOthersScene.enter(async (ctx) => {
  let user = await User.findOne({ where: { chat_id: ctx.chat.id } });

  find = await User.findAndCountAll({
    where: {
      id: { [Op.not]: user.id },
      [Op.or]: [
        { lang_code: { [Op.substring]: user.lang_code } },
        { age: { [Op.between]: [+user.age - 1, +user.age + 1] } },
      ],
    },
  });
  if (find.count > 0) {
    const alreadyLiked = await Like.findAll({
      where: { senderId: user.id },
      as: "Sender",
    });

    for (let i = 0; i < find.rows.length; i++) {
      for (let j = 0; j < alreadyLiked.length; j++) {
        if (find.rows[i]?.id === alreadyLiked[j].receiverId) {
          find.rows.splice(i, 1);
        }
      }
    }

    if (find.rows.length === 0) {
      await bot.sendMessage(chatId, "Новых анкет пока нет");
    } else {
      showingUser = find.rows[0];
      const { data } = supabase.storage
        .from("pfp")
        .getPublicUrl(showingUser.photo);

      prevUser = getOtherProfile(
        ctx.telegram,
        user.chat_id,
        showingUser,
        likeKeyboard,
        data.publicUrl
      );
      find.rows.splice(0, 1);
    }
  }
});

seeOthersScene.hears("1.❤️", async (ctx) => {
  return ctx.scene.enter("like");
});
seeOthersScene.hears("2.👎", async (ctx) => {
  return ctx.scene.enter("dislike");
});
seeOthersScene.hears("3.Вернуться в меню", async (ctx) => {
  return ctx.scene.enter("backToMenu");
});

const likeScene = new Scene("like");
likeScene.enter(async (ctx) => {
  let user = await User.findOne({ where: { chat_id: ctx.chat.id } });
  await Like.create({
    senderId: user.id,
    receiverId: prevUser.id,
    type: "like",
  });
  const liked = await Like.findOne({
    where: { senderId: prevUser.id, receiverId: user.id },
    include: { model: User, as: "Sender" },
  });
  if (liked !== null && liked.type === "like") {
    await bot.sendMessage(
      chatId,
      `Кажется у вас взаимная симпатия! Держи @${liked.Sender.username}`
    );
    await bot.sendMessage(
      liked.Sender.chat_id,
      ` Кажется у вас взаимная симпатия! Держи @${user.username}`
    );
  }
  if (find.rows.length) {
    showingUser = find.rows[0];
    const { data } = supabase.storage
      .from("pfp")
      .getPublicUrl(showingUser.photo);

    prevUser = getOtherProfile(
      ctx.telegram,
      user.chat_id,
      showingUser,
      likeKeyboard,
      data.publicUrl
    );
    find.rows.splice(0, 1);
  } else {
    await bot.sendMessage(chatId, "Это были все анкеты, что мы нашли(");
  }
  return ctx.scene.leave();
});

const dislikeScene = new Scene("dislike");

dislikeScene.enter(async (ctx) => {
  let user = await User.findOne({ where: { chat_id: ctx.chat.id } });
  await Like.create({
    senderId: user.id,
    receiverId: prevUser.id,
    type: "dislike",
  });
  if (find.rows.length) {
    showingUser = find.rows[0];
    const { data } = supabase.storage
      .from("pfp")
      .getPublicUrl(showingUser.photo);

    prevUser = getOtherProfile(
      ctx.telegram,
      user.chat_id,
      showingUser,
      likeKeyboard,
      data.publicUrl
    );
    find.rows.splice(0, 1);
  } else {
    await bot.sendMessage(chatId, "Это были все анкеты, что мы нашли(");
  }
  return ctx.scene.leave();
});

// ===========МЕНЮ==============================

const menuScene = new Scene("menu");
menuScene.enter(async (ctx) => {
  await sendMsgWithKeyboard(
    ctx.telegram,
    ctx.chat.id,
    `1.Смотреть свою анкету\n2.Изменить анкету\n3.Смотреть другие анкеты\n4.Закрыть меню`,
    menuKeyboard
  );
});

menuScene.hears("1.Смотреть свою анкету", async (ctx) => {
  return ctx.scene.enter("seeMyProfile");
});
menuScene.hears("2.Изменить анкету", async (ctx) => {
  return ctx.scene.enter("edtProfile");
});
menuScene.hears("3.Смотреть другие анкеты", async (ctx) => {
  return ctx.scene.enter("seeOthers");
});
menuScene.hears("4.Закрыть меню", async (ctx) => {
  return ctx.scene.enter("closeMenu");
});

const backToMenuScene = new Scene("backToMenu");
backToMenuScene.enter(async (ctx) => {
  await ctx.reply("Возвращаемся в меню:");
  return ctx.scene.enter("menu");
});

const seeMyProfileScene = new Scene("seeMyProfile");
seeMyProfileScene.enter(async (ctx) => {
  let user = await User.findOne({ where: { chat_id: ctx.chat.id } });
  const { data } = supabase.storage.from("pfp").getPublicUrl(user.photo);
  await getProfile(ctx.telegram, user.chat_id, user, data.publicUrl);
  return ctx.scene.enter("menu");
});

const edtProfileScene = new Scene("edtProfile");
edtProfileScene.enter(async (ctx) => {
  await sendMsgWithKeyboard(
    ctx.telegram,
    ctx.chat.id,
    "Что меняем?",
    editProfileKeyboard
  );
});

const closeMenuScene = new Scene("closeMenu");
closeMenuScene.enter(async (ctx) => {
  await ctx.reply("Меню закрыто", {
    reply_markup: {
      remove_keyboard: true,
    },
  });
});

const stage = new Scenes.Stage([
  nameScene,
  ageScene,
  sexScene,
  langScene,
  infoScene,
  pfpScene,
  seeOthersScene,
  likeScene,
  dislikeScene,
  backToMenuScene,
  seeMyProfileScene,
  menuScene,
  edtProfileScene,
  closeMenuScene,
]);

module.exports = { stage };
