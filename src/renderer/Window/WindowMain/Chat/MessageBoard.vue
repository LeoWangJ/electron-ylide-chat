<script setup lang="ts">
import { MessageContentV3 } from "@ylide/sdk";
import { onMounted, ref, watch } from "vue";
import { EVMNetwork } from "@ylide/ethereum";
import BarTop from "../../../Component/BarTop.vue";
import connect from "../../../Composables/connect";
import { useYlideStore } from "../../../store";
import MessageItem from "./MessageItem.vue";

let text = ref("");
const { state } = connect();
const ylideStore = useYlideStore();
const props = defineProps<{
  selected: string;
}>();
let data = ref([]);
watch(
  () => props.selected,
  async (cur: string, prev: string) => {
    console.log(props.selected);
    if (cur !== prev && cur) {
      await getChatList(cur);
    }
  }
);

const getChatList = async (address: string) => {
  data.value = await ylideStore.ylideChatDB.getItem(address);
};
const inputEnter = async (e: {
  keyCode: number;
  ctrlKey: any;
  shiftKey: any;
  preventDefault: () => void;
}) => {
  if (e.keyCode === 13) {
    if (e.ctrlKey || e.shiftKey) {
      text.value = text.value.replace(/[\r\n]/g, "<br />");
    } else {
      e.preventDefault();
      await send(props.selected);
      text.value = "";
    }
  }
};

const send = async (recipient: string) => {
  const content = MessageContentV3.plain("subject", text.value);
  const msgId = await ylideStore.ylide.sendMessage(
    {
      wallet: ylideStore.wallet,
      sender: { address: state.value.address },
      content,
      recipients: [recipient],
    },
    { network: EVMNetwork.ARBITRUM }
  );
  console.log(msgId);
};
</script>
<template>
  <div class="MessageBord">
    <BarTop />
    <div class="MessageList">
      <MessageItem :data="item" v-for="item in data" :key="item.id" />
    </div>
    <div class="MessageTextArea">
      <textarea
        @keydown="inputEnter"
        v-model="text"
        class="MessageInput"
        placeholder="Write a message..."
      ></textarea>
    </div>
  </div>
</template>
<style scoped lang="scss">
.MessageBord {
  padding-top: 25px;
  box-sizing: border-box;
  height: 100%;
  display: flex;
  flex: 1;
  flex-direction: column;
}
.MessageList {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  background: rgb(245, 245, 245);
}

.MessageTextArea {
  width: 100%;
  height: 100px;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  z-index: 99;
  overflow: hidden;
}

.MessageInput {
  width: 100%;
  border: none;
  height: 100px;
  overflow: hidden;
  resize: none;
  overflow-y: auto;
  &:focus {
    outline: none;
  }
}
</style>
