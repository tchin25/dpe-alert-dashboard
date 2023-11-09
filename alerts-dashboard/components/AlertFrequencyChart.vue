<script setup lang="ts">
import type { Thread } from "~/server/api/query.get";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { LineChart } from "echarts/charts";
import {
  DataZoomComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from "echarts/components";
import VChart from "vue-echarts";

const props = withDefaults(
  defineProps<{
    data: Thread[];
  }>(),
  {
    data: () => [],
  }
);

use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
]);

interface ThreadCountByDay {
  date: string;
  count: number;
}

const threadCount = computed(() => {
  return props.data.reduce((acc, item) => {
    // Extract just the YYYY-MM-DD from the ISO date string
    // const date = item.lastReplyDate.split("T")[0];

    // Extract the YYYY-MM-DDTHH from the ISO date string
    const date = item.lastReplyDate.substring(0, 13);

    const existingEntry = acc.find((entry) => entry.date === date);

    if (existingEntry) {
      existingEntry.count += 1;
    } else {
      acc.push({ date, count: 1 });
    }

    return acc;
  }, [] as ThreadCountByDay[]);
});

const option = computed(() => {
  return {
    title: {
      text: "Alerts per Hour",
      left: "center",
    },
    tooltip: {
      trigger: "item",
      formatter: "{c}",
    },
    dataZoom: [
      {
        type: "slider",
      }
    ],
    xAxis: { type: "time" },
    yAxis: {},
    series: [
      {
        type: "line",
        smooth: true,
        data: threadCount.value.map((obj) => Object.values(obj).flat()),
      },
    ],
  };
});
</script>
<template>
  <v-chart :option="option" :update-options="{ notMerge: false }" autoresize />
</template>
