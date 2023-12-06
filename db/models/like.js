const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Like extends Model {
    static associate({ User }) {
      Like.belongsTo(User, { as: "Sender", foreignKey: "senderId" }); // Связь с отправителем
      Like.belongsTo(User, { as: "Receiver", foreignKey: "receiverId" }); // Связь с получателем
    }
  }
  Like.init(
    {
      senderId: DataTypes.INTEGER,

      receiverId: DataTypes.INTEGER,
      type: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Like",
    }
  );
  return Like;
};
