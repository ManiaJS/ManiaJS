
import {Sequelize} from 'sequelize';
import {DataTypes} from 'sequelize';

export default function (sequelize: Sequelize, DataTypes: DataTypes) {
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

