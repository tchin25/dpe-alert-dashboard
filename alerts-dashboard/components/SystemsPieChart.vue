<script setup lang="ts">
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { PieChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
} from "echarts/components";
import VChart from "vue-echarts";
import type { Thread } from "~/server/api/query.get";

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
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
]);

interface SystemsCount {
  value: number;
  name: string;
}

const systemsCount = computed(() => {
  return props.data.reduce((acc, item) => {
    const existingEntry = acc.find((entry) => entry.name === item.system);

    if (existingEntry) {
      existingEntry.value += 1;
    } else {
      acc.push({ value: 1, name: item.system || "unknown" });
    }

    return acc;
  }, [] as SystemsCount[]);
});

const option = computed(() => {
  return {
    title: {
      text: "Alerts per System",
      left: "center",
    },
    tooltip: {
      trigger: "item",
      formatter: "{b} : {c} ({d}%)",
    },
    series: [
      {
        type: "pie",
        radius: "55%",
        center: ["50%", "60%"],
        data: systemsCount.value,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };
});
</script>
<template>
  <div class="flex flex-col">
    <div class="h-64">
      <v-chart :option="option" :update-options="{ notMerge: false }" />
    </div>
    <div class="grow-0">
      <DataTable size="small" scrollable :value="systemsCount" tableStyle="">
        <Column field="name" header="System"></Column>
        <Column field="value" header="Count"></Column>
      </DataTable>
    </div>
  </div>
</template>
