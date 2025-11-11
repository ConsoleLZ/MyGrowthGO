<template>
  <div class="card-container">
    <div class="card-grid">
      <div
        class="card"
        v-for="item in paginationData"
        :key="item.url"
        @click="openLink(item.url)"
      >
        <div class="card-header">
          <div class="card-icon">
            <img :src="item.ico" width="80%" alt="" />
          </div>
          <div class="card-title">
            <h3>{{ item.name }}</h3>
            <div style="display: flex;align-items: center;gap: 5px;">
              <el-tag size="mini" v-for="tag in item.tags" :key="tag">{{
                tag
              }}</el-tag>
            </div>
          </div>
        </div>
        <el-tooltip :content="item.description" placement="top">
          <div class="description">{{ item.description }}</div>
        </el-tooltip>
      </div>
    </div>

    <el-pagination
      background
      layout="prev, pager, next"
      :total="total"
      :page-size="$static.metadata.paginationValue"
      hide-on-single-page
      style="display: flex;justify-content: center;"
      @current-change="onChangePage"
    >
    </el-pagination>
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
  padding: 10px 15px;
}
/* 推荐内容网格 */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
  margin-bottom: 40px;
}

.card {
  background-color: #ffffff;
  border-radius: 10px;
  padding: 20px;
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 115px;
}

.card:hover {
  transform: translateY(-3px);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.card-icon {
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f4f4f4;
  border-radius: 8px;
  flex-shrink: 0;
  padding: 8px;
}

.card-title {
  flex: 1;
  min-width: 0;
}

.card-title h3 {
  margin: 0 0 6px 0;
  font-size: 16px;
  font-weight: 600;
  color: #000000;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-content {
  margin-bottom: 12px;
  flex: 1;
}

.description {
  margin: 0;
  font-size: 13px;
  color: #303133;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: all 0.3s ease;
  width: fit-content;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

/* 加载更多 */
.load-more {
  text-align: center;
  font-size: 14px;
  color: #303133;
  cursor: pointer;
  padding: 15px;
  transition: all 0.3s ease;
  border-radius: 8px;
  margin-top: 20px;
}

.load-more:hover {
  background: #a0cfff;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .card-container {
    padding: 0 15px;
  }
  .card-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .card {
    padding: 16px;
    min-height: 140px;
  }

  .card-header {
    gap: 10px;
    margin-bottom: 10px;
  }

  .card-icon {
    width: 36px;
    height: 36px;
  }

  .card-title h3 {
    font-size: 15px;
  }
}

@media (max-width: 480px) {
  .card-grid {
    grid-template-columns: 1fr;
  }

  .card {
    min-height: auto;
  }

  .card-header {
    align-items: center;
  }
}
</style>
