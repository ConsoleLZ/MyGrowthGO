<template>
  <Header @busuanziLoad="busuanziLoad">
    <div class="statistics-page">
      <!-- 页面标题 -->
      <div class="section-header">
        <h2 class="section-title">数据统计</h2>
        <p class="section-subtitle">探索站点的详细数据信息</p>
      </div>

      <!-- 统计卡片区域 -->
      <section class="stats-section reveal-section">
        <div class="stats-grid">
          <!-- 收录总数 -->
          <div class="stat-card reveal-item" data-delay="0.1">
            <div class="stat-icon">
              <img
                src="@/assets/icon/all.svg"
                width="24px"
                alt=""
              />
            </div>
            <div class="stat-content">
              <h3 class="stat-title">收录总数</h3>
              <div class="stat-value counter">{{ allLength }}</div>
            </div>
          </div>

          <!-- 分类总数 -->
          <div class="stat-card reveal-item" data-delay="0.2">
            <div class="stat-icon">
              <img
                src="@/assets/icon/application-two-black.svg"
                width="24px"
                alt=""
              />
            </div>
            <div class="stat-content">
              <h3 class="stat-title">分类总数</h3>
              <div class="stat-value counter">{{ tagLength - 1 }}</div>
            </div>
          </div>

          <!-- 本站访问量 -->
          <div class="stat-card reveal-item" data-delay="0.3">
            <div class="stat-icon">
              <img src="@/assets/icon/eye.svg" width="24px" alt="" />
            </div>
            <div class="stat-content">
              <h3 class="stat-title">本站访问量</h3>
              <div class="stat-value loading-container">
                <span
                  v-loading="isLoadingVisit"
                  element-loading-spinner="el-icon-loading"
                  id="busuanzi_value_site_pv"
                  class="counter"
                ></span>
              </div>
            </div>
          </div>

          <!-- 本站运行时间 -->
          <div class="stat-card reveal-item" data-delay="0.4">
            <div class="stat-icon">
              <img src="@/assets/icon/time.svg" width="24px" alt="" />
            </div>
            <div class="stat-content">
              <h3 class="stat-title">本站运行时间</h3>
              <div class="stat-value runtime">{{ runtimeText }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- 图表区域 -->
      <section class="chart-section reveal-section">
        <div class="chart-container">
          <h2 class="chart-title">标签分布</h2>
          <div class="chart-wrapper">
            <div
              ref="chartRef"
              class="chart"
              style="width: 100%; height: 450px;"
            ></div>
          </div>
        </div>
      </section>

      <!-- 数据概览 -->
      <section class="data-overview reveal-section">
        <h2 class="section-title">数据洞察</h2>
        <div class="overview-content">
          <div class="overview-item reveal-item" data-delay="0.1">
            <div class="overview-icon">
              <img
                src="@/assets/icon/李子.svg"
                width="24px"
                alt=""
              />
            </div>
            <div class="overview-text">
              <h3>持续增长</h3>
              <p>我们的资源库正在不断扩大，为用户提供更多有价值的内容</p>
            </div>
          </div>
          <div class="overview-item reveal-item" data-delay="0.2">
            <div class="overview-icon">
              <img src="@/assets/icon/西瓜.svg" width="24px" alt="" />
            </div>
            <div class="overview-text">
              <h3>用户友好</h3>
              <p>精心分类的资源，让用户能够快速找到所需的内容</p>
            </div>
          </div>
          <div class="overview-item reveal-item" data-delay="0.3">
            <div class="overview-icon">
              <img src="@/assets/icon/香蕉.svg" width="24px" alt="" />
            </div>
            <div class="overview-text">
              <h3>稳定运行</h3>
              <p>站点持续稳定运行，为用户提供可靠的服务</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </Header>
</template>

<static-query>
query {
  metadata {
    onlineTime
  }
}
</static-query>

<script>
import { tags, mainData } from "@/data.mjs";
import * as echarts from "echarts";

export default {
  data() {
    return {
      tagLength: Object.keys(tags).length,
      allLength: mainData.length,
      isLoadingVisit: true,
      runtimeText: "0秒",
      timer: null,
      chartInstance: null,
      resizeObserver: null,
    };
  },
  methods: {
    busuanziLoad(p) {
      this.isLoadingVisit = !p;
    },
    // 本站运行时间的计算
    calculateOnlineTime() {
      const startTime = new Date(this.$static.metadata.onlineTime).getTime();

      const updateRuntime = () => {
        const now = new Date().getTime();
        const diff = now - startTime;

        if (diff < 0) {
          this.runtimeText = "尚未开始";
          return;
        }

        const seconds = Math.floor(diff / 1000) % 60;
        const minutes = Math.floor(diff / 60000) % 60;
        const hours = Math.floor(diff / 3600000) % 24;
        const days = Math.floor(diff / 86400000);

        this.runtimeText = `${days}天${hours}小时${minutes}分钟${seconds}秒`;
      };

      updateRuntime();
      this.timer = setInterval(updateRuntime, 1000);
    },

    // 初始化图表
    initChart() {
      if (!this.$refs.chartRef) return;

      // 销毁之前的实例
      if (this.chartInstance) {
        this.chartInstance.dispose();
      }

      // 初始化 ECharts 实例，启用高分辨率渲染
      this.chartInstance = echarts.init(this.$refs.chartRef, null, {
        renderer: "canvas",
        useDirtyRect: false, // 禁用脏矩形优化，提高渲染质量
      });

      // 统计标签数量
      const tagCount = {};
      mainData.forEach((item) => {
        item.tags.forEach((tag) => {
          tagCount[tag] = (tagCount[tag] || 0) + 1;
        });
      });

      const chartData = Object.keys(tagCount).map((name) => ({
        value: tagCount[name],
        name: name,
      }));

      const isMobile = window.innerWidth <= 768;

      // 设置图表选项
      const option = {
        tooltip: {
          trigger: "item",
          formatter: "{a} <br/>{b}: {c} ({d}%)",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          borderColor: "var(--border)",
          borderWidth: 1,
          textStyle: {
            color: "var(--text-primary)",
          },
        },
        series: [
          {
            name: "标签分布",
            type: "pie",
            radius: isMobile ? ["40%", "70%"] : ["30%", "60%"],
            center: isMobile ? ["50%", "40%"] : ["50%", "50%"],
            avoidLabelOverlap: true,
            itemStyle: {
              borderColor: "#fff",
              borderWidth: 2,
              emphasis: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: "rgba(0, 0, 0, 0.5)",
              },
            },
            label: {
              show: !isMobile,
              position: "outside",
              formatter: "{b}: {c}",
              fontSize: isMobile ? 10 : 14,
              fontWeight: "bold",
              overflow: "truncate",
              color: "var(--text-primary)",
            },
            emphasis: {
              label: {
                show: true,
                fontSize: isMobile ? 12 : 16,
                fontWeight: "bold",
                color: "var(--text-primary)",
              },
              scale: true,
              scaleSize: 10,
            },
            labelLine: {
              show: !isMobile,
              length: isMobile ? 5 : 15,
              length2: isMobile ? 10 : 20,
              smooth: 0.3,
              lineStyle: {
                color: "var(--text-muted)",
              },
            },
            data: chartData,
          },
        ],
      };

      this.chartInstance.setOption(option);

      // 监听窗口大小变化
      this.handleResize();
    },

    // 处理窗口大小变化
    handleResize() {
      if (this.chartInstance) {
        this.chartInstance.resize();
      }
    },

    // 初始化滚动动画
    initScrollAnimations() {
      const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = entry.target.dataset.delay || "0";
            entry.target.style.animationDelay = delay + "s";
            entry.target.classList.add("active");
            observer.unobserve(entry.target);
          }
        });
      }, observerOptions);

      document.querySelectorAll(".reveal-item").forEach((item) => {
        observer.observe(item);
      });
    },
  },
  mounted() {
    this.calculateOnlineTime();
    this.initChart();
    this.initScrollAnimations();

    // 监听窗口大小变化
    window.addEventListener("resize", this.handleResize);

    if (this.$refs.chartRef) {
      this.resizeObserver = new ResizeObserver(() => {
        this.handleResize();
      });
      this.resizeObserver.observe(this.$refs.chartRef);
    }
  },
  beforeUnmount() {
    // 清理定时器
    if (this.timer) {
      clearInterval(this.timer);
    }
    // 销毁 ECharts 实例
    if (this.chartInstance) {
      this.chartInstance.dispose();
    }
    // 移除事件监听
    window.removeEventListener("resize", this.handleResize);
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  },
};
</script>

