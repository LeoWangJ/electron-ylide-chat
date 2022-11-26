<script setup lang="ts">
import Ethereum from "../../assets/blockchain/Ethereum.png";
import BNB from "../../assets/blockchain/bnb.png";
import Avalanche from "../../assets/blockchain/avalanche.png";
import Polygon from "../../assets/blockchain/polygon.png";
import Everscale from "../../assets/blockchain/everscale.png";
import Optimism from "../../assets/blockchain/optimism.png";

let support = [
  {
    name: "Ethereum",
    icon: Ethereum,
  },
  {
    name: "BNB Chain",
    icon: BNB,
  },
  {
    name: "Avalanche",
    icon: Avalanche,
  },
  {
    name: "Polygon",
    icon: Polygon,
  },
  {
    name: "Everscale",
    icon: Everscale,
  },
  {
    name: "Optimism",
    icon: Optimism,
  },
];
</script>
<template>
  <div class="blockchain">
    <h4>Current chain</h4>
    <div class="current">
      <img src="../../assets/blockchain/arbitrum.png" alt="" width="50" />
      <p>Arbitrum</p>
    </div>

    <h4>Will support</h4>
    <div class="support">
      <div v-for="item in support" class="support_item">
        <img :src="item.icon" alt="" width="50" />
        <p>{{ item.name }}</p>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.blockchain {
  padding-left: 20px;
}

.current {
  display: flex;
  padding: 0 10px;

  flex-direction: column;
}

.support {
  display: flex;
  flex: 1;
  &_item {
    padding: 0 10px;
    text-align: center;
  }
}
</style>
