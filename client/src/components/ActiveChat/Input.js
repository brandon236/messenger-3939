import React, { useState } from "react";
import { FormControl, FilledInput } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { connect } from "react-redux";
import { postMessage } from "../../store/utils/thunkCreators";
import { changeTyping } from "../../store/utils/thunkCreators";

const useStyles = makeStyles(() => ({
  root: {
    justifySelf: "flex-end",
    marginTop: 15
  },
  input: {
    height: 70,
    backgroundColor: "#F4F6FA",
    borderRadius: 8,
    marginBottom: 20
  }
}));

const Input = (props) => {
  const classes = useStyles();
  const [text, setText] = useState("");
  const { postMessage, otherUser, conversationId, user, dateLastAccessed } = props;

  //setType is being used to tell the postMessage function to only update the typing variable. 
  const handleChange = async (event) => {
    setText(event.target.value);
    let newConversation = {
      username: user.username,
      conversationId: conversationId,
      setType: 1,
    }
    if (event.target.value.length > 0 && otherUser.typing === false){
      newConversation = {
        ...newConversation,
        typing: true,
      }
      await postMessage(newConversation);
    } else if (event.target.value.length === 0 && otherUser.typing === true) {
      newConversation = {
        ...newConversation,
        typing: false,
      }
      await postMessage(newConversation);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    // add sender user info if posting to a brand new convo, so that the other user will have access to username, profile pic, etc.
    let newestDate = dateLastAccessed;
    if (!dateLastAccessed) {
      newestDate = new Date(Date.now()).toISOString();
    }
    const reqBody = {
      text: event.target.text.value,
      recipientId: otherUser.id,
      conversationId,
      sender: conversationId ? null : user,
      senderUsername: user.username,
      dateLastAccessed: newestDate,
    };
    await postMessage(reqBody);


    // sets the typing status back to false.
    const newConversation = {
      username: user.username,
      conversationId: conversationId,
      setType: 1,
      typing: false,
    }
    setText("");
    await postMessage(newConversation);
  };

  return (
    <form className={classes.root} onSubmit={handleSubmit}>
      <FormControl fullWidth hiddenLabel>
        <FilledInput
          classes={{ root: classes.input }}
          disableUnderline
          placeholder="Type something..."
          value={text}
          name="text"
          onChange={handleChange}
        />
      </FormControl>
    </form>
  );
};

const mapDispatchToProps = (dispatch) => {
  return {
    postMessage: (message) => {
      dispatch(postMessage(message));
    },
    changeTyping: (body) => {
      dispatch(changeTyping(body));
    },
  };
};

export default connect(null, mapDispatchToProps)(Input);
