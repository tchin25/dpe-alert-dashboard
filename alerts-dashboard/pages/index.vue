<script setup lang="ts">
import "primevue/resources/themes/lara-light-teal/theme.css?inline";
import dayjs from "dayjs";
import { CdxCard } from "@wikimedia/codex";
import type { Thread } from "~/server/api/query.get";

const calendarStartTime = ref(dayjs().subtract(3, "d").toDate());
const calendarEndTime = ref(new Date());

const startTime = ref(calendarStartTime.value.toISOString());
const endTime = ref(calendarEndTime.value.toISOString());

const { data, pending, error, refresh } = useFetch("/api/query", {
  query: { start_time: startTime, end_time: endTime },
  watch: [startTime, endTime],
});

const results = computed<Thread[]>(() =>
  pending.value || !data.value ? [] : data.value?.results
);

const calendarModel = computed({
  get() {
    return [calendarStartTime.value, calendarEndTime.value];
  },
  set([newStart, newEnd]) {
    [calendarStartTime.value, calendarEndTime.value] = [newStart, newEnd];
    if (newStart) {
      startTime.value = newStart.toISOString();
    }
    if (newEnd) {
      endTime.value = newEnd.toISOString();
    }
  },
});
</script>
<template>
  <div class="grid grid-cols-9 h-screen w-screen gap-2">
    <aside
      class="col-span-2 p-4 max-h-screen overflow-y-auto"
      style="
        border-right: var(--border-width-base) var(--border-style-base)
          var(--border-color-subtle);
      "
    >
      <h1 class="font-bold text-xl pb-2">Filters</h1>
      <h2 class="font-semibold text-md">Date range</h2>
      <Calendar
        v-model="calendarModel"
        selectionMode="range"
        :manualInput="true"
        :maxDate="new Date()"
        class=""
        style="border: var(--border-base)"
      />
      <h1 class="font-bold text-xl py-2">Threads</h1>
      <div class="flex flex-col max-w-full gap-2">
        <ClientOnly>
          <cdx-card
            v-for="thread in results"
            :key="thread.threadId"
            :url="`https://lists.wikimedia.org/hyperkitty/list/data-engineering-alerts@lists.wikimedia.org/thread/${thread.threadId}/`"
            class="block"
          >
            <template #title>
              <h2 class="line-clamp-2 break-all">
                {{ thread.title }}
              </h2>
            </template>
            <template #description>
              <p class="truncate break-all">{{ thread.author }}</p>
            </template>
            <template #supporting-text> {{ thread.lastReplyDate }} </template>
          </cdx-card>
        </ClientOnly>
      </div>
    </aside>
    <div class="min-h-fit col-span-7 p-4 grid grid-cols-6 grid-rows-6 gap-4">
      <ClientOnly>
        <AlertFrequencyChart
          :data="results"
          class="col-span-full row-span-2"
        ></AlertFrequencyChart>

        <AuthorPostPieChart
          :data="results"
          class="col-span-3 row-span-2"
        ></AuthorPostPieChart>
        <SystemsPieChart
          :data="results"
          class="col-span-3 row-span-2"
        ></SystemsPieChart>
      </ClientOnly>
    </div>
  </div>
</template>
