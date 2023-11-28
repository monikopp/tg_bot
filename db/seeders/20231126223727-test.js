"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("Users", [
      {
        chat_id: 123123123,
        username: "Smesharik",
        first_name: "Barash",
        age: 18,
        photo: "./photos/file_8.jpg",
        info: "Студент",
        lang_code: "Русский",
        sex: "Парень",
        // preferences: "female",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        chat_id: 1231231234,
        username: "yacrut",
        first_name: "krosh",
        age: 18,
        photo: "./photos/file_7.jpg",
        info: "Студент",
        sex: "Девушка",
        // preferences: "female",
        lang_code: "Китайский",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        chat_id: 1235,
        username: "loh",
        first_name: "loh",
        age: 19,
        photo: "./photos/file_6.jpg",
        info: "Студент",
        sex: "Парень",
        // preferences: "female",
        lang_code: "Английский",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {},
};
