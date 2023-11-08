import AirflowParser from "./airflow-parser";

test("Parses DAG correctly", () => {
  const airflowParser = new AirflowParser();

  expect(
    airflowParser._extractDagName(
      "Airflow alert: <TaskInstance: edit_hourly.process_edit_hourly scheduled__2023-10-01T00:00:00+00:00 [failed]>"
    )
  ).toBe("edit_hourly");
  expect(
    airflowParser._extractDagName(
      "Anomaly report anomaly_detection_traffic_distribution_daily 2023-11-07"
    )
  ).toBe("anomaly_detection_traffic_distribution_daily");
  expect(
    airflowParser._extractDagName(
      "Unexpected found in pageview hourly pageview_allowlist_check 2023-11-07"
    )
  ).toBe("pageview");
  expect(
    airflowParser._extractDagName(
      "[airflow] SLA miss on DAG=mediawiki_history_denormalize"
    )
  ).toBe("mediawiki_history_denormalize");
  expect(
    airflowParser._extractDagName(
      "Data Loss ERROR - Airflow Analytics mediawiki_history_denormalize 2023-10-25"
    )
  ).toBe("mediawiki_history_denormalize");
});
