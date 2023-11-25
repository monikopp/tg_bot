const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Like extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ User }) {
      User.belongsToMany(User, {
        as: 'Sender',
        through: 'Likes',
        foreignKey: 'sender_id',
      });
      User.belongsToMany(User, {
        as: 'Receiver',
        through: 'Likes',
        foreignKey: 'receiver_id',
      });
    }
  }
  Like.init(
    {
      sender_id: DataTypes.INTEGER,
      sender_username: DataTypes.STRING,
      receiver_id: DataTypes.INTEGER,
      receiver_username: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'Like',
    },
  );
  return Like;
};
