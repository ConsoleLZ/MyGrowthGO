<template>
  <Header>
    <div class="index-page">
      <div class="hero-section">
        <div class="site-info">
          <div class="hero-content">
            <div class="avatar-container">
              <!-- 头像保留注释，可根据需要启用 -->
            </div>
            <h1 class="title">{{ $static.metadata.title }}</h1>
            <p class="sub-title">{{ $static.metadata.subTitle }}</p>
          </div>

          <!-- 搜索结果弹窗（保留原有 el-popover，已默认 append-to-body） -->
          <el-popover
            placement="bottom-start"
            width="320"
            v-model="visiblePopover"
            trigger="manual"
            :visible-arrow="false"
            popper-class="custom-popover"
          >
            <div class="popover-content" v-if="searchData.length">
              <div
                class="popover-item"
                v-for="item in searchData"
                :key="item.url"
                @click="openLink(item.url)"
              >
                <img :src="item.ico" width="24px" alt="" class="popover-item-icon" />
                <div class="popover-item-content">
                  <div class="popover-item-title">{{ item.name }}</div>
                  <div class="description">{{ item.description }}</div>
                </div>
              </div>
            </div>
            <el-empty v-else image="/empty.png" :image-size="64"></el-empty>

            <!-- 搜索框及引擎选择区域（作为 reference） -->
            <div slot="reference">
              <div class="search-container">
                <div class="search-input-wrapper">
                  <!-- 搜索引擎图标 + el-popover 触发 -->
                  <el-popover
                    placement="bottom-start"
                    width="200"
                    v-model="enginePopoverVisible"
                    trigger="click"
                    :append-to-body="true"
                    popper-class="engine-popover"
                  >
                    <!-- 弹窗内容：搜索引擎列表 -->
                    <div class="engine-list">
                      <div
                        class="engine-item"
                        v-for="engine in searchEngines"
                        :key="engine.value"
                        @click="selectEngine(engine)"
                      >
                        <img :src="engine.icon" width="18px" alt="" />
                        <span>{{ engine.name }}</span>
                      </div>
                    </div>
                    <!-- 触发元素：图标本身 -->
                    <div slot="reference" class="search-icon">
                      <img :src="currentEngine.icon" width="20px" alt="" />
                    </div>
                  </el-popover>

                  <input
                    class="search-input"
                    :placeholder="currentEngine.placeholder"
                    type="text"
                    @keyup.enter="performSearch"
                    @blur="visiblePopover = false"
                  />
                </div>
                <!-- 原自定义下拉菜单 .search-dropdown 已删除 -->
              </div>
            </div>
          </el-popover>
        </div>
      </div>

      <!-- 快速访问区域 -->
      <div class="main-content">
        <section class="quick-access-section scroll-reveal" v-scroll-reveal>
          <h2 class="section-title">快速访问</h2>
          <div class="card-grid">
            <div
              class="quick-card scroll-reveal"
              v-for="(item, index) in JSON.parse($static.metadata.quickAccess)"
              :key="item.url"
              @click="openLink(item.url)"
              v-scroll-reveal
              :style="{ animationDelay: index * 0.1 + 's' }"
            >
              <div class="card-icon">
                <img :src="item.icon" width="36px" alt="" />
              </div>
              <div class="card-content">
                <h3 class="card-title">{{ item.name }}</h3>
                <p class="card-description">{{ item.description }}</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- 页脚友情链接 -->
      <footer class="footer">
        <div class="footer-content">
          <div class="friend-links">
            <a
              :href="item.url"
              target="_blank"
              v-for="(item, index) in JSON.parse($static.metadata.friendLink)"
              :key="index"
              class="friend-link"
              >{{ item.name }}</a
            >
          </div>
        </div>
      </footer>
    </div>
  </Header>
</template>

<static-query>
query {
  metadata {
    title,
    subTitle,
    avatar,
    friendLink,
    quickAccess
  }
}
</static-query>

<script>
import MiniSearch from "minisearch";
import { mainData } from "@/data.mjs";
import Header from "@/layouts/Header.vue";

