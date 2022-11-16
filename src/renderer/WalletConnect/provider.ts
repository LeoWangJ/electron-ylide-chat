import WalletConnectProvider from "@walletconnect/web3-provider";
console.log(import.meta.env.VITE_projectId);
export const provider = new WalletConnectProvider({
  rpc: {
    42161: `https://arbitrum-mainnet.infura.io/v3/${
      import.meta.env.VITE_projectId
    }`,
  },
  infuraId: `${import.meta.env.VITE_projectId}`,
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
