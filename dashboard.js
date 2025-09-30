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
