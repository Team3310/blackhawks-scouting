<template>
  <span class="custom-label">{{ data.name }}</span>
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
  font-size: 1.1em; /* Increase font size */
  /*font-weight: bold;  Optional: Make the text bold */
  /*color: #333; Optional: Change text color */
}
</style>
