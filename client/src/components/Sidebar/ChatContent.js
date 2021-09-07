import React from "react";
import { Box, Typography, Badge } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    justifyContent: "space-between",
    marginLeft: 20,
    flexGrow: 1,
  },
  username: {
    fontWeight: "bold",
    letterSpacing: -0.2,
  },
  previewTextNormal: {
    fontSize: 12,
    letterSpacing: -0.17,
    color: "#9CADC8",
  },
  previewTextBold: {
    fontSize: 12,
    letterSpacing: -0.17,
    fontWeight: 800,
    color: "#000000",
  },
  unreadDisplay: {
    color: "#FFFFFF",
    fontWeight: 800,
    backgroundColor: "#3F92FF",
    height: 30,
    width: 30,
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
}));

const ChatContent = (props) => {
  const classes = useStyles();

  const { conversation } = props;
  const { latestMessageText, otherUser, unreadMessages, typing } = conversation;

  return (
    <Box className={classes.root}>
      <Box>
        <Typography className={classes.username}>
          {otherUser.username}
        </Typography>
        <Typography className={unreadMessages > 0 ? classes.previewTextBold : classes.previewTextNormal}>
          {typing === false || !typing ? latestMessageText : "Typing..."}
        </Typography>
      </Box>
      <Badge className={unreadMessages === 0 || !unreadMessages ? "" : classes.unreadDisplay}>
        {unreadMessages !== 0 ? unreadMessages : null}
      </Badge>
    </Box>
  );
};

export default ChatContent;
