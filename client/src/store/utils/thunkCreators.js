import axios from "axios";
import socket from "../../socket";
import {
  gotConversations,
  addConversation,
  setNewMessage,
  setSearchedUsers,
  addDate,
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

const saveDate = async (body, date) => {
  const newBody = {
    ...body, 
    dateLastAccessed: date,
  }
  await axios.post("/api/conversations", newBody);
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

const sendTyping = (body) => {
  console.log("typing:", body);
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
      if (!body.dateLastAccessed) {
        body.dateLastAccessed = new Date(Date.now()).toISOString();
      }
      const data = await saveMessage(body);
        if (!body.conversationId) {
          dispatch(addConversation(body.recipientId, data.message));
        } else {
          dispatch(setNewMessage(data.message, body.dateLastAccessed));
        }
        sendMessage(data, body);
    }
  } catch (error) {
    console.error(error);
  }
};

//gets the active conversation to be used later
export const getActive = (message, sender, senderUsername, newDateAccessed) => async (dispatch, getState) => {
  const { activeConversation } = getState();
  let newDate = null;
  if (sender === null) {
    if (activeConversation === senderUsername) {
      newDate = new Date(Date.now()).toISOString();
      await saveDate({id: message.conversationId}, newDate);
    }
  } else {
    newDate = newDateAccessed;
  }
  dispatch(setNewMessage(message, newDate, sender));
}

export const addNewDate = (date) => async (dispatch) => {
  try {
    if (date.messages.length > 0) {
      if (date.otherUser.id === date.messages[date.messages.length-1].senderId) {
        await saveDate(date, date.dateLastAccessed);
        dispatch(addDate(date));
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

export const changeTyping = (body) => async (dispatch) => {
  try {
    console.log("gfsoafdf:", body);
    sendTyping(body);
    dispatch(setTyping(body));
  } catch (error) {
    console.error(error);
  }
};
