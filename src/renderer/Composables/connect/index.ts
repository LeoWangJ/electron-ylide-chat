import connectWalletConnect from "./connectWalletConnect";
import autoConnect from "./autoConnect";
import disconnectWallet from "./disconnectWallet";
import { useStorage } from "@vueuse/core";

export const STATE_NAME = "userState";

interface State {
  address: string;
  chainId: string;
  status: boolean;
  isPublic: boolean;
  publicKey: Uint8Array | null;
}
const defaultState: State = {
  address: "",
  chainId: "",
  status: false,
  publicKey: null,
  isPublic: false,
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
