document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const boardEl = document.getElementById('chessboard');
    const sizeSlider = document.getElementById('board-size');
    const sizeVal = document.getElementById('size-val');
    const speedSlider = document.getElementById('speed');
    const btnPlay = document.getElementById('btn-play');
    const btnPause = document.getElementById('btn-pause');
    const btnReset = document.getElementById('btn-reset');
    const statusBadge = document.getElementById('algo-status');
    const actionPopup = document.getElementById('action-popup');
    const actionIcon = document.getElementById('action-icon');
    const actionText = document.getElementById('action-text');
    const loopPopup = document.getElementById('loop-popup');
    const loopIcon = document.getElementById('loop-icon');
    const loopText = document.getElementById('loop-text');

    // State
    let N = parseInt(sizeSlider.value);
    let speed = parseInt(speedSlider.value);
    let board = [];
    let squares = []; // 2D array of DOM elements
    
    let isPlaying = false;
    let isPaused = false;
    let solverGenerator = null;
    let animationId = null;

    // Initialization
    function initBoard() {
        N = parseInt(sizeSlider.value);
        boardEl.innerHTML = '';
        boardEl.style.gridTemplateColumns = `repeat(${N}, 1fr)`;
        boardEl.style.gridTemplateRows = `repeat(${N}, 1fr)`;
        
        board = Array(N).fill(null).map(() => Array(N).fill(0));
        squares = Array(N).fill(null).map(() => Array(N).fill(null));

        for (let row = 0; row < N; row++) {
            for (let col = 0; col < N; col++) {
                const square = document.createElement('div');
                square.classList.add('square');
                // Checkered pattern
                if ((row + col) % 2 === 0) {
                    square.classList.add('light');
                } else {
                    square.classList.add('dark');
                }
                boardEl.appendChild(square);
                squares[row][col] = square;
            }
        }
        
        actionPopup.classList.add('hidden');
        loopPopup.classList.add('hidden');
        updateStatus('Idle', '');
    }

    // Logic: Backtracking Generator
    function* solveNQueens(col) {
        if (col >= N) {
            yield { type: 'done' };
            return true;
        }

        for (let row = 0; row < N; row++) {
            yield { type: 'try', row, col };
            
            const safeCheck = yield* isSafe(row, col);
            if (safeCheck.safe) {
                board[row][col] = 1;
                yield { type: 'place', row, col };

                if (yield* solveNQueens(col + 1)) {
                    return true;
                }

                // Backtrack
                board[row][col] = 0;
                yield { type: 'remove', row, col };
            } else {
                yield { type: 'threat', row, col, conflictRow: safeCheck.conflictRow, conflictCol: safeCheck.conflictCol };
            }
        }
        return false;
    }

    function* isSafe(row, col) {
        // Check this row on left side
        for (let i = 0; i < col; i++) {
            yield { type: 'check', checkType: 'row', r: row, c: i, col: col, row: row };
            if (board[row][i] === 1) return { safe: false, conflictRow: row, conflictCol: i };
        }

        // Check upper diagonal on left side
        for (let i = row, j = col; i >= 0 && j >= 0; i--, j--) {
            if (i !== row || j !== col) {
                yield { type: 'check', checkType: 'up-diag', r: i, c: j, col: col, row: row };
                if (board[i][j] === 1) return { safe: false, conflictRow: i, conflictCol: j };
            }
        }

        // Check lower diagonal on left side
        for (let i = row, j = col; j >= 0 && i < N; i++, j--) {
            if (i !== row || j !== col) {
                yield { type: 'check', checkType: 'down-diag', r: i, c: j, col: col, row: row };
                if (board[i][j] === 1) return { safe: false, conflictRow: i, conflictCol: j };
            }
        }

        return { safe: true };
    }

    // Animation Loop
    async function runVisualization() {
        if (!solverGenerator) {
            solverGenerator = solveNQueens(0);
            updateStatus('Running...', 'running');
            btnPlay.disabled = true;
            btnPause.disabled = false;
            sizeSlider.disabled = true;
        }

        isPlaying = true;
        isPaused = false;

        while (isPlaying) {
            const delay = 1100 - (speed * 100); // 100ms to 1000ms delay based on speed slider
            
            // Wait for delay
            await new Promise(resolve => setTimeout(resolve, delay));
            
            if (!isPlaying) break; // Check if paused/reset during sleep

            const { value, done } = solverGenerator.next();

            if (done || value.type === 'done') {
                isPlaying = false;
                updateStatus('Solved!', 'solved');
                showAction('🎉', 'Solution Found!');
                btnPlay.disabled = true;
                btnPause.disabled = true;
                sizeSlider.disabled = false;
                break;
            }

            renderState(value);
            
            if (value.type === 'done' && value === false) { // No solution found (though N>=4 always has one)
                isPlaying = false;
                updateStatus('No Solution', '');
                showAction('❌', 'No solution exists.');
                btnPlay.disabled = true;
                btnPause.disabled = true;
                sizeSlider.disabled = false;
                break;
            }
        }
    }

    function renderState(state) {
        // Clear previous highlights
        for (let r = 0; r < N; r++) {
            for (let c = 0; c < N; c++) {
                squares[r][c].classList.remove('active', 'threat');
            }
        }
        
        // Clear code highlights
        document.querySelectorAll('#pseudo-code span').forEach(span => {
            span.classList.remove('highlighted-code');
        });

        const { type, row, col, conflictRow, conflictCol } = state;
        const square = squares[row][col];

        if (type === 'try') {
            loopPopup.classList.add('hidden');
            square.classList.add('active');
            showAction('🔍', `col=${col}, row=${row}: Checking safety...`);
            document.getElementById('code-line-5').classList.add('highlighted-code');
        } else if (type === 'check') {
            squares[state.r][state.c].classList.add('active');
            loopPopup.classList.remove('hidden');
            if (state.checkType === 'row') {
                loopIcon.textContent = '➡️';
                loopText.textContent = `Looping row left: i=${state.c}`;
            } else {
                loopIcon.textContent = '↘️';
                loopText.textContent = `Looping diag: i=${state.r}, j=${state.c}`;
            }
            document.getElementById('code-line-5').classList.add('highlighted-code');
        } else if (type === 'place') {
            loopPopup.classList.add('hidden');
            const queen = document.createElement('div');
            queen.classList.add('queen');
            square.appendChild(queen);
            showAction('✅', `col=${col}, row=${row}: Safe! Placed Queen`);
            document.getElementById('code-line-6').classList.add('highlighted-code');
            document.getElementById('code-line-8').classList.add('highlighted-code');
        } else if (type === 'remove') {
            loopPopup.classList.add('hidden');
            const queen = square.querySelector('.queen');
            if (queen) {
                queen.classList.add('remove');
                setTimeout(() => {
                    if (square.contains(queen)) square.removeChild(queen);
                }, 200); // match css transition
            }
            square.classList.add('threat'); // highlight briefly as backtrack
            showAction('↩️', `col=${col}, row=${row}: Backtracking...`);
            document.getElementById('code-line-11').classList.add('highlighted-code');
        } else if (type === 'threat') {
            loopPopup.classList.add('hidden');
            square.classList.add('threat');
            squares[conflictRow][conflictCol].classList.add('active'); // highlight the conflicting queen
            showAction('⚠️', `col=${col}, row=${row}: Threat from i=${conflictRow}, j=${conflictCol}!`);
            document.getElementById('code-line-4').classList.add('highlighted-code');
        }
    }

    function showAction(icon, text) {
        actionPopup.classList.remove('hidden');
        actionIcon.textContent = icon;
        actionText.textContent = text;
    }

    function updateStatus(text, className) {
        statusBadge.textContent = text;
        statusBadge.className = 'status-badge';
        if (className) {
            statusBadge.classList.add(className);
        }
    }

    // Event Listeners
    sizeSlider.addEventListener('input', (e) => {
        sizeVal.textContent = e.target.value;
        reset();
    });

    speedSlider.addEventListener('input', (e) => {
        speed = parseInt(e.target.value);
    });

    btnPlay.addEventListener('click', () => {
        runVisualization();
    });

    btnPause.addEventListener('click', () => {
        isPlaying = false;
        isPaused = true;
        btnPlay.disabled = false;
        btnPause.disabled = true;
        updateStatus('Paused', '');
    });

    function reset() {
        isPlaying = false;
        solverGenerator = null;
        btnPlay.disabled = false;
        btnPause.disabled = true;
        sizeSlider.disabled = false;
        initBoard();
    }

    btnReset.addEventListener('click', reset);

    // Initial setup
    initBoard();
});
