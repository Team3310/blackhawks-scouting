<template>
  <h4>
    <span class="custom-heading">{{ data.name }}</span></h4>
</template>

<script setup lang="ts">
import { Widget, WidgetHeading } from "@/config";

defineProps<{
  data: Widget & WidgetHeading,
  currentId: string
}>();
</script>
<style scoped>
.custom-heading {
  font-size: 1.35em; /* Increase font size */
  /*font-weight: bold;  Optional: Make the text bold */
  /*color: #333; Optional: Change text color */
}
</style>
