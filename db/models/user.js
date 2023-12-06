"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate({ Like }) {
      User.belongsToMany(User, {
        as: "Sender",
        through: "Like",
        foreignKey: "senderId",
        otherKey: "receiverId",
      });

      User.belongsToMany(User, {
        as: "Receiver",
        through: "Like",
        foreignKey: "receiverId",
        otherKey: "senderId",
      });
    }
  }
  User.init(
    {
      chat_id: DataTypes.INTEGER,
      first_name: DataTypes.STRING,
      age: DataTypes.INTEGER,
      photo: DataTypes.STRING,
      video: DataTypes.STRING,

      username: DataTypes.STRING,
      info: DataTypes.TEXT,
      lang_code: DataTypes.STRING,
      sex: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
