// State
let originalArray = [10, 45, 12, 8, 30, 22, 50, 5];
let currentArray = [...originalArray];
let DELAY_MS = 500;
let isRunning = false;
let currentAlgo = 'bubble';

// DOM Elements
const container = document.getElementById('main-array-container');
const actionText = document.getElementById('action-text');
const codeDisplay = document.getElementById('code-display');
const codeTitle = document.getElementById('code-title');
const toastContainer = document.getElementById('toast-container');

const algoSelect = document.getElementById('algoSelect');
const customArrayInput = document.getElementById('customArrayInput');
const setArrayBtn = document.getElementById('setArrayBtn');
const randomArrayBtn = document.getElementById('randomArrayBtn');
const startBtn = document.getElementById('startBtn');
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');

// --- TABS ---
const tabBtns = document.querySelectorAll('.tab-btn');
const pages = document.querySelectorAll('.page');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        pages.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.getAttribute('data-target')).classList.add('active');
    });
});

// --- PSEUDO CODE TEMPLATES ---
const pseudoCodes = {
    bubble: [
        "function bubbleSort(arr):",
        "  n = length(arr)",
        "  for i from 0 to n-1:",
        "    for j from 0 to n-i-1:",
        "      if arr[j] > arr[j+1]:",
        "        swap(arr[j], arr[j+1])",
        "  return arr"
    ],
    insertion: [
        "function insertionSort(arr):",
        "  for i from 1 to length(arr)-1:",
        "    key = arr[i]",
        "    j = i - 1",
        "    while j >= 0 and arr[j] > key:",
        "      arr[j + 1] = arr[j]",
        "      j = j - 1",
        "    arr[j + 1] = key",
        "  return arr"
    ],
    quick: [
        "function quickSort(arr, low, high):",
        "  if low < high:",
        "    pi = partition(arr, low, high)",
        "    quickSort(arr, low, pi - 1)",
        "    quickSort(arr, pi + 1, high)",
        "",
        "function partition(arr, low, high):",
        "  pivot = arr[high]",
        "  i = low - 1",
        "  for j from low to high - 1:",
        "    if arr[j] < pivot:",
        "      i++",
        "      swap(arr[i], arr[j])",
        "  swap(arr[i + 1], arr[high])",
        "  return i + 1"
    ]
};

// --- INITIALIZATION & RENDERING ---

function loadCode(algo) {
    codeDisplay.innerHTML = '';
    const lines = pseudoCodes[algo];
    lines.forEach((line, index) => {
        const div = document.createElement('div');
        div.className = 'code-line';
        div.id = `line-${index}`;
        div.textContent = line;
        codeDisplay.appendChild(div);
    });
    codeTitle.innerText = algo.charAt(0).toUpperCase() + algo.slice(1) + " Sort";
}

function parseInputArray() {
    const val = customArrayInput.value;
    const parts = val.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    if (parts.length < 2) {
        alert("Please enter at least 2 valid numbers separated by commas.");
        return;
    }
    if (parts.length > 20) {
        alert("For best visualization, please keep the array size under 20.");
        return;
    }
    originalArray = parts;
    resetWorkspace();
}

function generateRandomArray() {
    originalArray = [];
    const size = Math.floor(Math.random() * 5) + 6; // 6 to 10 elements
    for(let i=0; i<size; i++){
        originalArray.push(Math.floor(Math.random() * 90) + 10);
    }
    customArrayInput.value = originalArray.join(', ');
    resetWorkspace();
}

function resetWorkspace() {
    currentArray = [...originalArray];
    renderArray();
    actionText.innerText = "Waiting to start...";
    actionText.style.color = "var(--text-main)";
    clearHighlights();
    toastContainer.innerHTML = '';
    
    // Reset start button
    isRunning = false;
    startBtn.disabled = false;
    startBtn.innerText = "▶️ Play Animation";
    
    algoSelect.disabled = false;
    setArrayBtn.disabled = false;
    randomArrayBtn.disabled = false;
}

