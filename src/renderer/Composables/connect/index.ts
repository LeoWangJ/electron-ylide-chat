import { reactive, computed, watch } from "vue";
import connectWalletConnect from "./connectWalletConnect";
import autoConnect from "./autoConnect";
import disconnectWallet from "./disconnectWallet";
import { useStorage } from "@vueuse/core";

const STATE_NAME = "userState";

const defaultState = {
  address: "",
  chainId: "",
  status: false,
};

const state = useStorage(STATE_NAME, defaultState);

const actions = {
  connectWalletConnect,
  autoConnect,
  disconnectWallet,
};

export default () => {
  return {
    state,
    ...actions,
  };
};
