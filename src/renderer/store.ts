import {
  AbstractBlockchainController,
  AbstractWalletController,
  BrowserLocalStorage,
  Ylide,
  YlideKeyPair,
  YlideKeyStore,
} from "@ylide/sdk";
import { defineStore } from "pinia";
import { EVMNetwork, EVM_NAMES } from "./@ylide/Ethereum";

export const useYlideStore = defineStore("ylide", {
  state: () => {
    return {
      wallet: <AbstractWalletController>{},
      keystore: <YlideKeyStore>{},
      readers: <AbstractBlockchainController[]>[],
    };
  },
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
    async setKeystore(password?: string) {
      const storage = new BrowserLocalStorage();

      this.keystore = new YlideKeyStore(storage, {
        onPasswordRequest: async (reason: string) => {
          return password || null;
        },
        onDeriveRequest: async (
          reason: string,
          blockchain: string,
          wallet: string,
          address: string,
          magicString: string
        ) => {
          try {
            return this.wallet.signMagicString(
              { address, blockchain, publicKey: null },
              magicString
            );
          } catch (err) {
            return null;
          }
        },
      });
    },
    async setReaders(readers: AbstractBlockchainController[]) {
      this.readers = readers;
    },
  },
});
