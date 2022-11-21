import Web3 from "web3";
import connect from "./index";
import { provider } from "../../WalletConnect/provider";
import { setGlobalProvider } from "@metamask/providers";

const connectWalletConnect = async () => {
  try {
    const { state } = connect();
    //  Enable session (triggers QR Code modal)
    await provider.enable();

    console.log(1);
    const web3 = new Web3(provider);

    const getAccounts = await web3.eth.getAccounts();
    const address = getAccounts[0];
    state.value.status = true;
    state.value.address = address.toLocaleLowerCase();
    state.value.chainId = await provider.request({ method: "eth_chainId" });
    setGlobalProvider(provider);

    provider.on("disconnect", (code, reason) => {
      console.log(code, reason);
      console.log("disconnected");
      state.value.status = false;
      state.value.address = "";
      state.value.publicKey = null;
      state.value.isPublic = false;

      localStorage.removeItem("userState");
      localStorage.removeItem("walletconnect");
      location.reload();
    });

    provider.on("accountsChanged", (accounts) => {
      if (accounts.length > 0) {
        state.value.address = accounts[0];
      }
    });

    provider.on("chainChanged", (chainId) => {
      console.log(chainId);
      state.value.chainId = chainId;
    });
  } catch (error) {
    console.log(error);
  }
};

export default connectWalletConnect;
