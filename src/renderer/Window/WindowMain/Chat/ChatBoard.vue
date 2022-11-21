<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useYlideStore } from "../../../store";
import ChatItem from "./ChatItem.vue";
import ChatSearch from "./ChatSearch.vue";
const ylideStore = useYlideStore();

let data = ref([]);
onMounted(async () => {
  await getChatList();
});

const getChatList = async () => {
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

    data.value.push(item);
  }
};
</script>
<template>
  <div class="ChatList">
    <ChatSearch />
    <div class="ListBox">
      <ChatItem
        :data="item"
        v-for="item in data"
        :key="item.address"
        v-bind="$attrs"
        v-on="$attrs"
      />
    </div>
  </div>
</template>
<style scoped lang="scss">
.ChatList {
  width: 250px;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
}
.ListBox {
  background: rgb(230, 229, 229);
  background-image: linear-gradient(
    to bottom right,
    rgb(235, 234, 233),
    rgb(240, 240, 240)
  );
  flex: 1;
  overflow-y: auto;
  box-sizing: border-box;

  border-right: 1px solid rgb(214, 214, 214);
}
</style>
