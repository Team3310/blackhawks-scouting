<template>
  <input 
    type="text" 
    class="time-input" 
    v-model="value" 
    :id="currentId"
    placeholder="M:SS"
    maxlength="4"
    @input="formatInput"
  />
</template>

<script setup lang="ts">
import { useWidgetsStore } from "@/common/stores";
import { Widget, WidgetTimeInput } from "@/config";

const props = defineProps<{
  data: Widget & WidgetTimeInput,
  currentId: string
}>();

let value = $ref("");
defineExpose({ index: useWidgetsStore().addWidgetValue(props.data, $$(value)) });

// Format input to M:SS format
const formatInput = () => {
  // Remove non-digit characters
  let digits = value.replace(/\D/g, "");
  
  // Limit to 3 digits (MSS)
  if (digits.length > 3) {
    digits = digits.slice(0, 3);
  }
  
  // Format as M:SS
  if (digits.length <= 1) {
    value = digits;
  } else if (digits.length <= 3) {
    value = digits.slice(0, 1) + ":" + digits.slice(1, 3);
  }
};
</script>

<style lang="postcss">
.time-input {
  padding: 0.5em;
  font-size: 1.2em;
  font-weight: bold;
  text-align: center;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 100px;
  font-family: monospace;
  
  &:focus {
    outline: none;
    border-color: #4CAF50;
    box-shadow: 0 0 5px rgba(76, 175, 80, 0.3);
  }
  
  &::placeholder {
    opacity: 0.6;
  }
}
</style>
