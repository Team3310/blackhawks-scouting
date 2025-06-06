<template>
  <FormPage title="📝 Team Selection 📝" ref="page">
    <FormGroup :show="isTBA" :label-type="LabelType.LabelTag" id="event-key-input" name="Event Key">
      <input id="event-key-input" type="text" v-model="eventKey" @keyup.enter="loadTBAData" />
      <button @click="loadTBAData">Load</button>
    </FormGroup>
    <FormGroup :show="isTBA" :label-type="LabelType.PlainText" name="Teams Loaded">{{ teamsLoadStatus }}</FormGroup>
    <FormGroup :show="isTBA" :label-type="LabelType.PlainText" name="Matches Loaded">{{ matchesLoadStatus }}</FormGroup>
    <FormGroup :label-type="LabelType.LabelTag" id="match-input" name="Match Number">
      <input id="match-input" type="number" v-model.lazy="matchNumber" :min="1" class="custom-number-input-match" @change ="saveMatchNumber" />
    </FormGroup>
    <FormGroup :show="isTBA" :label-type="LabelType.LabelTag" id="team-input" name="Team">
      <span v-if="currentMatch === null">&lt;No Data&gt;</span>
      <select v-else id="team-input" v-model="selectedTeam">
        <option v-for="[i, { color, index, number, name }] of teamsList.entries()" :key="i" :value="i">
          {{ color }} {{ index }}: {{ number }} ({{ name }} )
        </option>
      </select>
    </FormGroup>
    <FormGroup :show="!isTBA" :label-type="LabelType.LabelTag" id="team-number-input" name="Team Number">
      <input type="number" v-model="teamNumberManual" class="custom-number-input-team" />
    </FormGroup>
    <FormGroup :show="!isTBA" :label-type="LabelType.LabelTag" id="team-color-input" name="Team Color">
      <select id="team-color-input" v-model="teamColorManual" @change="saveTeamColor">
        <option value="Red" selected>Red</option>
        <option value="Blue">Blue</option>
      </select>
    </FormGroup>
    <FormGroup :show="!isTBA" :label-type="LabelType.LabelTag" id="scout-name-input" name="Scout's Name">
      <input type="text" size="13" v-model="scoutNameManual" @input="saveScoutName" />
    </FormGroup>
  </FormPage>
</template>

<script setup lang="ts">
import FormGroup from "./FormGroup.vue";
import FormPage from "./FormPage.vue";
import { get, isEmpty } from "lodash";
import { getError, getTeamName, isFailed, TBAData } from "@/common/tba";
import { LabelType } from "@/common/shared";
import { computed, Ref, ref, onMounted } from "vue";
import { useConfigStore, useTBAStore, useWidgetsStore } from "@/common/stores";

interface Team {
  color: string;
  index: number;
  number: number;
  name: string;
}

const page = $ref<InstanceType<typeof FormPage>>();
defineExpose({ title: computed(() => page?.title), setShown: computed(() => page?.setShown) });

const config = useConfigStore();
const tba = useTBAStore();
const widgets = useWidgetsStore();

const selectType = $ref(0);
let eventKey = $ref("");
const matchLevel = $ref(0);
let matchNumber = $ref(Number(localStorage.getItem("matchNumber") || "0"));
const selectedTeam = $ref(0);

const teamNumberManual = $ref(0);
const teamColorManual = ref(localStorage.getItem("teamColorManual") || "Red");
const scoutNameManual = ref(localStorage.getItem("scoutNameManual") || ""); // Use ref to make it reactive

let teamsLoadStatus = $ref("");
let matchesLoadStatus = $ref("");

const teams = $ref<unknown[]>();
const matches = $ref<unknown[]>();

const isTBA = $computed(() => selectType === 1);

const widgetData = computed(() => ({
  ...config.data,
  teamColor: `${teamColorManual}`
}));

// Debug: log teamColorManual and widgetData to ensure it is defined.
console.log("teamColorManual:", teamColorManual);
console.log("widgetData.teamColor:", widgetData.value.teamColor);