<style scoped>
.statistics-page {
  min-height: 100vh;
  padding: var(--space-16) var(--space-8);
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  position: relative;
}

/* 页面标题 */
.page-header {
  text-align: center;
  margin-bottom: var(--space-20);
  padding: var(--space-12) 0;
}

.header-content {
  max-width: 800px;
  margin: 0 auto;
  position: relative;
}

.page-title {
  font-size: var(--text-5xl);
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: var(--space-6);
  font-family: var(--font-serif);
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.page-subtitle {
  font-size: var(--text-xl);
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
  font-weight: 400;
}

/* 统计卡片 */
.stats-section {
  margin-bottom: var(--space-20);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-8);
}

.stat-card {
  background-color: var(--card-bg);
  border-radius: var(--radius-2xl);
  padding: var(--space-8);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: var(--space-6);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.stat-card:hover {
  border-color: var(--primary);
  transform: translateY(-2px);
}

.stat-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(0, 0, 0, 0.03),
    transparent
  );
  transition: left 0.6s ease;
}

.stat-card:hover::before {
  left: 100%;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.03);
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.stat-card:hover .stat-icon {
  background-color: rgba(0, 0, 0, 0.08);
}

.stat-content {
  flex: 1;
}

.stat-title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: var(--space-2);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.stat-value {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
  font-family: var(--font-sans);
}

