import { provider } from "../../WalletConnect/provider";
import connect from "./index";

const disconnectWallet = async () => {
  const { state } = connect();
  state.value.status = false;
  state.value.address = "";
  localStorage.removeItem("userState");

  await provider.disconnect();
};

export default disconnectWallet;
