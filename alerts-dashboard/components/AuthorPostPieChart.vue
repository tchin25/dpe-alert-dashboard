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

interface AuthorPostCount {
  value: number;
  name: string;
}

const authorPostCount = computed(() => {
  return props.data.reduce((acc, item) => {
    const existingEntry = acc.find((entry) => entry.name === item.author);

    if (existingEntry) {
      existingEntry.value += 1;
    } else {
      acc.push({ value: 1, name: item.author });
    }

    return acc;
  }, [] as AuthorPostCount[]);
});

const option = computed(() => {
  return {
    title: {
      text: "Posts per Author",
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
        data: authorPostCount.value,
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
      <v-chart
        :option="option"
        :update-options="{ notMerge: false }"
      />
    </div>
    <div class="grow-0">
      <DataTable size="small" scrollable :value="authorPostCount" tableStyle="">
        <Column field="name" header="Author"></Column>
        <Column field="value" header="Count"></Column>
      </DataTable>
    </div>
  </div>
</template>
