<template>
  <div class="app-container">
    <header class="header" :class="{ 'header-scrolled': showHeaderBackground }">
      <div class="header-content">
        <div class="header-logo">
          <g-link to="/" class="logo-link">
            <img
              src="@/assets/images/logo.png"
              alt="GrowthGO"
              class="logo-image"
            />
          </g-link>
        </div>
        <nav class="header-nav">
          <g-link to="/" class="nav-item">
            <img src="@/assets/icon/home-black.svg" width="18px" alt="" />
            <span>首页</span>
          </g-link>
          <g-link to="/recommend/" class="nav-item">
            <img src="@/assets/icon/thumbs-up-black.svg" width="18px" alt="" />
            <span>推荐</span>
          </g-link>
          <g-link to="/category/" class="nav-item">
            <img
              src="@/assets/icon/application-two-black.svg"
              width="18px"
              alt=""
            />
            <span>分类</span>
          </g-link>
          <g-link to="/statistics" class="nav-item">
            <img
              src="@/assets/icon/chart-pie-one-black.svg"
              width="18px"
              alt=""
            />
            <span>统计</span>
          </g-link>
        </nav>
        <button
          class="mobile-menu-btn"
          @click="visibleDrawer = true"
          aria-label="Menu"
        >
          <img width="26px" src="@/assets/icon/cola.svg" alt="">
        </button>
      </div>
    </header>

    <!-- 移动端适配的导航菜单 -->
    <el-drawer
      :title="$static.metadata.title"
      :visible.sync="visibleDrawer"
      direction="ltr"
      size="80%"
      custom-class="mobile-drawer"
    >
      <div class="drawer-content">
        <el-menu class="drawer-menu">
          <el-menu-item index="1" @click="goLink('/')">
            <img
              src="@/assets/icon/home-black.svg"
              width="20px"
              class="menu-item-icon"
              alt=""
            />
            <span>首页</span>
          </el-menu-item>
          <el-menu-item index="2" @click="goLink('/recommend')">
            <img
              src="@/assets/icon/thumbs-up-black.svg"
              width="20px"
              class="menu-item-icon"
              alt=""
            />
            <span>推荐</span>
          </el-menu-item>
          <el-menu-item index="3" @click="goLink('/category')">
            <img
              src="@/assets/icon/application-two-black.svg"
              width="20px"
              class="menu-item-icon"
              alt=""
            />
            <span>分类</span>
          </el-menu-item>
          <el-menu-item index="4" @click="goLink('/statistics')">
            <img
              src="@/assets/icon/chart-pie-one-black.svg"
              width="20px"
              class="menu-item-icon"
              alt=""
            />
            <span>统计</span>
          </el-menu-item>
        </el-menu>
      </div>
    </el-drawer>
    <main class="main-content">
      <slot></slot>
    </main>
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
    this.loadBusuanzi();
  },
  beforeDestroy() {
    window.removeEventListener("scroll", this.handleScroll);
  },
  methods: {
    // 不蒜子脚本加载
    loadBusuanzi() {
      const script = document.createElement("script");
      script.src = "//busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js";
      script.async = true;

      script.onload = () => {
        this.$emit("busuanziLoad", true);
      };

      script.onerror = () => {
        this.$emit("busuanziLoad", false);
      };

      document.head.appendChild(script);
    },
    handleScroll() {
      this.showHeaderBackground = window.scrollY > 10;
    },
    goLink(url) {
      location.href = url;
      this.visibleDrawer = false;
    },
  },
};
</script>

<style scoped>
.app-container {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  transition: all var(--transition-normal);
  background-color: transparent;
  backdrop-filter: blur(0px);
  height: 60px;
}

.header-scrolled {
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: var(--shadow-sm);
  height: 60px;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-6);
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-logo {
  display: flex;
  align-items: center;
}

.logo-link {
  display: flex;
  align-items: center;
  transition: transform var(--transition-normal);
}

.logo-link:hover {
  transform: scale(1.05);
}

.logo-image {
  height: 36px;
  width: auto;
}

.header-nav {
  display: flex;
  align-items: center;
  gap: var(--space-8);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--text-primary);
  font-weight: 500;
  font-size: var(--text-sm);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-lg);
  transition: all var(--transition-normal);
  position: relative;
  text-decoration: none;
}

.nav-item:hover {
  color: var(--primary);
  background-color: rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
}

.nav-item::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 2px;
  background-color: var(--primary);
  border-radius: var(--radius-full);
  transition: width var(--transition-normal);
}

.nav-item:hover::after {
  width: 80%;
}

/* 移动端菜单按钮 */
.mobile-menu-btn {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full);
  background-color: var(--card-bg);
  border: none;
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1000;
  transition: all var(--transition-normal);
  display: none;
}

.mobile-menu-btn:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-lg);
}

.menu-icon {
  width: 24px;
  height: 20px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.menu-line {
  width: 100%;
  height: 2px;
  background-color: var(--text-primary);
  border-radius: var(--radius-full);
  transition: all var(--transition-normal);
}

/* 移动端抽屉 */
.mobile-drawer {
  border-radius: 0 var(--radius-2xl) var(--radius-2xl) 0 !important;
}

.drawer-content {
  padding: var(--space-8) var(--space-6);
}

.drawer-menu {
  border: none !important;
}

.drawer-menu .el-menu-item {
  height: 56px !important;
  line-height: 56px !important;
  font-size: var(--text-base) !important;
  margin-bottom: var(--space-2) !important;
  border-radius: var(--radius-lg) !important;
  transition: all var(--transition-normal) !important;
}

.drawer-menu .el-menu-item:hover {
  background-color: rgba(35, 141, 247, 0.1) !important;
  color: var(--primary) !important;
}

.menu-item-icon {
  margin-right: var(--space-4) !important;
}

.main-content {
  flex: 1;
  margin-top: 70px;
}

.header-scrolled + .main-content {
  margin-top: 60px;
}

/* 响应式设计 */
/* 移动端 */
@media (max-width: 640px) {
  .header-nav {
    display: none;
  }

  .mobile-menu-btn {
    display: flex;
  }

  .header-content {
    padding: 0 var(--space-4);
  }

  .main-content {
    margin-top: 60px;
  }

  .logo-image {
    height: 32px;
  }

  .header {
    height: 60px;
  }

  .header-scrolled {
    height: 56px;
  }

  .header-scrolled + .main-content {
    margin-top: 56px;
  }
}

/* 平板 */
@media (min-width: 641px) and (max-width: 1024px) {
  .header-nav {
    gap: var(--space-6);
  }

  .nav-item {
    font-size: var(--text-xs);
  }

  .header-content {
    padding: 0 var(--space-6);
  }
}

/* 小屏幕移动端 */
@media (max-width: 480px) {
  .mobile-menu-btn {
    width: 40px;
    height: 40px;
  }

  .menu-icon {
    width: 20px;
    height: 16px;
  }

  .drawer-content {
    padding: var(--space-6) var(--space-4);
  }

  .drawer-menu .el-menu-item {
    height: 48px !important;
    line-height: 48px !important;
  }
}
</style>