export default {
  components: {
    Header
  },
  metaInfo: {
    title: "首页",
  },
  data() {
    return {
      // 搜索引擎弹窗显隐控制
      enginePopoverVisible: false,
      // 可用搜索引擎列表
      searchEngines: [
        {
          name: "搜索",
          value: "default",
          icon: require("@/assets/icon/search.svg"),
          placeholder: "搜索本网站内容，按回车键确认",
        },
        {
          name: "百度",
          value: "baidu",
          icon: require("@/assets/icon/baidu.svg"),
          placeholder: "用百度搜一搜，按回车键确认",
          searchUrl: "https://www.baidu.com/s?wd=",
        },
        {
          name: "Bing",
          value: "bing",
          icon: require("@/assets/icon/bing.svg"),
          placeholder: "用Bing搜一搜，按回车键确认",
          searchUrl: "https://www.bing.com/search?q=",
        },
      ],
      // 当前选中的搜索引擎
      currentEngine: {},
      // 搜索结果弹窗显隐
      visiblePopover: false,
      // 搜索结果数据
      searchData: []
    };
  },
  mounted() {
    // 从 localStorage 加载保存的搜索引擎
    this.loadSavedEngine();
  },
  beforeDestroy() {
    // 无需手动移除全局监听，el-popover 已处理
  },
  methods: {
    openLink(url) {
      window.open(url, "_blank");
    },
    selectEngine(engine) {
      this.currentEngine = engine;
      this.enginePopoverVisible = false; // 选择后关闭弹窗
      this.saveEngine(engine);
    },
    // 模糊搜索本网站内容（同原有逻辑）
    searchLocal(queryValue) {
      const searchData = [];
      const tokenizer = (str) => {
        const words = str.match(/[\u4e00-\u9fa5]+|[a-zA-Z0-9]+/g) || [];
        const subStrings = [];

        words.forEach((word) => {
          if (/^[a-zA-Z0-9]+$/.test(word)) {
            for (let i = 1; i <= word.length; i++) {
              subStrings.push(...word.slice(0, i));
            }
          } else {
            for (let i = 1; i <= word.length; i++) {
              for (let j = 0; j <= word.length - i; j++) {
                subStrings.push(word.substring(j, j + i));
              }
            }
          }
        });

        return subStrings.filter(
          (value, index, self) => self.indexOf(value) === index
        );
      };

      let miniSearch = new MiniSearch({
        fields: ["name", "description"],
        storeFields: ["name", "description", "url", "ico"],
        tokenize: tokenizer,
      });

      miniSearch.addAll(
        mainData.map((item, index) => ({
          ...item,
          id: index,
        }))
      );

      miniSearch.autoSuggest(queryValue, {
        filter: (result) => {
          searchData.push({
            name: result.name,
            description: result.description,
            url: result.url,
            ico: result.ico,
          });
          return true;
        },
      });

      return searchData;
    },
    performSearch(event) {
      const query = event.target.value.trim();
      if (query) {
        if (this.currentEngine.value === "default") {
          this.visiblePopover = true;
          this.searchData = this.searchLocal(query);
        } else {
          window.open(
            this.currentEngine.searchUrl + encodeURIComponent(query),
            "_blank"
          );
        }
      }
    },
    saveEngine(engine) {
      try {
        localStorage.setItem("preferredSearchEngine", JSON.stringify(engine));
      } catch (e) {
        console.warn("无法保存搜索引擎偏好:", e);
      }
    },
    loadSavedEngine() {
      try {
        const savedEngine = localStorage.getItem("preferredSearchEngine");
        if (savedEngine) {
          const parsedEngine = JSON.parse(savedEngine);
          const foundEngine = this.searchEngines.find(
            (engine) => engine.value === parsedEngine.value
          );
          if (foundEngine) {
            this.currentEngine = foundEngine;
            return;
          }
        }
      } catch (e) {
        console.warn("无法加载保存的搜索引擎:", e);
      }
      this.currentEngine = this.searchEngines[0];
    },
  },
};
</script>

<style scoped>
/* 原有样式保持不变，仅移除 .search-dropdown 相关样式，并添加 engine-popover 自定义样式 */
.index-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.hero-section {
  padding: var(--space-16) var(--space-6);
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--background) 0%, #f0f0f0 100%);
  position: relative;
  overflow: hidden; /* 保持原有 overflow: hidden，不影响 body 上的弹窗 */
}

.hero-section::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(0, 0, 0, 0.05) 0%, transparent 70%);
  animation: float 20s ease-in-out infinite;
}

@keyframes float {
  0% { transform: translate(0, 0) rotate(0deg); }
  50% { transform: translate(5%, 5%) rotate(180deg); }
  100% { transform: translate(0, 0) rotate(360deg); }
}

.site-info {
  text-align: center;
  position: relative;
  z-index: 1;
  max-width: 800px;
  width: 100%;
}

.hero-content {
  margin-bottom: var(--space-10);
}

.avatar-container {
  display: flex;
  justify-content: center;
  margin-bottom: var(--space-6);
}

