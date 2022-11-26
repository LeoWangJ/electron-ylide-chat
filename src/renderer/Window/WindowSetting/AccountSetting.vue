<script setup lang="ts">
import connect from "../../Composables/connect";

const { disconnectWallet } = connect();
</script>
<template>
  <div class="setting">
    <el-button type="primary" plain @click="disconnectWallet"
      >log out</el-button
    >
  </div>
</template>
<style scoped lang="scss">
.setting {
  padding-left: 10px;
}

.logout {
  padding: 10px;
}
</style>
