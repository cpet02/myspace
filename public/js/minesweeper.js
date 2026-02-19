// Minesweeper Game Logic
class MinesweeperGame {
    constructor() {
        // Beginner difficulty: 9x9 grid with 10 mines
        this.rows = 9;
        this.cols = 9;
        this.mines = 10;
        
        this.board = [];
        this.gameOver = false;
        this.gameWon = false;
        this.firstClick = true;
        this.flagsPlaced = 0;
        this.tilesRevealed = 0;
        this.startTime = null;
        this.timerInterval = null;
        this.elapsedTime = 0;
        
        // DOM elements
        this.gameBoard = document.getElementById('game-board');
        this.minesCount = document.getElementById('mines-count');
        this.flagsCount = document.getElementById('flags-count');
        this.gameTimer = document.getElementById('game-timer');
        this.newGameBtn = document.getElementById('new-game-btn');
        
        console.log('MinesweeperGame constructor called');
        this.init();
    }
    
    init() {
        console.log('Initializing Minesweeper game');
        console.log('Game board element:', this.gameBoard);
        this.updateDisplay();
        this.createBoard();
        this.setupEventListeners();
        // Don't start timer until first click
        this.updateTimer();
        console.log('Game initialized successfully');
    }
    
    createBoard() {
        console.log('Creating game board...');
        // Clear existing board
        this.gameBoard.innerHTML = '';
        this.gameBoard.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;
        
        // Initialize board array
        this.board = [];
        for (let row = 0; row < this.rows; row++) {
            this.board[row] = [];
            for (let col = 0; col < this.cols; col++) {
                this.board[row][col] = {
                    isMine: false,
                    isRevealed: false,
                    isFlagged: false,
                    adjacentMines: 0,
                    element: null
                };
            }
        }
        
        // Create tile elements
        let tileCount = 0;
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const tile = document.createElement('div');
                tile.className = 'minesweeper-tile';
                tile.dataset.row = row;
                tile.dataset.col = col;
                
                // Add basic inline styles to ensure tiles are visible
                tile.style.width = '32px';
                tile.style.height = '32px';
                tile.style.display = 'flex';
                tile.style.alignItems = 'center';
                tile.style.justifyContent = 'center';
                tile.style.backgroundColor = '#c0c0c0';
                tile.style.border = '2px outset #808080';
                tile.style.fontFamily = 'Courier New, monospace';
                tile.style.fontWeight = 'bold';
                tile.style.fontSize = '14px';
                tile.style.cursor = 'pointer';
                tile.style.userSelect = 'none';
                tile.style.setProperty('color', '#000000', 'important'); // Default text color
                
                // Add event listeners
                tile.addEventListener('click', (e) => this.handleLeftClick(e, row, col));
                tile.addEventListener('contextmenu', (e) => this.handleRightClick(e, row, col));
                tile.addEventListener('mousedown', (e) => this.handleMouseDown(e, row, col));
                tile.addEventListener('mouseup', (e) => this.handleMouseUp(e, row, col));
                tile.addEventListener('mouseleave', () => this.handleMouseLeave(row, col));
                
                this.board[row][col].element = tile;
                this.gameBoard.appendChild(tile);
                tileCount++;
            }
        }
        console.log(`Created ${tileCount} tiles on the board`);
    }
    
    placeMines(firstRow, firstCol) {
        let minesPlaced = 0;
        
        // Don't place mines in the first clicked cell or its neighbors
        const safeCells = this.getNeighbors(firstRow, firstCol);
        safeCells.push({row: firstRow, col: firstCol});
        
        while (minesPlaced < this.mines) {
            const row = Math.floor(Math.random() * this.rows);
            const col = Math.floor(Math.random() * this.cols);
            
            // Check if this cell is safe for first click
            const isSafeCell = safeCells.some(cell => cell.row === row && cell.col === col);
            if (!isSafeCell && !this.board[row][col].isMine) {
                this.board[row][col].isMine = true;
                minesPlaced++;
                
                // Update adjacent mine counts for neighbors
                this.getNeighbors(row, col).forEach(neighbor => {
                    this.board[neighbor.row][neighbor.col].adjacentMines++;
                });
            }
        }
    }
    
    getNeighbors(row, col) {
        const neighbors = [];
        for (let r = Math.max(0, row - 1); r <= Math.min(this.rows - 1, row + 1); r++) {
            for (let c = Math.max(0, col - 1); c <= Math.min(this.cols - 1, col + 1); c++) {
                if (r !== row || c !== col) {
                    neighbors.push({row: r, col: c});
                }
            }
        }
        return neighbors;
    }
    
    handleLeftClick(e, row, col) {
        if (this.gameOver || this.gameWon) return;
        
        const tile = this.board[row][col];
        
        // If tile is already revealed, don't handle left click here
        // (chording will handle it separately)
        if (tile.isRevealed) {
            return;
        }
        
        if (tile.isFlagged) return;
        
        // First click - place mines (avoiding this cell and neighbors)
        if (this.firstClick) {
            this.placeMines(row, col);
            this.firstClick = false;
            // Start timer on first click
            this.startTimer();
        }
        
        if (tile.isMine) {
            this.revealMine(row, col);
            this.gameOver = true;
            this.endGame(false);
            return;
        }
        
        this.revealTile(row, col);
        
        // Check for win condition
        this.checkWinCondition();
    }
    
    handleRightClick(e, row, col) {
        e.preventDefault();
        if (this.gameOver || this.gameWon) return;
        
        const tile = this.board[row][col];
        if (tile.isRevealed) return;
        
        if (!tile.isFlagged) {
            // Place flag
            tile.isFlagged = true;
            this.flagsPlaced++;
            tile.element.classList.add('flagged');
            tile.element.textContent = '🚩';
        } else {
            // Remove flag
            tile.isFlagged = false;
            this.flagsPlaced--;
            tile.element.classList.remove('flagged');
            tile.element.textContent = '';
        }
        
        this.updateDisplay();
    }
    
    handleMouseDown(e, row, col) {
        if (this.gameOver || this.gameWon) return;
        
        const tile = this.board[row][col];
        if (tile.isRevealed && tile.adjacentMines > 0 && e.button === 0) {
            // Prepare for chording (left click on revealed number)
            tile.element.style.backgroundColor = '#b0b0b0';
            tile.element.style.border = '1px solid #808080';
        }
    }
    
    handleMouseUp(e, row, col) {
        if (this.gameOver || this.gameWon) return;
        
        const tile = this.board[row][col];
        if (tile.isRevealed && tile.adjacentMines > 0) {
            // Reset tile appearance
            tile.element.style.backgroundColor = '';
            tile.element.style.border = '';
            
            // Handle chording (left+right click or middle click)
            if (e.button === 0 || e.button === 1 || e.button === 2) {
                this.handleChording(row, col);
            }
        }
    }
    
    handleMouseLeave(row, col) {
        const tile = this.board[row][col];
        if (tile.isRevealed && tile.adjacentMines > 0) {
            // Reset tile appearance when mouse leaves
            tile.element.style.backgroundColor = '';
            tile.element.style.border = '';
        }
    }
    
    handleChording(row, col) {
        console.log('Chording on tile', row, col);
        const tile = this.board[row][col];
        if (!tile.isRevealed || tile.adjacentMines === 0) return;
        
        const neighbors = this.getNeighbors(row, col);
        const flaggedNeighbors = neighbors.filter(n => this.board[n.row][n.col].isFlagged);
        
        console.log('Adjacent mines:', tile.adjacentMines, 'Flagged neighbors:', flaggedNeighbors.length);
        
        // Check if correct number of flags are placed
        if (flaggedNeighbors.length === tile.adjacentMines) {
            console.log('Correct number of flags, revealing unflagged neighbors');
            // Reveal all unflagged neighbors
            neighbors.forEach(neighbor => {
                const neighborTile = this.board[neighbor.row][neighbor.col];
                if (!neighborTile.isFlagged && !neighborTile.isRevealed) {
                    console.log('Revealing neighbor:', neighbor.row, neighbor.col);
                    if (neighborTile.isMine) {
                        console.log('Neighbor is a mine! Game over');
                        this.revealMine(neighbor.row, neighbor.col);
                        this.gameOver = true;
                        this.endGame(false);
                    } else {
                        this.revealTile(neighbor.row, neighbor.col);
                    }
                }
            });
            
            // Check win condition after chording
            this.checkWinCondition();
        } else {
            console.log('Incorrect number of flags for chording');
        }
    }
    
    revealTile(row, col) {
        const tile = this.board[row][col];
        
        // If tile is already revealed or flagged, don't process it again
        if (tile.isRevealed || tile.isFlagged) return;
        
        tile.isRevealed = true;
        tile.element.classList.add('revealed');
        this.tilesRevealed++;
        
        // Clear any existing content
        tile.element.textContent = '';
        
        // Remove all transitions and animations
        tile.element.style.setProperty('transition', 'none', 'important');
        tile.element.style.setProperty('animation', 'none', 'important');
        
        if (tile.adjacentMines > 0) {
            // This tile has adjacent mines - show the number
            tile.element.textContent = tile.adjacentMines;
            // Apply color based on number
            const colors = {
                1: '#0000ff', // Blue
                2: '#008000', // Green
                3: '#ff0000', // Red
                4: '#000080', // Dark Blue
                5: '#800000', // Maroon
                6: '#008080', // Teal
                7: '#000000', // Black
                8: '#808080'  // Gray
            };
            tile.element.style.setProperty('color', colors[tile.adjacentMines] || '#000000', 'important');
            
            // Number tiles need pointer-events for chording
            tile.element.style.setProperty('pointer-events', 'auto', 'important');
            
            // Number tiles get special background color #e0d6c2
            tile.element.style.setProperty('background-color', '#e0d6c2', 'important');
            // Make border same color as background so it's invisible
            tile.element.style.setProperty('border', '1px solid #e0d6c2', 'important');
            tile.element.style.setProperty('cursor', 'default', 'important');
            // Remove any outline that might appear
            tile.element.style.setProperty('outline', 'none', 'important');
            tile.element.style.setProperty('box-shadow', 'none', 'important');
        } else {
            // This is an empty tile - no text content
            tile.element.textContent = '';
            tile.element.style.setProperty('color', '#000000', 'important');
            
            // Empty tiles don't need pointer-events
            tile.element.style.setProperty('pointer-events', 'none', 'important');
            
            // Empty tiles keep original light gray background
            tile.element.style.setProperty('background-color', '#e0e0e0', 'important');
            // Make border same color as background so it's invisible
            tile.element.style.setProperty('border', '1px solid #e0e0e0', 'important');
            tile.element.style.setProperty('cursor', 'default', 'important');
            // Remove any outline that might appear
            tile.element.style.setProperty('outline', 'none', 'important');
            tile.element.style.setProperty('box-shadow', 'none', 'important');
            
            // Reveal adjacent tiles recursively (flood fill)
            this.getNeighbors(row, col).forEach(neighbor => {
                this.revealTile(neighbor.row, neighbor.col);
            });
        }
    }
    
    revealMine(row, col) {
        const tile = this.board[row][col];
        tile.isRevealed = true;
        tile.element.classList.add('revealed', 'mine');
        tile.element.textContent = '💣';
        tile.element.style.setProperty('background-color', '#ff0000', 'important');
        tile.element.style.setProperty('pointer-events', 'none', 'important');
        tile.element.style.setProperty('cursor', 'default', 'important');
        
        // Reveal all mines
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const otherTile = this.board[r][c];
                if (otherTile.isMine && !otherTile.isRevealed) {
                    otherTile.isRevealed = true;
                    otherTile.element.classList.add('revealed', 'mine');
                    otherTile.element.textContent = '💣';
                    otherTile.element.style.setProperty('background-color', '#ff0000', 'important');
                    otherTile.element.style.setProperty('pointer-events', 'none', 'important');
                    otherTile.element.style.setProperty('cursor', 'default', 'important');
                }
            }
        }
    }
    
    startTimer() {
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => {
            this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
            this.updateTimer();
        }, 1000);
    }
    
    updateTimer() {
        const timeStr = this.elapsedTime.toString().padStart(3, '0');
        this.gameTimer.textContent = timeStr;
    }
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    updateDisplay() {
        this.minesCount.textContent = this.mines.toString().padStart(2, '0');
        this.flagsCount.textContent = this.flagsPlaced.toString().padStart(2, '0');
    }
    
    checkWinCondition() {
        if (this.gameOver || this.gameWon) return;
        
        if (this.tilesRevealed === (this.rows * this.cols - this.mines)) {
            console.log('Game won! All non-mine tiles revealed');
            this.gameWon = true;
            this.endGame(true);
        }
    }
    
    endGame(isWin) {
        this.stopTimer();
        
        if (isWin) {
            // Add win class to the game container
            const gameContainer = document.querySelector('.minesweeper-game');
            if (gameContainer) {
                gameContainer.classList.add('game-won');
            }
            // Update button icon
            const buttonIcon = this.newGameBtn.querySelector('.button-icon');
            if (buttonIcon) {
                buttonIcon.textContent = '😎';
            }
            
            // Place flags on all remaining mines
            for (let row = 0; row < this.rows; row++) {
                for (let col = 0; col < this.cols; col++) {
                    const tile = this.board[row][col];
                    if (tile.isMine && !tile.isFlagged) {
                        tile.isFlagged = true;
                        tile.element.classList.add('flagged');
                        this.flagsPlaced++;
                    }
                }
            }
            this.updateDisplay();
        } else {
            // Add lose class to the game container
            const gameContainer = document.querySelector('.minesweeper-game');
            if (gameContainer) {
                gameContainer.classList.add('game-lost');
            }
            // Update button icon
            const buttonIcon = this.newGameBtn.querySelector('.button-icon');
            if (buttonIcon) {
                buttonIcon.textContent = '😵';
            }
        }
    }
    
    resetGame() {
        this.stopTimer();
        
        // Reset game state
        this.gameOver = false;
        this.gameWon = false;
        this.firstClick = true;
        this.flagsPlaced = 0;
        this.tilesRevealed = 0;
        this.elapsedTime = 0;
        
        // Reset UI classes
        const gameContainer = document.querySelector('.minesweeper-game');
        if (gameContainer) {
            gameContainer.classList.remove('game-won', 'game-lost');
        }
        
        const buttonIcon = this.newGameBtn.querySelector('.button-icon');
        if (buttonIcon) {
            buttonIcon.textContent = '😊';
        }
        
        // Create new board
        this.createBoard();
        this.updateDisplay();
        this.updateTimer();
        // Don't start timer until first click
    }
    
    setupEventListeners() {
        this.newGameBtn.addEventListener('click', () => this.resetGame());
        
        // Prevent context menu on the game board
        this.gameBoard.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
        
        // Handle chording (left click on revealed numbers or middle click)
        this.gameBoard.addEventListener('click', (e) => {
            // Check if this is a left click on a revealed tile with adjacent mines
            if (e.button === 0) {
                const tile = e.target;
                if (tile.classList.contains('minesweeper-tile')) {
                    const row = parseInt(tile.dataset.row);
                    const col = parseInt(tile.dataset.col);
                    const boardTile = this.board[row][col];
                    
                    // Check if this tile is already revealed and has adjacent mines
                    // This handles the case where user left-clicks on a revealed number
                    if (boardTile.isRevealed && boardTile.adjacentMines > 0) {
                        console.log('Left click on revealed number, checking for chording');
                        this.handleChording(row, col);
                    }
                }
            }
        });
        
        // Handle middle click (button 1) for chording
        this.gameBoard.addEventListener('auxclick', (e) => {
            if (e.button === 1) { // Middle mouse button
                e.preventDefault();
                const tile = e.target;
                if (tile.classList.contains('minesweeper-tile')) {
                    const row = parseInt(tile.dataset.row);
                    const col = parseInt(tile.dataset.col);
                    console.log('Middle click chording');
                    this.handleChording(row, col);
                }
            }
        });
        

    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new MinesweeperGame();
    
    // Make game accessible globally for debugging
    window.minesweeperGame = game;
});