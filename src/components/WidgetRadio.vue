<template>
  <label v-for="[i, name] in data.options.entries()" :key="i">
    <input type="radio" class="custom-radio" v-model="value" :name="currentId" :value="name" />{{ name }}<br />
  </label>
</template>

<script setup lang="ts">
import { useWidgetsStore } from "@/common/stores";
import { Widget, WidgetRadio } from "@/config";

const props = defineProps<{
  data: Widget & WidgetRadio,
  currentId: string
}>();

const value = $ref(props.data.default ?? 0);
defineExpose({ index: useWidgetsStore().addWidgetValue(props.data, $$(value)) });
</script>

<style scoped>
.custom-radio {
  width: 20px; /* Adjust width */
  height: 20px; /* Adjust height */
  cursor: pointer; /* Optional: Add a pointer cursor */
}
</style>
