const router = require("express").Router();
const { User, Conversation, Message } = require("../../db/models");
const { Op } = require("sequelize");
const onlineUsers = require("../../onlineUsers");

// get all conversations for a user, include latest message text for preview, and all messages
// include other user model so we have info on username/profile pic (don't include current user info)
router.get("/", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }
    const userId = req.user.id;
    const conversations = await Conversation.findAll({
      where: {
        [Op.or]: {
          user1Id: userId,
          user2Id: userId,
        },
      },
      attributes: ["id", "dateLastAccessed"],
      order: [[Message, "createdAt", "DESC"]],
      include: [
        { model: Message, order: ["createdAt", "DESC"] },
        {
          model: User,
          as: "user1",
          where: {
            id: {
              [Op.not]: userId,
            },
          },
          attributes: ["id", "username", "photoUrl"],
          required: false,
        },
        {
          model: User,
          as: "user2",
          where: {
            id: {
              [Op.not]: userId,
            },
          },
          attributes: ["id", "username", "photoUrl"],
          required: false,
        },
      ],
    });
    // const date = new Date(Date.now()).toISOString();
    // const values = {
    //   "dateLastAccessed": date
    // }
    // const selector = {
    //   where : {}
    // }
    // const tempcon = await Conversation.update(values, selector);
    // console.log("values");
    // console.log(values);

    for (let i = 0; i < conversations.length; i++) {
      const convo = conversations[i];
      const convoJSON = convo.toJSON();
      if (convoJSON.dateLastAccessed !== null) {
        let unreadCount = 0;
        for (let j = convo.messages.length-1; j >= 0 ; j--) {
          console.log(convo.messages[j].createdAt);
          if (Date.parse(convo.messages[j].createdAt) > Date.parse(convoJSON.dateLastAccessed)) {
            unreadCount++;
          } else {
            break;
          }
        }
        convoJSON.unreadMessages = unreadCount;
      } else {
        convoJSON.unreadMessages = 0;
        const newDate = new Date(Date.now());
        convoJSON.dateLastAccessed = newDate.toISOString();
      }
      // console.log("messages")
      // console.log(convo.messages);
      // set a property "otherUser" so that frontend will have easier access
      if (convoJSON.user1) {
        convoJSON.otherUser = convoJSON.user1;
        delete convoJSON.user1;
      } else if (convoJSON.user2) {
        convoJSON.otherUser = convoJSON.user2;
        delete convoJSON.user2;
      }

      // set property for online status of the other user
      if (onlineUsers.includes(convoJSON.otherUser.id)) {
        convoJSON.otherUser.online = true;
      } else {
        convoJSON.otherUser.online = false;
      }

      const reversedMessages = convoJSON.messages.slice(0).reverse();
      convoJSON.messages = reversedMessages;
      // set properties for notification count and latest message preview
      console.log("messages");
      console.log(convoJSON);
      if (convoJSON.messages.length !== 0) {
        convoJSON.latestMessageText = convoJSON.messages[convoJSON.messages.length-1].text;
      }
      conversations[i] = convoJSON;
    }

    res.json(conversations);
  } catch (error) {
    next(error);
  }
});


router.post("/", async (req, res, next) => {
  // console.log("postFunction");
  // console.log(req.body);
  const {id, dateLastAccessed} = req.body;
  console.log(id);
  console.log(typeof dateLastAccessed);
  try {
    // console.log("conversation");
    // console.log(Conversation.create());
    // const testConvo = await Conversation.create({
    //   user1Id: 3,
    //   user2Id: 9,
    // });
    // console.log("testconvo");
    // console.log(testConvo);
    const tempcon = await Conversation.update({ "dateLastAccessed": dateLastAccessed, }, {
      where: {
        id: id,
        returning: true,
        plain: true
      }
    });
    console.log("tempcon2")
    console.log(tempcon);
    res.json({ tempcon });
  } catch (error) {
    next(error);
  }
});


module.exports = router;
