<template>
  <Header @busuanziLoad="busuanziLoad">
    <div class="section-header">
      <h2 class="section-title">统计</h2>
      <p class="section-subtitle">勉强看一看站点数据信息吧</p>
    </div>

    <el-row :gutter="20">
      <el-col :xs="24" :sm="12" :md="6">
        <div>
          <el-statistic :value="allLength" title="收录总数"></el-statistic>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <div>
          <el-statistic :value="tagLength - 1" title="分类总数"></el-statistic>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <div>
          <el-statistic title="本站访问量">
            <template #formatter>
              <span
                v-loading="isLoadingVisit"
                element-loading-spinner="el-icon-loading"
                id="busuanzi_value_site_pv"
              ></span>
            </template>
          </el-statistic>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <div>
          <el-statistic title="本站运行时间">
            <template #formatter>
              <span>{{ runtimeText }}</span>
            </template>
          </el-statistic>
        </div>
      </el-col>
    </el-row>

    <div class="charts-container">
      <div class="chart-wrapper">
        <div
          ref="chartRef"
          class="chart"
          style="width: 100%; height: 400px;"
        ></div>
      </div>
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
    busuanziLoad(p){
      this.isLoadingVisit = !p
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
        },
        // legend: {
        //   type: "scroll",
        //   orient: "horizontal",
        //   right: 'center',
        //   top: 'top',
        //   textStyle: {
        //     fontSize: 12,
        //   },
        // },
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
            },
            label: {
              show: !isMobile,
              position: "outside",
              formatter: "{b}: {c}",
              fontSize: isMobile ? 10 : 14,
              fontWeight: "bold",
              overflow: "truncate",
            },
            emphasis: {
              label: {
                show: true,
                fontSize: isMobile ? 12 : 16,
                fontWeight: "bold",
              },
              scale: true,
              scaleSize: 10,
            },
            labelLine: {
              show: !isMobile,
              length: isMobile ? 5 : 15,
              length2: isMobile ? 10 : 20,
              smooth: 0.3,
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
  },
  mounted() {
    this.calculateOnlineTime();

    this.initChart();

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
.charts-container {
  width: 100%;
  margin-top: 30px;
  padding: 0 10px;
}

.chart-wrapper {
  width: 100%;
  height: 400px;
  position: relative;
}

.chart {
  width: 100%;
  height: 100%;
}

@media (max-width: 768px) {
  .charts-container {
    margin-top: 20px;
    padding: 0 5px;
  }

  .chart-wrapper {
    height: 300px;
  }

  .el-row {
    margin-left: -5px !important;
    margin-right: -5px !important;
  }

  .el-col {
    padding-left: 5px !important;
    padding-right: 5px !important;
    margin-bottom: 10px;
  }
}
</style>
