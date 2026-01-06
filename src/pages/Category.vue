<template>
  <Header>
    <CardListComp :cardListData="filteredCardData">
      <el-checkbox
        :indeterminate="isIndeterminate"
        v-model="checkAll"
        @change="handleCheckAllChange"
        >全选</el-checkbox
      >
      <div style="margin: 15px 0;"></div>
      <el-checkbox-group v-model="tagsSelect" @change="handleCheckedTagChange">
        <el-checkbox
          v-for="tag in Object.keys(tagsOptions)"
          :label="tag"
          :key="tag"
          >{{ tagsOptions[tag] }}</el-checkbox
        >
      </el-checkbox-group>
      <br>
      <br>
    </CardListComp>
  </Header>
</template>

<script>
import { tags } from "@/data.mjs";
import { mainData } from "@/data.mjs";
import CardListComp from "@/components/CardList.vue";

export default {
  components: {
    CardListComp,
  },
  data() {
    return {
      checkAll: true,
      tagsSelect: Object.keys(tags),
      tagsOptions: tags,
      isIndeterminate: false,
      cardData: mainData, // 原始数据
    };
  },
  computed: {
    filteredCardData() {
      if (this.tagsSelect.length === 0) {
        return [];
      }
      return this.cardData.filter((item) =>
        item.tags.some((tag) => {
          return this.tagsSelect.includes(Object.keys(tags).find((item) => tags[item] === tag));
        })
      );
    },
  },
  methods: {
    handleCheckAllChange(val) {
      this.tagsSelect = val ? Object.keys(this.tagsOptions) : [];
      this.isIndeterminate = false;
    },
    handleCheckedTagChange(value) {
      const total = Object.keys(this.tagsOptions).length;
      const checkedCount = value.length;
      this.checkAll = checkedCount === total;
      this.isIndeterminate = checkedCount > 0 && checkedCount < total;
    },
  },
};
</script>
