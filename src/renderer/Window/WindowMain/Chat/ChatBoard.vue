<script setup lang="ts">
import { onMounted, ref } from "vue";
import ChatItem from "./ChatItem.vue";
import ChatSearch from "./ChatSearch.vue";
let store = ref([]);
onMounted(() => {
  let prepareData = () => {
    let result = [];
    for (let i = 0; i < 10; i++) {
      let model = {};
      model.fromName = "聊天对象" + i;
      model.sendTime = "昨天";
      model.lastMsg = "这是此会话的最后一条消息" + i;
      model.avatar = `https://pic3.zhimg.com/v2-306cd8f07a20cba46873209739c6395d_im.jpg?source=32738c0c`;
      result.push(model);
    }
    result[5].isSelected = true;
    return result;
  };
  store.value = prepareData();
});
</script>
<template>
  <div class="ChatList">
    <ChatSearch />
    <div class="ListBox">
      <ChatItem :data="item" v-for="item in store" :key="item.id" />
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
