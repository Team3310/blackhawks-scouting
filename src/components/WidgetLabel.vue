<template>
  <p class="custom-label">{{ data.name }}</p>
</template>

<script setup lang="ts">
import { Widget, WidgetLabel } from "@/config";

defineProps<{
  data: Widget & WidgetLabel,
  currentId: string
}>();
</script>

<style scoped>
.custom-label {
  font-size: .9em;
  white-space: normal;
  margin: 0;
}
</style>
