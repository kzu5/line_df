// ⚠️ YOUR_PLEASANTER_URLとAPIキーを置き換えてください
const pleasanterUrl = 'YOUR_PLEASANTER_URL';
const pleasanterApiKey = 'YOUR_PLEASANTER_API_KEY';

// 学習室のデータを定義します
const roomsData = [
  { id: '1', name: '学習室1', capacity: 10 },
  { id: '2', name: '学習室2', capacity: 15 },
  { id: '3', name: '学習室3', capacity: 20 },
  { id: '4', name: '学習室4', capacity: 12 },
];

async function fetchRoomStatus() {
  try {
    const roomsContainer = document.getElementById('rooms-container');
    roomsContainer.innerHTML = ''; // 既存のカードをクリア

    for (const room of roomsData) {
      // PleasanterのAPIを呼び出して在室人数を取得する
      const response = await fetch(`${pleasanterUrl}/api/v1/items/${room.id}`, {
        headers: {
          'Authorization': `Bearer ${pleasanterApiKey}`
        }
      });
      const data = await response.json();
      
      const occupants = data.records.length; // 在室人数
      const remainingSeats = room.capacity - occupants;
      const progress = (occupants / room.capacity) * 100;

      let statusClass;
      let statusIcon;
      if (remainingSeats <= 0) {
        statusClass = 'full';
        statusIcon = '🔴';
      } else if (remainingSeats <= room.capacity * 0.2) {
        statusClass = 'high';
        statusIcon = '🟠';
      } else if (remainingSeats <= room.capacity * 0.5) {
        statusClass = 'medium';
        statusIcon = '🟡';
      } else {
        statusClass = 'low';
        statusIcon = '🟢';
      }
      
      // HTMLカードを生成して挿入
      const roomCardHtml = `
        <div class="room-card">
          <h2>${room.name}</h2>
          <div class="status-icon ${statusClass}">${statusIcon}</div>
          <p class="remaining-seats ${statusClass}">${remainingSeats}<span>席</span></p>
          <div class="progress-bar-container">
            <div class="progress-bar ${statusClass}" style="width: ${progress}%;"></div>
          </div>
          <p class="status-text">${statusClass.toUpperCase()}</p>
        </div>
      `;
      roomsContainer.innerHTML += roomCardHtml;
    }

    // 最終更新時間を表示
    const now = new Date();
    document.getElementById('last-updated-time').textContent = now.toLocaleTimeString('ja-JP');

  } catch (error) {
    console.error('データの取得に失敗しました:', error);
    document.getElementById('last-updated-time').textContent = 'エラー';
  }
}

fetchRoomStatus();
setInterval(fetchRoomStatus, 60000); // 60秒ごとに更新

// ... (既存のコード) ...

async function fetchRoomStatus() {
    // ... (Pleasanterから在室人数と総席数を取得するロジック) ...

    // 例: Pleasanterから取得したデータに図書館 (room_id: 'D') の情報が含まれているか確認
    const libraryData = roomData.find(room => room.room_id === 'D');
    const roomDCard = document.getElementById('roomD-card');

    if (libraryData && libraryData.current_occupants > 0) { // 図書館に誰かいる場合
        roomDCard.classList.remove('hidden'); // 表示する
        // ... (図書館の在室人数や総席数を更新するロロジック) ...
    } else {
        roomDCard.classList.add('hidden'); // 非表示にする
    }

    // ... (他の学習室の更新ロジック) ...

    document.getElementById('last-updated-time').textContent = new Date().toLocaleString();
}

fetchRoomStatus();
setInterval(fetchRoomStatus, 60000); // 1分ごとに更新

// 各施設の定休日情報 (JavaScriptのDateオブジェクトでの曜日: 0=日, 1=月, ..., 6=土)
// 'D': 不定期開放のため、基本的には定休日判定を適用しないが、一応形式的に定義。
const HOLIDAYS = {
    'A': { dayOfWeek: 1, label: '月曜日' },       // 生涯学習センター: 月曜日 (1)
    'B': { monthly: 3, dayOfWeek: 3, label: '第3水曜日' }, // 創造館: 第3水曜日
    'C': { monthly: -1, label: '年末年始' },      // アルラ: 年末年始 (特殊対応が必要なため仮に定義)
    'D': { dayOfWeek: -1, label: '不定期' }      // 図書館: 不定期
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
    const dayOfMonth = date.getDate();

    // 1. 毎週の定休日判定
    if (holidayInfo.dayOfWeek !== undefined && holidayInfo.dayOfWeek >= 0 && day === holidayInfo.dayOfWeek) {
        return true;
    }

    // 2. 第N曜日の定休日判定 (創造館 'B' の第3水曜日のようなケース)
    if (holidayInfo.monthly && holidayInfo.monthly > 0 && holidayInfo.dayOfWeek !== undefined && holidayInfo.dayOfWeek >= 0) {
        // 月初から数えて何番目の曜日か
        const weekOfMonth = Math.floor((dayOfMonth - 1) / 7) + 1;
        if (day === holidayInfo.dayOfWeek && weekOfMonth === holidayInfo.monthly) {
            return true;
        }
    }

    // 3. 年末年始などの特殊な定休日 (ここでは省略、必要であれば日付範囲判定ロジックを追加)

    return false;
}

// 既存の fetchRoomStatus 関数を修正
async function fetchRoomStatus() {
    // ... (既存のPleasanterからのデータ取得ロジックなど) ...

    const now = new Date();
    const rooms = ['A', 'B', 'C', 'D'];

    rooms.forEach(id => {
        const card = document.getElementById(`room${id}-card`);
        const overlay = document.getElementById(`room${id}-closed-overlay`);

        if (isHoliday(id, now)) {
            // 定休日として表示
            card.classList.add('closed');
            if (overlay) overlay.style.display = 'block';

            // 在室人数などを -- に上書きしても良い
            document.getElementById(`room${id}-remaining`).innerHTML = '--<span>席</span>';
            document.getElementById(`room${id}-status-text`).textContent = `定休日: ${HOLIDAYS[id].label}`;
            
            // プログレスバーもリセット
            const progressBar = document.getElementById(`room${id}-progress`);
            progressBar.style.width = '0%';
            progressBar.className = 'progress-bar';

        } else {
            // 定休日ではない場合
            card.classList.remove('closed');
            if (overlay) overlay.style.display = 'none';

            // **ここに既存の在室人数更新ロジックを配置**
            // ... roomData からデータを取得し、カード内容を更新 ...

            // 例: Pleasanterから取得したroomDataに基づき在室状況を更新するロジック
            // const roomDatum = roomData.find(r => r.room_id === id);
            // if (roomDatum) {
            //    updateRoomDisplay(id, roomDatum.current_occupants, roomDatum.total_capacity); 
            // }

            // (図書館の表示・非表示ロジックもここに含まれる)
            // if (id === 'D') {
            //     const libraryData = roomData.find(room => room.room_id === 'D');
            //     if (libraryData && libraryData.current_occupants > 0) {
            //         card.classList.remove('hidden');
            //     } else {
            //         card.classList.add('hidden');
            //     }
            // }

        }

    });

    // ... (既存の最終更新時刻の更新ロジック) ...
    document.getElementById('last-updated-time').textContent = new Date().toLocaleString();
}

fetchRoomStatus();
setInterval(fetchRoomStatus, 60000); // 1分ごとに更新
