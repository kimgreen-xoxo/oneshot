import { google } from 'googleapis'

const SPREADSHEET_ID = '17yfHR8iLkR7WZ-kUDnsNiUOGduWkEiIG-U3PS-a1Ztg'

function getAuth() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON)
  return new google.auth.GoogleAuth({
    credentials,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive',
    ],
  })
}

export async function appendToSheet(sheetName, values) {
  const auth = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A1`,
    valueInputOption: 'RAW',
    requestBody: { values: [values] },
  })
}

export async function getSheetData(sheetName) {
  const auth = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A:Z`,
  })
  return res.data.values || []
}