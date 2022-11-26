<script setup lang="ts">
import BarTop from "../Component/BarTop.vue";
import BarLeft from "../Component/BarLeft.vue";
import { ref } from "vue";

let mainWindowRoutes = ref([
  {
    path: `/WindowSetting/Blockchain`,
    name: "blockchain",
  },
  {
    path: `/WindowSetting/AccountSetting`,
    name: "setting",
  },
]);
</script>
<template>
  <BarLeft />
  <BarTop />
  <div class="settingBody">
    <div class="menuBox">
      <router-link
        class="menuItem"
        active-class="active"
        v-for="item in mainWindowRoutes"
        :to="item.path"
      >
        <span style="padding-left: 10px"> {{ item.name }}</span>
      </router-link>
    </div>
    <div class="pageBox">
      <router-view />
    </div>
  </div>
</template>
<style lang="scss" scoped>
#app {
  flex-direction: column;
  background: rgb(245, 245, 245);
}
</style>
<style scoped lang="scss">
.settingBody {
  display: flex;
  flex: 1;
  box-sizing: border-box;
  background: rgb(230, 229, 229);
}
.menuBox {
  width: 140px;
  padding-top: 20px;
  border-right: 1px solid rgb(227, 227, 227);
  .menuItem {
    height: 32px;
    line-height: 32px;
    display: block;
    cursor: pointer;
    color: black;
    text-decoration: none;
    &:hover {
      background: rgb(196, 196, 196);
    }
  }
}
.active {
  background: rgb(196, 196, 196);
}
.pageBox {
  flex: 1;
  padding-top: 20px;
  background: rgb(245, 245, 245);
}
</style>