// Define a unique widget id to pass as currentId.
// You can generate or set this value as needed.
const currentId = "unique-widget-id";

// The match data based on the selected level and number
const currentMatch = $computed(() => {
  // Make sure matches are loaded
  if (!Array.isArray(matches)) return null;

  // Get the matches with the selected level
  const matchLevelCodes = ["qm", "sf", "f"];
  const matchList = matches.filter((match: unknown) => get(match, "comp_level") === matchLevelCodes[matchLevel]);

  // When ordering matches, the match number takes priority over the set number
  // Sorting according to multiple values: https://stackoverflow.com/a/46256174
  const getNumber = (matchObj: unknown, key: string) => get(matchObj, key + "_number") ?? 1;
  const diff = (obj1: unknown, obj2: unknown, key: string) => getNumber(obj1, key) - getNumber(obj2, key);

  matchList.sort((first: unknown, second: unknown) => diff(first, second, "match") || diff(first, second, "set"));
  return matchList[matchNumber - 1] ?? null;
});

// The teams playing in the selected match
const teamsList = $computed(() => {
  const result = new Array<Team>();
  if (currentMatch === null) return result; // Return empty array if current selected match is invalid

  for (const color of ["Red", "Blue"]) {
    // The list of teams playing on one alliance
    const teamKeys = get(currentMatch, `alliances.${color.toLowerCase()}.team_keys`) as unknown as string[];

    for (const [i, element] of teamKeys.entries()) {
      // Get info for each team
      const index = i + 1;
      const number = parseInt(element.substring(3));
      const name = getTeamName(number, teams);

      result.push({ color, index, number, name });
    }
  }

  return result;
});

// The exported team information
const teamData = $computed(() => {
  if (isTBA) return teamsList[selectedTeam] ? Object.values(teamsList[selectedTeam]).join() : "";
  else return `${teamColorManual.value},${teamNumberManual},${scoutNameManual.value}`;
});

// Add values to export
widgets.addWidgetValue("EventKey", $$(eventKey));
widgets.addWidgetValue("MatchLevel", $$(matchLevel));
widgets.addWidgetValue("MatchNumber", $$(matchNumber));
widgets.addWidgetValue("Team", $$(teamData));

// Updates the loaded status message for a variable.
// This function takes Ref objects to get a behavior similar to pass-by-reference in C++.
function updateStatus(msg: Ref<string>, saveVar: Ref<unknown>, { code, data }: TBAData) {
  // Update variables
  eventKey = code;
  saveVar.value = data;

  // Update status message
  if (isFailed(data)) msg.value = "\u274C " + getError(data);
  else if (isEmpty(data)) msg.value = "\u26A0\uFE0F No data available";
  else msg.value = "\u2705 Loaded successfully";
}

// Loads team and match data from the event key the user entered.
function loadTBAData() {
  teamsLoadStatus = "Loading...";
  tba.load(eventKey, "teams").then(value => updateStatus($$(teamsLoadStatus), $$(teams), value));

  matchesLoadStatus = "Loading...";
  tba.load(eventKey, "matches").then(value => updateStatus($$(matchesLoadStatus), $$(matches), value));
}

// Save the scout name to local storage whenever it changes
function saveScoutName() {
  localStorage.setItem("scoutNameManual", scoutNameManual.value);
}
function saveTeamColor() {
  localStorage.setItem("teamColorManual", teamColorManual.value);
}
function saveMatchNumber() {
  localStorage.setItem("matchNumber", matchNumber.toString());
}

// Increment match number on component mount
onMounted(() => {
  matchNumber++; // Increment by 1 on component mount
  saveMatchNumber(); // Save the incremented number
});
</script>

<style>
#team-input {
  width: 250px;
  text-overflow: ellipsis;
}

.custom-number-input-match {
  width: 40px; /* Set the desired width */
  height: 23px; /* Set the desired height */
}
.custom-number-input-team {
  width: 70px; /* Set the desired width */
  height: 23px; /* Set the desired height */
}
</style>
