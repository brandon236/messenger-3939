import React from "react";
import { Box, Avatar } from "@material-ui/core";
import { SenderBubble, OtherUserBubble } from "../ActiveChat";
import moment from "moment";

import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(() => ({
  avatar: {
    height: 30,
    width: 30,
    marginLeft: "calc(100vw - 590px)",
    marginTop: 10,
    marginBottom: 10,
  },
}));


const Messages = (props) => {
  const classes = useStyles();
  const { messages, otherUser, userId, typing } = props;

  return (
    <Box>
      {messages.map((message) => {
        const time = moment(message.createdAt).format("h:mm");
        return message.senderId === userId ? (
          <React.Fragment key={message.id}>
          <SenderBubble text={message.text} time={time} />
          { message.readStatus !== false ? 
            <Avatar alt={otherUser.username} src={otherUser.photoUrl} className={classes.avatar}></Avatar>
          : 
            null
          }
          </React.Fragment>
        ) : (
          <OtherUserBubble key={message.id} text={message.text} time={time} otherUser={otherUser} />
        );
      })}
      {/* When the other user is typing a message */}
      {typing === true ? <OtherUserBubble key={"temp"} text={"●●●"} time={null} otherUser={otherUser} /> : null}
    </Box>
  );
};

export default Messages;
