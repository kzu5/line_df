// スプレッドシートIDとシート名を設定
const SPREADSHEET_ID = 'ここに作成したスプレッドシートIDを貼り付けます';
const SHEET_NAME = 'シート1'; // データシートの名前

/**
 * Webアプリとして公開するためのメイン関数
 */
function doGet() {
  // Index.htmlを呼び出し、実行
  return HtmlService.createTemplateFromFile('Index')
      .evaluate()
      .setSandboxMode(HtmlService.SandboxMode.IFRAME)
      .setTitle('座席操作パネル');
}

/**
 * スプレッドシートから全座席データを取得する (クライアントから呼び出される)
 */
function getSeatData() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  // データ範囲（A2から最終行のF列まで）を取得
  const range = sheet.getRange(2, 1, sheet.getLastRow() - 1, 6); 
  const data = range.getValues();
  
  // 構造化されたデータとして返す
  return data.map(row => ({
    id: row[0],
    name: row[1],
    status: row[2],
    user: row[3],
    x: row[4], // E列
    y: row[5]  // F列
  }));
}

/**
 * 座席のステータスを更新する (クライアントから呼び出される)
 * @param {string} seatId - 更新する座席ID
 * @param {string} userName - 利用者名
 */
function updateSeatStatus(seatId, userName) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === seatId) { // 座席IDが一致したら
      const currentRow = i + 1;
      const currentStatus = data[i][2];
      
      let newStatus;
      let newUser;
      
      // ステータスのトグルロジック
      if (currentStatus === '空き') {
        newStatus = '使用中';
        newUser = userName;
      } else {
        newStatus = '空き';
        newUser = '-';
      }
      
      // スプレッドシートに書き込み
      sheet.getRange(currentRow, 3).setValue(newStatus); // C列 (ステータス)
      sheet.getRange(currentRow, 4).setValue(newUser); // D列 (利用者)
      
      return { status: newStatus, user: newUser };
    }
  }
  return { error: 'Seat not found' };
}
