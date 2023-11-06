import { Meta } from ".";

interface AirflowData extends Meta {
    type?: "Anomaly" | "SLA Miss" | "Task Failed" | "Unexpected Founds",
    dag?: string
    date?: string // currently not in ISO format
}

export default function parseEmail(email: string) {
    // Create an object to store the parsed data
    let parsedData: Record<string, string> = {};

    // Use a regular expression to match the lines we're interested in
    const typeMatch = email.match(/Notification Type:\s*(.*)/);
    const serviceMatch = email.match(/Service:\s*(.*)/);
    const stateMatch = email.match(/State:\s*(.*)/);
    const dateMatch = email.match(/Date\/Time:\s*(.*)/);

    // Assign the matched groups to the respective fields in the parsedData object
    if (typeMatch) {
        parsedData.type = typeMatch[1];
    }
    if (serviceMatch) {
        parsedData.service = serviceMatch[1];
    }
    if (stateMatch) {
        parsedData.state = stateMatch[1];
    }
    if (dateMatch) {
        parsedData.date = dateMatch[1];
    }

    return {
        ...parsedData,
        system: "Airflow"
    } as AirflowData;
};