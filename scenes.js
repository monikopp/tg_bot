const { session, Scenes } = require("telegraf");

const { leave, enter } = Scenes.Stage;
const { message, editedMessage } = require("telegraf/filters");
const { Op } = require("sequelize");
const { createClient } = require("@supabase/supabase-js");
const { User, Like } = require("./db/models");
const { getSexKeyboard, getBackKeyboard } = require("./keyboard");
const {
  sendMsgWithKeyboard,
  getProfile,
  getOtherProfile,
} = require("./functions");
const { menuKeyboard, editProfileKeyboard, likeKeyboard } = require("./const");

// let user;
let find;

const supabase = createClient(process.env.PROJECT_URL, process.env.API_KEY);
const Scene = Scenes.BaseScene;

// ========РЕГА===============================

const nameScene = new Scene("name");
nameScene.enter((ctx) => ctx.reply("Привет👋🏻, как тебя зовут? "));
nameScene.on(message("text"), async (ctx) => {
  try {
    if (ctx.message.text === "/menu" || ctx.message.text === "/start") {
      await ctx.reply("Сначала заверши регистрацию");
      return ctx.scene.enter("name");
    } else {
      const [user, created] = await User.findOrCreate({
        where: { username: ctx.chat.username },
        defaults: {
          username: ctx.chat.username,
          chat_id: ctx.chat.id,
          first_name: ctx.message.text,
        },
      });
      if (created) {
        await user.destroy();
        user = await User.create({
          username: ctx.chat.username,
          chat_id: ctx.chat.id,
          first_name: ctx.message.text,
        });
      }
      ctx.session.name = ctx.message.text;

      return ctx.scene.enter("age");
    }
  } catch (e) {
    console.log(e.stack);
    ctx.reply(`Что-то пошло не так`);
  }
});

const ageScene = new Scene("age");
ageScene.enter((ctx) => ctx.reply("Сколько тебе полных лет? "));
ageScene.on(message("text"), async (ctx) => {
  try {
    if (ctx.message.text === "/menu" || ctx.message.text === "/start") {
      await ctx.reply("Сначала заверши регистрацию");
      return ctx.scene.enter("age");
    } else {
      const user = await User.findOne({
        where: { username: ctx.from.username },
      });
      ctx.session.name = ctx.message.text;
      let age = ctx.message.text;

      if (isNaN(Number(age))) {
        await ctx.reply("Введите корректный возраст...");
        return ctx.scene.enter("age");
      } else {
        await user.update({ age: ctx.message.text });
        return ctx.scene.enter("sex");
      }
    }
  } catch (e) {
    console.log(e.stack);
    ctx.reply(`Что-то пошло не так`);
  }
});

const sexScene = new Scene("sex");
sexScene.enter((ctx) => ctx.reply("Твой пол?", getSexKeyboard()));
sexScene.on(message("text"), async (ctx) => {
  try {
    if (ctx.message.text === "/menu" || ctx.message.text === "/start") {
      await ctx.reply("Сначала заверши регистрацию");
      return ctx.scene.enter("sex");
    } else {
      const user = await User.findOne({
        where: { username: ctx.from.username },
      });
      ctx.session.name = ctx.message.text;
      let sex = ctx.message.text;
      if (sex === "Парень" || sex === "Девушка") {
        await user.update({ sex: ctx.message.text });
        return ctx.scene.enter("lang");
      } else {
        await ctx.reply("Выберите из предложенных");
        return ctx.scene.enter("sex");
      }
    }
  } catch (e) {
    console.log(e.stack);
    ctx.reply(`Что-то пошло не так`);
  }
});

const langScene = new Scene("lang");
langScene.enter((ctx) => ctx.reply("Какой язык изучаешь?"));
langScene.on(message("text"), async (ctx) => {
  try {
    if (ctx.message.text === "/menu" || ctx.message.text === "/start") {
      await ctx.reply("Сначала заверши регистрацию");
      return ctx.scene.enter("lang");
    } else {
      const user = await User.findOne({
        where: { username: ctx.from.username },
      });
      ctx.session.name = ctx.message.text;
      let lang = ctx.message.text;
      if (lang.split(",").length > 1) {
        await ctx.reply("Придется выбрать только один");
        return ctx.scene.enter("lang");
      } else {
        await user.update({ lang_code: ctx.message.text });
        return ctx.scene.enter("info");
      }
    }
  } catch (e) {
    console.log(e.stack);
    ctx.reply(`Что-то пошло не так`);
  }
});

const infoScene = new Scene("info");
infoScene.enter((ctx) => ctx.reply("Добавь описание к анкете:"));
infoScene.on(message("text"), async (ctx) => {
  try {
    if (ctx.message.text === "/menu" || ctx.message.text === "/start") {
      await ctx.reply("Сначала заверши регистрацию");
      return ctx.scene.enter("info");
    } else {
      const user = await User.findOne({
        where: { username: ctx.from.username },
      });
      ctx.session.name = ctx.message.text;
      await user.update({ info: ctx.message.text });
      return ctx.scene.enter("pfp");
    }
  } catch (e) {
    console.log(e.stack);
    ctx.reply(`Что-то пошло не так`);
  }
});

