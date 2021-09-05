const { Op } = require("sequelize");
const db = require("../db");
const Sequelize = require('Sequelize');

const ConvoUsers = db.define("convoUsers", {
  userID: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'user',
      key: 'id',
    }
  },
  convoID: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'conversation',
      key: 'id',
    }
  },
  moderatorPrivileges: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
  }
});

module.exports = ConvoUsers;
