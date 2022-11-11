import WalletConnectProvider from "@walletconnect/web3-provider";

export const provider = new WalletConnectProvider({
  infuraId: "1ffc4eed3eea422ba8d97821cdb5fc38",
  qrcodeModalOptions: {
    mobileLinks: [
      "rainbow",
      "metamask",
      "argent",
      "trust",
      "imtoken",
      "pillar",
    ],
    desktopLinks: ["encrypted ink"],
  },
});
