/**
 * Day 8: Tower of Hanoi Animator
 * Smooth "Slide Up" Animation & Recursive Logic Teacher
 */

class HanoiAnimator {
    constructor() {
        this.diskCount = 3;
        this.towers = [[], [], []]; // Array of disk IDs
        this.disks = {}; // Map of disk ID to element
        this.moves = [];
        this.isSolving = false;
        this.isPaused = false;
        this.moveIndex = 0;
        this.speed = 500;

        // Colors for disks (Vibrant palette)
        this.colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

        // DOM Elements
        this.container = document.getElementById('disks-container');
        this.diskSlider = document.getElementById('disk-count');
        this.diskVal = document.getElementById('disk-count-val');
        this.speedSlider = document.getElementById('speed');
        this.explanation = document.getElementById('explanation-text');
        this.logicDisplay = document.getElementById('logic-display');
        this.history = document.getElementById('history-container');
        this.totalStepsText = document.getElementById('total-steps');
        this.currentStepText = document.getElementById('current-step');

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.reset();
        this.loadCode();
    }

    setupEventListeners() {
        this.diskSlider.addEventListener('input', (e) => {
            this.diskCount = parseInt(e.target.value);
            this.diskVal.innerText = this.diskCount;
            this.reset();
        });

        this.speedSlider.addEventListener('input', (e) => {
            this.speed = (11 - e.target.value) * 100;
        });

        document.getElementById('startBtn').onclick = () => this.startSolving();
        document.getElementById('pauseBtn').onclick = () => this.togglePause();
        document.getElementById('resetBtn').onclick = () => this.reset();
        document.getElementById('copyBtn').onclick = () => this.copyCode();
    }

    reset() {
        this.isSolving = false;
        this.isPaused = false;
        this.moveIndex = 0;
        this.moves = [];
        this.towers = [[], [], []];
        this.container.innerHTML = '';
        this.history.innerHTML = '';
        this.currentStepText.innerText = '0';
        this.totalStepsText.innerText = Math.pow(2, this.diskCount) - 1;
        this.explanation.innerText = "Ready to start the recursion teacher.";
        this.logicDisplay.innerText = `move(${this.diskCount}, SRC, AUX, DEST)`;

        // Create disks
        for (let i = this.diskCount; i >= 1; i--) {
            this.createDisk(i);
        }
        this.renderInitialState();
    }

    createDisk(size) {
        const disk = document.createElement('div');
        disk.className = 'disk';
        disk.id = `disk-${size}`;
        disk.innerText = size;
        
        // Size and Color
        const width = 60 + (size * 20);
        disk.style.width = `${width}px`;
        disk.style.backgroundColor = this.colors[size - 1];
        
        this.container.appendChild(disk);
        this.disks[size] = disk;
        this.towers[0].push(size);
    }

    renderInitialState() {
        this.towers[0].forEach((size, index) => {
            const disk = this.disks[size];
            const bottomOffset = 40 + (index * 30);
            const towerCenter = this.getTowerCenter(0);
            
            disk.style.left = `${towerCenter - (parseInt(disk.style.width) / 2)}px`;
            disk.style.bottom = `${bottomOffset}px`;
        });
    }

    getTowerCenter(index) {
        const tower = document.getElementById(`tower-${index}`);
        const rect = tower.getBoundingClientRect();
        const stageRect = document.querySelector('.hanoi-stage').getBoundingClientRect();
        return (rect.left - stageRect.left) + (rect.width / 2);
    }

    async startSolving() {
        if (this.isSolving) return;
        this.isSolving = true;
        this.isPaused = false;
        
        // Generate all moves using recursion
        this.moves = [];
        this.solveRecursive(this.diskCount, 0, 1, 2);
        
        while (this.moveIndex < this.moves.length) {
            if (this.isPaused) {
                await new Promise(r => setTimeout(r, 100));
                continue;
            }
            if (!this.isSolving) break;

            const move = this.moves[this.moveIndex];
            await this.animateMove(move);
            this.moveIndex++;
            this.currentStepText.innerText = this.moveIndex;
        }
        
        if (this.isSolving) {
            this.explanation.innerText = "All disks successfully moved! Recursion depth reached 0.";
        }
        this.isSolving = false;
    }

