// === Nastavení ===
const SPREADSHEET_ID = "1evwXruibMI8N-pWMXR7DkifGRGrZG2HVykmpZEykGi0";
const SHEET_NAME = "Leady";
const NOTIFY_EMAIL_TO = "fik.maxmilian@gmail.com";
const SECRET_TOKEN = "1506-123-12-157489-13589-odstartujto";

function doGet(e) {
  try {
    // Data jsou v URL parametru 'data' jako JSON string
    if (!e || !e.parameter || !e.parameter.data) {
      const errorResponse = { ok: false, error: "Missing data" };
      return formatResponse(errorResponse, e && e.parameter && e.parameter.callback);
    }
    
    const data = JSON.parse(e.parameter.data);
    const result = processFormData(data);
    
    return formatResponse(result, e.parameter.callback);
  } catch (err) {
    const errorResponse = { ok: false, error: String(err) };
    return formatResponse(errorResponse, e && e.parameter && e.parameter.callback);
  }
}

function formatResponse(response, callback) {
  const jsonText = JSON.stringify(response);
  if (callback) {
    return ContentService.createTextOutput(callback + '(' + jsonText + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(jsonText)
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const result = processFormData(data);
    return formatResponse(result, null);
  } catch (err) {
    return formatResponse({ ok: false, error: String(err) }, null);
  }
}

function processFormData(data) {
  try {
    // 1) Kontrola tokenu
    if (data.token !== SECRET_TOKEN) {
      return { ok: false, error: "Unauthorized" };
    }
    
    // 2) Honeypot kontrola
    if (data.website && data.website.trim() !== "") {
      return { ok: true };
    }
    
    // 3) Získání dat
    const name = (data.name || "").trim();
    const email = (data.email || "").trim();
    const phone = (data.phone || "").trim();
    const goal = (data.goal || "").trim();
    const message = (data.message || "").trim();
    const source = (data.source || "").trim();
    
    // 4) Validace
    if (!name) {
      return { ok: false, error: "Jméno a příjmení je povinné" };
    }
    
    if (!email) {
      return { ok: false, error: "E-mail je povinný" };
    }
    
    if (!phone) {
      return { ok: false, error: "Telefon je povinný" };
    }
    
    if (!goal) {
      return { ok: false, error: "Cíl webu je povinný" };
    }
    
    if (!message) {
      return { ok: false, error: "Zpráva je povinná" };
    }
    
    // 5) Zápis do Google Sheets
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      return { ok: false, error: "Sheet not found" };
    }
    
    // Hlavička listu Leady: Datum | Jméno | Email | Telefon | Cíl webu | Zpráva | Zdroj
    sheet.appendRow([
      new Date(),
      name,
      email,
      phone,
      goal,
      message,
      source
    ]);
    
    // 6) Odeslání emailu
    const emailBody = 
      "Nový kontakt z formuláře:\n\n" +
      "Jméno: " + name + "\n" +
      "Email: " + email + "\n" +
      "Telefon: " + phone + "\n" +
      "Cíl webu: " + goal + "\n" +
      "Zpráva: " + message + "\n" +
      "Zdroj: " + source + "\n" +
      "Čas: " + new Date().toLocaleString("cs-CZ");
    
    GmailApp.sendEmail(NOTIFY_EMAIL_TO, "Nová registrace / lead z webu", emailBody);
    
    // 7) Úspěšná odpověď
    return { ok: true };
      
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}
