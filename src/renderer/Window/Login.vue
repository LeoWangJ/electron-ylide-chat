<script setup lang="ts">
import { useRouter } from "vue-router";
import connect from "../Composables/connect";
import BarTop from "../Component/BarTop.vue";

const router = useRouter();
const { connectWalletConnect, state } = connect();

const connectUserWallet = async () => {
  try {
    await connectWalletConnect();
    if (state.value.status) {
      location.reload();
    }
  } catch (e) {
    console.log(e);
  }
};
</script>

<template>
  <div class="Login">
    <BarTop />
    <h3>Ylide Chat</h3>
    <img src="../assets/ylide-io.png" alt="" class="Login-logo" />

    <div class="Login-btn" @click="connectUserWallet">WalletConnect</div>
  </div>
</template>

<style scoped lang="scss">
.Login {
  background: rgb(230, 229, 229);
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  &-logo {
    width: 150px;
    margin-bottom: 20px;
  }

  &-btn {
    background-color: green;
    color: white;
    padding: 15px;
    border-radius: 5px;
  }
}
</style>