function renderArray() {
    container.innerHTML = '';
    const maxVal = Math.max(...currentArray, 10); 
    
    for (let i = 0; i < currentArray.length; i++) {
        const val = currentArray[i];
        const heightPercent = (val / maxVal) * 90;
        
        const wrapper = document.createElement('div');
        wrapper.className = 'array-bar-wrapper';
        wrapper.id = `wrapper-${i}`;
        
        const bar = document.createElement('div');
        bar.className = 'large-array-bar';
        bar.id = `bar-${i}`;
        bar.style.height = `${Math.max(heightPercent, 15)}%`; 
        
        const valueText = document.createElement('div');
        valueText.className = 'bar-value';
        valueText.id = `val-${i}`;
        valueText.innerText = val;
        
        const indexText = document.createElement('div');
        indexText.className = 'bar-index';
        indexText.innerText = i;
        
        bar.appendChild(valueText);
        wrapper.appendChild(bar);
        wrapper.appendChild(indexText);
        
        container.appendChild(wrapper);
    }
}

// --- ANIMATION UTILS ---

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function highlightLine(lineNum) {
    clearHighlights();
    const el = document.getElementById(`line-${lineNum}`);
    if(el) {
        el.classList.add('highlight-line');
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function clearHighlights() {
    document.querySelectorAll('.code-line').forEach(el => el.classList.remove('highlight-line'));
}

function setAction(text, color = "var(--text-main)") {
    actionText.innerText = text;
    actionText.style.color = color;
}

function updateBar(index, value, color) {
    const bar = document.getElementById(`bar-${index}`);
    const valText = document.getElementById(`val-${index}`);
    
    if (bar && color !== null) bar.style.backgroundColor = color;
    
    if (bar && valText && value !== null) {
        valText.innerText = value;
        const maxVal = Math.max(...currentArray, 10);
        const heightPercent = (value / maxVal) * 90;
        bar.style.height = `${Math.max(heightPercent, 15)}%`;
    }
}

function showToast(message, type = 'true') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = message;
    toastContainer.appendChild(toast);
    
    // Auto remove after animation completes (2s total)
    setTimeout(() => {
        if(toast.parentElement) toast.remove();
    }, 2000);
}

// --- ALGORITHMS ---

async function runBubbleSort() {
    let arr = currentArray;
    let n = arr.length;
    
    highlightLine(0); setAction("Starting Bubble Sort", "var(--accent)"); await sleep(DELAY_MS);
    highlightLine(1); setAction(`Array length n = ${n}`); await sleep(DELAY_MS);
    
    for (let i = 0; i < n - 1; i++) {
        highlightLine(2); 
        setAction(`Outer loop i = ${i}`); 
        showToast(`i = ${i}`, 'increment');
        await sleep(DELAY_MS);
        if (!isRunning) return;

        for (let j = 0; j < n - i - 1; j++) {
            if (!isRunning) return;
            
            highlightLine(3); 
            setAction(`Inner loop j = ${j}`); 
            showToast(`j = ${j}`, 'increment');
            await sleep(DELAY_MS);
            
            highlightLine(4); 
            setAction(`Comparing arr[${j}] (${arr[j]}) and arr[${j+1}] (${arr[j+1]})`, "var(--warning)");
            updateBar(j, null, 'var(--bar-compare)');
            updateBar(j + 1, null, 'var(--bar-compare)');
            await sleep(DELAY_MS * 1.5);
            
            if (arr[j] > arr[j + 1]) {
                showToast(`True! ${arr[j]} > ${arr[j+1]}`, 'true');
                highlightLine(5);
                setAction(`${arr[j]} > ${arr[j+1]}, so we SWAP them!`, "var(--danger)");
                updateBar(j, null, 'var(--bar-swap)');
                updateBar(j + 1, null, 'var(--bar-swap)');
                await sleep(DELAY_MS);
                
                let temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
                
                updateBar(j, arr[j], null);
                updateBar(j + 1, arr[j + 1], null);
                await sleep(DELAY_MS);
            } else {
                showToast(`False`, 'false');
                setAction(`${arr[j]} is not > ${arr[j+1]}. No swap needed.`, "var(--text-muted)");
                await sleep(DELAY_MS);
            }
            
            updateBar(j, null, 'var(--bar-default)');
            updateBar(j + 1, null, 'var(--bar-default)');
        }
        setAction(`Pass complete. Element at index ${n - 1 - i} is sorted.`, "var(--success)");
        updateBar(n - 1 - i, null, 'var(--bar-sorted)');
        await sleep(DELAY_MS);
    }
    
    updateBar(0, null, 'var(--bar-sorted)');
    highlightLine(6); setAction("Array is fully sorted!", "var(--success)");
}

async function runInsertionSort() {
    let arr = currentArray;
    let n = arr.length;
    
    highlightLine(0); setAction("Starting Insertion Sort", "var(--accent)"); await sleep(DELAY_MS);
    
    updateBar(0, null, 'var(--bar-sorted)');
    setAction(`Index 0 (${arr[0]}) is considered sorted.`); await sleep(DELAY_MS);
    
    for (let i = 1; i < n; i++) {
        if (!isRunning) return;
        highlightLine(1); 
        setAction(`Outer loop i = ${i}`); 
        showToast(`i = ${i}`, 'increment');
        await sleep(DELAY_MS);
        
        let key = arr[i];
        highlightLine(2); setAction(`Key selected: ${key}`, "var(--warning)");
        updateBar(i, null, 'var(--bar-swap)');
        await sleep(DELAY_MS);
        
        let j = i - 1;
        highlightLine(3); 
        setAction(`Comparing with elements before index ${i}`); 
        showToast(`j = ${j}`, 'increment');
        await sleep(DELAY_MS);
        
        while (j >= 0 && arr[j] > key) {
            if (!isRunning) return;
            highlightLine(4); 
            showToast(`True: ${arr[j]} > ${key}`, 'true');
            setAction(`arr[${j}] (${arr[j]}) is > Key (${key}). We need to shift it right.`, "var(--warning)");
            updateBar(j, null, 'var(--bar-compare)');
            await sleep(DELAY_MS);
            
            highlightLine(5);
            arr[j + 1] = arr[j];
            updateBar(j + 1, arr[j + 1], 'var(--bar-default)'); 
            setAction(`Shifted ${arr[j]} to the right.`, "var(--danger)");
            await sleep(DELAY_MS);
            
            highlightLine(6);
            j = j - 1;
            showToast(`j-- -> ${j}`, 'increment');
            await sleep(DELAY_MS);
        }
        
        // Highlight while condition failing if j >= 0
        if(j >= 0) {
            highlightLine(4);
            showToast(`False: ${arr[j]} <= ${key}`, 'false');
            setAction(`${arr[j]} is not > Key (${key}). Loop ends.`, "var(--text-muted)");
            await sleep(DELAY_MS);
        } else {
            highlightLine(4);
            showToast(`False: j < 0`, 'false');
            setAction(`j is less than 0. Loop ends.`, "var(--text-muted)");
            await sleep(DELAY_MS);
        }
        
        highlightLine(7);
        arr[j + 1] = key;
        updateBar(j + 1, arr[j + 1], 'var(--bar-sorted)');
        setAction(`Inserted Key (${key}) into correct position at index ${j+1}`, "var(--success)");
        
        for(let k=0; k<=i; k++) updateBar(k, null, 'var(--bar-sorted)');
        await sleep(DELAY_MS);
    }
    
    highlightLine(8); setAction("Array is fully sorted!", "var(--success)");
}

async function runQuickSort() {
    highlightLine(0); setAction("Starting Quick Sort", "var(--accent)"); await sleep(DELAY_MS);
    await quickSortHelper(currentArray, 0, currentArray.length - 1);
    if(isRunning) {
        for(let i=0; i<currentArray.length; i++) updateBar(i, null, 'var(--bar-sorted)');
        setAction("Array is fully sorted!", "var(--success)");
        clearHighlights();
    }
}

async function quickSortHelper(arr, low, high) {
    if(!isRunning) return;
    highlightLine(1); setAction(`quickSort called on range [${low} to ${high}]`); await sleep(DELAY_MS);
    
    if (low < high) {
        showToast(`True: ${low} < ${high}`, 'true');
        highlightLine(2); setAction(`Finding pivot for range [${low} to ${high}]`); await sleep(DELAY_MS);
        let pi = await partition(arr, low, high);
        
        if(!isRunning) return;
        highlightLine(3); setAction(`Recursively sorting left of pivot [${low} to ${pi - 1}]`); await sleep(DELAY_MS);
        await quickSortHelper(arr, low, pi - 1);
        
        if(!isRunning) return;
        highlightLine(4); setAction(`Recursively sorting right of pivot [${pi + 1} to ${high}]`); await sleep(DELAY_MS);
        await quickSortHelper(arr, pi + 1, high);
    } else {
        showToast(`False`, 'false');
        if (low >= 0 && high >= 0 && low < arr.length && low === high) {
             updateBar(low, null, 'var(--bar-sorted)');
             setAction(`Element at index ${low} is trivially sorted.`, "var(--success)");
             await sleep(DELAY_MS);
        }
    }
}

async function partition(arr, low, high) {
    highlightLine(6); setAction(`Partitioning range [${low} to ${high}]`); await sleep(DELAY_MS);
    
    let pivot = arr[high];
    highlightLine(7); setAction(`Selected pivot: ${pivot} at index ${high}`, "var(--bar-pivot)");
    updateBar(high, null, 'var(--bar-pivot)');
    await sleep(DELAY_MS);
    
    let i = (low - 1);
    highlightLine(8); 
    setAction(`Tracking smaller elements with index i = ${i}`); 
    showToast(`i = ${i}`, 'increment');
    await sleep(DELAY_MS);

    for (let j = low; j <= high - 1; j++) {
        if (!isRunning) return;
        highlightLine(9); 
        setAction(`j = ${j}. Checking if arr[${j}] (${arr[j]}) < pivot (${pivot})`); 
        showToast(`j = ${j}`, 'increment');
        updateBar(j, null, 'var(--bar-compare)');
        await sleep(DELAY_MS);

        highlightLine(10);
        if (arr[j] < pivot) {
            showToast(`True!`, 'true');
            i++;
            highlightLine(11); 
            setAction(`Yes! ${arr[j]} < ${pivot}. Increment i to ${i}`, "var(--success)"); 
            showToast(`i++ -> ${i}`, 'increment');
            await sleep(DELAY_MS);
            
            highlightLine(12); setAction(`Swapping arr[${i}] and arr[${j}]`, "var(--danger)");
            updateBar(i, null, 'var(--bar-swap)');
            updateBar(j, null, 'var(--bar-swap)');
            await sleep(DELAY_MS);
            
            let temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
            
            updateBar(i, arr[i], null);
            updateBar(j, arr[j], null);
            await sleep(DELAY_MS);
        } else {
            showToast(`False`, 'false');
            setAction(`No, ${arr[j]} >= ${pivot}. Continuing.`, "var(--text-muted)");
            await sleep(DELAY_MS);
        }
        
        if(i !== j) updateBar(j, null, 'var(--bar-default)');
        if(i >= low && i !== high) updateBar(i, null, 'var(--bar-default)');
    }
    
    highlightLine(13); setAction(`Placing pivot ${pivot} into its correct sorted position by swapping with arr[${i+1}]`);
    updateBar(i + 1, null, 'var(--bar-swap)');
    updateBar(high, null, 'var(--bar-swap)');
    await sleep(DELAY_MS);
    
    let temp = arr[i + 1];
    arr[i + 1] = arr[high];
    arr[high] = temp;
    
    updateBar(i + 1, arr[i + 1], null);
    updateBar(high, arr[high], null);
    
    updateBar(i + 1, null, 'var(--bar-sorted)');
    setAction(`Pivot ${pivot} is now correctly placed at index ${i+1}.`, "var(--success)");
    
    highlightLine(14);
    await sleep(DELAY_MS);
    return (i + 1);
}

// --- EVENT LISTENERS ---

algoSelect.addEventListener('change', (e) => {
    if(isRunning) return;
    currentAlgo = e.target.value;
    loadCode(currentAlgo);
    resetWorkspace();
});

setArrayBtn.addEventListener('click', () => {
    if(isRunning) return;
    parseInputArray();
});

randomArrayBtn.addEventListener('click', () => {
    if(isRunning) return;
    generateRandomArray();
});

speedSlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    DELAY_MS = 1510 - (val * 15); 
    
    if(val < 30) speedValue.innerText = "Slow (Educational)";
    else if(val < 70) speedValue.innerText = "Normal";
    else speedValue.innerText = "Fast (Overview)";
});

startBtn.addEventListener('click', async () => {
    if (isRunning) {
        isRunning = false;
        resetWorkspace();
        return;
    }
    
    isRunning = true;
    startBtn.innerText = "⏹️ Stop / Reset";
    algoSelect.disabled = true;
    setArrayBtn.disabled = true;
    randomArrayBtn.disabled = true;
    
    currentArray = [...originalArray];
    renderArray();
    
    if (currentAlgo === 'bubble') await runBubbleSort();
    else if (currentAlgo === 'insertion') await runInsertionSort();
    else if (currentAlgo === 'quick') await runQuickSort();
    
    if (isRunning) {
        isRunning = false;
        startBtn.innerText = "🔄 Reset Workspace";
        algoSelect.disabled = false;
        setArrayBtn.disabled = false;
        randomArrayBtn.disabled = false;
    }
});

// INIT
window.onload = () => {
    loadCode('bubble');
    resetWorkspace();
    const val = parseInt(speedSlider.value);
    DELAY_MS = 1510 - (val * 15);
};
