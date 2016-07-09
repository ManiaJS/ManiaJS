
import {Sequelize} from 'sequelize';
import {DataTypes} from 'sequelize';

export default function (sequelize: Sequelize, DataTypes: DataTypes) {
  return sequelize.define('Setting', {
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
      allowNull: true
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'core__setting',
    charset: 'utf8',
    indexes: [
      {
        unique: true,
        fields: ['context', 'key', 'foreignKey']
      }
    ],
    hooks: {
      beforeValidate (setting: any, options) {
        // Json Encode the content, always store it inside a object itself to prevent null failures.
        if (setting.value && typeof setting.value !== 'string')
          setting.value = JSON.stringify({value: setting.value});
      }
    }
  });
}
