import connect from "./index";

const autoConnect = async () => {
  const { state, connectWalletConnect } = connect();
  if (state.value.status) {
    if (localStorage.getItem("walletconnect") == null) {
      state.value.status = false;
      state.value.address = "";
      localStorage.removeItem("userState");
    }
    if (localStorage.getItem("walletconnect")) {
      await connectWalletConnect();
    }
  }
};

export default autoConnect;
