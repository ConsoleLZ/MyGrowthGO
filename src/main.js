// This is the main.js file. Import global CSS and scripts here.
// The Client API can be used here. Learn more: gridsome.org/docs/client-api

import HeaderLayout from "~/layouts/Header.vue";
import {
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Tooltip,
  Tag,
  Row,
  Col,
  Statistic,
  Loading,
  Drawer,
  Menu,
  MenuItem,
  Submenu,
  Popover,
  Empty,
  Pagination
} from "element-ui";
import "~/assets/css/index.css";

export default function(Vue, { router, head, isClient }) {
  // Set default layout as a global component
  if (isClient) {
    if (!document.querySelector('meta[name="viewport"]')) {
      const meta = document.createElement("meta");
      meta.name = "viewport";
      meta.content = "width=device-width, initial-scale=1";
      document.head.appendChild(meta);
    }
  }
  head.htmlAttrs = { lang: "zh-CN" };
  Vue.component("Header", HeaderLayout);
  Vue.use(Dropdown);
  Vue.use(DropdownMenu);
  Vue.use(DropdownItem);
  Vue.use(Tooltip);
  Vue.use(Tag);
  Vue.use(Row);
  Vue.use(Col);
  Vue.use(Statistic);
  Vue.use(Loading);
  Vue.use(Drawer);
  Vue.use(Menu);
  Vue.use(MenuItem);
  Vue.use(Submenu);
  Vue.use(Popover);
  Vue.use(Empty);
  Vue.use(Pagination)
}
