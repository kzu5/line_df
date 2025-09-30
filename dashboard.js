// 各施設の定休日情報 (JavaScriptのDateオブジェクトでの曜日: 0=日, 1=月, ..., 6=土)
const HOLIDAYS = {
    'A': { dayOfWeek: 1, label: '月曜日' },       // 生涯学習センター: 月曜日 (1)
    // 創造館のテスト用: 仮に火曜日を定休日として設定し、第3週の判定を省略します
    'B': { dayOfWeek: 2, label: '火曜日' },       // 創造館: (テスト用に火曜日に変更)
    'C': { dayOfWeek: -1, label: '年末年始' },    // アルラ: 特殊対応のため -1
    'D': { dayOfWeek: -1, label: '不定期' }      // 図書館: 不定期
};

// 施設の詳細情報（総席数） - 実際はPleasanterから取得しますが、ここでは固定値
const ROOM_CAPACITIES = {
    'A': 50,
    'B': 35,
    'C': 80,
    'D': 20 
};

/**
 * 特定の日付が施設の定休日に当たるか判定する
 * @param {string} roomId - 施設のID ('A', 'B', 'C', 'D')
 * @param {Date} date - 判定する日付オブジェクト
 * @returns {boolean} - 定休日であれば true
 */
function isHoliday(roomId, date) {
    const holidayInfo = HOLIDAYS[roomId];
    if (!holidayInfo) return false;

    const day = date.getDay(); // 0:日, 1:月, ..., 6:土
    // const dayOfMonth = date.getDate(); // 第N曜日判定が必要な場合

    // 毎週の定休日判定
    if (holidayInfo.dayOfWeek !== undefined && holidayInfo.dayOfWeek >= 0 && day === holidayInfo.dayOfWeek) {
        return true;
    }

    // (必要であれば、第N曜日の判定ロジックや年末年始の判定ロジックをここに追加)

    return false;
}

/**
 * 在室人数と総席数に基づいて表示を更新する関数
 */
function updateRoomDisplay(id, occupants, capacity) {
    const iconEl = document.getElementById(`room${id}-icon`);
    const remainingEl = document.getElementById(`room${id}-remaining`);
    const progressEl = document.getElementById(`room${id}-progress`);
    const statusTextEl = document.getElementById(`room${id}-status-text`);
    const totalCapacityEl = document.getElementById(`room${id}-total-capacity`);

    const remaining = capacity - occupants;
    const occupancyRate = (occupants / capacity) * 100;

    let statusClass;
    let icon;
    let statusText;

    if (occupancyRate < 20) {
        statusClass = 'empty';
        icon = '🟢';
        statusText = '空席あり';
    } else if (occupancyRate < 50) {
        statusClass = 'low';
        icon = '🟡';
        statusText = '利用可能';
    } else if (occupancyRate < 80) {
        statusClass = 'medium';
        icon = '🟠';
        statusText = '混雑中';
    } else if (occupancyRate < 100) {
        statusClass = 'high';
        icon = '🔴';
        statusText = '満席に近い';
    } else {
        statusClass = 'full';
        icon = '🔴';
        statusText = '満席';
    }

    // CSSクラスとテキストの更新
    remainingEl.className = `remaining-seats ${statusClass}`;
    remainingEl.innerHTML = `${remaining}<span>席</span>`;
    iconEl.className = `status-icon ${statusClass}`;
    iconEl.textContent = icon;
    statusTextEl.textContent = statusText;
    
    // 総席数の更新
    totalCapacityEl.textContent = capacity;

    // プログレスバーの更新
    progressEl.className = `progress-bar ${statusClass}`;
    progressEl.style.width = `${occupancyRate}%`;
}


/**
 * Pleasanterからデータを取得し、ダッシュボードを更新するメイン関数
 */
async function fetchRoomStatus() {
    // 💡 実際にはここにPleasanterからのデータ取得ロジックが入ります。
    // 💡 テスト用として、ダミーデータを使用します。
    // 💡 A: 混雑中 (70%), B: 空席あり (10%), C: 満席 (100%), D: 非表示
    const roomData = [
        { room_id: 'A', current_occupants: 35, total_capacity: ROOM_CAPACITIES['A'] },
        { room_id: 'B', current_occupants: 3, total_capacity: ROOM_CAPACITIES['B'] },
        { room_id: 'C', current_occupants: 80, total_capacity: ROOM_CAPACITIES['C'] },
        // 図書館(D)は、このデータに含まれていない（非公開）と仮定
        // { room_id: 'D', current_occupants: 10, total_capacity: ROOM_CAPACITIES['D'] },
    ];


    // 現在時刻を取得
    const now = new Date();
    // 例: 特定の日付をテストしたい場合は以下を使用 (例: 月曜日=1, 火曜日=2, 水曜日=3)
    // const now = new Date('2025-09-30'); // 月曜日をシミュレーション
    // const now = new Date('2025-10-01'); // 火曜日をシミュレーション


    const rooms = ['A', 'B', 'C', 'D'];

    rooms.forEach(id => {
        const card = document.getElementById(`room${id}-card`);
        const overlay = document.getElementById(`room${id}-closed-overlay`);
        const roomDatum = roomData.find(r => r.room_id === id);

        // 1. 定休日の判定
        if (isHoliday(id, now)) {
            // 定休日として表示
            card.classList.add('closed');
            if (overlay) overlay.style.display = 'block';

            // 表示内容を休館日仕様に上書き
            document.getElementById(`room${id}-remaining`).innerHTML = '--<span>席</span>';
            document.getElementById(`room${id}-status-text`).textContent = `定休日: ${HOLIDAYS[id].label}`;
            document.getElementById(`room${id}-total-capacity`).textContent = ROOM_CAPACITIES[id] || '--';
            document.getElementById(`room${id}-icon`).textContent = '❌'; 
            
            const progressBar = document.getElementById(`room${id}-progress`);
            progressBar.style.width = '0%';
            progressBar.className = 'progress-bar';

            // 定休日のため、以降の在室情報更新はスキップ
            return;
        } 
        
        // 定休日ではない場合、closedクラスとオーバーレイを解除
        card.classList.remove('closed');
        if (overlay) overlay.style.display = 'none';

        // 2. 図書館 (D) の表示・非表示判定
        if (id === 'D') {
            if (roomDatum && roomDatum.current_occupants > 0) {
                card.classList.remove('hidden'); // 在室者がいれば表示
                updateRoomDisplay(id, roomDatum.current_occupants, roomDatum.total_capacity);
            } else {
                card.classList.add('hidden'); // 在室者がいなければ非表示
            }
            // 図書館はここで処理完了
            return; 
        }

        // 3. その他学習室 (A, B, C) の在室状況更新
        if (roomDatum) {
            updateRoomDisplay(id, roomDatum.current_occupants, roomDatum.total_capacity);
        } else {
            // データが取得できなかった場合の初期表示を維持
        }
    });

    // 最終更新時刻の更新
    document.getElementById('last-updated-time').textContent = new Date().toLocaleString();
}


// 初回実行と1分ごとの更新
fetchRoomStatus();
setInterval(fetchRoomStatus, 60000); // 1分ごとに更新
