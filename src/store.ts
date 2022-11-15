import { AbstractWalletController, Ylide } from "@ylide/sdk";
import { defineStore } from "pinia";
import { EVMNetwork, EVM_NAMES } from "./renderer/@ylide/Ethereum";

export const useYlideStore = defineStore("ylide", {
  state: () => {
    return {
      wallet: <AbstractWalletController>{},
    };
  },
  // could also be defined as
  // state: () => ({ count: 0 })
  actions: {
    async setWallet(ylide: Ylide) {
      this.wallet = await ylide.addWallet("evm", "web3", {
        writeWeb3Provider: window.ethereum,
        onNetworkSwitchRequest: async (
          reason: string,
          currentNetwork: EVMNetwork | undefined,
          needNetwork: EVMNetwork,
          needChainId: number
        ) => {
          alert(
            "Wrong network (" +
              (currentNetwork ? EVM_NAMES[currentNetwork] : "undefined") +
              "), switch to " +
              EVM_NAMES[needNetwork]
          );
        },
      });
    },
  },
});
