const BOARD_SIZE = 10;
const TOTAL_MINES = 10;

let board = [];
let revealed = [];
let flagged = [];
let gameOver = false;
let mineCount = TOTAL_MINES;
let timer = 0;
let timerInterval;

// Инициализация игры
function initGame() {
    board = createBoard(BOARD_SIZE, TOTAL_MINES);
    revealed = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(false));
    flagged = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(false));
    gameOver = false;
    mineCount = TOTAL_MINES;
    timer = 0;
    clearInterval(timerInterval);
    updateUI();
    renderBoard();
}

// Создание поля с минами
function createBoard(size, mines) {
    const board = Array(size).fill().map(() => Array(size).fill(0));
    let minesPlaced = 0;

    while (minesPlaced < mines) {
        const x = Math.floor(Math.random() * size);
        const y = Math.floor(Math.random() * size);
        if (board[y][x] !== -1) {
            board[y][x] = -1; // -1 = мина
            minesPlaced++;
        }
    }

    // Заполняем числами (сколько мин вокруг)
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (board[y][x] !== -1) {
                let count = 0;
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        const nx = x + dx, ny = y + dy;
                        if (nx >= 0 && nx < size && ny >= 0 && ny < size && board[ny][nx] === -1) {
                            count++;
                        }
                    }
                }
                board[y][x] = count;
            }
        }
    }
    return board;
}

// Отрисовка поля
function renderBoard() {
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = '';
    boardElement.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 30px)`;

    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.x = x;
            cell.dataset.y = y;

            if (revealed[y][x]) {
                cell.classList.add('revealed');
                if (board[y][x] === -1) {
                    cell.textContent = '💣';
                    cell.classList.add('mine');
                } else if (board[y][x] > 0) {
                    cell.textContent = board[y][x];
                }
            } else if (flagged[y][x]) {
                cell.textContent = '🚩';
                cell.classList.add('flagged');
            }

            cell.addEventListener('click', () => handleCellClick(x, y));
            cell.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                handleRightClick(x, y);
            });

            boardElement.appendChild(cell);
        }
    }
}

// Клик по клетке
function handleCellClick(x, y) {
    if (gameOver || revealed[y][x] || flagged[y][x]) return;

    if (board[y][x] === -1) {
        // Игрок наступил на мину
        gameOver = true;
        revealAllMines();
        alert('Вы проиграли!');
    } else {
        revealCell(x, y);
        if (checkWin()) {
            gameOver = true;
            alert('Вы победили! 🎉');
        }
    }
    updateUI();
}

// Правый клик (флаг)
function handleRightClick(x, y) {
    if (gameOver || revealed[y][x]) return;

    flagged[y][x] = !flagged[y][x];
    mineCount += flagged[y][x] ? -1 : 1;
    updateUI();
    renderBoard();
}

// Открытие клетки (рекурсивное, если пустая)
function revealCell(x, y) {
    if (x < 0 || x >= BOARD_SIZE || y < 0 || y >= BOARD_SIZE || revealed[y][x] || flagged[y][x]) return;

    revealed[y][x] = true;

    if (board[y][x] === 0) {
        // Рекурсивно открываем соседей
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                revealCell(x + dx, y + dy);
            }
        }
    }
    renderBoard();
}

// Проверка победы
function checkWin() {
    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            if (board[y][x] !== -1 && !revealed[y][x]) {
                return false;
            }
        }
    }
    return true;
}

// Показать все мины при проигрыше
function revealAllMines() {
    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            if (board[y][x] === -1) {
                revealed[y][x] = true;
            }
        }
    }
    renderBoard();
}

// Обновление UI (счётчик мин, таймер)
function updateUI() {
    document.getElementById('mines-count').textContent = `💣: ${mineCount}`;
    if (!gameOver && timer === 0) {
        timerInterval = setInterval(() => {
            timer++;
            document.getElementById('timer').textContent = `⏱️: ${timer}`;
        }, 1000);
    }
}

// Кнопка сброса
document.getElementById('reset-btn').addEventListener('click', initGame);

// Запуск игры
initGame();