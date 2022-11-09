<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import HelloWorld from "./components/HelloWorld.vue";
import fs from "fs";
import { ipcRenderer } from "electron";
import { onMounted } from "vue";
import { everscaleBlockchainFactory, everscaleWalletFactory } from "@ylide/everscale";
import { evmFactories, ethereumWalletFactory, EVMNetwork, EVM_NAMES } from "@ylide/ethereum";
import { Ylide, IMessage, MessageContentV3, YlideKeyStore, BrowserLocalStorage, MessagesList, AbstractWalletController, AbstractBlockchainController, WalletControllerFactory, YlideKeyPair, GenericEntry, BlockchainSource, } from "@ylide/sdk";

onMounted(async () => {
  console.log(everscaleBlockchainFactory);

  Ylide.registerBlockchainFactory(evmFactories[EVMNetwork.ETHEREUM]);
  Ylide.registerBlockchainFactory(evmFactories[EVMNetwork.BNBCHAIN]);
  Ylide.registerBlockchainFactory(evmFactories[EVMNetwork.POLYGON]);
  Ylide.registerBlockchainFactory(evmFactories[EVMNetwork.ARBITRUM]);
  Ylide.registerBlockchainFactory(evmFactories[EVMNetwork.OPTIMISM]);
  Ylide.registerBlockchainFactory(evmFactories[EVMNetwork.AVALANCHE]);
  Ylide.registerBlockchainFactory(everscaleBlockchainFactory);
  Ylide.registerWalletFactory(ethereumWalletFactory);
  Ylide.registerWalletFactory(everscaleWalletFactory);

  // let YlideWallet: AbstractWalletController;

  // const storage = new BrowserLocalStorage();
  // console.log(storage)
  // const keystore = new YlideKeyStore(storage, {
  //   // This handler will be called every time Keystore
  //   // needs user's Ylide password
  //   onPasswordRequest: async (reason: string) =>
  //     prompt(`Enter Ylide password for ${reason}:`),

  //   // This handler will be called every time Keystore
  //   // needs derived signature of user's Ylide password
  //   onDeriveRequest: async (
  //     reason: string, blockchainGroup: string,
  //     wallet: string, address: string, magicString: string
  //   ) => {
  //     try {
  //       // We request wallet to sign our magic string -
  //       // it will be used for generation of communication
  //       // private key
  //       return YlideWallet.signMagicString(magicString);
  //     } catch (err) {
  //       return null;
  //     }
  //   },
  // });

  // await keystore.init();
  // const ylide = new Ylide(keystore);

  // let wallet = await ylide.addWallet('evm', 'web3');
  // let reader = await ylide.addBlockchain('POLYGON');
  // console.log(wallet, reader)
});
</script>

<template>
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
  <HelloWorld msg="Vite + Vue" />
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
