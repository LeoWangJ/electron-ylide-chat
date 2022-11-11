import SignClient from "@walletconnect/sign-client";
import { ConfigCtrl, ModalCtrl } from "@web3modal/core";
import "@web3modal/ui";
import { onMounted } from "vue";

// 1. Configure sign client
let signClient = undefined;
const namespaces = {
  eip155: {
    methods: ["eth_sign"],
    chains: ["eip155:1"],
    events: ["accountsChanged"],
  },
};
async function configureSignClient() {
  signClient = await SignClient.init({
    projectId: "YOUR_PROJECT_ID",
  });
}

// 2. Configure web3modal
ConfigCtrl.setConfig({
  projectId: "YOUR_PROJECT_ID",
  // standaloneChains: namespaces.eip155.chains
});

// 3. Manage manual connection
export default function HomePage() {
  async function onOpenModal() {
    if (signClient) {
      const { uri, approval } = await signClient.connect({
        requiredNamespaces: namespaces,
      });

      if (uri) {
        ModalCtrl.open({
          uri,
          standaloneChains: namespaces.eip155.chains,
        });
        await approval();
        ModalCtrl.close();
      }
    }
  }

  async function onInitialize() {
    await configureSignClient();
  }

  onMounted(() => {
    onInitialize();
  });

  return (
    <div>
      <button onClick={onOpenModal}>Connect Wallet</button>
      <w3m-modal></w3m-modal>
    </div>
  );
}
