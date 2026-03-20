// Google Apps Script — paste into Extensions → Apps Script on your Google Sheet,
// then deploy as a Web App ("Execute as: Me", "Who has access: Anyone").
//
// This version writes the raw QR/CSV string into column A of the "Raw Data" tab.
// The sheet's other columns should use formulas to parse column A.
//
// Layout expected:
// - Data starts on row 4
// - Raw string goes into column A

const SHEET_NAME = "Raw Data";
const DATA_START_ROW = 4;
const RAW_COL = 1; // A

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000); // wait up to 10s for other writes to finish

    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);
    if (!sheet) {
      throw new Error(`Sheet not found: ${SHEET_NAME}`);
    }

    const data = JSON.parse(e.postData.contents || "{}");
    const rawString = data.raw;

    if (!rawString) {
      throw new Error("Invalid payload: expected non-empty 'raw' field");
    }

    // Find the next empty row in column A starting from DATA_START_ROW
    const dataHeight = Math.max(sheet.getLastRow() - DATA_START_ROW + 1, 1);
    const colValues = sheet.getRange(DATA_START_ROW, RAW_COL, dataHeight, 1).getValues();
    let writeRow = DATA_START_ROW;
    for (let i = 0; i < colValues.length; i++) {
      if (String(colValues[i][0] || "").trim() === "") {
        writeRow = DATA_START_ROW + i;
        break;
      }
      writeRow = DATA_START_ROW + i + 1;
    }

    sheet.getRange(writeRow, RAW_COL).setValue(rawString);
    SpreadsheetApp.flush(); // ensure the write is committed before releasing the lock

    return ContentService
      .createTextOutput(JSON.stringify({ status: "ok", row: writeRow }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: String(error) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
