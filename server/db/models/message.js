const Sequelize = require("sequelize");
const db = require("../db");

const Message = db.define("message", {
  text: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  senderId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  readStatus: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
  },
  readStatusUsers: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'usersRead',
      key: 'id',
    }
  },
});

module.exports = Message;
