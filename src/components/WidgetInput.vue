<template>
  <input :id="currentId" :type="data.type" v-model="value" />
</template>

<script setup lang="ts">
//import { ref, watch } from 'vue';
import { useWidgetsStore } from "@/common/stores";
import { Widget, WidgetCheckbox, WidgetNumber, WidgetText } from "@/config";

const props = defineProps<{
  data: Widget & (WidgetCheckbox | WidgetNumber | WidgetText),
  currentId: string
}>();

// Table of default values for different input types
const defaultValues = new Map<string, unknown>([
  ["checkbox", false],
  ["number", 0],
  ["text", ""]
]);

const value = $ref(defaultValues.get(props.data.type));
defineExpose({ index: useWidgetsStore().addWidgetValue(props.data, $$(value)) });

</script>

<style scoped>
.final-score-input {
  width: 60px; /* Adjust the width as needed */
  padding: 4px; /* Adjust the padding as needed */
  font-size: 15px; /* Adjust the font size as needed */
}
</style>
