<script setup lang="ts">
import { MessageContentV3, MessagesList, Ylide } from "@ylide/sdk";
import { onMounted, ref } from "vue";
import { EVMNetwork } from "../../../@ylide/Ethereum";
import BarTop from "../../../Component/BarTop.vue";
import connect from "../../../Composables/connect";
import { useYlideStore } from "../../../store";
import MessageItem from "./MessageItem.vue";
let data = ref([]);
let text = ref("");
const { connectWalletConnect, state } = connect();
const ylideStore = useYlideStore();

onMounted(async () => {
  const list = new MessagesList();
  console.log(list);
  console.log(list.getWindow());
  await read();
  // let initData = (chat) => {
  //   let result = [];
  //   let msg1 = `醉里挑灯看剑，梦回吹角连营。八百里分麾下灸，五十弦翻塞外声。沙场秋点兵。马作的卢飞快，弓如霹雳弦惊。了却君王天下事，嬴得生前身后名。可怜白发生`;
  //   let msg2 = `怒发冲冠，凭栏处，潇潇雨歇。抬望眼，仰天长啸，壮怀激烈。 三十功名尘与土，八千里路云和月。莫等闲，白了少年头，空悲切！ 靖康耻，犹未雪；臣子恨，何时灭?驾长车，踏破贺兰山缺！ 壮志饥餐胡虏肉，笑谈渴饮匈奴血。待从头，收拾旧山河，朝天阙！`;
  //   for (let i = 0; i < 10; i++) {
  //     let model = {};
  //     model.createTime = Date.now();
  //     model.isInMsg = i % 2 === 0;
  //     model.messageContent = model.isInMsg ? msg1 : msg2;
  //     model.fromName = model.isInMsg ? "測試" : "我";
  //     result.push(model);
  //   }
  //   return result;
  // };
  // store.value = initData();
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
  console.log(ylideStore.readers[0]);
  // const messages = await ylideStore.readers[0].retrieveMessageHistoryByBounds(
  //   state.value.address,
  //   null
  // );
  // console.log(messages);
  // const message = messages[0];
  // const content = await ylideStore.readers[0].retrieveAndVerifyMessageContent(
  //   message
  // );
  // console.log(content);

  // if (!content || content.corrupted) {
  //   // check content integrity
  //   throw new Error("Content not found or corrupted");
  // }
  // const decodedContent = await ylideStore.ylide.decryptMessageContent(
  //   { address: state.value.address },
  //   message,
  //   content
  // );
  // console.log(decodedContent);
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
