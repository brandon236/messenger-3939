export const addMessageToStore = (state, payload) => {
  const { message, sender, newDateAccessed } = payload;
  console.log("state:", state);
  // const newActive = (getActiveChat());
  // if sender isn't null, that means the message needs to be put in a brand new convo
  if (sender !== null) {
    const newConvo = {
      id: message.conversationId,
      otherUser: sender,
      dateLastAccessed: newDateAccessed,
      unreadMessages: 1,
      messages: [message],
    };
    newConvo.latestMessageText = message.text;
    return [newConvo, ...state];
  }
  return state.map((convo) => {
    if (convo.id === message.conversationId) {
      let newUnread = convo.unreadMessages;
      let dateLastAccessed = convo.dateLastAccessed;
      if (newDateAccessed === null) {
        console.log("dateNull:");
        newUnread = convo.unreadMessages + 1;
      } else {
        dateLastAccessed = newDateAccessed;
      }
      const newConvo = {
        ...convo,
        messages: convo.messages.concat(message),
        latestMessageText: message.text,
        unreadMessages: newUnread,
        dateLastAccessed,
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
        unreadMessages: 1,
      };
      return newConvo;
    } else {
      return convo;
    }
  });
};

export const addNewAccessedDate = (state, payload) => {
  const { dateLastAccessed, id } = payload.body
  console.log("dateAdd:", payload);
  return state.map((convo) => {
    if (convo.id === id) {
      if (payload.body.otherUser.id === payload.body.messages[payload.body.messages.length-1].senderId) { 
        const newConvo = {
          ...convo,
          dateLastAccessed,
          unreadMessages: 0,
        };
        return newConvo;
      } else {
        return convo;
      }
    } else {
      return convo;
    }
  })
};