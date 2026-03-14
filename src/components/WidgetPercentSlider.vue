<template>
  <div class="percent-slider-wrap">
    <input
      :id="currentId"
      type="range"
      class="percent-slider"
      :min="min"
      :max="max"
      :step="step"
      v-model.number="value"
    />
    <span v-if="showValue" class="percent-slider-value">{{ value }}%</span>
  </div>
</template>

<script setup lang="ts">
import { clamp } from "lodash";
import { useWidgetsStore } from "@/common/stores";
import { Widget, WidgetPercentSlider } from "@/config";

const props = defineProps<{
  data: Widget & WidgetPercentSlider,
  currentId: string
}>();

const min = props.data.min ?? 0;
const max = props.data.max ?? 100;
const step = props.data.step ?? 1;
const showValue = props.data.showValue ?? true;
const defaultValue = clamp(props.data.default ?? 0, min, max);

let value = $ref(defaultValue);

defineExpose({ index: useWidgetsStore().addWidgetValue(props.data, $$(value)) });
</script>

<style lang="postcss">
.percent-slider-wrap {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.percent-slider {
  width: 14rem;
}

.percent-slider-value {
  min-width: 3.25rem;
  text-align: right;
}
</style>