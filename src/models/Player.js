'use strict';

export default function (sequelize, DataTypes) {
  let Player = sequelize.define('Player', {
    login: {
      type: DataTypes.STRING,
      allowNull: false
    },
    nickname: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'core__player'
  });

  return Player;
}
