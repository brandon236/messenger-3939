export const addMessageToStore = (state, payload) => {
  const { message, sender, activeConversation } = payload;
  console.log("convo");
  console.log(state);
  // if sender isn't null, that means the message needs to be put in a brand new convo
  if (sender !== null) {
    const newConvo = {
      id: message.conversationId,
      otherUser: sender,
      messages: [message],
    };
    newConvo.latestMessageText = message.text;
    return [newConvo, ...state];
  }
  return state.conversations.map((convo) => {
    if (convo.id === message.conversationId) {
      const newUnread = convo.unreadMessages;
      if (state.activeConversation === convo.otherUser) {
        newUnread = (parseInt(newUnread) + 1).toString();
      }
      const newConvo = {
        ...convo,
        messages: convo.messages.concat(message),
        latestMessageText: activeConversation,
        unreadMessages: newUnread
      }
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
      console.log("convo");
      console.log(convo);
      const newConvo = {
        ...convo,
        id: message.conversationId,
        messages: [message],
        latestMessageText: message.text,
        unreadMessages: "1",
      };
      return newConvo;
    } else {
      return convo;
    }
  });
};

export const addNewAccessedDate = (state, payload) => {
  console.log("reducer");
  const { dateLastAccessed, id } = payload.date
  console.log(payload);
  return state.map((convo) => {
    if (convo.id === id) {
      const newConvo = {
        ...convo,
        dateLastAccessed,
      };
      return newConvo;
    } else {
      return convo;
    }
  })
};

export const addUnreadMessages = (state, payload) => {
  const { message, sender } = payload;
  console.log("reducer");
  console.log(state);
  // if sender isn't null, that means the message needs to be put in a brand new convo
  if (sender !== null) {
    const newConvo = {
      id: message.conversationId,
      otherUser: sender,
      messages: [message],
      unreadMessages: "1"
    };
    newConvo.latestMessageText = message.text;
    return [newConvo, ...state];
  }
  return state.map((convo) => {
    if (convo.id === message.conversationId) {
      console.log("convo");
      console.log(convo);
      const newUnread = (parseInt(convo.unreadMessages) + 1).toString();
      const newConvo = {
        ...convo,
        messages: convo.messages.concat(message),
        latestMessageText: message.text,
        unreadMessages: newUnread,
      }
      return newConvo;
    } else {
      return convo;
    }
  });
};