    solveRecursive(n, src, aux, dest) {
        if (n === 0) return;
        this.solveRecursive(n - 1, src, dest, aux);
        this.moves.push({ n, src, dest });
        this.solveRecursive(n - 1, aux, src, dest);
    }

    async animateMove(move) {
        const { n, src, dest } = move;
        const diskEl = this.disks[n];
        
        // 1. Log move
        this.addHistory(n, src, dest);
        this.updateExplanation(n, src, dest);

        // 2. Physics: Lift Up
        diskEl.style.bottom = '400px';
        await new Promise(r => setTimeout(r, this.speed));

        // 3. Physics: Slide Across
        const targetCenter = this.getTowerCenter(dest);
        diskEl.style.left = `${targetCenter - (parseInt(diskEl.style.width) / 2)}px`;
        await new Promise(r => setTimeout(r, this.speed));

        // 4. Update logical towers
        const srcIdx = this.towers[src].indexOf(n);
        this.towers[src].splice(srcIdx, 1);
        
        // Calculate target bottom
        const targetLevel = this.towers[dest].length;
        const targetBottom = 40 + (targetLevel * 30);
        this.towers[dest].push(n);

        // 5. Physics: Drop Down
        diskEl.style.bottom = `${targetBottom}px`;
        await new Promise(r => setTimeout(r, this.speed));
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        document.getElementById('pauseBtn').innerText = this.isPaused ? "Resume" : "Pause";
    }

    updateExplanation(n, src, dest) {
        const towerNames = ["Source", "Auxiliary", "Destination"];
        this.explanation.innerText = `Moving Disk ${n} from ${towerNames[src]} to ${towerNames[dest]}.`;
        this.logicDisplay.innerText = `move(Disk ${n}, ${src}, ${dest})`;
    }

    addHistory(n, src, dest) {
        const names = ["S", "A", "D"];
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `Step ${this.moveIndex + 1}: Move <span>Disk ${n}</span> (${names[src]} ➔ ${names[dest]})`;
        this.history.prepend(div);
    }

    switchTab(tab, event) {
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.getElementById(`${tab}-tab`).classList.add('active');
        event.currentTarget.classList.add('active');
    }

    loadCode() {
        const code = `/**
 * Tower of Hanoi Recursive Algorithm
 * Time Complexity: O(2^n)
 */

function towerOfHanoi(n, source, aux, dest) {
    // Base Case: Only 1 disk left to move
    if (n === 1) {
        console.log(\`Move disk 1 from \${source} to \${dest}\`);
        return;
    }

    // Step 1: Move n-1 disks from Source to Aux
    towerOfHanoi(n - 1, source, dest, aux);

    // Step 2: Move the nth disk from Source to Dest
    console.log(\`Move disk \${n} from \${source} to \${dest}\`);

    // Step 3: Move n-1 disks from Aux to Dest
    towerOfHanoi(n - 1, aux, source, dest);
}

// Example: 3 disks
towerOfHanoi(3, 'A', 'B', 'C');`;
        document.getElementById('code-display').innerText = code;
    }

    copyCode() {
        const code = document.getElementById('code-display').innerText;
        navigator.clipboard.writeText(code).then(() => {
            const btn = document.getElementById('copyBtn');
            btn.innerText = "✅ Copied!";
            setTimeout(() => btn.innerText = "Copy Code", 2000);
        });
    }
}

// Initialize
const app = new HanoiAnimator();

// Global tab switcher helper
function switchTab(tab, event) {
    app.switchTab(tab, event);
}
