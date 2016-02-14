'use strict';

export default function (sequelize, DataTypes) {
  let Map = sequelize.define('Map', {
    uid: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false
    },
    environment: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'core__map',
    charset: 'utf8'
  });

  return Map;
}

