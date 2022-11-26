<script setup lang="ts">
import { BoardList } from "../../../types";

defineProps<{
  data: BoardList;
  selected: string;
}>();
</script>
<template>
  <div
    @click="$emit('updateSelected', data.fromName)"
    :class="['chatItem', { chatItemSelected: selected === data.fromName }]"
  >
    <div class="avatar">
      <img src="../../../assets/avatar.png" alt="" />
    </div>
    <div class="chatInfo">
      <div class="row">
        <div class="fromName">
          {{ `${data.fromName.slice(0, 4)}...${data.fromName.slice(-6)}` }}
        </div>
        <div class="timeName">{{ data.sendTime }}</div>
      </div>
      <div class="row">
        <div class="lastMsg">{{ data.lastMsg }}</div>
        <div class="newMessage">
          <div v-if="data.isNew" class="new"></div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.chatItem {
  display: flex;
  height: 66px;
  box-sizing: border-box;
  cursor: pointer;
  &:hover {
    background: rgb(221, 219, 218);
  }
}
.chatItemSelected {
  background: rgb(196, 196, 196);
  &:hover {
    background: rgb(196, 196, 196);
  }
}
.avatar {
  width: 66px;
  display: flex;
  align-items: center;
  justify-content: center;
  img {
    width: 46px;
    height: 46px;
  }
}
.chatInfo {
  flex: 1;
  height: 66px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.row {
  box-sizing: border-box;
  height: 28px;
  line-height: 28px;
  display: flex;
}
.fromName {
  flex: 1;
}
.timeName {
  color: rgb(153, 153, 153);
  padding-right: 12px;
  font-size: 12px;
}
.lastMsg {
  color: rgb(153, 153, 153);
  flex: 1;
  font-size: 12px;
}
.newMessage {
  display: flex;
  justify-content: center;
  align-items: center;
}
.new {
  border-radius: 50%;
  width: 5px;
  height: 5px;
  background-color: red;
  margin-right: 10px;
}
</style>
