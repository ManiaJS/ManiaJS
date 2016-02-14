'use strict';

export default function (sequelize, DataTypes) {
  let Map = sequelize.define('Map', {
    Uid: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Author: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Environment: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'core__map'
  });

  return Map;
}

