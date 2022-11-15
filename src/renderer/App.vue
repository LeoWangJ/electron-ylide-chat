<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { initializeProvider } from "@metamask/providers";
import { WindowPostMessageStream } from "@metamask/post-message-stream";
import {
  evmFactories,
  ethereumWalletFactory,
  EVMNetwork,
  EVM_NAMES,
} from "./@ylide/Ethereum/index";
import {
  Ylide,
  IMessage,
  MessageContentV3,
  YlideKeyStore,
  BrowserLocalStorage,
  MessagesList,
  AbstractWalletController,
  AbstractBlockchainController,
  WalletControllerFactory,
  YlideKeyPair,
  GenericEntry,
  BlockchainSource,
} from "@ylide/sdk";
import { useRouter } from "vue-router";
import connect from "./Composables/connect";
import { Duplex } from "stream";
import { useYlideStore } from "../store";

const router = useRouter();
const { state, autoConnect } = connect();

const storage = new BrowserLocalStorage();
const ylideStore = useYlideStore();

const readers = ref<AbstractBlockchainController[]>([]);
const keystore = new YlideKeyStore(storage, {
  onPasswordRequest: async (reason: string) => {
    return prompt(`Enter Ylide password for ${reason}:`);
  },
  onDeriveRequest: async (
    reason: string,
    blockchain: string,
    wallet: string,
    address: string,
    magicString: string
  ) => {
    try {
      return ylideStore.wallet.signMagicString(
        { address, blockchain, publicKey: null },
        magicString
      );
    } catch (err) {
      return null;
    }
  },
});

onMounted(async () => {
  await injectEthereum();
  await autoConnect();
  console.log(state);
  if (state.value.status) {
    router.push({ name: "chat" });
  } else {
    router.push({ name: "login" });
  }
  await initYlide();
});

const injectEthereum = () => {
  const metamaskStream = new WindowPostMessageStream({
    name: "inpage",
    target: "contentscript",
  });

  initializeProvider({
    connectionStream: metamaskStream as unknown as Duplex,
    shouldSetOnWindow: true,
    shouldShimWeb3: true,
  });
};

const initYlide = async () => {
  Ylide.registerBlockchainFactory(evmFactories[EVMNetwork.ETHEREUM]);
  Ylide.registerBlockchainFactory(evmFactories[EVMNetwork.POLYGON]);
  Ylide.registerWalletFactory(ethereumWalletFactory);

  await keystore.init();
  const ylide = new Ylide(keystore);

  readers.value = [
    await ylide.addBlockchain("ETHEREUM"),
    await ylide.addBlockchain("POLYGON"),
  ];
  await ylideStore.setWallet(ylide);
  console.log("wallet:", ylideStore.wallet);
};

const setStoreKey = async (password: string) => {
  const key = await keystore.create(
    `Generation key for ${state.value.address}`,
    "evm",
    "web3",
    state.value.address,
    password
  );
  console.log("key:", key);

  await key.storeUnencrypted(password);
  console.log(key);

  await keystore.save();
  console.log(key);
};

const publishKey = () => {
  ylideStore.wallet.attachPublicKey(
    { address: state.value.address, blockchain: "", publicKey: null },
    key,
    {
      address: state.value.address,
      network: EVMNetwork.ARBITRUM,
    }
  );
};
</script>

<template>
  <router-view />
</template>
