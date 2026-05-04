/**
 * Day 7: Maze Generator (Randomized DFS)
 * Logic: Recursive Backtracker using an explicit stack
 */

class Cell {
    constructor(row, col) {
        this.row = row;
        this.col = col;
        this.visited = false;
        this.walls = { top: true, right: true, bottom: true, left: true };
        this.element = null; // DOM reference
    }

    createDOM(size) {
        const div = document.createElement('div');
        div.className = 'cell';
        div.style.width = `${size}px`;
        div.style.height = `${size}px`;
        this.element = div;
        return div;
    }

    updateWalls() {
        if (!this.walls.top) this.element.classList.add('top');
        if (!this.walls.right) this.element.classList.add('right');
        if (!this.walls.bottom) this.element.classList.add('bottom');
        if (!this.walls.left) this.element.classList.add('left');
    }

    highlight(type = 'current') {
        if (!this.element) return;
        this.element.classList.remove('current', 'backtrack');
        if (type) this.element.classList.add(type);
    }
}

class MazeGenerator {
    constructor() {
        this.rows = 20;
        this.cols = 20;
        this.grid = [];
        this.stack = [];
        this.current = null;
        this.isGenerating = false;
        this.speed = 80;
        this.cellsVisited = 0;

        // DOM cache
        this.container = document.getElementById('maze-container');
        this.statusText = document.getElementById('status-text');
        this.visitedCounter = document.getElementById('cells-visited');
        this.stackDepthText = document.getElementById('stack-depth');
        this.stackContainer = document.getElementById('stack-container');
    }

    init(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.grid = [];
        this.stack = [];
        this.cellsVisited = 0;
        this.container.innerHTML = '';
        this.stackContainer.innerHTML = '';
        this.isGenerating = false;

        // Set grid dimensions
        this.container.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;
        const cellSize = Math.floor(Math.min(580 / this.rows, 580 / this.cols));

        for (let r = 0; r < this.rows; r++) {
            let row = [];
            for (let c = 0; c < this.cols; c++) {
                const cell = new Cell(r, c);
                this.container.appendChild(cell.createDOM(cellSize));
                row.push(cell);
            }
            this.grid.push(row);
        }

        this.statusText.innerText = "Ready";
        this.updateStats();
    }

    async generate() {
        if (this.isGenerating) return;
        this.isGenerating = true;
        this.statusText.innerText = "Generating...";
        this.statusText.style.color = "var(--warning)";

        // Start at (0,0)
        this.current = this.grid[0][0];
        this.current.visited = true;
        this.cellsVisited++;
        this.stack.push(this.current);
        this.updateStackUI('push', this.current);

        while (this.stack.length > 0) {
            if (!this.isGenerating) break;

            this.current.highlight('current');
            this.updateStats();

            // Step 1: Pick a random unvisited neighbor
            const neighbor = this.getRandomNeighbor(this.current);

            if (neighbor) {
                // Step 2: Push current to stack
                this.stack.push(this.current);
                this.updateStackUI('push', neighbor);

                // Step 3: Remove walls between current and neighbor
                this.removeWalls(this.current, neighbor);
                this.current.updateWalls();
                neighbor.updateWalls();

                // Step 4: Move to neighbor
                this.current.highlight('visited'); 
                this.current = neighbor;
                this.current.visited = true;
                this.cellsVisited++;
                
                await this.sleep();
            } else if (this.stack.length > 0) {
                // Backtrack
                this.current.highlight('backtrack');
                await this.sleep();
                this.current.highlight('visited');
                this.current = this.stack.pop();
                this.updateStackUI('pop');
            }
        }

        if (this.isGenerating) {
            this.current.highlight(null);
            this.statusText.innerText = "Completed";
            this.statusText.style.color = "var(--success)";
            this.isGenerating = false;
        }
    }

    getRandomNeighbor(cell) {
        const neighbors = [];
        const { row, col } = cell;

        // Top
        if (row > 0 && !this.grid[row - 1][col].visited) neighbors.push(this.grid[row - 1][col]);
        // Right
        if (col < this.cols - 1 && !this.grid[row][col + 1].visited) neighbors.push(this.grid[row][col + 1]);
        // Bottom
        if (row < this.rows - 1 && !this.grid[row + 1][col].visited) neighbors.push(this.grid[row + 1][col]);
        // Left
        if (col > 0 && !this.grid[row][col - 1].visited) neighbors.push(this.grid[row][col - 1]);

        if (neighbors.length > 0) {
            const randomIndex = Math.floor(Math.random() * neighbors.length);
            return neighbors[randomIndex];
        }
        return null;
    }

    removeWalls(a, b) {
        const dx = a.col - b.col;
        if (dx === 1) {
            a.walls.left = false;
            b.walls.right = false;
        } else if (dx === -1) {
            a.walls.right = false;
            b.walls.left = false;
        }

        const dy = a.row - b.row;
        if (dy === 1) {
            a.walls.top = false;
            b.walls.bottom = false;
        } else if (dy === -1) {
            a.walls.bottom = false;
            b.walls.top = false;
        }
    }

    updateStats() {
        this.visitedCounter.innerText = `${this.cellsVisited} / ${this.rows * this.cols}`;
        this.stackDepthText.innerText = this.stack.length;
    }

    updateStackUI(action, cell) {
        if (action === 'push') {
            const item = document.createElement('div');
            item.className = 'stack-item';
            item.id = `stack-${cell.row}-${cell.col}`;
            item.innerText = `Cell (${cell.row}, ${cell.col})`;
            this.stackContainer.appendChild(item);
            this.stackContainer.scrollTop = this.stackContainer.scrollHeight;
        } else {
            if (this.stackContainer.lastChild) {
                this.stackContainer.lastChild.remove();
            }
        }
    }

    sleep() {
        const ms = 101 - this.speed;
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// UI Controller
const maze = new MazeGenerator();

function switchTab(tabName, event) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`${tabName}-tab`).classList.add('active');
    event.currentTarget.classList.add('active');
}

document.getElementById('startBtn').onclick = () => {
    maze.generate();
};

document.getElementById('resetBtn').onclick = () => {
    const size = parseInt(document.getElementById('gridSize').value);
    maze.init(size, size);
};

document.getElementById('gridSize').onchange = (e) => {
    const size = parseInt(e.target.value);
    maze.init(size, size);
};

document.getElementById('speedSlider').oninput = (e) => {
    maze.speed = parseInt(e.target.value);
};

// Pseudo-code display
function loadPseudoCode() {
    const code = [
        "<span class='highlight'>DFS_Maze(current_cell):</span>",
        "  Mark <span class='highlight'>current_cell</span> as visited",
        "  While there are unvisited neighbors:",
        "    1. Pick a random <span class='highlight'>neighbor</span>",
        "    2. Remove walls between them",
        "    3. <span class='highlight'>Stack.push</span>(current_cell)",
        "    4. DFS_Maze(neighbor)",
        "  Else if stack is not empty:",
        "    <span class='highlight'>Backtrack:</span> current = Stack.pop()"
    ];
    const display = document.getElementById('code-display');
    if (display) display.innerHTML = code.map(line => `<div class='code-line'>${line}</div>`).join('');
}

window.onload = () => {
    maze.init(20, 20);
    loadPseudoCode();
};
