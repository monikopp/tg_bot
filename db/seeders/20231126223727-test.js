"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */

    await queryInterface.bulkInsert("Users", [
      {
        chat_id: 123123123,
        username: "Smesharik",
        first_name: "Barash",
        age: 18,
        photo: "./photos/file_8.jpg",
        info: "Студент",
        lang_code: "Русский",
        sex: "женский",
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
        sex: "мужской",
        // preferences: "female",
        lang_code: "Китайский",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