.loading-container {
  min-height: 40px;
  display: flex;
  align-items: center;
}

.runtime {
  font-family: "Courier New", monospace;
  font-size: var(--text-lg);
  font-weight: 600;
}

/* 图表区域 */
.chart-section {
  margin-bottom: var(--space-20);
}

.chart-container {
  background-color: var(--card-bg);
  border-radius: var(--radius-2xl);
  padding: var(--space-10);
  border: 1px solid var(--border);
  transition: all 0.3s ease;
}

.chart-container:hover {
  border-color: var(--primary);
}

.chart-title {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-8);
  text-align: center;
  font-family: var(--font-serif);
  letter-spacing: -0.01em;
}

.chart-wrapper {
  position: relative;
  width: 100%;
  height: 480px;
}

.chart {
  width: 100%;
  height: 100%;
}

/* 数据概览 */
.data-overview {
  margin-bottom: var(--space-16);
}

.section-title {
  font-size: var(--text-3xl);
  font-weight: 700;
  color: var(--text-primary);
  text-align: center;
  margin-bottom: var(--space-10);
  font-family: var(--font-serif);
  letter-spacing: -0.01em;
}

.overview-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: var(--space-8);
}

.overview-item {
  background-color: var(--card-bg);
  border-radius: var(--radius-2xl);
  padding: var(--space-8);
  border: 1px solid var(--border);
  display: flex;
  align-items: flex-start;
  gap: var(--space-6);
  transition: all 0.3s ease;
}

.overview-item:hover {
  border-color: var(--primary);
  transform: translateY(-2px);
}

.overview-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.03);
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.overview-item:hover .overview-icon {
  background-color: rgba(0, 0, 0, 0.08);
}

.overview-text h3 {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-3);
  font-family: var(--font-serif);
  letter-spacing: -0.01em;
}

.overview-text p {
  font-size: var(--text-base);
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
  font-weight: 400;
}

/* 动画效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.reveal-item {
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease;
}

.reveal-item.active {
  opacity: 1;
  transform: translateY(0);
}

/* 数字增长动画 */
@keyframes countUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.counter {
  animation: countUp 0.8s ease;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .statistics-page {
    padding: var(--space-12) var(--space-4);
  }

  .page-title {
    font-size: var(--text-4xl);
  }

  .page-subtitle {
    font-size: var(--text-lg);
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: var(--space-6);
  }

  .stat-card {
    padding: var(--space-6);
    gap: var(--space-4);
  }

  .stat-icon {
    width: 48px;
    height: 48px;
  }

  .stat-value {
    font-size: var(--text-xl);
  }

  .chart-container {
    padding: var(--space-6);
  }

  .chart-wrapper {
    height: 320px;
  }

  .overview-content {
    grid-template-columns: 1fr;
    gap: var(--space-6);
  }

  .overview-item {
    padding: var(--space-6);
    gap: var(--space-4);
  }

  .overview-icon {
    width: 40px;
    height: 40px;
  }

  .overview-text h3 {
    font-size: var(--text-lg);
  }

  .overview-text p {
    font-size: var(--text-sm);
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .overview-content {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: var(--background);
}

::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: var(--radius-full);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--secondary);
}
</style>
