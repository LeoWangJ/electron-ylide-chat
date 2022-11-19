<script setup lang="ts">
import { MessageContentV3 } from "@ylide/sdk";
import { onMounted, ref } from "vue";
import { EVMNetwork } from "../../../@ylide/Ethereum";
import BarTop from "../../../Component/BarTop.vue";
import connect from "../../../Composables/connect";
import { useYlideStore } from "../../../store";
import MessageItem from "./MessageItem.vue";

interface DecodedContent {
  serviceCode: number;
  decryptedContent: Uint8Array;
  type: string;
  subject: string;
  content: any;
  fromName: string;
  mine: boolean;
}
let data = ref<DecodedContent[]>([]);
let text = ref("");
const { state } = connect();
const ylideStore = useYlideStore();

onMounted(async () => {
  await read();
});

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
      await send("0x3adEcd65A2Db4F9Cb6e84a6D0DE5d33b8a8B9f89");
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

const read = async () => {
  let messages = await ylideStore.readers[0].retrieveMessageHistoryByBounds(
    ylideStore.wallet.addressToUint256(state.value.address)
  );
  messages = messages.reverse();
  for (let message of messages) {
    const content = await ylideStore.readers[0].retrieveAndVerifyMessageContent(
      message
    );
    console.log(content);
    if (!content || content.corrupted) {
      // check content integrity
      throw new Error("Content not found or corrupted");
    }

    const decodedContent = await ylideStore.ylide.decryptMessageContent(
      { address: state.value.address, blockchain: "", publicKey: null },
      message,
      content
    );
    console.log(decodedContent);

    data.value.push({
      ...decodedContent,
      fromName: content.senderAddress,
      mine: state.value.address === content.senderAddress,
    });
  }
  console.log("data:", data.value);
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
