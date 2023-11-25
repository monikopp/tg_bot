/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Likes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      sender_id: {
        type: Sequelize.INTEGER,
        references: {
          table: 'Users',
          key: 'id',
        },
      },
      sender_username: {
        type: Sequelize.STRING,
        references: {
          table: 'Users',
          key: 'username',
        },
      },
      receiver_id: {
        type: Sequelize.INTEGER,
        references: {
          table: 'Users',
          key: 'id',
        },
      },
      receiver_username: {
        type: Sequelize.STRING,
        references: {
          table: 'Users',
          key: 'username',
        },
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Likes');
  },
};
