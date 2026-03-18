<template>
  <label v-for="[i, name] in data.options.entries()" :key="i" :style="data.optionColors?.[i] ? { color: data.optionColors[i] } : {}">
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

// If exportValues is provided, map the selected option to its export value
const exportValue = $computed(() => {
  if (!props.data.exportValues || typeof value !== "string") return value;
  const idx = props.data.options.indexOf(value);
  return idx >= 0 && idx < props.data.exportValues.length ? props.data.exportValues[idx] : value;
});

defineExpose({ index: useWidgetsStore().addWidgetValue(props.data, $$(exportValue)) });
</script>

<style scoped>
.custom-radio {
  width: 20px; /* Adjust width */
  height: 20px; /* Adjust height */
  cursor: pointer; /* Optional: Add a pointer cursor */
}
</style>
