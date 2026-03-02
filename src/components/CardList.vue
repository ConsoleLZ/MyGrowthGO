<template>
  <div class="card-container">
    <slot></slot>
    <div class="card-grid">
      <div
        class="card scroll-reveal"
        v-for="(item, index) in paginationData"
        :key="item.url"
        @click="openLink(item.url)"
        v-scroll-reveal
        :style="{ animationDelay: index * 0.05 + 's' }"
      >
        <div class="card-header">
          <div class="card-icon">
            <img :src="item.ico" width="80%" alt="" />
          </div>
          <div class="card-title">
            <h3>{{ item.name }}</h3>
            <div class="card-tags">
              <el-tag 
                size="mini" 
                v-for="tag in item.tags" 
                :key="tag"
                class="card-tag"
              >{{ tag }}</el-tag>
            </div>
          </div>
        </div>
        <el-tooltip :content="item.description" placement="top">
          <div class="description">{{ item.description }}</div>
        </el-tooltip>
        <div class="card-like" v-if="item.recommend">
          <img src="@/assets/images/like.png" width="24px" alt="">
        </div>
      </div>
    </div>

    <div class="pagination-container">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="total"
        :page-size="$static.metadata.paginationValue"
        hide-on-single-page
        @current-change="onChangePage"
      >
      </el-pagination>
    </div>
  </div>
</template>

<static-query>
query {
  metadata {
    paginationValue
  }
}
</static-query>

<script>
export default {
  props: {
    cardListData: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      page: 1,
      paginationData: [],
      total: 0,
    };
  },
  created() {
    this.page = this.$route.query.page ? parseInt(this.$route.query.page, 10) : 1;
    this.init();
  },
  watch: {
    cardListData: {
      handler(newData) {
        this.total = newData.length;
        this.page = 1;
        this.init();
      },
      immediate: true,
    },
    page(newPage) {
      this.init();
    }
  },
  methods: {
    openLink(url) {
      window.open(url, "_blank");
    },
    init() {
      const paginationValue = this.$static.metadata.paginationValue;
      const start = (this.page - 1) * paginationValue;
      const end = start + paginationValue;
      this.paginationData = this.cardListData.slice(start, end);
    },
    onChangePage(page) {
      this.page = page;
    },
  },
};
</script>

<style scoped>
.card-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-6);
}

/* 推荐内容网格 */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-6);
  margin-bottom: var(--space-10);
}

.card {
  background-color: var(--card-bg);
  border-radius: var(--radius-2xl);
  padding: var(--space-6);
  transition: all var(--transition-normal);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  min-height: 140px;
  position: relative;
  border: 1px solid var(--border);
  overflow: hidden;
}

.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left var(--transition-normal);
}

.card:hover::before {
  left: 100%;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary);
}

.card-like {
  position: absolute;
  right: var(--space-4);
  top: var(--space-4);
  transition: transform var(--transition-normal);
}

.card:hover .card-like {
  transform: scale(1.1);
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

.card-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: var(--radius-xl);
  flex-shrink: 0;
  padding: var(--space-3);
  transition: all var(--transition-normal);
}

.card:hover .card-icon {
  background-color: rgba(0, 0, 0, 0.1);
  transform: scale(1.05);
}

.card-title {
  flex: 1;
  min-width: 0;
}

.card-title h3 {
  margin: 0 0 var(--space-2) 0;
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
}

.card-tag {
  font-size: var(--text-xs) !important;
  border-radius: var(--radius-full) !important;
  background-color: rgba(0, 0, 0, 0.05) !important;
  color: var(--primary) !important;
  border: none !important;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: var(--space-8);
}

/* 响应式调整 */
@media (max-width: 640px) {
  .card-container {
    padding: var(--space-4);
  }
  
  .card-grid {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }

  .card {
    padding: var(--space-4);
    min-height: 120px;
  }

  .card-header {
    gap: var(--space-3);
    margin-bottom: var(--space-3);
  }

  .card-icon {
    width: 40px;
    height: 40px;
  }

  .card-title h3 {
    font-size: var(--text-base);
  }
}

@media (min-width: 641px) and (max-width: 1024px) {
  .card-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-5);
  }
}

@media (min-width: 1025px) {
  .card-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
