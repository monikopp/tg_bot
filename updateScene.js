const { Scenes } = require('telegraf');
const { message } = require('telegraf/filters');
const {
  getProfile,
} = require('./functions');
const {
  getSexKeyboard,
} = require('./const');
const {
  supabase,
  user,
  edtProfileScene,
  seeMyProfileScene,
  backToMenuScene
} = require('./regScene');

const Scene = Scenes.BaseScene;

const nameUpdScene = new Scene('nameUpd');
edtProfileScene.hears('1.Имя', async (ctx) => ctx.scene.enter('nameUpd'));
nameUpdScene.enter((ctx) => ctx.reply('Введи новое имя'));
nameUpdScene.on(message('text'), async (ctx) => {
  // ctx.session.name = ctx.message.text;
  await user.update({ age: ctx.message.text });
  //   ctx.reply('Анкета изменена:');
  return ctx.scene.enter('seeMyProfile');
});

const pfpUpdScene = new Scene('pfpUpd');
edtProfileScene.hears('2.Фото/Видео', async (ctx) => ctx.scene.enter('pfpUpd'));
pfpUpdScene.enter((ctx) => ctx.reply('Отправь новое фото для анкеты'));
pfpUpdScene.on(message('photo'), async (ctx) => {
  try {
    const { photo } = ctx.message;
    const fileInfo = await ctx.telegram.getFile(photo[2].file_id);
    const link = await ctx.telegram.getFileLink(photo[2].file_id);
    const res = await fetch(link);
    const fileBuffer = await res.arrayBuffer();
    const blob = new Blob([fileBuffer], {
      type: 'image/jpeg',
    });
    await supabase.storage
      .from('pfp')
      .upload(`photos/${fileInfo.file_unique_id}`, blob, {
        upsert: true,
      });
    await user.update({
      photo: `photos/${fileInfo.file_unique_id}`,
    });
    const { data } = supabase.storage.from('pfp').getPublicUrl(user.photo);
    await getProfile(ctx.telegram, user.chat_id, user, data.publicUrl);
  } catch (e) {
    console.log(e.stack);
  }
  //   ctx.reply('Анкета изменена:');
  return ctx.scene.enter('seeMyProfile');
});

const infoUpdScene = new Scene('infoUpd');
edtProfileScene.hears('3.Описание', async (ctx) => ctx.scene.enter('infoUpd'));
infoUpdScene.enter((ctx) => ctx.reply('Добавь новое описание к анкете:'));
infoUpdScene.on(message('text'), async (ctx) => {
  //   ctx.session.name = ctx.message.text;
  await user.update({ info: ctx.message.text });
  //   ctx.reply('Анкета изменена:');
  return ctx.scene.enter('seeMyProfile');
});

const langUpdScene = new Scene('langUpd');
edtProfileScene.hears('4.Язык', async (ctx) => ctx.scene.enter('langUpd'));
langUpdScene.enter((ctx) => ctx.reply('Какой язык изучаешь?'));
langUpdScene.on(message('text'), async (ctx) => {
//   ctx.session.name = ctx.message.text;
  await user.update({ lang_code: ctx.message.text });
  //   ctx.reply('Анкета изменена:');
  return ctx.scene.enter('seeMyProfile');
});

const ageUpdScene = new Scene('ageUpd');
edtProfileScene.hears('5.Возраст', async (ctx) => ctx.scene.enter('ageUpd'));
ageUpdScene.enter((ctx) => ctx.reply('Введи новый возраст'));
ageUpdScene.on(message('text'), async (ctx) => {
  // ctx.session.name = ctx.message.text;
  await user.update({ age: ctx.message.text });
  //   ctx.reply('Анкета изменена:');
  return ctx.scene.enter('seeMyProfile');
});

const sexUpdScene = new Scene('sexUpd');
edtProfileScene.hears('5.Пол', async (ctx) => ctx.scene.enter('sexUpd'));
sexUpdScene.enter((ctx) => ctx.reply('Твой пол?', getSexKeyboard()));
sexUpdScene.on(message('text'), async (ctx) => {
  // ctx.session.name = ctx.message.text;
  await user.update({ sex: ctx.message.text });
  //   ctx.reply('Анкета изменена:');
  return ctx.scene.enter('seeMyProfile');
});

edtProfileScene.hears('Назад', async (ctx) => ctx.scene.enter('backToMenu'));

module.exports = {
  nameUpdScene,
  ageUpdScene,
  sexUpdScene,
  langUpdScene,
  infoUpdScene,
  pfpUpdScene,
};
