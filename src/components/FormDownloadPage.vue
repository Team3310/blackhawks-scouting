<template>
  <FormPage title="💾 Download Data 💾" ref="page">
    <FormGroup :label-type="LabelType.None" :colspan="2" align="center">
      <button @click="openQRDialog">Generate QR Code</button>
    </FormGroup>
    <FormGroup v-if="config.data.googleSheetsUrl" :label-type="LabelType.None" :colspan="2" align="center">
      <button :disabled="sheetStatus === 'sending'" @click="sendToGoogleSheets">
        {{ sheetStatus === "sending" ? "Sending..." : "Send to Google Sheets" }}
      </button>
    </FormGroup>
    <FormGroup v-if="config.data.googleSheetsUrl && sheetStatus !== 'idle'" :label-type="LabelType.None" :colspan="2" align="center">
      <span class="sheet-status" v-if="sheetStatus === 'sending'">📤 Sending {{ pendingSendSummary }}...</span>
      <span class="sheet-status" v-else-if="sheetStatus === 'sent'">✅ Sent {{ lastSentSummary }} to Google Sheets.</span>
      <span class="sheet-status" v-else-if="sheetStatus === 'error'">❌ Failed to send {{ pendingSendSummary }}.</span>
    </FormGroup>
    <FormGroup :label-type="LabelType.None">
      <div style="height: 20px;"></div>
    </FormGroup>
    <FormGroup :label-type="LabelType.None">
      <div style="height: 20px;"></div>
    </FormGroup>
    <FormGroup :label-type="LabelType.None" :colspan="2" align="center">
      <button @click="clearForm">Save and Clear Form</button>
    </FormGroup>
    <FormGroup :label-type="LabelType.None">
      <div style="height: 20px;"></div>
    </FormGroup>
    <FormGroup :label-type="LabelType.None" :colspan="2" align="center">
      <span v-if="widgets.downloadLink === null">No Saved Data</span>
      <a v-else :download="`scouted-${config.name}.csv`" :href="widgets.downloadLink">Download Saved CSV</a>
    </FormGroup>
    <FormGroup :label-type="LabelType.None" :colspan="2" align="center">
      <RouterLink :to="{ name: 'inspector' }">Data Inspector</RouterLink>
    </FormGroup>
    <FormGroup :label-type="LabelType.None" :colspan="2" align="center">
      <RouterLink :to="{ name: 'home' }">Home</RouterLink>
    </FormGroup>
  </FormPage>
  <dialog ref="qrContainer">
    <div id="qr-dialog-contents">
      <button id="qr-dialog-close" @click="qrContainer?.close">Close</button>
      <div>
        <input type="checkbox" v-model="excludeHeaders" id="exclude-headers" />
        <label for="exclude-headers">Include headers in code</label>
      </div>
      <qrcode-vue :value="qrData" level="M" render-as="svg" :size="300" />
    </div>
  </dialog>
</template>

<script setup lang="ts">
import FormPage from "./FormPage.vue";
import FormGroup from "./FormGroup.vue";
import { LabelType } from "@/common/shared";
import { computed } from "vue";
import QrcodeVue from "qrcode.vue";
import { useConfigStore, useWidgetsStore } from "@/common/stores";
import { submitToGoogleSheets } from "@/common/googleSheets";
import { useRouter } from "vue-router";

const config = useConfigStore();
const widgets = useWidgetsStore();

const router = useRouter();

const page = $ref<InstanceType<typeof FormPage>>();
const qrContainer = $ref<HTMLDialogElement>();
const qrData = $computed(() => widgets.toCSVString(widgets.getWidgetsAsCSV(), !excludeHeaders));
const excludeHeaders = $ref(false);
let sheetStatus = $ref<'idle' | 'sending' | 'sent' | 'error'>('idle');
let pendingSendSummary = $ref("");
let lastSentSummary = $ref("");

function openQRDialog() {
  qrContainer?.showModal();
}

async function sendToGoogleSheets() {
  const url = config.data.googleSheetsUrl;
  if (!url) return;

  const csv = widgets.getWidgetsAsCSV();
  const getValue = (name: string) => {
    const idx = csv.header.indexOf(name);
    return (idx >= 0) ? csv.values[0][idx] : "";
  };

  const matchNumber = getValue("MatchNumber");
  const teamNumber = getValue("TeamNumber");
  const scoutName = getValue("ScoutName");
  pendingSendSummary = `Match ${matchNumber || "?"} / Team ${teamNumber || "?"}${scoutName ? ` / ${scoutName}` : ""}`;

  sheetStatus = 'sending';
  const ok = await submitToGoogleSheets(url, csv);
  sheetStatus = ok ? 'sent' : 'error';
  if (ok) lastSentSummary = pendingSendSummary;
}

function clearForm() {
  widgets.save();
  router.go(0); // Reload the page
}

defineExpose({ title: computed(() => page?.title), setShown: computed(() => page?.setShown) });
</script>

<style lang="postcss">
#qr-dialog-contents {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;

  button {
    align-self: flex-end;
  }

  label {
    color: black;
  }
}

.sheet-status {
  font-size: 0.9em;
  margin-top: 2px;
}
</style>
