document.addEventListener('DOMContentLoaded', function() {
    
    // Проверка доступа
if (!localStorage.getItem('accessGranted')) {
    window.location.href = 'index.html';
    throw new Error('Доступ не предоставлен');
}// Элементы DOM
    const puzzleGrid = document.getElementById('puzzle-grid');
    const piecesContainer = document.getElementById('pieces-container');
    const secretSection = document.getElementById('secret-section');
    const secretPiece = document.getElementById('secret-piece');
    const counterElement = document.getElementById('counter');
    const modalOverlay = document.getElementById('modal-overlay');
    const completionModal = document.getElementById('completion-modal');
    const modalClose = document.getElementById('modal-close');
    const shuffleBtn = document.getElementById('shuffle-btn');
    const hintBtn = document.getElementById('hint-btn');
    const resetBtn = document.getElementById('reset-btn');
    const playAgainBtn = document.getElementById('play-again-btn');
    
    // Элементы аудиоплеера
    const backgroundMusic = document.getElementById('background-music');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const playPauseIcon = playPauseBtn.querySelector('i');
    const muteBtn = document.getElementById('mute-btn');
    const muteIcon = muteBtn.querySelector('i');
    const volumeSlider = document.getElementById('volume-slider');
    const volumeValue = document.getElementById('volume-value');
    const playerStatus = document.getElementById('player-status');
    
    // Переменные состояния
    let placedPieces = 0;
    let isSecretPieceActive = false;
    let draggedPiece = null;
    let pieceElements = [];
    
    // Пути к фото в папке img
    const imagePaths = {
        1: 'img/1.jpg',
        2: 'img/2.jpg',
        3: 'img/3.jpg',
        4: 'img/4.jpg',
        5: 'img/5.jpg',
        6: 'img/6.jpg',
        7: 'img/7.jpg',
        8: 'img/8.jpg',
        9: 'img/9.jpg'
    };
    
    // Координаты для частей пазла (9 частей, 3x3)
    const piecePositions = [
        {row: 0, col: 0, num: 1},
        {row: 0, col: 1, num: 2},
        {row: 0, col: 2, num: 3},
        {row: 1, col: 0, num: 4},
        {row: 1, col: 1, num: 5},
        {row: 1, col: 2, num: 6},
        {row: 2, col: 0, num: 7},
        {row: 2, col: 1, num: 8},
        {row: 2, col: 2, num: 9}
    ];
    
    // Инициализация игры
    function initGame() {
        initPuzzle();
        initAudioPlayer();
    }
    
    // Инициализация пазла
    function initPuzzle() {
        puzzleGrid.innerHTML = '';
        piecesContainer.innerHTML = '';
        pieceElements = [];
        
        placedPieces = 0;
        isSecretPieceActive = false;
        counterElement.textContent = '0';
        secretSection.classList.remove('active');
        completionModal.classList.remove('active');
        modalOverlay.classList.remove('active');
        
        createPuzzleGrid();
        
        const availablePieces = [1, 2, 4, 5, 6, 7, 8, 9];
        shuffleArray(availablePieces);
        
        for (let i = 0; i < availablePieces.length; i++) {
            const pieceNum = availablePieces[i];
            const piece = createPieceElement(pieceNum);
            pieceElements.push(piece);
            piecesContainer.appendChild(piece);
        }
        
        setupSecretPiece();
    }
    
    // Создание сетки пазла
    function createPuzzleGrid() {
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.className = 'puzzle-cell';
            
            const pieceData = piecePositions[i];
            cell.dataset.row = pieceData.row;
            cell.dataset.col = pieceData.col;
            cell.dataset.piece = pieceData.num;
            
            cell.addEventListener('dragover', handleDragOver);
            cell.addEventListener('dragenter', handleDragEnter);
            cell.addEventListener('dragleave', handleDragLeave);
            cell.addEventListener('drop', handleDrop);
            
            puzzleGrid.appendChild(cell);
        }
    }
    
    // Создание элемента части пазла
    function createPieceElement(pieceNum) {
        const piece = document.createElement('div');
        piece.className = 'piece';
        piece.dataset.piece = pieceNum;
        piece.draggable = true;
        
        const img = document.createElement('img');
        img.src = imagePaths[pieceNum];
        img.alt = `Часть пазла ${pieceNum}`;
        img.draggable = false;
        img.loading = 'lazy';
        piece.appendChild(img);
        
        const numberElement = document.createElement('div');
        numberElement.className = 'piece-number';
        numberElement.textContent = pieceNum;
        piece.appendChild(numberElement);
        
        piece.addEventListener('dragstart', handleDragStart);
        piece.addEventListener('dragend', handleDragEnd);
        
        return piece;
    }
    
    // Настройка секретной части
    function setupSecretPiece() {
        secretPiece.innerHTML = '';
        
        const img = document.createElement('img');
        img.src = imagePaths[3];
        img.alt = 'Секретная часть пазла ';
        img.draggable = false;
        secretPiece.appendChild(img);
        
        const numberElement = document.createElement('div');
        numberElement.className = 'piece-number';
        numberElement.textContent = '3';
        secretPiece.appendChild(numberElement);
        
        const labelElement = document.createElement('div');
        labelElement.className = 'piece-label';
        labelElement.textContent = 'Секретная часть';
        secretPiece.appendChild(labelElement);
        
        secretPiece.draggable = true;
        secretPiece.addEventListener('dragstart', handleDragStart);
        secretPiece.addEventListener('dragend', handleDragEnd);
    }
    
    // Инициализация аудиоплеера
    function initAudioPlayer() {
        // Устанавливаем начальную громкость
        backgroundMusic.volume = volumeSlider.value / 100;
        volumeValue.textContent = `${volumeSlider.value}%`;
        
        // Попытка автоматического воспроизведения
        setTimeout(() => {
            const playPromise = backgroundMusic.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    updatePlayButton(true);
                }).catch(error => {
                    console.log("Автовоспроизведение заблокировано, требуется взаимодействие пользователя");
                    updatePlayButton(false);
                });
            }
        }, 1000);
        
        // Обработчики событий для аудиоплеера
        playPauseBtn.addEventListener('click', togglePlayPause);
        muteBtn.addEventListener('click', toggleMute);
        volumeSlider.addEventListener('input', updateVolume);
        
        // Обновление статуса при изменении состояния аудио
        backgroundMusic.addEventListener('play', () => updatePlayButton(true));
        backgroundMusic.addEventListener('pause', () => updatePlayButton(false));
        backgroundMusic.addEventListener('volumechange', updateMuteButton);
        
        // Сохранение громкости в localStorage
        const savedVolume = localStorage.getItem('puzzleVolume');
        if (savedVolume !== null) {
            volumeSlider.value = savedVolume;
            backgroundMusic.volume = savedVolume / 100;
            volumeValue.textContent = `${savedVolume}%`;
        }
    }
    
    // Управление воспроизведением
    function togglePlayPause() {
        if (backgroundMusic.paused) {
            backgroundMusic.play();
        } else {
            backgroundMusic.pause();
        }
    }
    
    function updatePlayButton(isPlaying) {
        if (isPlaying) {
            playPauseIcon.className = 'fas fa-pause';
            playerStatus.textContent = 'Играет';
            playPauseBtn.setAttribute('title', 'Пауза');
        } else {
            playPauseIcon.className = 'fas fa-play';
            playerStatus.textContent = 'Пауза';
            playPauseBtn.setAttribute('title', 'Воспроизвести');
        }
    }
    
    // Управление громкостью
    function updateVolume() {
        const volume = volumeSlider.value;
        backgroundMusic.volume = volume / 100;
        volumeValue.textContent = `${volume}%`;
        
        // Сохраняем громкость
        localStorage.setItem('puzzleVolume', volume);
        
        // Обновляем иконку mute если громкость 0
        updateMuteButton();
    }
    
    function toggleMute() {
        if (backgroundMusic.muted) {
            backgroundMusic.muted = false;
            muteIcon.className = 'fas fa-volume-up';
            muteBtn.setAttribute('title', 'Выключить звук');
        } else {
            backgroundMusic.muted = true;
            muteIcon.className = 'fas fa-volume-mute';
            muteBtn.setAttribute('title', 'Включить звук');
        }
    }
    
    function updateMuteButton() {
        if (backgroundMusic.muted || backgroundMusic.volume === 0) {
            muteIcon.className = 'fas fa-volume-mute';
            muteBtn.setAttribute('title', 'Включить звук');
        } else {
            muteIcon.className = 'fas fa-volume-up';
            muteBtn.setAttribute('title', 'Выключить звук');
        }
    }
    
    // Вспомогательные функции
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    // Обработчики событий перетаскивания
    function handleDragStart(e) {
        draggedPiece = this;
        this.classList.add('dragging');
        e.dataTransfer.setData('text/plain', this.dataset.piece);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setDragImage(this, 50, 50);
    }
    
    function handleDragEnd() {
        this.classList.remove('dragging');
        draggedPiece = null;
        document.querySelectorAll('.puzzle-cell').forEach(cell => {
            cell.classList.remove('hover');
        });
    }
    
    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }
    
    function handleDragEnter(e) {
        e.preventDefault();
        this.classList.add('hover');
    }
    
    function handleDragLeave() {
        this.classList.remove('hover');
    }
    
    function handleDrop(e) {
        e.preventDefault();
        this.classList.remove('hover');
        
        if (!draggedPiece) return;
        
        const pieceNumber = parseInt(draggedPiece.dataset.piece);
        const targetCell = this;
        
        if (parseInt(targetCell.dataset.piece) === pieceNumber) {
            placePieceInSlot(draggedPiece, targetCell);
        } else {
            showMessage(`Не туда науй (№${pieceNumber}) не подходит ебана.`, 'warning');
        }
    }
    
    // Помещение части в ячейку
    function placePieceInSlot(piece, cell) {
        if (piece === secretPiece && !isSecretPieceActive) {
            showMessage('Собирай уебок', 'warning');
            return;
        }
        
        const pieceClone = piece.cloneNode(true);
        pieceClone.classList.remove('piece', 'dragging', 'secret-piece');
        
        const pieceContainer = document.createElement('div');
        pieceContainer.className = 'puzzle-piece';
        pieceContainer.appendChild(pieceClone);
        
        cell.innerHTML = '';
        cell.appendChild(pieceContainer);
        cell.classList.add('correct');
        
        if (piece !== secretPiece) {
            piece.classList.add('locked');
            piece.draggable = false;
            
            placedPieces++;
            counterElement.textContent = placedPieces;
            
            if (placedPieces === 8) {
                activateSecretPiece();
            }
            
            showMessage(` Да ну науй часть ${piece.dataset.piece} размещена правильно`, 'success');
        } else {
            setTimeout(() => {
                completePuzzleGame();
            }, 500);
        }
    }
    
    // Активация секретной части
    function activateSecretPiece() {
        isSecretPieceActive = true;
        secretSection.classList.add('active');
        
        setTimeout(() => {
            showMessage('Ты собрал ура теперь лась часть.', 'success');
            secretSection.scrollIntoView({ behavior: 'smooth' });
        }, 300);
    }
    
    // Завершение игры
    function completePuzzleGame() {
        modalOverlay.classList.add('active');
        completionModal.classList.add('active');
        showMessage('Пошел нахуй', 'success');
        
        // Воспроизводим звук победы если есть
        try {
            const winSound = new Audio('music/win.mp3');
            winSound.volume = backgroundMusic.volume;
            winSound.play();
        } catch (e) {
            console.log("ФА");
        }
    }
    
    // Показать сообщение
    function showMessage(text, type) {
        const messageEl = document.createElement('div');
        messageEl.className = `message message-${type}`;
        messageEl.textContent = text;
        
        messageEl.style.position = 'fixed';
        messageEl.style.top = '80px';
        messageEl.style.right = '20px';
        messageEl.style.padding = '12px 20px';
        messageEl.style.borderRadius = '8px';
        messageEl.style.zIndex = '10000';
        messageEl.style.fontWeight = '600';
        messageEl.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.5)';
        messageEl.style.maxWidth = '300px';
        
        if (type === 'success') {
            messageEl.style.backgroundColor = '#00b894';
            messageEl.style.color = 'white';
            messageEl.style.borderLeft = '5px solid #00a085';
        } else if (type === 'warning') {
            messageEl.style.backgroundColor = '#fdcb6e';
            messageEl.style.color = '#333';
            messageEl.style.borderLeft = '5px solid #f9c855';
        }
        
        document.body.appendChild(messageEl);
        
        setTimeout(() => {
            messageEl.style.opacity = '0';
            messageEl.style.transition = 'opacity 0.5s';
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
            }, 500);
        }, 3000);
    }
    
    // Перемешать части
    shuffleBtn.addEventListener('click', function() {
        const unlockedPieces = Array.from(piecesContainer.querySelectorAll('.piece:not(.locked)'));
        const pieceNumbers = unlockedPieces.map(p => parseInt(p.dataset.piece));
        
        if (pieceNumbers.length > 1) {
            shuffleArray(pieceNumbers);
            
            unlockedPieces.forEach((piece, index) => {
                piecesContainer.appendChild(piece);
            });
            
            showMessage('Части перемешаны!', 'success');
        } else {
            showMessage('Не осталось частей для перемешивания', 'warning');
        }
    });
    
    // Подсказка
   let currentHint = null;

