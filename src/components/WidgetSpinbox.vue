<template>
  <button @click="setValue(value - 1)" :style="buttonColorStyle" class="spinbox-btn">-</button>
  <input type="number" class="spinbox" v-model="value" :id="currentId" :min="min" :max="max" step="1"
    :readonly="!data.allowKeyboardInput" @change="setValue(value)" />
  <button @click="setValue(value + 1)" :style="buttonColorStyle" class="spinbox-btn">+</button>
</template>

<script setup lang="ts">
import { clamp, inRange } from "lodash";
import { useWidgetsStore } from "@/common/stores";
import { Widget, WidgetSpinbox } from "@/config";

const props = defineProps<{
  data: Widget & WidgetSpinbox,
  currentId: string
}>();

const min = props.data.min ?? 0;
const max = props.data.max ?? Number.MAX_SAFE_INTEGER;

// Style object to set button background color
const buttonColorStyle = $computed(() => ({ backgroundColor: props.data.buttonColor }));

let value = $ref(min);
defineExpose({ index: useWidgetsStore().addWidgetValue(props.data, $$(value)) });

// Updates the value of the widget.
const setValue = (newValue: number) => value = inRange(newValue, min, max) ? newValue : clamp(newValue, min, max);
</script>

<style lang="postcss">
.spinbox {
  text-align: center;
  width: 1.75em;
  appearance: textfield;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
}

.spinbox-btn {
  width: 2.5ch; /* Increase width */
  height: 2.5ch; /* Increase height */
  font-size: 1.3em; /* Increase font size */
  padding: 0px; /* Add padding */
}
</style>
