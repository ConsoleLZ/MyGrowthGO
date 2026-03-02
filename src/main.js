// This is the main.js file. Import global CSS and scripts here.
// The Client API can be used here. Learn more: gridsome.org/docs/client-api

import HeaderLayout from "~/layouts/Header.vue";
import {
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
  Pagination,
  Checkbox,
  CheckboxGroup
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
    
    // 滚动动画逻辑
    Vue.directive('scroll-reveal', {
      inserted: function(el) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              el.classList.add('active');
              observer.unobserve(el);
            }
          });
        }, {
          threshold: 0.1
        });
        
        observer.observe(el);
      }
    });
    
    // 页面加载动画
    window.addEventListener('load', () => {
      document.body.classList.add('loaded');
    });
  }
  head.htmlAttrs = { lang: "zh-CN" };
  Vue.component("Header", HeaderLayout);
  Vue.use(Checkbox);
  Vue.use(CheckboxGroup);
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
