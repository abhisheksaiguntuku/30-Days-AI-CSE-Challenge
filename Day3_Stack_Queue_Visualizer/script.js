// --- TAB LOGIC ---
const tabBtns = document.querySelectorAll('.tab-btn');
const slides = document.querySelectorAll('.slide');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all
        tabBtns.forEach(b => b.classList.remove('active'));
        slides.forEach(s => s.classList.remove('active-slide'));
        
        // Add to clicked
        btn.classList.add('active');
        document.getElementById(btn.dataset.target).classList.add('active-slide');
    });
});

// --- GLOBALS ---
const MAX_SIZE = 6;
let DELAY_MS = 600;
let isRunning = false;

const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');
speedSlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    DELAY_MS = 1200 - (val * 10);
    if(val < 30) speedValue.innerText = "Slow";
    else if(val < 70) speedValue.innerText = "Normal";
    else speedValue.innerText = "Fast";
});

const toastContainer = document.getElementById('toast-container');
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = message;
    toastContainer.appendChild(toast);
    setTimeout(() => { if (toast.parentElement) toast.remove(); }, 3000);
}

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

function highlightCode(containerId, lineNum) {
    const container = document.getElementById(containerId);
    container.querySelectorAll(`.code-line`).forEach(el => el.classList.remove('highlight-line'));
    const el = document.getElementById(`${containerId}-line-${lineNum}`);
    if (el) { el.classList.add('highlight-line'); }
}

function loadCode(containerId, lines) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    lines.forEach((line, index) => {
        const div = document.createElement('div');
        div.className = 'code-line';
        div.id = `${containerId}-line-${index}`;
        div.textContent = line;
        container.appendChild(div);
    });
}

// --- STACK IMPLEMENTATION ---
const stack = [];
const stackBucket = document.querySelector('.stack-bucket');
const stackInput = document.getElementById('stackInput');
const stackEmptyText = document.getElementById('stack-empty');

const stackCodes = {
    push: [
        "function push(element):",
        "  if stack.length == MAX_SIZE:",
        "    return OVERFLOW",
        "  top = top + 1",
        "  stack[top] = element"
    ],
    pop: [
        "function pop():",
        "  if stack.length == 0:",
        "    return UNDERFLOW",
        "  element = stack[top]",
        "  top = top - 1",
        "  return element"
    ],
    peek: [
        "function peek():",
        "  if stack.length == 0:",
        "    return null",
        "  return stack[top]"
    ]
};

function renderStack() {
    // Clear old elements but keep empty text
    const elements = stackBucket.querySelectorAll('.ds-element');
    elements.forEach(e => e.remove());
    
    // Remove old pointer
    const oldPtr = stackBucket.querySelector('.top-ptr');
    if (oldPtr) oldPtr.remove();

    if (stack.length === 0) {
        stackEmptyText.style.display = 'block';
        return;
    }
    
    stackEmptyText.style.display = 'none';

    // Because bucket is column-reverse, we append them in normal order 0..length-1
    for (let i = 0; i < stack.length; i++) {
        const el = document.createElement('div');
        el.className = 'ds-element stack-element';
        el.id = `stack-el-${i}`;
        el.innerText = stack[i];
        
        // If it's the top element, attach the Top pointer
        if (i === stack.length - 1) {
            const ptr = document.createElement('div');
            ptr.className = 'ptr-label top-ptr';
            ptr.innerText = `Top (${i})`;
            el.appendChild(ptr);
        }
        
        stackBucket.appendChild(el);
    }
}

async function stackPush() {
    if (isRunning) return;
    
    let valStr = stackInput.value;
    if (!valStr) { valStr = Math.floor(Math.random() * 100); stackInput.value = valStr; }
    
    isRunning = true;
    loadCode('stack-code', stackCodes.push);
    highlightCode('stack-code', 0);
    await sleep(DELAY_MS);

    highlightCode('stack-code', 1);
    if (stack.length >= MAX_SIZE) {
        highlightCode('stack-code', 2);
        showToast("Stack Overflow! Maximum size (6) reached.", "danger");
        await sleep(DELAY_MS);
        isRunning = false;
        return;
    }
    await sleep(DELAY_MS);

    highlightCode('stack-code', 3);
    const newTopIndex = stack.length;
    showToast(`Top moves to index ${newTopIndex}`, "info");
    await sleep(DELAY_MS);

    highlightCode('stack-code', 4);
    stack.push(valStr);
    renderStack();
    
    // Animate the newly added element
    const newEl = document.getElementById(`stack-el-${newTopIndex}`);
    if (newEl) newEl.classList.add('push-anim', 'element-new');
    
    await sleep(DELAY_MS);
    if (newEl) newEl.classList.remove('element-new');
    
    isRunning = false;
}

