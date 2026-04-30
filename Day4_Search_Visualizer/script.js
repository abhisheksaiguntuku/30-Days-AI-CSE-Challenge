// State
let arr = [12, 34, 45, 56, 67, 78, 89, 90, 100, 120, 145];
let isRunning = false;
let DELAY_MS = 600;
let algo = 'linear';

// DOM Elements
const arrayContainer = document.getElementById('main-array-container');
const toastContainer = document.getElementById('toast-container');
const actionText = document.getElementById('action-text');
const codeDisplay = document.getElementById('code-display');

const algoSelect = document.getElementById('algoSelect');
const arrayInput = document.getElementById('arrayInput');
const targetInput = document.getElementById('targetInput');
const randomBtn = document.getElementById('randomBtn');
const searchBtn = document.getElementById('searchBtn');
const speedSlider = document.getElementById('speedSlider');

// Pseudo Codes
const codes = {
    linear: [
        "for i = 0 to array.length - 1:",
        "  if array[i] == target:",
        "    return i",
        "return -1 // Not found"
    ],
    binary: [
        "low = 0, high = array.length - 1",
        "while low <= high:",
        "  mid = low + (high - low) / 2",
        "  if array[mid] == target: return mid",
        "  if array[mid] < target:",
        "    low = mid + 1",
        "  else:",
        "    high = mid - 1",
        "return -1"
    ],
    jump: [
        "n = array.length",
        "step = floor(sqrt(n))",
        "prev = 0",
        "while array[min(step, n)-1] < target:",
        "  prev = step",
        "  step += floor(sqrt(n))",
        "  if prev >= n: return -1",
        "while array[prev] < target:",
        "  prev++",
        "  if prev == min(step, n): return -1",
        "if array[prev] == target: return prev",
        "return -1"
    ],
    interpolation: [
        "low = 0, high = array.length - 1",
        "while low <= high and target >= arr[low] and target <= arr[high]:",
        "  if low == high:",
        "    if arr[low] == target: return low",
        "    return -1",
        "  pos = low + ((target-arr[low])*(high-low)) / (arr[high]-arr[low])",
        "  if arr[pos] == target: return pos",
        "  if arr[pos] < target: low = pos + 1",
        "  else: high = pos - 1",
        "return -1"
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

function setAction(text, color = "var(--text-main)") {
    actionText.innerText = text;
    actionText.style.color = color;
}

function loadCode(algoName) {
    codeDisplay.innerHTML = '';
    codes[algoName].forEach((line, index) => {
        const div = document.createElement('div');
        div.className = 'code-line';
        div.id = `code-line-${index}`;
        div.textContent = line;
        codeDisplay.appendChild(div);
    });
}

function highlightCode(lineNum) {
    document.querySelectorAll(`.code-line`).forEach(el => el.classList.remove('highlight-line'));
    const el = document.getElementById(`code-line-${lineNum}`);
    if (el) {
        el.classList.add('highlight-line');
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function isSorted(arr) {
    for (let i = 1; i < arr.length; i++) {
        if (arr[i - 1] > arr[i]) return false;
    }
    return true;
}

// Render
function renderArray() {
    arrayContainer.innerHTML = '';
    arr.forEach((val, i) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'array-box-wrapper';
        wrapper.id = `box-wrapper-${i}`;
        
        const box = document.createElement('div');
        box.className = 'array-box';
        box.id = `box-${i}`;
        box.innerText = val;
        
        const indexLabel = document.createElement('div');
        indexLabel.className = 'box-index';
        indexLabel.innerText = i;
        
        wrapper.appendChild(box);
        wrapper.appendChild(indexLabel);
        arrayContainer.appendChild(wrapper);
    });
    arrayInput.value = arr.join(', ');
}

function setBoxState(index, state) { // active, eliminated, found, none
    const box = document.getElementById(`box-${index}`);
    if (!box) return;
    box.className = 'array-box'; // reset
    if (state !== 'none') box.classList.add(`box-${state}`);
}

function setPointer(index, type, text) { // low, high, mid
    const wrapper = document.getElementById(`box-wrapper-${index}`);
    if (!wrapper) return;
    
    // Remove existing pointer of this type from all
    document.querySelectorAll(`.ptr-${type}`).forEach(e => e.remove());
    
    if (text) {
        const ptr = document.createElement('div');
        ptr.className = `ptr-label ptr-${type}`;
        ptr.innerText = text;
        wrapper.appendChild(ptr);
    }
}

function clearAllPointers() {
    document.querySelectorAll('.ptr-label').forEach(e => e.remove());
}

// Visual Auto-Sort
async function visualSort() {
    setAction("Array must be sorted for this algorithm. Sorting...", "var(--warning)");
    showToast("Auto-sorting array...", "warning");
    
    const boxes = document.querySelectorAll('.array-box');
    boxes.forEach(b => b.classList.add('sorting-transition'));
    
    await sleep(800);
    arr.sort((a, b) => a - b);
    renderArray();
    
    document.querySelectorAll('.array-box').forEach(b => b.classList.add('sorting-transition'));
    await sleep(800);
    document.querySelectorAll('.array-box').forEach(b => b.classList.remove('sorting-transition'));
}

// -- ALGORITHMS --

async function linearSearch(target) {
    for (let i = 0; i < arr.length; i++) {
        highlightCode(0);
        setAction(`Checking index ${i} (Value: ${arr[i]})`);
        setBoxState(i, 'active');
        showToast(`i = ${i}`, "purple");
        await sleep(DELAY_MS);
        
        highlightCode(1);
        if (arr[i] === target) {
            showToast(`arr[${i}] == target (True!)`, "success");
            await sleep(DELAY_MS / 2);
            highlightCode(2);
            setBoxState(i, 'found');
            setAction(`Target ${target} found at index ${i}!`, "var(--success)");
            showToast("Found!", "success");
            return;
        }
        
        showToast(`arr[${i}] == target (False)`, "danger");
        setBoxState(i, 'eliminated');
        await sleep(DELAY_MS / 2);
    }
    highlightCode(3);
    setAction(`Target ${target} not found in the array.`, "var(--danger)");
    showToast("Not Found", "danger");
}

async function binarySearch(target) {
    let low = 0;
    let high = arr.length - 1;
    
    highlightCode(0);
    setPointer(low, 'low', 'Low');
    setPointer(high, 'high', 'High');
    showToast(`low = ${low}, high = ${high}`, "purple");
    await sleep(DELAY_MS);

    while (low <= high) {
        highlightCode(1);
        showToast(`low <= high (True)`, "info");
        await sleep(DELAY_MS / 2);
        
        highlightCode(2);
        let mid = Math.floor(low + (high - low) / 2);
        setPointer(mid, 'mid', 'Mid');
        setBoxState(mid, 'active');
        setAction(`Calculated Mid = ${mid}. Checking value ${arr[mid]}.`);
        showToast(`mid = ${mid}`, "purple");
        await sleep(DELAY_MS);
        
        highlightCode(3);
        if (arr[mid] === target) {
            showToast(`arr[mid] == target (True!)`, "success");
            await sleep(DELAY_MS / 2);
            setBoxState(mid, 'found');
            setAction(`Target ${target} found at index ${mid}!`, "var(--success)");
            showToast("Found!", "success");
            return;
        }
        showToast(`arr[mid] == target (False)`, "danger");
        
        highlightCode(4);
        await sleep(DELAY_MS / 2);
        
        if (arr[mid] < target) {
            showToast(`arr[mid] < target (True)`, "info");
            highlightCode(5);
            setAction(`${arr[mid]} < ${target}. Target must be in right half.`);
            // Eliminate left half
            for(let i=low; i<=mid; i++) setBoxState(i, 'eliminated');
            low = mid + 1;
            if(low <= high) {
                setPointer(low, 'low', 'Low');
                showToast(`low updates to ${low}`, "purple");
            }
        } else {
            showToast(`arr[mid] < target (False)`, "danger");
            await sleep(DELAY_MS / 2);
            highlightCode(7);
            setAction(`${arr[mid]} > ${target}. Target must be in left half.`);
            // Eliminate right half
            for(let i=mid; i<=high; i++) setBoxState(i, 'eliminated');
            high = mid - 1;
            if(low <= high) {
                setPointer(high, 'high', 'High');
                showToast(`high updates to ${high}`, "purple");
            }
        }
        await sleep(DELAY_MS);
    }
    
    highlightCode(8);
    clearAllPointers();
    setAction(`Target ${target} not found in the array.`, "var(--danger)");
    showToast("Not Found", "danger");
}

async function jumpSearch(target) {
    let n = arr.length;
    highlightCode(0); await sleep(DELAY_MS/2);
    highlightCode(1);
    let step = Math.floor(Math.sqrt(n));
    let prev = 0;
    highlightCode(2);
    
    showToast(`step = ${step}`, "purple");
    setPointer(prev, 'low', 'Prev');
    setPointer(Math.min(step, n)-1, 'high', 'Step');
    setAction(`Jump step size is ${step}`);
    await sleep(DELAY_MS);
    
    while (arr[Math.min(step, n) - 1] < target) {
        highlightCode(3);
        showToast(`arr[step] < target (True)`, "info");
        await sleep(DELAY_MS/2);
        
        // Eliminate previous block visually
        for(let i=prev; i<Math.min(step, n); i++) setBoxState(i, 'eliminated');
        
        highlightCode(4); prev = step;
        showToast(`prev updates to ${prev}`, "purple");
        highlightCode(5); step += Math.floor(Math.sqrt(n));
        showToast(`step updates to ${step}`, "purple");
        
        setPointer(prev, 'low', 'Prev');
        if(prev >= n) break; // prevent error in pointer
        setPointer(Math.min(step, n)-1, 'high', 'Step');
        
        setAction(`Jumping to index ${Math.min(step, n)-1}. Value is ${arr[Math.min(step, n)-1]}`);
        await sleep(DELAY_MS);
        
        highlightCode(6);
        if (prev >= n) {
            highlightCode(11);
            setAction(`Reached end of array. Not found.`, "var(--danger)");
            return;
        }
    }
    showToast(`arr[step] < target (False)`, "danger");
    
    setAction(`Target is within block ${prev} to ${Math.min(step, n)-1}. Doing linear search.`);
    await sleep(DELAY_MS);
    
    while (arr[prev] < target) {
        highlightCode(7); 
        showToast(`arr[prev] < target (True)`, "info");
        await sleep(DELAY_MS/2);
        highlightCode(8);
        setBoxState(prev, 'eliminated');
        prev++;
        showToast(`prev++ -> ${prev}`, "purple");
        setPointer(prev, 'low', 'Prev');
        await sleep(DELAY_MS/2);
        
        highlightCode(9);
        if (prev == Math.min(step, n)) {
            highlightCode(11); setAction("Not found in block.", "var(--danger)"); return;
        }
    }
    
    highlightCode(10);
    if (arr[prev] === target) {
        showToast(`arr[prev] == target (True!)`, "success");
        await sleep(DELAY_MS / 2);
        setBoxState(prev, 'found');
        setAction(`Target ${target} found at index ${prev}!`, "var(--success)");
        showToast("Found!", "success");
        return;
    }
    
    highlightCode(11);
    showToast(`arr[prev] == target (False)`, "danger");
    setBoxState(prev, 'eliminated');
    setAction(`Target ${target} not found.`, "var(--danger)");
}

async function interpolationSearch(target) {
    let low = 0; let high = arr.length - 1;
    highlightCode(0);
    setPointer(low, 'low', 'Low'); setPointer(high, 'high', 'High');
    showToast(`low = ${low}, high = ${high}`, "purple");
    await sleep(DELAY_MS);
    
    while (low <= high && target >= arr[low] && target <= arr[high]) {
        highlightCode(1); 
        showToast(`Conditions Met (True)`, "info");
        await sleep(DELAY_MS/2);
        highlightCode(2);
        if (low === high) {
            showToast(`low == high (True)`, "info");
            await sleep(DELAY_MS/2);
            if (arr[low] === target) { 
                showToast(`arr[low] == target (True!)`, "success");
                highlightCode(3); setBoxState(low, 'found'); setAction("Found!", "var(--success)"); return; 
            }
            highlightCode(4); setAction("Not found", "var(--danger)"); return;
        }
        showToast(`low == high (False)`, "danger");
        await sleep(DELAY_MS/2);
        
        highlightCode(5);
        let pos = low + Math.floor(((target - arr[low]) * (high - low)) / (arr[high] - arr[low]));
        setPointer(pos, 'mid', 'Pos');
        setBoxState(pos, 'active');
        setAction(`Probed Pos = ${pos}. Checking value ${arr[pos]}.`);
        showToast(`pos = ${pos}`, "purple");
        await sleep(DELAY_MS);
        
        highlightCode(6);
        if (arr[pos] === target) {
            showToast(`arr[pos] == target (True!)`, "success");
            await sleep(DELAY_MS/2);
            setBoxState(pos, 'found'); setAction(`Target ${target} found at index ${pos}!`, "var(--success)"); showToast("Found!", "success"); return;
        }
        showToast(`arr[pos] == target (False)`, "danger");
        await sleep(DELAY_MS/2);
        
        if (arr[pos] < target) {
            showToast(`arr[pos] < target (True)`, "info");
            highlightCode(7);
            for(let i=low; i<=pos; i++) setBoxState(i, 'eliminated');
            low = pos + 1;
            if(low<=high) {
                setPointer(low, 'low', 'Low');
                showToast(`low updates to ${low}`, "purple");
            }
        } else {
            showToast(`arr[pos] < target (False)`, "danger");
            highlightCode(8);
            for(let i=pos; i<=high; i++) setBoxState(i, 'eliminated');
            high = pos - 1;
            if(low<=high) {
                setPointer(high, 'high', 'High');
                showToast(`high updates to ${high}`, "purple");
            }
        }
        await sleep(DELAY_MS);
    }
    showToast(`Loop Conditions Failed`, "danger");
    highlightCode(9);
    clearAllPointers(); setAction(`Target ${target} not found.`, "var(--danger)");
}

// -- MAIN EXECUTION --
searchBtn.addEventListener('click', async () => {
    if (isRunning) return;
    
    let target = parseInt(targetInput.value);
    if (isNaN(target)) { alert("Please enter a valid target number."); return; }
    
    // Parse Array Input
    const rawArr = arrayInput.value.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
    if (rawArr.length === 0) { alert("Please enter a valid comma-separated array."); return; }
    if (rawArr.length > 25) { alert("Please keep the array under 25 elements for visualization."); return; }
    
    arr = rawArr;
    algo = algoSelect.value;
    
    isRunning = true;
    searchBtn.disabled = true;
    randomBtn.disabled = true;
    clearAllPointers();
    toastContainer.innerHTML = '';
    renderArray();
    loadCode(algo);
    
    // Auto-Sort Check
    if (algo !== 'linear' && !isSorted(arr)) {
        await visualSort();
    }
    
    // Run
    if (algo === 'linear') await linearSearch(target);
    else if (algo === 'binary') await binarySearch(target);
    else if (algo === 'jump') await jumpSearch(target);
    else if (algo === 'interpolation') await interpolationSearch(target);
    
    isRunning = false;
    searchBtn.disabled = false;
    randomBtn.disabled = false;
});

// Controls
algoSelect.addEventListener('change', (e) => {
    algo = e.target.value;
    loadCode(algo);
});

randomBtn.addEventListener('click', () => {
    if(isRunning) return;
    const len = Math.floor(Math.random() * 10) + 8; // 8 to 18 elements
    const newArr = [];
    for(let i=0; i<len; i++) newArr.push(Math.floor(Math.random() * 100));
    newArr.sort((a,b)=>a-b);
    arr = newArr;
    renderArray();
    targetInput.value = arr[Math.floor(Math.random() * arr.length)]; // Pick a guaranteed target mostly
});

speedSlider.addEventListener('input', (e) => {
    DELAY_MS = 1500 - (e.target.value * 14);
});

// Init
window.onload = () => {
    renderArray();
    loadCode(algo);
    targetInput.value = 67;
};
