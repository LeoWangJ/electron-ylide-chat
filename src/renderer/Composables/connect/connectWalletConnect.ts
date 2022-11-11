import Web3 from "web3";
import connect from "./index";
import { provider } from "../../WalletConnect/provider";
import { setGlobalProvider } from "@metamask/providers";

const connectWalletConnect = async () => {
  try {
    const { state } = connect();
    //  Enable session (triggers QR Code modal)
    await provider.enable();

    const web3 = new Web3(provider);

    const getAccounts = await web3.eth.getAccounts();
    const address = getAccounts[0];

    // var rawMessage = "Hello World";
    // const signedMessage = await web3.eth.sign(rawMessage, address);

    // console.log(signedMessage);
    state.status = true;
    state.address = address;
    state.chainId = await provider.request({ method: "eth_chainId" });
    setGlobalProvider(provider);
    provider.on("disconnect", (code, reason) => {
      console.log(code, reason);
      console.log("disconnected");
      state.status = false;
      state.address = "";
      state.provider = null;

      localStorage.removeItem("userState");
    });

    provider.on("accountsChanged", (accounts) => {
      if (accounts.length > 0) {
        state.address = accounts[0];
      }
    });

    provider.on("chainChanged", (chainId) => {
      console.log(chainId);
      state.chainId = chainId;
    });
  } catch (error) {
    console.log(error);
  }
};

export default connectWalletConnect;
