<template>
  <Header>
    <div class="section-header">
      <h2 class="section-title">{{ title }}</h2>
    </div>
    <CardListComp :cardListData="filterData" />
  </Header>
</template>

<script>
import { tags, mainData } from "@/data.mjs";
import CardListComp from "@/components/CardList.vue";

export default {
  components: { CardListComp },
  data() {
    return {
      title: "",
      filterData: [],
    };
  },
  watch: {
    "$route.params.tag": {
      handler(newTag) {
        this.title = tags[newTag] || newTag;
        this.init();
      },
      immediate: true,
    },
  },
  methods: {
    init() {
      const tag = this.$route.params.tag;

      if (tag === "all") {
        this.filterData = mainData;
      } else {
        this.filterData = mainData.filter((item) =>
          item.tags.includes(tags[tag])
        );
      }
    },
  },
  created() {
    this.init();
  },
};
</script>
