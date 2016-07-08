
import {Sequelize} from 'sequelize';
import {DataTypes} from 'sequelize';
import {Instance} from 'sequelize';
import {stringify} from 'querystring';

export default function (sequelize: Sequelize, DataTypes: DataTypes) {
  let Setting = sequelize.define('Setting', {
    context: {
      type: DataTypes.STRING,
      allowNull: false
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false
    },
    foreignKey: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    enumeration: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true
    },
    visible: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'core__setting',
    charset: 'utf8',
    indexes: [
      {
        unique: true,
        fields: ['context', 'key']
      }
    ],
    hooks: {
      beforeValidate (setting: any, options) {
        if (setting.value && typeof setting.value !== 'string')
          setting.value = JSON.stringify({value: setting.value});
        if (setting.enumeration && Array.isArray(setting.enumeration))
          setting.enumeration = JSON.stringify(setting.enumeration);
      }
    }
  });

  return Setting;
}

