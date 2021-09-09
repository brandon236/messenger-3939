export const addMessageToStore = (state, payload) => {
  const { message, sender, userID } = payload;

  // if sender isn't null, that means the message needs to be put in a brand new convo
  if (sender !== null) {
    const newConvo = {
      id: message.conversationId,
      otherUser: sender,
      unreadMessages: 1,
      messages: [message],
      typing: false,
    };
    newConvo.latestMessageText = message.text;
    return [newConvo, ...state];
  }
  return state.map((convo) => {
    if (convo.id === message.conversationId) {
      let newUnread = convo.unreadMessages;
      let dateLastAccessed = convo.dateLastAccessed;
      if (message.senderId !== userID && message.readStatus === false) {
        newUnread = convo.unreadMessages + 1;
      }
      const newConvo = {
        ...convo,
        messages: convo.messages.concat(message),
        latestMessageText: message.text,
        unreadMessages: newUnread,
        dateLastAccessed,
        typing: false,
      };
      return newConvo;
    } else {
      return convo;
    }
  });
};

export const addOnlineUserToStore = (state, id) => {
  return state.map((convo) => {
    if (convo.otherUser.id === id) {
      const convoCopy = { ...convo };
      convoCopy.otherUser.online = true;
      return convoCopy;
    } else {
      return convo;
    }
  });
};

export const removeOfflineUserFromStore = (state, id) => {
  return state.map((convo) => {
    if (convo.otherUser.id === id) {
      const convoCopy = { ...convo };
      convoCopy.otherUser.online = false;
      return convoCopy;
    } else {
      return convo;
    }
  });
};

export const addSearchedUsersToStore = (state, users) => {
  const currentUsers = {};

  // make table of current users so we can lookup faster
  state.forEach((convo) => {
    currentUsers[convo.otherUser.id] = true;
  });

  const newState = [...state];
  users.forEach((user) => {
    // only create a fake convo if we don't already have a convo with this user
    if (!currentUsers[user.id]) {
      let fakeConvo = { otherUser: user, messages: [] };
      newState.push(fakeConvo);
    }
  });

  return newState;
};

export const addNewConvoToStore = (state, recipientId, message) => {
  return state.map((convo) => {
    if (convo.otherUser.id === recipientId) {
      const newConvo = {
        ...convo,
        id: message.conversationId,
        messages: [message],
        latestMessageText: message.text,
        unreadMessages: 0,
      };
      return newConvo;
    } else {
      return convo;
    }
  });
};

export const setNewRead = (state, payload) => {
  const { convoId, readStatus, unreadMessages } = payload
  return state.map((convo) => {
    if (convo.id === convoId) {
      let newConvo = convo;
      const newMessages = newConvo.messages;
      const newMessagesRevered = newMessages.slice().reverse();
      newMessagesRevered.forEach((message, index, arr) => {
        if (message.readStatus === !readStatus) {
          message.readStatus = readStatus;
        } else {
          arr.length = index + 1;
        }
      });
      if (unreadMessages !== 0) {
        newConvo = {
          ...newConvo,
          unreadMessages: 0,
          messages: newMessages
        }; 
      } else {
        newConvo = {
          ...newConvo,
          messages: newMessages
        }; 
      }
      return newConvo;
    } else {
      return convo;
    }
  });
};

export const changeTyping = (state, payload) => {
  const { recipientId, typing, username } = payload;
  return state.map((convo) => {
    if (convo.id === recipientId) {
      let newOtherUser = convo.otherUser;
      let newTyping = convo.typing;
      if (username) {
        newOtherUser = {
          ...newOtherUser,
          typing: typing,
        };
      } else {
        newTyping = typing;
      }
      const newConvo = {
        ...convo,
        otherUser: newOtherUser,
        typing: newTyping,
      };
      return newConvo;
    } else {
      return convo;
    }
  });
};