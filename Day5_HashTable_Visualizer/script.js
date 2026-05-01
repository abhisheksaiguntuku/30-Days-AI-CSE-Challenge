// State
let tableSize = 10;
let hashTable = Array.from({ length: tableSize }, () => []); // Array of arrays to support chaining
let isRunning = false;
let DELAY_MS = 600;
let strategy = 'linear';

// DOM Elements
const sizeInput = document.getElementById('sizeInput');
const applySizeBtn = document.getElementById('applySizeBtn');
const strategySelect = document.getElementById('strategySelect');
const keyInput = document.getElementById('keyInput');
const insertBtn = document.getElementById('insertBtn');
const randomBtn = document.getElementById('randomBtn');
const resetBtn = document.getElementById('resetBtn');
const speedSlider = document.getElementById('speedSlider');

const tableContainer = document.getElementById('hash-table-container');
const tableSizeDisplay = document.getElementById('table-size-display');
const calcText = document.getElementById('calc-text');
const toastContainer = document.querySelector('.toast-container-static');
const codeDisplay = document.getElementById('code-display');

// Pseudo Codes
const codes = {
    linear: [
        "function insert(key):",
        "  index = key % table_size",
        "  while table[index] is occupied:",
        "    if table[index] == key: return // Duplicate",
        "    index = (index + 1) % table_size",
        "  table[index] = key"
    ],
    quadratic: [
        "function insert(key):",
        "  index = key % table_size",
        "  step = 1",
        "  original_index = index",
        "  while table[index] is occupied:",
        "    if table[index] == key: return // Duplicate",
        "    index = (original_index + step*step) % table_size",
        "    step++",
        "  table[index] = key"
    ],
    chaining: [
        "function insert(key):",
        "  index = key % table_size",
        "  list = table[index]",
        "  for node in list:",
        "    if node.val == key: return // Duplicate",
        "  if list.length >= 4: return // UI Limit",
        "  list.append(key)"
    ]
};

// Utils
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = message;
    toastContainer.appendChild(toast);
    toastContainer.scrollTop = toastContainer.scrollHeight;
}

function updateCalc(text, highlight = false) {
    calcText.innerText = text;
    if(highlight) calcText.style.color = "var(--warning)";
    else calcText.style.color = "var(--text-main)";
}

function loadCode(stratName) {
    codeDisplay.innerHTML = '';
    codes[stratName].forEach((line, index) => {
        const div = document.createElement('div');
        div.className = 'code-line';
        div.id = `code-line-${index}`;
        div.textContent = line;
        codeDisplay.appendChild(div);
    });
}

