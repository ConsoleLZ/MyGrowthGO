<template>
  <div style="position: relative; min-height: 100vh;">
    <div class="header" :class="{ 'has-background': showHeaderBackground }">
      <g-link to="/" class="item">
        <img src="@/assets/icon/home-black.svg" width="18px" alt="" />
        <div>首页</div>
      </g-link>
      <g-link to="/recommend/" class="item">
        <img src="@/assets/icon/thumbs-up-black.svg" width="18px" alt="" />
        <div>推荐</div>
      </g-link>
      <el-dropdown placement="bottom">
        <div
          style="display: flex; align-items: center; gap: 3px; color: #000; font-size: 14px; cursor: pointer; font-weight: 400;"
        >
          <img
            src="@/assets/icon/application-two-black.svg"
            width="18px"
            alt=""
          />
          <div>分类</div>
        </div>
        <el-dropdown-menu slot="dropdown">
          <div class="dropdown">
            <el-dropdown-item
              style="text-align: center;"
              v-for="item in tagsData"
              :key="item.key"
              ><div @click="onGoCategory(item.key)">
                {{ item.value }}
              </div></el-dropdown-item
            >
          </div>
        </el-dropdown-menu>
      </el-dropdown>
      <g-link to="/statistics" class="item">
        <img src="@/assets/icon/chart-pie-one-black.svg" width="18px" alt="" />
        <div>统计</div>
      </g-link>
    </div>
    <div class="g-menu" @click="visibleDrawer = true">
      <img src="@/assets/icon/expand.png" width="24px" alt="" />
    </div>

    <!-- 移动端适配的导航菜单 -->
    <el-drawer
      :title="$static.metadata.title"
      :visible.sync="visibleDrawer"
      direction="ltr"
      size="80%"
    >
      <el-menu>
        <el-menu-item index="1" @click="goLink('/')">
          <img
            src="@/assets/icon/home-black.svg"
            width="18px"
            style="margin-right: 10px;"
            alt=""
          />
          <span slot="title">首页</span>
        </el-menu-item>
        <el-menu-item index="2" @click="goLink('/recommend')">
          <img
            src="@/assets/icon/thumbs-up-black.svg"
            width="18px"
            style="margin-right: 10px;"
            alt=""
          />
          <span slot="title">推荐</span>
        </el-menu-item>
        <el-submenu index="3">
          <template slot="title">
            <img
              src="@/assets/icon/application-two-black.svg"
              width="18px"
              style="margin-right: 10px;"
              alt=""
            />
            <span slot="title">分类</span>
          </template>
          <el-menu-item
            v-for="item in tagsData"
            :key="item.key"
            @click="onGoCategory(item.key)"
            >{{ item.value }}</el-menu-item
          >
        </el-submenu>
        <el-menu-item index="4" @click="goLink('/statistics')">
          <img
            src="@/assets/icon/chart-pie-one-black.svg"
            width="18px"
            style="margin-right: 10px;"
            alt=""
          />
          <span slot="title">统计</span>
        </el-menu-item>
      </el-menu>
    </el-drawer>
    <slot></slot>
  </div>
</template>

<static-query>
query {
  metadata {
    title
  }
}
</static-query>

<script>
import { tags } from "@/data.mjs";

export default {
  data() {
    return {
      tagsData: [],
      showHeaderBackground: false,
      visibleDrawer: false,
    };
  },
  created() {
    Object.keys(tags).forEach((key) => {
      this.tagsData.push({
        key,
        value: tags[key],
      });
    });
  },
  mounted() {
    window.addEventListener("scroll", this.handleScroll);
    this.handleScroll();
    this.init();

    window.addEventListener("resize", this.init);
  },
  beforeDestroy() {
    window.removeEventListener("scroll", this.handleScroll);
  },
  methods: {
    // 网站初始化
    init() {
      const menuDom = document.querySelector(".g-menu");
      const headerDom = document.querySelector(".header");

      if (window.innerWidth < 500) {
        // 显示菜单，隐藏导航栏
        menuDom.style.display = "flex";
        headerDom.style.display = "none";
      } else {
        menuDom.style.display = "none";
        headerDom.style.display = "flex";
      }

      this.loadBusuanzi();
    },
    // 不蒜子脚本加载
    loadBusuanzi() {
      const script = document.createElement("script");
      script.src = "//busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js";
      script.async = true;

      script.onload = () => {
        this.$emit('busuanziLoad', true)
      };

      script.onerror = () => {
        this.$emit('busuanziLoad', false)
      };

      document.head.appendChild(script);
    },
    onGoCategory(tag) {
      // location.href = `/category/${tag}`;
      this.$router.push(`/category/${tag}`)
    },
    handleScroll() {
      this.showHeaderBackground = window.scrollY > 0;
    },
    goLink(url){
      location.href = url
    }
  },
};
</script>

<style scoped>
.header {
  width: 100%;
  height: 3rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 55px;
  font-weight: 500;
  font-size: 16px;
  cursor: default;
  position: sticky;
  top: 0;
  background-color: transparent;
  transition: background-color 0.3s ease;
}

.header.has-background {
  background-color: #ffffff;
}

.header > .item {
  text-decoration: none;
  transition: color 0.3s ease;
  position: relative;
  padding: 15px 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 14px;
  font-weight: 400;
  color: #000;
}

.header > .item::after {
  content: "";
  position: absolute;
  left: 50%;
  bottom: 10px;
  width: 0;
  height: 2px;
  background-color: #238df7;
  transform: translateX(-50%);
  transition: width 0.3s ease;
  border-radius: 1px;
}

.header > .item:hover::after {
  width: 80%;
}

.dropdown {
  width: 160px;
  max-height: 360px;
  overflow: auto;
}

.dropdown::-webkit-scrollbar {
  display: none;
}

.g-menu {
  --size: 40px;
  width: var(--size);
  height: var(--size);
  border-radius: var(--size);
  background-color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 8px;
  left: 10px;
  z-index: 999;
  cursor: pointer;
}
</style>
