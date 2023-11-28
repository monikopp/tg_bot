"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init(
    {
      chat_id: DataTypes.INTEGER,
      first_name: DataTypes.STRING,
      age: DataTypes.INTEGER,
      photo: DataTypes.STRING,
      // last_name: DataTypes.STRING,
      username: DataTypes.STRING,
      info: DataTypes.TEXT,
      lang_code: DataTypes.STRING,
      sex: DataTypes.STRING,
      // preferences: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
