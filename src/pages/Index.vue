<template>
  <Header>
    <div class="index-page">
      <div class="hero-section">
        <div class="site-info">
          <div class="hero-content">
            <div class="avatar-container">
              <!-- <div
                class="avatar"
                :style="{ 'background-image': 'url(' + $static.metadata.avatar + ')' }"
              ></div> -->
            </div>
            <h1 class="title">{{ $static.metadata.title }}</h1>
            <p class="sub-title">{{ $static.metadata.subTitle }}</p>
          </div>

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
            <div slot="reference">
              <!-- 搜索框和下拉菜单 -->
              <div class="search-container">
                <div class="search-input-wrapper">
                  <div class="search-icon" @click="toggleDropdown">
                    <img :src="currentEngine.icon" width="20px" alt="" />
                  </div>
                  <input
                    class="search-input"
                    :placeholder="currentEngine.placeholder"
                    type="text"
                    @keyup.enter="performSearch"
                    @blur="visiblePopover = false"
                  />
                </div>
                <!-- 下拉菜单 -->
                <div class="search-dropdown" v-show="showDropdown">
                  <div
                    class="dropdown-item"
                    v-for="engine in searchEngines"
                    :key="engine.name"
                    @click="selectEngine(engine)"
                  >
                    <img :src="engine.icon" width="18px" alt="" class="dropdown-item-icon" />
                    <span class="dropdown-item-text">{{ engine.name }}</span>
                  </div>
                </div>
              </div>
            </div>
          </el-popover>
        </div>
      </div>

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
      showDropdown: false,
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
      currentEngine: {},
      visiblePopover: false,
      searchData: []
    };
  },
  mounted() {
    // 尝试从localStorage获取保存的搜索引擎
    this.loadSavedEngine();

    // 点击页面其他地方关闭下拉菜单
    document.addEventListener("click", this.closeDropdown);
  },
  beforeDestroy() {
    // 移除事件监听
    document.removeEventListener("click", this.closeDropdown);
  },
  methods: {
    openLink(url) {
      window.open(url, "_blank");
    },
    toggleDropdown(event) {
      // 阻止事件冒泡，防止触发document的点击事件
      event.stopPropagation();
      this.showDropdown = !this.showDropdown;
    },
    selectEngine(engine) {
      this.currentEngine = engine;
      this.showDropdown = false;

      // 保存选择到localStorage
      this.saveEngine(engine);
    },
    closeDropdown(event) {
      // 如果点击的不是搜索容器区域，则关闭下拉菜单
      if (!event.target.closest(".search-container")) {
        this.showDropdown = false;
      }
    },
    // 模糊搜索本网站内容
    searchLocal(queryValue) {
      const searchData = [];
      const tokenizer = (str) => {
        // 分词逻辑，返回完整的单词以及单词的部分片段
        const words = str.match(/[\u4e00-\u9fa5]+|[a-zA-Z0-9]+/g) || [];
        const subStrings = [];

        words.forEach((word) => {
          if (/^[a-zA-Z0-9]+$/.test(word)) {
            // 英文或数字
            // 生成所有可能的子串
            for (let i = 1; i <= word.length; i++) {
              subStrings.push(...word.slice(0, i));
            }
          } else {
            // 中文
            // 生成所有可能的 n-gram 子串
            for (let i = 1; i <= word.length; i++) {
              for (let j = 0; j <= word.length - i; j++) {
                subStrings.push(word.substring(j, j + i));
              }
            }
          }
        });

        return subStrings.filter(
          (value, index, self) => self.indexOf(value) === index
        ); // 去重
      };

      let miniSearch = new MiniSearch({
        fields: ["name", "description"], // 搜索哪些字段
        storeFields: ["name", "description", "url", "ico"], // 返回哪些字段
        tokenize: tokenizer,
      });

      miniSearch.addAll(
        mainData.map((item, index) => {
          return {
            ...item,
            id: index,
          };
        })
      ); // 配置搜索源

      // 搜索
      miniSearch.autoSuggest(queryValue, {
        filter: (result) => {
          // 处理搜索结果
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
          this.searchData = this.searchLocal(query)
        } else {
          window.open(
            this.currentEngine.searchUrl + encodeURIComponent(query),
            "_blank"
          );
        }
      }
    },
    // 保存搜索引擎到localStorage
    saveEngine(engine) {
      try {
        localStorage.setItem("preferredSearchEngine", JSON.stringify(engine));
      } catch (e) {
        console.warn("无法保存搜索引擎偏好:", e);
      }
    },
    // 从localStorage加载保存的搜索引擎
    loadSavedEngine() {
      try {
        const savedEngine = localStorage.getItem("preferredSearchEngine");
        if (savedEngine) {
          const parsedEngine = JSON.parse(savedEngine);
          // 确保保存的引擎在可用引擎列表中
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

      // 如果没有保存的引擎或加载失败，使用默认引擎
      this.currentEngine = this.searchEngines[0];
    },
  },
};
</script>

<style scoped>
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
  overflow: hidden;
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

/* 搜索下拉菜单 */
.search-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: var(--space-2);
  background-color: var(--card-bg);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  z-index: 100;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.dropdown-item:hover {
  background-color: rgba(35, 141, 247, 0.1);
  color: var(--primary);
}

.dropdown-item-icon {
  flex-shrink: 0;
}

.dropdown-item-text {
  font-size: var(--text-sm);
  font-weight: 500;
}

/* 搜索结果弹窗 */
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
  transform: translateX(5px);
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
