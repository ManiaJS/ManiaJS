
'use strict';

var Sequelize = require('sequelize');
var sequelize = require('./../lib/database').sequelize;

let Player = sequelize.define('Player', {
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

module.exports = Player;
