import io from "socket.io-client";
import store from "./store";
import {
  removeOfflineUser,
  addOnlineUser,
  setTyping,
} from "./store/conversations";
import {
  getActive
} from "./store/utils/thunkCreators"

const socket = io(window.location.origin);

socket.on("connect", () => {
  console.log("connected to server");

  socket.on("add-online-user", (id) => {
    store.dispatch(addOnlineUser(id));
  });

  socket.on("remove-offline-user", (id) => {
    store.dispatch(removeOfflineUser(id));
  });
  socket.on("new-message", (data) => {
   store.dispatch(getActive(data.message, data.sender, data.senderUsername, data.newDateAccessed));
  });
  socket.on("isTyping", (data) => {
    store.dispatch(setTyping(data.recipientId, data.typing));
   });
});

export default socket;
