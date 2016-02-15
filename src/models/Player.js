'use strict';

export default function (sequelize, DataTypes) {
  let Player = sequelize.define('Player', {
    login: {
      type: DataTypes.STRING,
      allowNull: false
    },
    nickname: {
      type: DataTypes.STRING,
      allowNull: false
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: 'core__player',
    charset: 'utf8'
  });

  return Player;
}
