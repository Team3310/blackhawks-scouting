<template>
  <textarea rows="2" cols="10" v-model="value" :id="currentId" class="custom-textarea"></textarea>
</template>

<script setup lang="ts">
import { useWidgetsStore } from "@/common/stores";
import { Widget, WidgetTextarea } from "@/config";

const props = defineProps<{
  data: Widget & WidgetTextarea,
  currentId: string
}>();

const value = $ref("");
defineExpose({ index: useWidgetsStore().addWidgetValue(props.data, $$(value)) });
</script>

<style>
.custom-textarea {
  font-family: sans-serif; /* Set the desired font family */
  font-size: 15px; /* Set the desired font size */
  font-weight: 1; /* Set the desired font weight */
}
</style>