async function stackPop() {
    if (isRunning) return;
    
    isRunning = true;
    loadCode('stack-code', stackCodes.pop);
    highlightCode('stack-code', 0);
    await sleep(DELAY_MS);

    highlightCode('stack-code', 1);
    if (stack.length === 0) {
        highlightCode('stack-code', 2);
        showToast("Stack Underflow! Stack is already empty.", "danger");
        await sleep(DELAY_MS);
        isRunning = false;
        return;
    }
    await sleep(DELAY_MS);

    highlightCode('stack-code', 3);
    const topIndex = stack.length - 1;
    const targetEl = document.getElementById(`stack-el-${topIndex}`);
    if (targetEl) targetEl.classList.add('element-active');
    showToast(`Grabbing element ${stack[topIndex]}`, "info");
    await sleep(DELAY_MS);

    highlightCode('stack-code', 4);
    if (targetEl) {
        targetEl.classList.remove('element-active');
        targetEl.classList.add('pop-anim');
    }
    showToast(`Top moves down to index ${topIndex - 1}`, "info");
    await sleep(DELAY_MS);

    highlightCode('stack-code', 5);
    stack.pop();
    renderStack();
    
    isRunning = false;
}

async function stackPeek() {
    if (isRunning) return;
    isRunning = true;
    loadCode('stack-code', stackCodes.peek);
    
    highlightCode('stack-code', 1);
    if (stack.length === 0) {
        highlightCode('stack-code', 2);
        showToast("Stack is empty. Nothing to peek.", "danger");
        await sleep(DELAY_MS);
        isRunning = false; return;
    }
    await sleep(DELAY_MS);

    highlightCode('stack-code', 3);
    const topIndex = stack.length - 1;
    const targetEl = document.getElementById(`stack-el-${topIndex}`);
    if (targetEl) targetEl.classList.add('element-active');
    showToast(`Top element is ${stack[topIndex]}`, "info");
    
    await sleep(DELAY_MS * 1.5);
    if (targetEl) targetEl.classList.remove('element-active');
    
    isRunning = false;
}

document.getElementById('pushBtn').addEventListener('click', stackPush);
document.getElementById('popBtn').addEventListener('click', stackPop);
document.getElementById('peekStackBtn').addEventListener('click', stackPeek);


// --- QUEUE IMPLEMENTATION ---
const queue = [];
const queueBucket = document.querySelector('.queue-bucket');
const queueInput = document.getElementById('queueInput');
const queueEmptyText = document.getElementById('queue-empty');

const queueCodes = {
    enqueue: [
        "function enqueue(element):",
        "  if queue.length == MAX_SIZE:",
        "    return OVERFLOW",
        "  rear = rear + 1",
        "  queue[rear] = element"
    ],
    dequeue: [
        "function dequeue():",
        "  if queue.length == 0:",
        "    return UNDERFLOW",
        "  element = queue[front]",
        "  shift_all_elements_left()",
        "  rear = rear - 1",
        "  return element"
    ],
    peek: [
        "function peek():",
        "  if queue.length == 0:",
        "    return null",
        "  return queue[front]"
    ]
};

function renderQueue() {
    const elements = queueBucket.querySelectorAll('.ds-element');
    elements.forEach(e => e.remove());
    
    queueBucket.querySelectorAll('.ptr-label').forEach(e => e.remove());

    if (queue.length === 0) {
        queueEmptyText.style.display = 'block';
        return;
    }
    
    queueEmptyText.style.display = 'none';

    // Bucket is flex-row, so appending maps left to right
    for (let i = 0; i < queue.length; i++) {
        const el = document.createElement('div');
        el.className = 'ds-element queue-element';
        el.id = `queue-el-${i}`;
        el.innerText = queue[i];
        
        // Pointers
        if (i === 0) {
            const ptr = document.createElement('div');
            ptr.className = 'ptr-label front-ptr';
            ptr.innerText = `Front (0)`;
            el.appendChild(ptr);
        }
        
        if (i === queue.length - 1) {
            const ptr = document.createElement('div');
            ptr.className = 'ptr-label rear-ptr';
            ptr.innerText = `Rear (${i})`;
            el.appendChild(ptr);
        }
        
        queueBucket.appendChild(el);
    }
}

