<script setup lang="ts">
import { onMounted } from "vue";
import { initializeProvider } from "@metamask/providers";
import { WindowPostMessageStream } from "@metamask/post-message-stream";
import {
  evmFactories,
  ethereumWalletFactory,
  EVMNetwork,
} from "@ylide/ethereum";
import { Ylide } from "@ylide/sdk";
import { useRouter } from "vue-router";
import connect from "./Composables/connect";
import { Duplex } from "stream";
import { useYlideStore } from "./store";
import { ylideChatDB } from "./Database";

const router = useRouter();
const { state, autoConnect } = connect();
const ylideStore = useYlideStore();
onMounted(async () => {
  await injectEthereum();
  await autoConnect();
  await ylideStore.setKeystore();
  if (state.value.status && state.value.isPublic) {
    router.push({ name: "chat" });
  } else {
    router.push({ name: "login" });
  }
  await initYlide();
  ylideStore.setDB(ylideChatDB);
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
  Ylide.registerBlockchainFactory(evmFactories[EVMNetwork.ARBITRUM]);
  Ylide.registerWalletFactory(ethereumWalletFactory);

  await ylideStore.keystore.init();
  const ylide = new Ylide(ylideStore.keystore as any);
  ylideStore.setYlide(ylide);

  const readers = [await ylide.addBlockchain("ARBITRUM")];
  ylideStore.setReaders(readers);
  await ylideStore.setWallet(ylide);
};
</script>

<template>
  <router-view />
</template>