hintBtn.addEventListener('click', function() {
    // Удаляем предыдущую подсказку
    if (currentHint) {
        currentHint.remove();
    }
    
    // Все подсказки в одном массиве
    const allHints = [
        'ВАТАФА.',
        'ЕБАНАТ ДА?',
        'КУДА ТЫ ТЫЧЕШЬ',
        'ШНЕЙНЕ',
        'СУКА ВРЕМЯ ДЕНЬГИ.',
        'А ЧЕ БЫ И НЕТ @shikkoraee',
        'ФААА',
        `БЫСТРЕЕ НАХУЙ ${placedPieces} ИЗ 8 ЧАСТЕЙ.`,
        `ФАСТОМ  ${placedPieces}/8`,
        `НАСКОЛЬКО Я ПИДР ${placedPieces} ИЗ 10`
    ];
    
    // Случайная подсказка из общего списка
    const randomIndex = Math.floor(Math.random() * allHints.length);
    const hintText = allHints[randomIndex];
    
    // Создаем новое сообщение
    currentHint = document.createElement('div');
    currentHint.textContent = hintText;
    currentHint.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 10000;
        background: #fdcb6e;
        color: #333;
        font-weight: 600;
        box-shadow: 0 5px 15px rgba(0,0,0,0.5);
        border-left: 5px solid #f9c855;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    document.body.appendChild(currentHint);
    
    // Автоудаление через 6 секунды
    setTimeout(() => {
        if (currentHint && currentHint.parentNode) {
            currentHint.remove();
            currentHint = null;
        }
    }, 6000);
});
    
    // Закрытие модального окна
    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);
    
    function closeModal() {
        modalOverlay.classList.remove('active');
        completionModal.classList.remove('active');
    }
    
    // Сброс игры
    resetBtn.addEventListener('click', initPuzzle);
    
    // Играть снова
    playAgainBtn.addEventListener('click', function() {
        closeModal();
        initPuzzle();
    });
    
    // Инициализируем игру при загрузке
    initGame();
});