.avatar {
  --size: 8rem;
  width: var(--size);
  height: var(--size);
  border-radius: var(--radius-full);
  background-repeat: no-repeat;
  background-size: 66%;
  background-position: center center;
  background-color: var(--card-bg);
  box-shadow: var(--shadow-lg);
  transition: all var(--transition-normal);
  border: 4px solid var(--card-bg);
}

.avatar:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-xl);
}

.title {
  font-size: var(--text-4xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-4);
  font-family: var(--font-serif);
  animation: fadeInUp 1s ease-out;
}

.sub-title {
  font-size: var(--text-lg);
  color: var(--text-secondary);
  margin-bottom: var(--space-8);
  line-height: 1.6;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  animation: fadeInUp 1s ease-out 0.2s both;
}

/* 搜索容器 */
.search-container {
  position: relative;
  max-width: 600px;
  margin: 0 auto var(--space-8);
  animation: fadeInUp 1s ease-out 0.4s both;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  background-color: var(--card-bg);
  border-radius: var(--radius-full);
  padding: var(--space-3) var(--space-4);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal);
}

.search-input-wrapper:focus-within {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.search-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-normal);
  flex-shrink: 0;
}

.search-icon:hover {
  background-color: rgba(35, 141, 247, 0.1);
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: var(--text-base);
  color: var(--text-primary);
  background-color: transparent;
  padding: var(--space-2) var(--space-4);
}

.search-input::placeholder {
  color: var(--text-muted);
}

/* 搜索引擎弹窗自定义样式（完全还原原 .search-dropdown 外观） */
.engine-popover {
  background-color: var(--card-bg) !important;
  border-radius: var(--radius-xl) !important;
  box-shadow: var(--shadow-lg) !important;
  border: none !important;
  padding: var(--space-2) 0 !important;
  min-width: 160px;
}

.engine-list {
  display: flex;
  flex-direction: column;
}

.engine-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.engine-item:hover {
  background-color: rgba(35, 141, 247, 0.1);
}

.engine-item img {
  flex-shrink: 0;
}

.engine-item span {
  font-size: var(--text-sm);
  color: var(--text-primary);
}

/* 搜索结果弹窗样式（原 custom-popover，无需修改） */
.custom-popover {
  border-radius: var(--radius-xl) !important;
  box-shadow: var(--shadow-xl) !important;
  border: none !important;
  overflow: hidden !important;
}

.popover-content {
  max-height: 400px;
  overflow-y: auto;
}

.popover-item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  cursor: pointer;
  transition: all var(--transition-normal);
  border-radius: var(--radius-lg);
  margin: var(--space-1);
}

.popover-item:hover {
  background-color: rgba(35, 141, 247, 0.1);
}

.popover-item-icon {
  flex-shrink: 0;
}

.popover-item-content {
  flex: 1;
  text-align: left;
}

.popover-item-title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-1);
}

/* 主内容区域 */
.main-content {
  flex: 1;
  padding: var(--space-12) var(--space-6);
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.quick-access-section {
  margin-bottom: var(--space-16);
}

.section-title {
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
  margin-bottom: var(--space-8);
  font-family: var(--font-serif);
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  border-radius: var(--radius-full);
}

/* 快速访问卡片网格 */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-6);
}

.quick-card {
  background-color: var(--card-bg);
  border-radius: var(--radius-2xl);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--space-4);
  border: 1px solid var(--border);
}

.quick-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary);
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
  transition: all var(--transition-normal);
}

.quick-card:hover .card-icon {
  background-color: rgba(0, 0, 0, 0.1);
  transform: scale(1.1);
}

.card-content {
  flex: 1;
  text-align: left;
}

.card-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.card-description {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}

/* 页脚 */
.footer {
  background-color: var(--card-bg);
  border-top: 1px solid var(--border);
  padding: var(--space-8) var(--space-6);
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.friend-links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-4);
}

.friend-link {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-full);
  transition: all var(--transition-normal);
  border: 1px solid var(--border);
}

.friend-link:hover {
  color: var(--primary);
  border-color: var(--primary);
  background-color: rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
}

/* 动画 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hero-section {
    padding: var(--space-12) var(--space-4);
  }
  
  .title {
    font-size: var(--text-3xl);
  }
  
  .sub-title {
    font-size: var(--text-base);
  }
  
  .card-grid {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }
  
  .main-content {
    padding: var(--space-8) var(--space-4);
  }
  
  .quick-card {
    padding: var(--space-4);
  }
  
  .friend-links {
    gap: var(--space-2);
  }
  
  .friend-link {
    font-size: var(--text-xs);
    padding: var(--space-1) var(--space-3);
  }
}
</style>