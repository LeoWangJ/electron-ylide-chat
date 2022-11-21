import {
  AbstractBlockchainController,
  AbstractWalletController,
  BrowserLocalStorage,
  Ylide,
  YlideKeyPair,
  YlideKeyStore,
} from "@ylide/sdk";
import { defineStore } from "pinia";
import { EVMNetwork, EVM_NAMES } from "@ylide/ethereum";

export interface DecodedContent {
  serviceCode: number;
  decryptedContent: Uint8Array;
  type: string;
  subject: string;
  content: any;
  fromName: string;
  mine: boolean;
}

export interface ChatList {
  [key: string]: DecodedContent[];
}

export const useYlideStore = defineStore("ylide", {
  state: () => {
    return {
      wallet: <AbstractWalletController>{},
      keystore: <YlideKeyStore>{},
      readers: <AbstractBlockchainController[]>[],
      ylide: <Ylide>{},
      ylideChatDB: <LocalForage>{},
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
    async setYlide(ylide: Ylide) {
      this.ylide = ylide;
    },
    setDB(db: LocalForage) {
      this.ylideChatDB = db;
    },
  },
});
