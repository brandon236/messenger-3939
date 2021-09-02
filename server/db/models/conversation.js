const { Op } = require("sequelize");
const db = require("../db");
const Message = require("./message");
const Sequelize = require('Sequelize');
DataTypes = Sequelize.DataTypes

const Conversation = db.define("conversation", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  dateLastAccessed: {
    type: DataTypes.STRING,
    allowNull: false,
  }
});

// find conversation given two user Ids

Conversation.findConversation = async function (user1Id, user2Id) {
  const conversation = await Conversation.findOne({
    where: {
      user1Id: {
        [Op.or]: [user1Id, user2Id]
      },
      user2Id: {
        [Op.or]: [user1Id, user2Id]
      }
    }
  });

  // return conversation or null if it doesn't exist
  return conversation;
};

module.exports = Conversation;
