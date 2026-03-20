<template>
  <select :id="currentId" v-model="value">
    <option v-if="data.defaultOption" :value="-1" selected disabled>Select...</option>
    <option v-for="[i, opt] of data.options.entries()" :value="opt" :key="i">{{ opt }}</option>
  </select>
</template>

<script setup lang="ts">
import { useWidgetsStore } from "@/common/stores";
import { Widget, WidgetDropdown } from "@/config";

const props = defineProps<{
  data: Widget & WidgetDropdown,
  currentId: string
}>();

const value = $ref(props.data.defaultOption ? -1 : (props.data.options[0] ?? ""));
defineExpose({ index: useWidgetsStore().addWidgetValue(props.data, $$(value)) });
</script>
