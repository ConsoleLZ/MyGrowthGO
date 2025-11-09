<template>
  <Header>
    <div class="section-header">
      <h2 class="section-title">推荐</h2>
      <p class="section-subtitle">发现精选资源和实用工具</p>
    </div>

    <CardListComp :cardListData="recommendata" />
  </Header>
</template>

<script>
import { mainData } from "@/data.mjs";
import CardListComp from "@/components/CardList.vue";
export default {
  components: {
    CardListComp
  },
  metaInfo: {
    title: "推荐",
  },
  data() {
    return {
      recommendata: mainData.filter((item) => item.recommend),
    };
  }
};
</script>
