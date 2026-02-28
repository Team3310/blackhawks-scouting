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
  <div v-if="showCycle" class="cycle-info">
    <div class="rate-line">current: {{ currentRate.toFixed(2) }} shots/s</div>
    <div class="rate-line">avg: {{ averageRate.toFixed(2) }} shots/s</div>
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
// --- cycle/time tracking state ------------------------------------------------
let cycleStart = $ref<number | null>(null);      // timestamp of first shot in current burst
let lastShot = $ref<number | null>(null);        // timestamp of most recent shot
let shotCount = $ref(0);                         // shots in current burst
let totalCycles = $ref(0);                      // number of completed bursts
let totalShots = $ref(0);                       // total shots counted in finished bursts
let totalShotSec = $ref(0);                     // sum of durations of finished bursts (seconds)
let inactivityTimer = $ref<number | null>(null); // timeout handle for detecting end-of-cycle

const cycleThreshold = props.data.cycleThreshold ?? 3000;
const showCycle = $computed(() => {
  if (props.data.cycleGroup) {
    // only the designated primary widget displays the shared rate
    return !!props.data.cycleGroupPrimary;
  }
  return props.data.showCycleRate === true;
});

const currentRate = $computed(() => {
  if (props.data.cycleGroup) {
    return widgets.getCycleGroupCurrentRate(props.data.cycleGroup);
  }
  if (!cycleStart || shotCount < 2 || lastShot === null) return 0;
  return shotCount / ((lastShot - cycleStart) / 1000);
});

const averageRate = $computed(() => {
  if (props.data.cycleGroup) {
    return widgets.getCycleGroupAverageRate(props.data.cycleGroup);
  }
  if (totalShotSec <= 0) return 0;
  return totalShots / totalShotSec;
});

// Reactive string representation of average rate for export
const rateString = $computed(() => averageRate.toFixed(2));

function scheduleInactivity() {
  if (inactivityTimer !== null) window.clearTimeout(inactivityTimer);
  inactivityTimer = window.setTimeout(() => {
    if (cycleStart && shotCount > 1 && lastShot !== null) {
      const dur = (lastShot - cycleStart) / 1000;
      totalShotSec += dur;
      totalShots += shotCount;
      totalCycles++;
    }
    cycleStart = lastShot = null;
    shotCount = 0;
    inactivityTimer = null;
  }, cycleThreshold);
}

function recordShots(delta: number) {
  const now = Date.now();
  if (!cycleStart || (lastShot !== null && now - lastShot > cycleThreshold)) {
    // finish the previous burst if it had more than one shot
    if (cycleStart && shotCount > 1 && lastShot !== null) {
      const dur = (lastShot - cycleStart) / 1000;
      totalShotSec += dur;
      totalShots += shotCount;
      totalCycles++;
    }
    cycleStart = now;
    shotCount = delta;
  } else {
    shotCount += delta;
  }
  lastShot = now;
  scheduleInactivity();
}

function resetCycle() {
  if (cycleStart && shotCount > 1 && lastShot !== null) {
    const dur = (lastShot - cycleStart) / 1000;
    totalShotSec += dur;
    totalShots += shotCount;
    totalCycles++;
  }
  cycleStart = lastShot = null;
  shotCount = 0;
  if (inactivityTimer !== null) {
    window.clearTimeout(inactivityTimer);
    inactivityTimer = null;
  }
}

const widgets = useWidgetsStore();

// expose the raw counter to the widgets store; additional stats can be inspected
const widgetIndex = widgets.addWidgetValue(props.data, $$(value));

// If this counter belongs to a cycle group, ensure the group export exists
if (props.data.cycleGroup) {
  widgets.ensureCycleGroupExport(props.data.cycleGroup, props.data.cycleRateExportName);
}

// If cycleRateExportName is set on this widget specifically, export the per-widget average
// (skip when participating in a group; groups export their own column)
if (props.data.cycleRateExportName && !props.data.cycleGroup) {
  widgets.addWidgetValue(props.data.cycleRateExportName, $$(rateString));
}

defineExpose({ index: widgetIndex, currentRate, averageRate });

// Updates the value of the widget.
const setValue = (newValue: number) => {
  const delta = newValue - value;
  if (delta > 0) {
    // forward to shared group tracker if configured
    if (props.data.cycleGroup) {
      widgets.addShotToCycleGroup(props.data.cycleGroup, delta, cycleThreshold);
    }
    // record local cycle only when not part of a group
    if (!props.data.cycleGroup && showCycle) {
      recordShots(delta);
    }
  } else if (delta <= 0) {
    // decrement or reset: treat as ending the current cycle
    if (!props.data.cycleGroup && showCycle) resetCycle();
  }
  value = inRange(newValue, min, max) ? newValue : clamp(newValue, min, max);
};
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

.cycle-info {
  margin-top: 0.5em;
  font-size: 0.8em;
  text-align: center;
  color: #555;
}
.cycle-info .rate-line {
  line-height: 1.2;
}
</style>
