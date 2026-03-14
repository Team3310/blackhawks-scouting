import { SavedData } from "./stores";

/**
 * Sends the current form data to a Google Sheet via a deployed Google Apps Script web app.
 * The script URL should be the deployed web app URL from Google Apps Script.
 */
export async function submitToGoogleSheets(
  scriptUrl: string,
  data: SavedData
): Promise<boolean> {
  try {
    const payload = {
      header: data.header,
      values: data.values[0] // Send the single current record
    };

    const resp = await fetch(scriptUrl, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(payload)
    });

    // With no-cors the response is opaque (can't read status),
    // but doPost() runs before the redirect so data is written.
    return true;
  } catch (e) {
    console.error("Failed to submit to Google Sheets:", e);
    return false;
  }
}
