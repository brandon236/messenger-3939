const { Op } = require("sequelize");
const db = require("../db");
const Sequelize = require('Sequelize');

const ConvoUsers = db.define("convoUsers", {
  userID: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    }
  },
  messageID: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'message',
      key: 'id',
    }
  },
});

module.exports = ConvoUsers;