function highlightCode(lineNum) {
    document.querySelectorAll(`.code-line`).forEach(el => el.classList.remove('highlight-line'));
    if(lineNum === -1) return;
    const el = document.getElementById(`code-line-${lineNum}`);
    if (el) {
        el.classList.add('highlight-line');
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Render
function renderTable() {
    tableContainer.innerHTML = '';
    tableSizeDisplay.innerText = `(Size: ${tableSize})`;
    
    for (let i = 0; i < tableSize; i++) {
        const row = document.createElement('div');
        row.className = 'bucket-row';
        row.id = `bucket-row-${i}`;
        
        const indexLabel = document.createElement('div');
        indexLabel.className = 'bucket-index';
        indexLabel.innerText = `[${i}]`;
        
        const cellsContainer = document.createElement('div');
        cellsContainer.className = 'bucket-cells';
        cellsContainer.id = `bucket-cells-${i}`;
        
        // Render existing nodes in this bucket
        if (hashTable[i].length === 0) {
            // Empty placeholder box for Open Addressing so it looks like an array slot
            if (strategy !== 'chaining') {
                const emptyCell = document.createElement('div');
                emptyCell.className = 'bucket-cell';
                emptyCell.id = `cell-${i}-0`;
                cellsContainer.appendChild(emptyCell);
            }
        } else {
            hashTable[i].forEach((val, j) => {
                if (j > 0 && strategy === 'chaining') {
                    const arrow = document.createElement('div');
                    arrow.className = 'chain-ptr';
                    arrow.innerText = '→';
                    cellsContainer.appendChild(arrow);
                }
                
                const cell = document.createElement('div');
                cell.className = 'bucket-cell cell-filled';
                cell.id = `cell-${i}-${j}`;
                cell.innerText = val;
                cellsContainer.appendChild(cell);
            });
        }
        
        row.appendChild(indexLabel);
        row.appendChild(cellsContainer);
        tableContainer.appendChild(row);
    }
}

function initTable(size) {
    tableSize = size;
    hashTable = Array.from({ length: tableSize }, () => []);
    renderTable();
}

function setCellState(bucketIndex, nodeIndex, state) {
    // states: default, checking, collision, inserted
    let cell;
    if (strategy !== 'chaining') {
        cell = document.getElementById(`cell-${bucketIndex}-0`);
    } else {
        // If probing an empty chaining bucket, there is no cell to highlight unless we just check the row
        // Let's highlight the row cells container instead
        const cellsContainer = document.getElementById(`bucket-cells-${bucketIndex}`);
        if(cellsContainer) {
            cellsContainer.style.transition = "background 0.3s";
            if(state === 'checking') cellsContainer.style.background = "rgba(245, 158, 11, 0.2)";
            else if(state === 'collision') cellsContainer.style.background = "rgba(239, 68, 68, 0.3)";
            else cellsContainer.style.background = "rgba(0,0,0,0.1)";
            return;
        }
    }
    
    if (!cell) return;
    
    // Remove old classes
    cell.classList.remove('node-checking', 'node-collision', 'node-inserted');
    
    if (state === 'checking') cell.classList.add('node-checking');
    else if (state === 'collision') cell.classList.add('node-collision');
    else if (state === 'inserted') {
        cell.classList.add('cell-filled', 'node-inserted');
    }
}

// -- ALGORITHMS --

async function linearProbing(key) {
    highlightCode(0); await sleep(DELAY_MS/2);
    
    let index = key % tableSize;
    highlightCode(1);
    updateCalc(`Hash = ${key} % ${tableSize} = ${index}`, true);
    showToast(`Hash = ${index}`, "purple");
    await sleep(DELAY_MS);
    
    let probedCount = 0; // prevent infinite loops if full
    
    while (hashTable[index].length > 0) {
        highlightCode(2);
        showToast(`table[${index}] occupied (True)`, "info");
        setCellState(index, 0, 'checking');
        await sleep(DELAY_MS/2);
        
        highlightCode(3);
        if (hashTable[index][0] === key) {
            showToast(`Duplicate found!`, "danger");
            setCellState(index, 0, 'collision');
            await sleep(DELAY_MS);
            setCellState(index, 0, 'default');
            return;
        }
        
        showToast(`Collision at [${index}]!`, "danger");
        setCellState(index, 0, 'collision');
        await sleep(DELAY_MS);
        setCellState(index, 0, 'default');
        
        highlightCode(4);
        index = (index + 1) % tableSize;
        probedCount++;
        showToast(`index = (${index-1} + 1) % ${tableSize} = ${index}`, "purple");
        updateCalc(`Probing to index ${index}`, true);
        await sleep(DELAY_MS);
        
        if (probedCount >= tableSize) {
            showToast(`Table is full!`, "danger");
            highlightCode(-1);
            return;
        }
    }
    
    highlightCode(2);
    showToast(`table[${index}] occupied (False)`, "success");
    setCellState(index, 'checking');
    await sleep(DELAY_MS/2);
    
    highlightCode(5);
    hashTable[index].push(key);
    // Directly mutate DOM to show insertion without full re-render
    const cell = document.getElementById(`cell-${index}-0`);
    if(cell) {
        cell.innerText = key;
        setCellState(index, 0, 'inserted');
    }
    showToast(`Inserted at [${index}]`, "success");
    updateCalc(`Inserted ${key} at index ${index}`);
}

async function quadraticProbing(key) {
    highlightCode(0); await sleep(DELAY_MS/2);
    
    let index = key % tableSize;
    highlightCode(1);
    updateCalc(`Hash = ${key} % ${tableSize} = ${index}`, true);
    showToast(`Hash = ${index}`, "purple");
    await sleep(DELAY_MS);
    
    highlightCode(2); let step = 1; showToast(`step = 1`, "purple"); await sleep(DELAY_MS/2);
    highlightCode(3); let orig_index = index; showToast(`orig_index = ${index}`, "purple"); await sleep(DELAY_MS/2);
    
    let probedCount = 0; // prevent infinite loops
    
    while (hashTable[index].length > 0) {
        highlightCode(4);
        showToast(`table[${index}] occupied (True)`, "info");
        setCellState(index, 0, 'checking');
        await sleep(DELAY_MS/2);
        
        highlightCode(5);
        if (hashTable[index][0] === key) {
            showToast(`Duplicate found!`, "danger");
            setCellState(index, 0, 'collision');
            await sleep(DELAY_MS);
            setCellState(index, 0, 'default');
            return;
        }
        
        showToast(`Collision at [${index}]!`, "danger");
        setCellState(index, 0, 'collision');
        await sleep(DELAY_MS);
        setCellState(index, 0, 'default');
        
        highlightCode(6);
        index = (orig_index + (step * step)) % tableSize;
        showToast(`index = (${orig_index} + ${step}^2) % ${tableSize} = ${index}`, "purple");
        updateCalc(`Probing to index ${index} (step ${step})`, true);
        await sleep(DELAY_MS);
        
        highlightCode(7);
        step++;
        showToast(`step++ -> ${step}`, "purple");
        probedCount++;
        await sleep(DELAY_MS/2);
        
        if (probedCount >= tableSize) {
            showToast(`Unable to find empty slot!`, "danger");
            highlightCode(-1);
            return;
        }
    }
    
    highlightCode(4);
    showToast(`table[${index}] occupied (False)`, "success");
    setCellState(index, 'checking');
    await sleep(DELAY_MS/2);
    
    highlightCode(8);
    hashTable[index].push(key);
    const cell = document.getElementById(`cell-${index}-0`);
    if(cell) {
        cell.innerText = key;
        setCellState(index, 0, 'inserted');
    }
    showToast(`Inserted at [${index}]`, "success");
    updateCalc(`Inserted ${key} at index ${index}`);
}

async function separateChaining(key) {
    highlightCode(0); await sleep(DELAY_MS/2);
    
    let index = key % tableSize;
    highlightCode(1);
    updateCalc(`Hash = ${key} % ${tableSize} = ${index}`, true);
    showToast(`Hash = ${index}`, "purple");
    await sleep(DELAY_MS);
    
    highlightCode(2);
    showToast(`list = table[${index}]`, "info");
    setCellState(index, 0, 'checking'); // highlight row
    await sleep(DELAY_MS);
    
    let list = hashTable[index];
    
    highlightCode(3);
    for(let i=0; i<list.length; i++) {
        showToast(`Checking node ${list[i]}`, "purple");
        const cell = document.getElementById(`cell-${index}-${i}`);
        if(cell) {
            cell.classList.add('node-checking');
            await sleep(DELAY_MS/2);
            
            highlightCode(4);
            if (list[i] === key) {
                showToast(`Duplicate found!`, "danger");
                cell.classList.remove('node-checking');
                cell.classList.add('node-collision');
                await sleep(DELAY_MS);
                cell.classList.remove('node-collision');
                setCellState(index, 'default');
                return;
            }
            showToast(`Not duplicate`, "info");
            cell.classList.remove('node-checking');
            await sleep(DELAY_MS/2);
            highlightCode(3);
        }
    }
    
    highlightCode(5);
    if (list.length >= 4) {
        showToast(`Chain length maxed out!`, "danger");
        setCellState(index, 0, 'collision');
        await sleep(DELAY_MS);
        setCellState(index, 0, 'default');
        return;
    }
    await sleep(DELAY_MS/2);
    
    highlightCode(6);
    hashTable[index].push(key);
    renderTable(); // Re-render to draw new chained node
    
    // Animate the newly inserted chained node
    const newCellIndex = hashTable[index].length - 1;
    const newCell = document.getElementById(`cell-${index}-${newCellIndex}`);
    if(newCell) newCell.classList.add('node-inserted');
    
    showToast(`Appended to chain at [${index}]`, "success");
    updateCalc(`Chained ${key} at index ${index}`);
    setCellState(index, 'default');
}


// -- MAIN EXECUTION --
insertBtn.addEventListener('click', async () => {
    if (isRunning) return;
    
    let key = parseInt(keyInput.value);
    if (isNaN(key)) { alert("Please enter a valid numeric key."); return; }
    
    isRunning = true;
    insertBtn.disabled = true;
    randomBtn.disabled = true;
    applySizeBtn.disabled = true;
    strategySelect.disabled = true;
    
    toastContainer.innerHTML = '';
    
    if (strategy === 'linear') await linearProbing(key);
    else if (strategy === 'quadratic') await quadraticProbing(key);
    else if (strategy === 'chaining') await separateChaining(key);
    
    isRunning = false;
    insertBtn.disabled = false;
    randomBtn.disabled = false;
    applySizeBtn.disabled = false;
    strategySelect.disabled = false;
    highlightCode(-1);
    
    keyInput.value = '';
});

// Controls
strategySelect.addEventListener('change', (e) => {
    strategy = e.target.value;
    loadCode(strategy);
    initTable(tableSize); // Clear table when switching strategy because memory shape changes
});

applySizeBtn.addEventListener('click', () => {
    if (isRunning) return;
    let size = parseInt(sizeInput.value);
    if(isNaN(size) || size < 3 || size > 20) {
        alert("Size must be between 3 and 20.");
        sizeInput.value = tableSize;
        return;
    }
    initTable(size);
});

resetBtn.addEventListener('click', () => {
    if (isRunning) return;
    initTable(tableSize);
    updateCalc("Table cleared.");
    toastContainer.innerHTML = '';
});

randomBtn.addEventListener('click', () => {
    keyInput.value = Math.floor(Math.random() * 1000);
});

speedSlider.addEventListener('input', (e) => {
    DELAY_MS = 1500 - (e.target.value * 14);
});

// Init
window.onload = () => {
    initTable(10);
    loadCode(strategy);
    keyInput.value = Math.floor(Math.random() * 100);
};
