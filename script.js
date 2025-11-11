document.addEventListener('DOMContentLoaded', () => {
    // すべての座席要素を取得
    const seats = document.querySelectorAll('.seat');

    // IDから日本語の座席番号を抽出する関数
    const getSeatName = (id) => id.replace('seat-', '座席');

    seats.forEach(seat => {
        // 初期表示のテキストを設定
        const updateText = () => {
            const seatName = getSeatName(seat.id);
            if (seat.classList.contains('available')) {
                seat.textContent = `${seatName} (空きあり)`;
            } else {
                seat.textContent = `${seatName} (使用中)`;
            }
        };

        // 初期表示を適用
        updateText();

        // 各座席にクリックイベントリスナーを設定
        seat.addEventListener('click', () => {
            // クラスをトグル（切り替え）する
            const isAvailable = seat.classList.toggle('available');
            seat.classList.toggle('occupied', !isAvailable);

            // テキストを更新
            updateText();
        });
    });
});
