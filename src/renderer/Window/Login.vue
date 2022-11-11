<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import connect from "../Composables/connect";

const router = useRouter();
const { connectWalletConnect, disconnectWallet, state } = connect();
console.log(state);
const connectUserWallet = async () => {
  await connectWalletConnect();
};

const disconnectUser = async () => {
  await disconnectWallet();
};

onMounted(() => {
  if (state.status) {
    router.push({ name: "chat" });
  }
});
</script>

<template>
  <div @click="connectUserWallet">login</div>
  <div @click="disconnectUser">logout</div>
</template>
