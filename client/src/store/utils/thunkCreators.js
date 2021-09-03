import axios from "axios";
import socket from "../../socket";
import {
  gotConversations,
  addConversation,
  setNewMessage,
  setSearchedUsers,
  setRead,
  setTyping,
} from "../conversations";

import { gotUser, setFetchingStatus } from "../user";

axios.interceptors.request.use(async function (config) {
  const token = await localStorage.getItem("messenger-token");
  config.headers["x-access-token"] = token;

  return config;
});

// USER THUNK CREATORS

export const fetchUser = () => async (dispatch) => {
  dispatch(setFetchingStatus(true));
  try {
    const { data } = await axios.get("/auth/user");
    dispatch(gotUser(data));
    if (data.id) {
      socket.emit("go-online", data.id);
    }
  } catch (error) {
    console.error(error);
  } finally {
    dispatch(setFetchingStatus(false));
  }
};

export const register = (credentials) => async (dispatch) => {
  try {
    const { data } = await axios.post("/auth/register", credentials);
    await localStorage.setItem("messenger-token", data.token);
    dispatch(gotUser(data));
    socket.emit("go-online", data.id);
  } catch (error) {
    console.error(error);
    dispatch(gotUser({ error: error.response.data.error || "Server Error" }));
  }
};

export const login = (credentials) => async (dispatch) => {
  try {
    const { data } = await axios.post("/auth/login", credentials);
    await localStorage.setItem("messenger-token", data.token);
    dispatch(gotUser(data));
    socket.emit("go-online", data.id);
  } catch (error) {
    console.error(error);
    dispatch(gotUser({ error: error.response.data.error || "Server Error" }));
  }
};

export const logout = (id) => async (dispatch) => {
  try {
    await axios.delete("/auth/logout");
    await localStorage.removeItem("messenger-token");
    dispatch(gotUser({}));
    socket.emit("logout", id);
  } catch (error) {
    console.error(error);
  }
};

// CONVERSATIONS THUNK CREATORS

export const fetchConversations = () => async (dispatch) => {
  try {
    const { data } = await axios.get("/api/conversations");
    dispatch(gotConversations(data));
  } catch (error) {
    console.error(error);
  }
};

const saveMessage = async (body) => {
  const { data } = await axios.post("/api/messages", body);
  return data;
};

const updateMessage = async (body) => {
  await axios.put("/api/messages", body);
}

const sendMessage = (data, body) => {
  socket.emit("new-message", {
    message: data.message,
    recipientId: body.recipientId,
    sender: data.sender,
    senderUsername: body.senderUsername,
    newDateAccessed: body.dateLastAccessed,
  });
};

const sendNewRead = (data) => {
  socket.emit("new-read-status", {
    id: data.id, 
    readStatus: data.readStatus,
    unreadMessages: data.unreadMessages,
  });
};

const sendTyping = (body) => {
  socket.emit("isTyping", {
    recipientId: body.conversationId,
    typing: body.typing,
  });
};

// message format to send: {recipientId, text, conversationId}
// conversationId will be set to null if its a brand new conversation
export const postMessage = (body) => async (dispatch) => {
  try {
    if (body.setType) {
      sendTyping(body);
      dispatch(setTyping(body.conversationId, body.typing, body.username));
    } else {
      const data = await saveMessage(body);
        if (!body.conversationId) {
          dispatch(addConversation(body.recipientId, data.message));
        } else {
          dispatch(setNewMessage(data.message, body.userID));
        }
        sendMessage(data, body);
    }
  } catch (error) {
    console.error(error);
  }
};

//gets the active conversation to be used later
export const getActive = (message, sender, senderUsername) => async (dispatch, getState) => {
  const { activeConversation } = getState();
  const userID = getState().user.id;
  if (!sender) {
    if (activeConversation === senderUsername) {
      const newMessage = {
        ...message,
        readStatus: true
      }
      message = newMessage;
      await updateMessage(message);
    }
  }
  dispatch(setNewMessage(message, userID, sender));
}

//only adds a new date if the last message was posted by the other user
export const setNewRead = (date) => async (dispatch) => {
  try {
    console.log("setRead:", date)
    if (date.messages.length > 0) {
      if (date.otherUser.id === date.messages[date.messages.length-1].senderId) {
        await updateMessage({id: null, readStatus: date.readStatus, convoId: date.id});
        sendNewRead({id: date.id, readStatus: date.readStatus, unreadMessages: date.unreadMessages});
        dispatch(setRead(date.id, date.readStatus, date.unreadMessages));
      }
    }
  } catch (error) {
    console.error(error);
  }
}

export const searchUsers = (searchTerm) => async (dispatch) => {
  try {
    const { data } = await axios.get(`/api/users/${searchTerm}`);
    dispatch(setSearchedUsers(data));
  } catch (error) {
    console.error(error);
  }
};

//This function isn't being called for some reason. I had to use the postMessage function instead. 
export const changeTyping = (body) => async (dispatch) => {
  try {
    sendTyping(body);
    dispatch(setTyping(body));
  } catch (error) {
    console.error(error);
  }
};
