import * as VueRouter from "vue-router";

const routes: any = [
  { path: "/" },
  {
    path: "/Login",
    name: "login",
    component: () => import("./Window/Login.vue"),
  },
  {
    path: "/WindowMain",
    component: () => import("./Window/WindowMain.vue"),
    children: [
      {
        path: "Chat",
        name: "chat",
        component: () => import("./Window/WindowMain/Chat.vue"),
      },
      {
        path: "Contact",
        component: () => import("./Window/WindowMain/Contact.vue"),
      },
      {
        path: "Collection",
        component: () => import("./Window/WindowMain/Collection.vue"),
      },
    ],
  },
  {
    path: "/WindowSetting",
    component: () => import("./Window/WindowSetting.vue"),
    children: [
      {
        path: "AccountSetting",
        component: () => import("./Window/WindowSetting/AccountSetting.vue"),
      },
      {
        path: "Blockchain",
        component: () => import("./Window/WindowSetting/Blockchain.vue"),
      },
    ],
  },
  {
    path: "/WindowUserInfo",
    component: () => import("./Window/WindowUserInfo.vue"),
  },
];
export let router = VueRouter.createRouter({
  history: VueRouter.createWebHistory(),
  routes,
});