async function queueEnqueue() {
    if (isRunning) return;
    
    let valStr = queueInput.value;
    if (!valStr) { valStr = Math.floor(Math.random() * 100); queueInput.value = valStr; }
    
    isRunning = true;
    loadCode('queue-code', queueCodes.enqueue);
    highlightCode('queue-code', 0);
    await sleep(DELAY_MS);

    highlightCode('queue-code', 1);
    if (queue.length >= MAX_SIZE) {
        highlightCode('queue-code', 2);
        showToast("Queue Overflow! Maximum size (6) reached.", "danger");
        await sleep(DELAY_MS);
        isRunning = false;
        return;
    }
    await sleep(DELAY_MS);

    highlightCode('queue-code', 3);
    const newRearIndex = queue.length;
    showToast(`Rear moves to index ${newRearIndex}`, "info");
    await sleep(DELAY_MS);

    highlightCode('queue-code', 4);
    queue.push(valStr);
    renderQueue();
    
    // Animate insertion
    const newEl = document.getElementById(`queue-el-${newRearIndex}`);
    if (newEl) newEl.classList.add('enqueue-anim', 'element-new');
    
    await sleep(DELAY_MS);
    if (newEl) newEl.classList.remove('element-new');
    
    isRunning = false;
}

async function queueDequeue() {
    if (isRunning) return;
    
    isRunning = true;
    loadCode('queue-code', queueCodes.dequeue);
    highlightCode('queue-code', 0);
    await sleep(DELAY_MS);

    highlightCode('queue-code', 1);
    if (queue.length === 0) {
        highlightCode('queue-code', 2);
        showToast("Queue Underflow! Queue is already empty.", "danger");
        await sleep(DELAY_MS);
        isRunning = false;
        return;
    }
    await sleep(DELAY_MS);

    highlightCode('queue-code', 3);
    const targetEl = document.getElementById(`queue-el-0`);
    if (targetEl) targetEl.classList.add('element-active');
    showToast(`Grabbing front element ${queue[0]}`, "info");
    await sleep(DELAY_MS);

    highlightCode('queue-code', 4);
    if (targetEl) {
        targetEl.classList.remove('element-active');
        targetEl.classList.add('dequeue-anim');
    }
    showToast(`Shifting all elements left...`, "info");
    await sleep(DELAY_MS);
    
    highlightCode('queue-code', 5);
    showToast(`Rear updates to ${queue.length - 2}`, "info");
    await sleep(DELAY_MS);

    highlightCode('queue-code', 6);
    queue.shift();
    renderQueue();
    
    isRunning = false;
}

async function queuePeek() {
    if (isRunning) return;
    isRunning = true;
    loadCode('queue-code', queueCodes.peek);
    
    highlightCode('queue-code', 1);
    if (queue.length === 0) {
        highlightCode('queue-code', 2);
        showToast("Queue is empty. Nothing to peek.", "danger");
        await sleep(DELAY_MS);
        isRunning = false; return;
    }
    await sleep(DELAY_MS);

    highlightCode('queue-code', 3);
    const targetEl = document.getElementById(`queue-el-0`);
    if (targetEl) targetEl.classList.add('element-active');
    showToast(`Front element is ${queue[0]}`, "info");
    
    await sleep(DELAY_MS * 1.5);
    if (targetEl) targetEl.classList.remove('element-active');
    
    isRunning = false;
}

document.getElementById('enqueueBtn').addEventListener('click', queueEnqueue);
document.getElementById('dequeueBtn').addEventListener('click', queueDequeue);
document.getElementById('peekQueueBtn').addEventListener('click', queuePeek);

// Init
window.onload = () => {
    renderStack();
    renderQueue();
};
