<template>
  <RouterLink :to="{ name: 'home' }">Home</RouterLink>
  <p>This is an exporter for data in The Purple Standard (TPS).</p>
  <template v-if="tpsData">
    <label for="team-number-input">Team Number</label>
    <input type="number" v-model.number="teamNumber" id="team-number-input">
    <button @click="downloadTPSData">Download TPS Data</button>
  </template>
  <p v-else>No TPS Data</p>
  <p v-show="error">Schema fetch failed: {{ error }}</p>
  <a ref="downloadLink" style="visibility: hidden"></a>
</template>

<script setup lang="ts">
import { useWidgetsStore } from "@/common/stores";
import { useStorage } from "@vueuse/core";
import { zip } from "lodash";

const widgets = useWidgetsStore();
const tpsData = $computed(() => widgets.savedData.get("tps"));
const downloadLink = $ref<HTMLAnchorElement>();
const teamNumber = $ref(useStorage("tpsTeamNumber", 0));

let tpsSchema: Record<string, string>;
let error: string | undefined = undefined;

function valueToTPS(value: string, type: string) {
  switch (type) {
    case "boolean":
      return value === "true";
    case "number":
      return parseInt(value);
    case "timer":
      return Math.trunc(parseFloat(value) * 1000); // Convert s to ms
    case "string":
    default:
      return value;
  }
}

async function downloadTPSData() {
  if (tpsData === undefined) return;

  if (tpsSchema === undefined) {
    const fetchResult = await fetch(`${import.meta.env.BASE_URL}assets/tps-exporter.json`);
    if (!fetchResult.ok) error = `${fetchResult.status} (${fetchResult.statusText})`;

    tpsSchema = await fetchResult.json();
  }

  const dataOut: Record<string, Record<string, unknown>>[] = [];

  for (const entry of tpsData.values) {
    const newData: Record<string, Record<string, unknown>> = { metadata: { match: {} } }

    for (const [widgetName, widgetValue] of zip(tpsData.header, entry)) {
      if (widgetName === undefined || widgetValue === undefined) continue;

      // Process metadata
      if (widgetName === "MatchNumber") {
        const matchNumber = parseInt(widgetValue);
        (newData["metadata"]["match"] as Record<string, unknown>)["number"] = matchNumber;
        (newData["metadata"]["match"] as Record<string, unknown>)["set"] = 1;
      } else if (widgetName === "TeamNumber") {
        newData["metadata"]["bot"] = parseInt(widgetValue);
      } else if (widgetName === "ScoutedTime") {
        newData["metadata"]["timestamp"] = Date.parse(widgetValue)
      } else if (widgetName === "ScoutName") {
        newData["metadata"]["scouter"] = { name: widgetValue, team: teamNumber, app: "bhs" }
      }

      const schemaData = tpsSchema[widgetName];
      if (schemaData === undefined) continue;

      const [iface, prop, type] = schemaData.split(" ");
      if (newData[iface] === undefined) newData[iface] = {};
      newData[iface][prop] = valueToTPS(widgetValue, type);
    }
    dataOut.push(newData);
  }

  if (downloadLink !== undefined) {
    const text = JSON.stringify({ entries: dataOut }, undefined, 2);
    downloadLink.href = URL.createObjectURL(new Blob([text], { type: "text/json" }));
    downloadLink.download = "tps.json";
    downloadLink.click();
  }
}
</script>
