<template>
  <div class="button-counter" :style="containerStyle">
    <div class="button-group">
      <button @click="setValue(value - 5)" :style="minusButtonStyle" class="counter-btn">-5</button>
      <button @click="setValue(value - 1)" :style="minusButtonStyle" class="counter-btn">-1</button>
    </div>
    <input type="number" class="counter-display" v-model="value" :id="currentId" :min="min" :max="max" step="1"
      :readonly="!data.allowKeyboardInput" @change="setValue(value)" />
    <div class="button-group">
      <button @click="setValue(value + 1)" :style="plusButtonStyle" class="counter-btn">+1</button>
      <button @click="setValue(value + 5)" :style="plusButtonStyle" class="counter-btn">+5</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { clamp, inRange } from "lodash";
import { useWidgetsStore } from "@/common/stores";
import { Widget, WidgetButtonCounter } from "@/config";

const props = defineProps<{
  data: Widget & WidgetButtonCounter,
  currentId: string
}>();

const min = props.data.min ?? 0;
const max = props.data.max ?? Number.MAX_SAFE_INTEGER;
const buttonSize = props.data.buttonSize ?? "2.5ch";

// Style objects
const minusButtonStyle = $computed(() => ({ 
  backgroundColor: props.data.minusButtonColor ?? props.data.buttonColor ?? "#f44336" 
}));
const plusButtonStyle = $computed(() => ({ 
  backgroundColor: props.data.plusButtonColor ?? props.data.buttonColor ?? "#4caf50" 
}));
const containerStyle = $computed(() => ({ 
  "--button-size": buttonSize 
} as any));

let value = $ref(min);
defineExpose({ index: useWidgetsStore().addWidgetValue(props.data, $$(value)) });

// Updates the value of the widget.
const setValue = (newValue: number) => value = inRange(newValue, min, max) ? newValue : clamp(newValue, min, max);
</script>

<style lang="postcss">
.button-counter {
  display: flex;
  align-items: center;
  gap: 0.5em;
}

.button-group {
  display: flex;
  gap: 0.25em;
}

.counter-display {
  text-align: center;
  width: 2em;
  appearance: textfield;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
}

.counter-btn {
  width: var(--button-size, 2.5ch);
  height: var(--button-size, 2.5ch);
  font-size: 0.9em;
  padding: 0px;
  min-width: 2em;
}
</style>