const pfpScene = new Scene("pfp");
pfpScene.enter((ctx) => ctx.reply("Отправь фото для анкеты"));
pfpScene.on(message("photo"), async (ctx) => {
  try {
    const user = await User.findOne({ where: { username: ctx.from.username } });
    const { photo } = ctx.message;
    if (photo === null) {
      ctx.reply("Неправильный формат");
      return ctx.scene.enter("pfp");
    } else {
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
      return ctx.scene.enter("seeMyProfile");
    }
  } catch (e) {
    ctx.reply(`Что-то пошло не так`);
    console.log(e.stack);
  }
});

// ============ТУТ ЛАЙКИ====================================
let prevUser;
let showingUser;
const seeOthersScene = new Scene("seeOthers");
seeOthersScene.enter(async (ctx) => {
  try {
    ctx.session.name = ctx.message.text;
    const user = await User.findOne({ where: { username: ctx.from.username } });
    find = await User.findAndCountAll({
      where: {
        photo: { [Op.not]: null },
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
        await ctx.reply("Новых анкет пока нет");
        return ctx.scene.enter("backToMenu");
      } else {
        showingUser = find.rows[0];
        const { data } = supabase.storage
          .from("pfp")
          .getPublicUrl(showingUser.photo);

        prevUser = await getOtherProfile(
          ctx.telegram,
          user.chat_id,
          showingUser,
          likeKeyboard,
          data.publicUrl
        );
        find.rows.splice(0, 1);
      }
    } else {
      ctx.reply("Мы не нашли подходящих анкет(");
    }
  } catch (e) {
    console.log(e.stack);
    ctx.reply(`Что-то пошло не так`);
  }
});

seeOthersScene.hears("1.❤️", async (ctx) => ctx.scene.enter("like"));
seeOthersScene.hears("2.👎", async (ctx) => ctx.scene.enter("dislike"));
seeOthersScene.hears("3.Вернуться в меню", async (ctx) =>
  ctx.scene.enter("backToMenu")
);

const likeScene = new Scene("like");
likeScene.enter(async (ctx) => {
  try {
    ctx.session.name = ctx.message.text;
    const user = await User.findOne({ where: { username: ctx.from.username } });
    await Like.create({
      senderId: user.id,
      receiverId: showingUser.id,
      type: "like",
    });
    const liked = await Like.findOne({
      where: { senderId: showingUser.id, receiverId: user.id },
      include: { model: User, as: "Sender" },
    });
    if (liked !== null && liked.type === "like") {
      await ctx.telegram.sendMessage(
        ctx.chat.id,
        `Кажется у вас взаимная симпатия! Держи @${liked.Sender.username}`
      );
      await ctx.telegram.sendMessage(
        liked.Sender.chat_id,
        ` Кажется у вас взаимная симпатия! Держи @${user.username}`
      );
    }
    if (find.rows.length) {
      return ctx.scene.enter("seeOthers");
    } else {
      await ctx.reply("Это были все анкеты, что мы нашли(");
      return ctx.scene.enter("backToMenu");
    }
  } catch (e) {
    console.log(e.stack);
    ctx.reply(`Что-то пошло не так`);
  }
});

const dislikeScene = new Scene("dislike");

dislikeScene.enter(async (ctx) => {
  try {
    ctx.session.name = ctx.message.text;
    const user = await User.findOne({ where: { username: ctx.from.username } });
    await Like.create({
      senderId: user.id,
      receiverId: showingUser.id,
      type: "dislike",
    });
    if (find.rows.length) {
      showingUser = find.rows[0];

      return ctx.scene.enter("seeOthers");
    } else {
      await ctx.reply("Это были все анкеты, что мы нашли(");
      return ctx.scene.enter("backToMenu");
    }
  } catch (e) {
    console.log(e.stack);
    ctx.reply(`Что-то пошло не так`);
  }
});

// ===========МЕНЮ==============================

const menuScene = new Scene("menu");
menuScene.enter(async (ctx) => {
  await sendMsgWithKeyboard(
    ctx.telegram,
    ctx.chat.id,
    "1.Смотреть свою анкету\n2.Изменить анкету\n3.Смотреть другие анкеты\n4.Закрыть меню",
    menuKeyboard
  );
});

menuScene.hears("1.Смотреть свою анкету", async (ctx) =>
  ctx.scene.enter("seeMyProfile")
);
menuScene.hears("2.Изменить анкету", async (ctx) =>
  ctx.scene.enter("edtProfile")
);
menuScene.hears("3.Смотреть другие анкеты", async (ctx) =>
  ctx.scene.enter("seeOthers")
);
menuScene.hears("4.Закрыть меню", async (ctx) => ctx.scene.enter("closeMenu"));

const backToMenuScene = new Scene("backToMenu");
backToMenuScene.enter(async (ctx) => {
  await ctx.reply("Возвращаемся в меню:");
  return ctx.scene.enter("menu");
});

const seeMyProfileScene = new Scene("seeMyProfile");
seeMyProfileScene.enter(async (ctx) => {
  try {
    const user = await User.findOne({ where: { username: ctx.from.username } });
    const { data } = supabase.storage.from("pfp").getPublicUrl(user.photo);
    await getProfile(ctx.telegram, user.chat_id, user, data.publicUrl);
    return ctx.scene.enter("menu");
  } catch (e) {
    console.log(e.satck);
    ctx.reply(`Что-то пошло не так`);
  }
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

// ======ЭДИТ=============================

edtProfileScene.hears("1.Имя", async (ctx) => ctx.scene.enter("nameUpd"));
edtProfileScene.hears("2.Фото/Видео", async (ctx) => ctx.scene.enter("pfpUpd"));
edtProfileScene.hears("3.Описание", async (ctx) => ctx.scene.enter("infoUpd"));
edtProfileScene.hears("4.Язык", async (ctx) => ctx.scene.enter("langUpd"));
edtProfileScene.hears("5.Возраст", async (ctx) => ctx.scene.enter("ageUpd"));
edtProfileScene.hears("6.Пол", async (ctx) => ctx.scene.enter("sexUpd"));
edtProfileScene.hears("Назад", async (ctx) => ctx.scene.enter("backToMenu"));

const nameUpdScene = new Scene("nameUpd");
nameUpdScene.enter((ctx) => ctx.reply("Введи новое имя"));
nameUpdScene.on(message("text"), async (ctx) => {
  try {
    const user = await User.findOne({ where: { username: ctx.from.username } });
    await user.update({ first_name: ctx.message.text });
    return ctx.scene.enter("seeMyProfile");
  } catch (e) {
    console.log(e.stack);
    ctx.reply(`Что-то пошло не так`);
  }
});

const pfpUpdScene = new Scene("pfpUpd");
pfpUpdScene.enter((ctx) => ctx.reply("Отправь новое фото для анкеты"));
pfpUpdScene.on(message("photo"), async (ctx) => {
  try {
    const user = await User.findOne({ where: { username: ctx.from.username } });
    const { photo } = ctx.message;
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

    return ctx.scene.enter("seeMyProfile");
  } catch (e) {
    console.log(e.stack);
    ctx.reply(`Что-то пошло не так`);
  }
});

const infoUpdScene = new Scene("infoUpd");

infoUpdScene.enter((ctx) => ctx.reply("Добавь новое описание к анкете:"));
infoUpdScene.on(message("text"), async (ctx) => {
  try {
    const user = await User.findOne({ where: { username: ctx.from.username } });
    await user.update({ info: ctx.message.text });
    return ctx.scene.enter("seeMyProfile");
  } catch (e) {
    console.log(e.satck);
    ctx.reply(`Что-то пошло не так`);
  }
});

const langUpdScene = new Scene("langUpd");

langUpdScene.enter((ctx) => ctx.reply("Какой язык изучаешь?"));
langUpdScene.on(message("text"), async (ctx) => {
  try {
    const user = await User.findOne({ where: { username: ctx.from.username } });
    await user.update({ lang_code: ctx.message.text });
    return ctx.scene.enter("seeMyProfile");
  } catch (e) {
    console.log(e.stack);
    ctx.reply(`Что-то пошло не так`);
  }
});

const ageUpdScene = new Scene("ageUpd");

ageUpdScene.enter((ctx) => ctx.reply("Введи новый возраст"));
ageUpdScene.on(message("text"), async (ctx) => {
  try {
    const user = await User.findOne({ where: { username: ctx.from.username } });
    await user.update({ age: ctx.message.text });
    return ctx.scene.enter("seeMyProfile");
  } catch (e) {
    console.log(e.stack);
    ctx.reply(`Что-то пошло не так`);
  }
});

const sexUpdScene = new Scene("sexUpd");

sexUpdScene.enter((ctx) => ctx.reply("Твой пол?", getSexKeyboard()));
sexUpdScene.on(message("text"), async (ctx) => {
  try {
    const user = await User.findOne({ where: { username: ctx.from.username } });

    await user.update({ sex: ctx.message.text });

    return ctx.scene.enter("seeMyProfile");
  } catch (e) {
    ctx.reply(`Что-то пошло не так`);
    console.log(e.stack);
  }
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
  nameUpdScene,
  ageUpdScene,
  sexUpdScene,
  langUpdScene,
  infoUpdScene,
  pfpUpdScene,
]);

module.exports = { stage };
