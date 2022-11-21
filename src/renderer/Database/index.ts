import localforage from "localforage";

localforage.config({
  name: "ylide-chat-db",
  storeName: "ylideChat",
});

export const ylideChatDB = localforage;
