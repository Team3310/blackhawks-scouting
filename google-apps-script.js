// Google Apps Script — paste into Extensions → Apps Script on your Google Sheet
// then deploy as a Web App ("Execute as: Me", "Who has access: Anyone").
//
// After deploying, copy the web-app URL and set it as `googleSheetsUrl` in your
// scouting config JSON (e.g. config-matches.json).

function doPost(e) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName("Sheet1");
  if (!sheet) {
    sheet = spreadsheet.insertSheet("Sheet1");
  }
  var data = JSON.parse(e.postData.contents);

  // Always write the header row in row 1 (overwrites if already present)
  var headerRange = sheet.getRange(1, 1, 1, data.header.length);
  headerRange.setValues([data.header]);

  // Append the data row after the last row with content
  sheet.appendRow(data.values);

  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok" }))
    .setMimeType(ContentService.MimeType.JSON);
}
