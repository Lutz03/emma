/**
 * Emma's 1st Birthday RSVP → Google Sheets
 *
 * Paste this into your Google Sheet: Extensions → Apps Script.
 * Then Deploy → New deployment → Web app
 *   Execute as: Me
 *   Who has access: Anyone
 * Copy the Web App URL into script.js (SCRIPT_URL).
 */

const SHEET_NAME = "RSVP";
const HEADERS = ["Timestamp", "Name", "Attending", "Guests", "Event", "Contact", "Message"];

// Optional: put your email here to get notified on every RSVP (leave "" to disable)
const NOTIFY_EMAIL = "";

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const p = e.parameter;
    const sheet = getSheet_();

    const row = [
      new Date(),
      clean_(p.name),
      clean_(p.attending),
      Number(p.guests) || 0,
      clean_(p.event),
      clean_(p.contact),
      clean_(p.message),
    ];
    sheet.appendRow(row);

    if (NOTIFY_EMAIL) {
      MailApp.sendEmail(
        NOTIFY_EMAIL,
        `New RSVP: ${row[1]} (${row[2]})`,
        HEADERS.map((h, i) => `${h}: ${row[i]}`).join("\n")
      );
    }

    return json_({ result: "success" });
  } catch (err) {
    return json_({ result: "error", error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Lets you open the Web App URL in a browser to check it's live
function doGet() {
  return json_({ result: "ok", message: "RSVP endpoint is running" });
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold").setBackground("#fbe3e8");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// Trim, limit length, and stop values being treated as spreadsheet formulas
function clean_(v) {
  let s = String(v || "").trim().slice(0, 500);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
