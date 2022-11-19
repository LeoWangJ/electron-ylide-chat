<script setup lang="ts">
import { useRouter } from "vue-router";
import connect from "../Composables/connect";
import BarTop from "../Component/BarTop.vue";
import { ref } from "vue";
import { useYlideStore } from "../store";
import { EVMNetwork } from "../@ylide/Ethereum";
import { ElMessage } from "element-plus";

const ylideStore = useYlideStore();
const { connectWalletConnect, state } = connect();
const password = ref("");
const disabled = ref(false);

const connectUserWallet = async () => {
  try {
    await connectWalletConnect();
    await checkKey();
  } catch (e) {
    console.log(e);
  }
};

const passwordHandler = async () => {
  if (!password.value) return;

  disabled.value = true;
  ElMessage({
    message: "Please check your wallet, you need to sign it",
  });
  try {
    await setStoreKey(password.value);
    const isPublic = await checkKey();
    if (!isPublic) {
      ElMessage({
        message: "Please check your wallet, you need to publish your key",
      });
      await publishKey();
      state.value.isPublic = true;
      location.reload();
    } else {
      state.value.isPublic = true;
      location.reload();
    }
  } catch (e) {
    ElMessage({
      message: "An error occurred",
      type: "error",
    });
  } finally {
    disabled.value = false;
  }
};

const setStoreKey = async (password: string) => {
  const key = await ylideStore.keystore.create(
    `Generation key for ${state.value.address}`,
    "evm",
    "web3",
    state.value.address,
    password
  );
  state.value.publicKey = key.publicKey;
  await key.storeUnencrypted(password);
  await ylideStore.keystore.save();
};

const checkKey = async () => {
  const pk = await ylideStore.readers[0].extractPublicKeyFromAddress(
    state.value.address
  );
  if (pk) {
    state.value.isPublic = true;
    console.log(`found public key for ${state.value.address} `);
    return pk.bytes;
  } else {
    return null;
  }
};

const publishKey = async () => {
  await ylideStore.wallet.attachPublicKey(
    { address: state.value.address, blockchain: "", publicKey: null },
    state.value.publicKey!,
    {
      address: state.value.address,
      network: EVMNetwork.ARBITRUM,
    }
  );
};
</script>

<template>
  <div class="Login">
    <BarTop />
    <h3>Ylide Chat</h3>
    <img src="../assets/ylide-io.png" alt="" class="Login-logo" />
    <template v-if="!state.status">
      <div class="Login-btn" @click="connectUserWallet">WalletConnect</div>
    </template>
    <template v-else-if="!state.isPublic">
      <span>Enter Ylide password for your first key</span>
      <input
        class="inputBox"
        placeholder="password"
        type="password"
        v-model="password"
      />
      <button class="Login-btn" @click="passwordHandler" :disabled="disabled">
        Confirm
      </button>
    </template>
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
    border: 0;
    &:disabled {
      background-color: #888;
    }
  }
}

.inputBox {
  -webkit-app-region: no-drag;
  width: 200px;
  margin: 8px;
  height: 23px;
  line-height: 22px;
  background: white;
  box-sizing: border-box;
  overflow: hidden;
  border: 1px solid rgb(226, 226, 226);
  border-radius: 3px;
  outline: none;
  padding-left: 23px;
  font-size: 12px;
  padding-right: 6px;
  font-family: "Microsoft Yahei", -apple-system, Ubuntu, sans-serif;
  &:focus {
    background: #fff;
  }
  /* 输入框为空时显示 placeholder */
  &:empty:before {
    content: attr(placeholder);
    color: #888;
  }
  /* 输入框获取焦点时移除 placeholder */
  &:focus:before {
    content: none;
  }
}
</style>
