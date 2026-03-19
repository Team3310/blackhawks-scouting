<template>
  <FormPage title="📋 Team Info 📋" ref="page">
    <FormGroup :label-type="LabelType.LabelTag" id="pit-scout-name-input" name="Scout's Name (You)">
      <input type="text" size="13" v-model="scoutName" @input="saveScoutName" />
    </FormGroup>
    <FormGroup :label-type="LabelType.LabelTag" id="pit-team-number-input" name="Team Number">
      <input id="pit-team-number-input" type="number" v-model="teamNumber" class="custom-number-input-team" />
    </FormGroup>
    <FormGroup :label-type="LabelType.LabelTag" id="pit-coach-name-input" name="Drive Coach's Name">
      <input type="text" size="13" v-model="coachName" />
    </FormGroup>
  </FormPage>
</template>

<script setup lang="ts">
import FormGroup from "./FormGroup.vue";
import FormPage from "./FormPage.vue";
import { LabelType } from "@/common/shared";
import { computed } from "vue";
import { useWidgetsStore } from "@/common/stores";

const page = $ref<InstanceType<typeof FormPage>>();
defineExpose({ title: computed(() => page?.title), setShown: computed(() => page?.setShown) });

const widgets = useWidgetsStore();

let teamNumber = $ref(0);
let scoutName = $ref(localStorage.getItem("scoutNameManual") ?? "");
let coachName = $ref("");

widgets.addWidgetValue("TeamNumber", $$(teamNumber));
widgets.addWidgetValue("ScoutName", $$(scoutName));
widgets.addWidgetValue("CoachName", $$(coachName));

function saveScoutName() {
  localStorage.setItem("scoutNameManual", scoutName);
}
</script>

<style>
#pit-team-number-input {
  width: 75px;
  height: 23px;
}
</style>
