// Google Apps Script — paste into Extensions → Apps Script on your Google Sheet,
// then deploy as a Web App ("Execute as: Me", "Who has access: Anyone").
//
// This version writes to the existing formatted "Raw Data" tab by matching
// incoming app headers to the header row on the sheet.
//
// Layout expected:
// - Header row is row 3
// - Data starts on row 4
// - First data column is column B

const SHEET_NAME = "Raw Data";
const HEADER_ROW = 3;
const DATA_START_ROW = 4;
const START_COL = 2; // B

function doPost(e) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);
    if (!sheet) {
      throw new Error(`Sheet not found: ${SHEET_NAME}`);
    }

    const data = JSON.parse(e.postData.contents || "{}");
    const incomingHeader = Array.isArray(data.header) ? data.header : [];
    const incomingValues = Array.isArray(data.values) ? data.values : [];

    if (incomingHeader.length === 0 || incomingValues.length === 0) {
      throw new Error("Invalid payload: expected non-empty header and values arrays");
    }

    const maxColumns = sheet.getMaxColumns();
    const headerWidth = maxColumns - START_COL + 1;
    const sheetHeaders = sheet.getRange(HEADER_ROW, START_COL, 1, headerWidth).getValues()[0];

    let lastHeaderIndex = -1;
    for (let i = 0; i < sheetHeaders.length; i++) {
      if (String(sheetHeaders[i] || "").trim() !== "") {
        lastHeaderIndex = i;
      }
    }
    if (lastHeaderIndex < 0) {
      throw new Error(`No headers found on row ${HEADER_ROW} starting at column B`);
    }

    const activeHeaders = sheetHeaders.slice(0, lastHeaderIndex + 1).map(h => String(h).trim());

    const valueByHeader = {};
    incomingHeader.forEach((headerName, index) => {
      valueByHeader[String(headerName).trim()] = incomingValues[index];
    });

    const outputRow = activeHeaders.map(headerName => {
      if (!(headerName in valueByHeader)) return "";
      const value = valueByHeader[headerName];
      return value === null || value === undefined ? "" : value;
    });

    const dataHeight = Math.max(sheet.getLastRow() - DATA_START_ROW + 1, 1);
    const colValues = sheet.getRange(DATA_START_ROW, START_COL, dataHeight, 1).getValues();
    let writeRow = DATA_START_ROW;
    for (let i = 0; i < colValues.length; i++) {
      if (String(colValues[i][0] || "").trim() === "") {
        writeRow = DATA_START_ROW + i;
        break;
      }
      writeRow = DATA_START_ROW + i + 1;
    }

    sheet.getRange(writeRow, START_COL, 1, outputRow.length).setValues([outputRow]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: "ok", row: writeRow }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: String(error) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
