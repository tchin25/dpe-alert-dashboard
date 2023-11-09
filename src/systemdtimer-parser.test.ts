import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
dayjs.extend(customParseFormat);

import SystemdtimerParser from "./systemdtimer-parser";
const systemdtimerParser = new SystemdtimerParser();

test("Parses process and time correctly", () => {
  const str = `
    Systemd timer ran the following command:

    /usr/local/bin/kerberos-run-command analytics /usr/local/bin/produce_canary_events

Its return value was 1 and emitted the following output:

produce_canary_events is not running
Running /opt/conda-analytics/bin/spark-submit $@
SPARK_HOME: /opt/conda-analytics/lib/python3.10/site-packages/pyspark
Using Hadoop client lib jars at 3.2.0, provided by Spark.
PYSPARK_PYTHON=/opt/conda-analytics/bin/python3
2023-11-07T04:30:07.579 INFO ProduceCanaryEvents Loaded ProduceCanaryEvents config:
Config(
  stream_names = List(),
  settings_filters = Map(canary_events_enabled -> true),
  schema_base_uris = ArrayBuffer(
    "https://schema.discovery.wmnet/repositories/primary/jsonschema", 
    "https://schema.discovery.wmnet/repositories/secondary/jsonschema"
  ),
    `;

  expect(systemdtimerParser._extractInfo(str)).toMatchObject({
    process: "produce_canary_events",
    time: "2023-11-07T04:30:07.579Z",
  });
});

test("Parses alternative time format correctly", () => {
  const str = `
  Systemd timer ran the following command:

    /usr/local/bin/kerberos-run-command analytics
/usr/local/bin/monitor_refine_event_sanitized_analytics_immediate

Its return value was 1 and emitted the following output:

monitor_refine_event_sanitized_analytics_immediate is not running
Running /opt/conda-analytics/bin/spark-submit $@
SPARK_HOME: /opt/conda-analytics/lib/python3.10/site-packages/pyspark
Using Hadoop client lib jars at 3.2.0, provided by Spark.
PYSPARK_PYTHON=/opt/conda-analytics/bin/python3
23/11/09 04:20:05 INFO HiveConf: Found configuration file
`;

  expect(systemdtimerParser._extractInfo(str)).toMatchObject({
    process: "monitor_refine_event_sanitized_analytics_immediate",
    time: dayjs("23/11/09 04:20:05", ["YY/MM/DD HH:mm:ss"]).utc(true).toISOString(),
  });
});
