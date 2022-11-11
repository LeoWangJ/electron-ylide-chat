<script setup lang="ts">
import { onMounted } from "vue";
import { initializeProvider, setGlobalProvider } from "@metamask/providers";
import { WindowPostMessageStream } from "@metamask/post-message-stream";
import {
  everscaleBlockchainFactory,
  everscaleWalletFactory,
} from "@ylide/everscale";
import {
  evmFactories,
  ethereumWalletFactory,
  EVMNetwork,
  EVM_NAMES,
} from "@ylide/ethereum";
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
const metamaskStream = new WindowPostMessageStream({
  name: "inpage",
  target: "contentscript",
});

const t = initializeProvider({
  connectionStream: metamaskStream,
  shouldSetOnWindow: true,
  shouldShimWeb3: true,
});
const router = useRouter();
const { state, autoConnect } = connect();

onMounted(async () => {
  await autoConnect();
  console.log(state);
  if (state.status) {
    router.push({ name: "chat" });
  } else {
    router.push({ name: "login" });
  }

  Ylide.registerBlockchainFactory(evmFactories[EVMNetwork.ETHEREUM]);
  Ylide.registerBlockchainFactory(evmFactories[EVMNetwork.POLYGON]);
  Ylide.registerBlockchainFactory(evmFactories[EVMNetwork.ARBITRUM]);
  Ylide.registerWalletFactory(ethereumWalletFactory);
  let YlideWallet: AbstractWalletController;
  const storage = new BrowserLocalStorage();
  const isWalletAvailable = await ethereumWalletFactory.isWalletAvailable();
  let myWallet;
  const keystore = new YlideKeyStore(storage, {
    // This handler will be called every time Keystore
    // needs user's Ylide password
    onPasswordRequest: async (reason: string) => {
      console.log("????");
      return prompt(`Enter Ylide password for ${reason}:`);
    },
    // This handler will be called every time Keystore
    // needs derived signature of user's Ylide password
    onDeriveRequest: async (
      reason: string,
      blockchain: string,
      wallet: string,
      address: string,
      magicString: string
    ) => {
      try {
        // We request wallet to sign our magic string -
        // it will be used for generation of communication
        // private key
        return myWallet.signMagicString(magicString);
      } catch (err) {
        console.log(err);
        return null;
      }
    },
  });
  await keystore.init();
  console.log("keystore:", keystore);
  const ylide = new Ylide(keystore);
  console.log("storage:", storage);
  await ylide.addBlockchain("ETHEREUM");
  console.log(ylide);
  const availableWallets = await Ylide.getAvailableWallets();
  console.log(availableWallets);
  myWallet = await ylide.addWallet("evm", "web3", {
    dev: true,
    onNetworkSwitchRequest: async (
      reason: string,
      currentNetwork: EVMNetwork | undefined,
      needNetwork: EVMNetwork,
      needChainId: number
    ) => {
      console.log(
        reason,
        currentNetwork,
        needNetwork,
        needChainId,
        EVM_NAMES[currentNetwork]
      );
    },
    writeWeb3Provider: window.ethereum,
  });

  console.log("wallet:", myWallet);
  // const account = await wallet.requestAuthentication();
  // console.log(account);
  const password = "aa111122";
  const key = await keystore.create(
    `Generation key for ${state.address}`,
    "evm",
    "web3",
    state.address,
    password
  );
  console.log(key);

  await key.storeUnencrypted(password);
  console.log(key);

  await keystore.save();
  console.log(key);
  document.location.reload();
});
</script>

<template>
  <router-view />
</template>
