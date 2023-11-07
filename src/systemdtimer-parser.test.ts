import SystemdtimerParser from "./systemdtimer-parser";

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
    `

    const systemdtimerParser = new SystemdtimerParser()
    expect(systemdtimerParser._extractInfo(str)).toMatchObject({
        process: "produce_canary_events",
        time: "2023-11-07T04:30:07.579"
    });
  });