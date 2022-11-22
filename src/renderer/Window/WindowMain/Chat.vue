<script setup lang="ts">
import { onMounted, ref } from "vue";
import ChatBoard from "./Chat/ChatBoard.vue";
import MessageBoard from "./Chat/MessageBoard.vue";
import {
  BlockchainListSource,
  BlockchainSourceType,
  IMessageWithSource,
  IndexerListSource,
  ListSourceDrainer,
  ListSourceMultiplexer,
  SourceReadingSession,
} from "@ylide/sdk";
import {
  EthereumBlockchainController,
  EthereumListSource,
} from "@ylide/ethereum";
import connect from "../../Composables/connect";
import { useYlideStore } from "../../store";
import dayjs from "dayjs";
const { state } = connect();
const ylideStore = useYlideStore();
const selected = ref("");
let chatBoardList = ref([]);

onMounted(async () => {
  await listen();
});

const read = async (messages) => {
  console.log("messages:", messages);
  messages = messages.reverse();
  for (let i = 0; i < messages.length; i++) {
    let message = messages[i];
    const content = await ylideStore.readers[0].retrieveAndVerifyMessageContent(
      message.msg
    );
    console.log(content);
    if (!content || content.corrupted) {
      // check content integrity
      throw new Error("Content not found or corrupted");
    }
    if (messages.length - 1 === i) selected.value = content.senderAddress;
    let chatList = await ylideStore.ylideChatDB.getItem(content.senderAddress);
    console.log("chatList:", chatList);
    if (!chatList) {
      chatList = [];
      await ylideStore.ylideChatDB.setItem(content.senderAddress, []);
    } else {
    }

    const msgIdList = chatList ? chatList.map((item) => item.msgId) : [];
    if (!msgIdList.includes(content.msgId)) {
      const decodedContent = await ylideStore.ylide.decryptMessageContent(
        { address: state.value.address, blockchain: "", publicKey: null },
        message.msg,
        content
      );

      await ylideStore.ylideChatDB.setItem(content.senderAddress, [
        ...chatList,
        {
          msgId: content.msgId,
          ...decodedContent,
          fromName: content.senderAddress,
          sendTime: dayjs.unix(message.msg.createdAt).format("DD.MM.YYYY"),
          mine:
            state.value.address === content.senderAddress.toLocaleLowerCase(),
        },
      ]);
    }
  }
};

const listen = async () => {
  const readingSession = new SourceReadingSession();
  readingSession.sourceOptimizer = (subject, reader) => {
    const useIndexer = true;
    if (reader instanceof EthereumBlockchainController) {
      console.log(reader);
      const evmListSource = new EthereumListSource(reader, subject, 30000);
      if (useIndexer) {
        return new IndexerListSource(
          evmListSource,
          readingSession.indexerHub,
          reader,
          subject
        );
      } else {
        return evmListSource;
      }
    } else {
      return new BlockchainListSource(reader, subject, 10000);
    }
  };

  const listSource1 = readingSession.listSource(
    {
      blockchain: ylideStore.wallet,
      type: BlockchainSourceType.DIRECT,
      recipient: ylideStore.wallet.addressToUint256(state.value.address),
      sender: null,
    },
    ylideStore.readers[0]
  );
  const listSource2 = readingSession.listSource(
    {
      blockchain: ylideStore.wallet,
      type: BlockchainSourceType.BROADCAST,
      sender: state.value.address,
    },
    ylideStore.readers[0]
  );
  const multiplexer = new ListSourceMultiplexer([listSource1, listSource2]);
  const list = new ListSourceDrainer(multiplexer);
  list.on(
    "messages",
    async ({ messages }: { messages: IMessageWithSource[] }) => {
      await read(messages);
      console.log(`you've got a new messages, yoohoo: `, messages);
    }
  );

  await list.resume(); // we need to activate list before we will be able to read from it
  const messages = await list.readMore(100);
  console.log(list, messages);
  await read(messages);
  await getChatList();
  console.log("can I read more:", list.drained);

  if (!list.drained) {
    console.log("messages: ", await list.readMore(10));
  }
};
const updateSelected = (address: string) => {
  selected.value = address;
};

const getChatList = async () => {
  chatBoardList.value = [];
  const addresses = await ylideStore.ylideChatDB.keys();
  for (let address of addresses) {
    const list = await ylideStore.ylideChatDB.getItem(address);
    let item = {};
    if (list.length) {
      item = {
        fromName: address,
        sendTime: list[list.length - 1].sendTime,
        lastMsg: list[list.length - 1].content,
      };
    } else {
      item = {
        fromName: address,
        sendTime: "",
        lastMsg: "",
      };
    }

    chatBoardList.value.push(item);
  }
};
</script>
<template>
  <ChatBoard
    :selected="selected"
    :chatBoardList="chatBoardList"
    @updateChatList="getChatList"
    @updateSelected="updateSelected"
  ></ChatBoard>
  <MessageBoard
    :selected="selected"
    @updateSelected="updateSelected"
  ></MessageBoard>
</template>
<style scoped lang="scss"></style>
