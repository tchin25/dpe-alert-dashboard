/**
 * @typedef {Object} NagiosData
 * @property {string} type
 * @property {string} service
 * @property {string} state
 * @property {string} date - currently not in ISO format
 */

/**
 * 
 * @param {string} email - email contents
 * @returns {NagiosData}
 */
export default function parseEmail(email) {
    // Create an object to store the parsed data
    let parsedData = {
        type: '',
        service: '',
        state: '',
        date: ''
    };

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

    return parsedData;
};