<script setup lang="ts">
import { onMounted, ref, nextTick } from "vue";
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
let messageTips = ref(false);
onMounted(async () => {
  await listen();
});

const read = async (messages, isNew = false) => {
  console.log("messages:", messages);
  messages = messages.reverse();
  for (let i = 0; i < messages.length; i++) {
    let message = messages[i];
    const content = await ylideStore.readers[0].retrieveAndVerifyMessageContent(
      message.msg
    );

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
      let text = "";
      // support ylide mail message
      try {
        let parseText = JSON.parse(decodedContent.content);
        text = parseText.blocks[0].data.text;
      } catch (e) {
        text = decodedContent.content;
      }
      await ylideStore.ylideChatDB.setItem(content.senderAddress, [
        ...chatList,
        {
          msgId: content.msgId,
          content: text,
          fromName: content.senderAddress,
          sendTime: dayjs.unix(message.msg.createdAt).format("DD.MM.YYYY"),
          mine:
            state.value.address === content.senderAddress.toLocaleLowerCase(),
          isNew,
        },
      ]);
      if (isNew) {
        new Notification(content.senderAddress, {
          body: text,
        });
        newMessageTips(true);
      }
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
      await read(messages, true);
      await getChatList();
      console.log(`you've got a new messages, yoohoo: `, messages);
    }
  );

  await list.resume(); // we need to activate list before we will be able to read from it
  const messages = await list.readMore(100);
  await read(messages);
  await getChatList();

  if (!list.drained) {
    const messages = await list.readMore(100);
    await read(messages);
    await getChatList();
  }
};
const updateSelected = async (address: string) => {
  selected.value = address;
  const list = await ylideStore.ylideChatDB.getItem(address);
  const clearNew = list.map((item) => ({ ...item, isNew: false }));
  await ylideStore.ylideChatDB.setItem(address, clearNew);
  await getChatList();
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
        isNew: list[list.length - 1].isNew,
      };
    } else {
      item = {
        fromName: address,
        sendTime: "",
        lastMsg: "",
        isNew: false,
      };
    }

    chatBoardList.value.push(item);
  }
};

const newMessageTips = (status: boolean) => {
  messageTips.value = status;
  nextTick(() => {
    messageTips.value = false;
  });
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
    :chatBoardList="chatBoardList"
    :messageTips="messageTips"
    @updateSelected="updateSelected"
  ></MessageBoard>
</template>
<style scoped lang="scss"></style>
