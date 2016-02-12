'use strict';

import Sequelize from 'sequelize';
import sequelize from './../lib/database';

export let Player = sequelize.define('Player', {
  playerid: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  login: {
    type: Sequelize.STRING,
    allowNull: false
  },
  nickname: {
    type: Sequelize.STRING,
    allowNull: true
  }
}, {
  tableName: 'core__player'
});
