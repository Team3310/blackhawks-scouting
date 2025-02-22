<template>
  <div>
    <input
      v-if="data.type === 'number'"
      type="number"
      v-model.number="value"
      :min="0"
      @input="handleInput"
      class="final-score-input"
    />
    <input v-else :id="currentId" :type="data.type" v-model="value" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
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

//const value = $ref(defaultValues.get(props.data.type));
//defineExpose({ index: useWidgetsStore().addWidgetValue(props.data, $$(value)) });

const value = ref(defaultValues.get(props.data.type));

// Ensure the value does not go below zero
function handleInput(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.valueAsNumber < 0) {
    input.value = '0';
    value.value = 0;
  }
}

// Watch for changes in the value and ensure it does not go below zero
watch(value, (newValue) => {
  if (newValue < 0) {
    value.value = 0;
  }
});

defineExpose({ index: useWidgetsStore().addWidgetValue(props.data, value.value) });
</script>

<style scoped>
.final-score-input {
  width: 60px; /* Adjust the width as needed */
  padding: 4px; /* Adjust the padding as needed */
  font-size: 15px; /* Adjust the font size as needed */
}
</style>
