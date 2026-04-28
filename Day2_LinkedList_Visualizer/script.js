// State
let listType = 'sll'; // sll, dll, cll
let nodes = [10, 20, 30, 40, 50]; 
let isRunning = false;
let DELAY_MS = 600;
let hasCycle = false;
let isReversed = false;

// DOM Elements
const container = document.getElementById('main-ll-container');
const circularArrowSvg = document.getElementById('circular-arrow');
const circularPath = document.getElementById('circular-path');
const toastContainer = document.getElementById('toast-container');
const actionText = document.getElementById('action-text');

const listTypeSelect = document.getElementById('listTypeSelect');
const valueInput = document.getElementById('valueInput');
const newValueInput = document.getElementById('newValueInput');
const indexInput = document.getElementById('indexInput');
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');

// Code Panels
const codeAddDisplay = document.getElementById('code-add-display');
const codeRemoveDisplay = document.getElementById('code-remove-display');
const codeAdvDisplay = document.getElementById('code-adv-display');

// Buttons
const btnSelectors = ['addFirstBtn', 'addMiddleBtn', 'addLastBtn', 'removeFirstBtn', 'removeMiddleBtn', 'removeLastBtn', 'reverseBtn', 'findMiddleBtn', 'searchUpdateBtn', 'removeDuplicatesBtn', 'createCycleBtn', 'detectCycleBtn'];
const btns = {};
btnSelectors.forEach(id => btns[id] = document.getElementById(id));

// --- PSEUDO CODES ---
const codes = {
    sll: {
        add: {
            first: ["newNode = Node(data)", "newNode.next = head", "head = newNode"],
            middle: ["newNode = Node(data)", "curr = head", "for i = 0 to index - 1:", "  curr = curr.next", "newNode.next = curr.next", "curr.next = newNode"],
            last: ["newNode = Node(data)", "if head == null: head = newNode", "curr = head", "while curr.next != null: curr = curr.next", "curr.next = newNode"]
        },
        remove: {
            first: ["if head == null: return", "temp = head", "head = head.next", "delete temp"],
            middle: ["if head == null: return", "curr = head", "for i = 0 to index - 1:", "  curr = curr.next", "temp = curr.next", "curr.next = temp.next", "delete temp"],
            last: ["if head == null: return", "curr = head", "while curr.next.next != null: curr = curr.next", "temp = curr.next", "curr.next = null", "delete temp"]
        },
        advanced: {
            reverse: ["prev = null", "curr = head", "while curr != null:", "  nextTemp = curr.next", "  curr.next = prev", "  prev = curr", "  curr = nextTemp", "head = prev"],
            findMiddle: ["slow = head", "fast = head", "while fast != null and fast.next != null:", "  slow = slow.next", "  fast = fast.next.next", "return slow"],
            searchUpdate: ["curr = head", "while curr != null:", "  if curr.data == target:", "    curr.data = newValue", "    return true", "  curr = curr.next", "return false"],
            removeDuplicates: ["curr = head", "while curr != null:", "  runner = curr", "  while runner.next != null:", "    if runner.next.data == curr.data:", "      temp = runner.next", "      runner.next = runner.next.next", "      delete temp", "    else: runner = runner.next", "  curr = curr.next"],
            detectCycle: ["slow = head", "fast = head", "while fast != null and fast.next != null:", "  slow = slow.next", "  fast = fast.next.next", "  if slow == fast: return true", "return false"]
        }
    },
    dll: {
        add: {
            first: ["newNode = Node(data)", "newNode.next = head", "if head != null: head.prev = newNode", "head = newNode"],
            middle: ["newNode = Node(data)", "curr = head", "for i = 0 to index - 1: curr = curr.next", "newNode.next = curr.next", "newNode.prev = curr", "if curr.next != null: curr.next.prev = newNode", "curr.next = newNode"],
            last: ["newNode = Node(data)", "if head == null: head = newNode", "curr = head", "while curr.next != null: curr = curr.next", "curr.next = newNode", "newNode.prev = curr"]
        },
        remove: {
            first: ["if head == null: return", "temp = head", "head = head.next", "if head != null: head.prev = null", "delete temp"],
            middle: ["if head == null: return", "curr = head", "for i = 0 to index - 1: curr = curr.next", "temp = curr.next", "curr.next = temp.next", "if temp.next != null: temp.next.prev = curr", "delete temp"],
            last: ["if head == null: return", "curr = head", "while curr.next != null: curr = curr.next", "curr.prev.next = null", "delete curr"]
        },
        advanced: {
            reverse: ["temp = null", "curr = head", "while curr != null:", "  temp = curr.prev", "  curr.prev = curr.next", "  curr.next = temp", "  curr = curr.prev // move to next node", "if temp != null: head = temp.prev"],
            findMiddle: ["slow = head", "fast = head", "while fast != null and fast.next != null:", "  slow = slow.next", "  fast = fast.next.next", "return slow"],
            searchUpdate: ["curr = head", "while curr != null:", "  if curr.data == target:", "    curr.data = newValue", "    return true", "  curr = curr.next", "return false"],
            removeDuplicates: ["curr = head", "while curr != null:", "  runner = curr", "  while runner.next != null:", "    if runner.next.data == curr.data:", "      temp = runner.next", "      runner.next = runner.next.next", "      if runner.next != null: runner.next.prev = runner", "      delete temp", "    else: runner = runner.next", "  curr = curr.next"],
            detectCycle: ["slow = head", "fast = head", "while fast != null and fast.next != null:", "  slow = slow.next", "  fast = fast.next.next", "  if slow == fast: return true", "return false"]
        }
    },
    cll: {
        add: {
            first: ["newNode = Node(data)", "if head == null: head = newNode; newNode.next = head", "curr = head", "while curr.next != head: curr = curr.next", "newNode.next = head", "curr.next = newNode", "head = newNode"],
            middle: ["newNode = Node(data)", "curr = head", "for i = 0 to index - 1: curr = curr.next", "newNode.next = curr.next", "curr.next = newNode"],
            last: ["newNode = Node(data)", "if head == null: head = newNode; newNode.next = head", "curr = head", "while curr.next != head: curr = curr.next", "curr.next = newNode", "newNode.next = head"]
        },
        remove: {
            first: ["if head == null: return", "curr = head", "while curr.next != head: curr = curr.next", "temp = head", "head = head.next", "curr.next = head", "delete temp"],
            middle: ["if head == null: return", "curr = head", "for i = 0 to index - 1: curr = curr.next", "temp = curr.next", "curr.next = temp.next", "delete temp"],
            last: ["if head == null: return", "curr = head", "while curr.next.next != head: curr = curr.next", "temp = curr.next", "curr.next = head", "delete temp"]
        },
        advanced: {
            reverse: ["if head == null: return", "prev = head", "curr = head.next", "head.next = null", "while curr != head:", "  nextTemp = curr.next", "  curr.next = prev", "  prev = curr", "  curr = nextTemp", "head.next = prev", "head = prev"],
            findMiddle: ["slow = head", "fast = head", "while fast.next != head and fast.next.next != head:", "  slow = slow.next", "  fast = fast.next.next", "return slow"],
            searchUpdate: ["if head == null: return false", "curr = head", "do:", "  if curr.data == target:", "    curr.data = newValue", "    return true", "  curr = curr.next", "while curr != head", "return false"],
            removeDuplicates: ["if head == null: return", "curr = head", "do:", "  runner = curr", "  while runner.next != head:", "    if runner.next.data == curr.data:", "      temp = runner.next", "      runner.next = runner.next.next", "      delete temp", "    else: runner = runner.next", "  curr = curr.next", "while curr != head"],
            detectCycle: ["// CLL inherently has a cycle.", "slow = head", "fast = head", "while fast != null and fast.next != null:", "  slow = slow.next", "  fast = fast.next.next", "  if slow == fast: return true", "return false"]
        }
    }
};

// --- RENDER & INIT ---

function loadCode(type, opGroup, targetPanel) {
    targetPanel.innerHTML = '';
    const group = codes[listType][type][opGroup];
    group.forEach((line, index) => {
        const div = document.createElement('div');
        div.className = 'code-line';
        div.id = `${type}-line-${index}`;
        div.textContent = line;
        targetPanel.appendChild(div);
    });
}

function updateWorkspace() {
    isReversed = false;
    hasCycle = false;
    renderList();
    loadCode('add', 'last', codeAddDisplay); 
    loadCode('remove', 'last', codeRemoveDisplay);
    codeAdvDisplay.innerHTML = '<div class="code-line" style="color: var(--text-muted)">Select an advanced operation to view logic.</div>';
}

function renderList() {
    container.innerHTML = '';
    circularArrowSvg.style.display = 'none';

    if (nodes.length === 0) {
        container.innerHTML = '<div class="null-ptr">List is Empty (Head = Null)</div>';
        return;
    }

    // If reversed, SLL logic still flows left to right on screen, but visually arrows point backward.
    // Or we reverse the DOM elements for simplicity if it's permanently reversed.
    // Let's just render left to right and use css to flip arrows.
    let displayNodes = isReversed ? [...nodes].reverse() : nodes;

    // Optional: add a null pointer to the left if SLL is reversed
    if ((listType === 'sll' || listType === 'dll') && isReversed) {
        const nullPtr = document.createElement('div');
        nullPtr.className = 'null-ptr left';
        nullPtr.innerText = 'NULL ←';
        container.appendChild(nullPtr);
    }

    for (let i = 0; i < displayNodes.length; i++) {
        const actualIndex = isReversed ? displayNodes.length - 1 - i : i;
        
        const wrapper = document.createElement('div');
        wrapper.className = 'll-node-wrapper';
        wrapper.id = `node-${actualIndex}`; // IDs still map to logic index

        const label = document.createElement('div');
        label.className = 'node-label';
        
        if (actualIndex === 0) {
            label.innerText = 'HEAD (0)';
            label.classList.add('node-head-label');
        } else if (actualIndex === nodes.length - 1) {
            label.innerText = `TAIL (${actualIndex})`;
            label.classList.add('node-tail-label');
        } else {
            label.innerText = `Index: ${actualIndex}`;
        }
        wrapper.appendChild(label);

        const nodeDiv = document.createElement('div');
        nodeDiv.className = 'll-node';

        if (listType === 'dll') {
            const prevPtr = document.createElement('div');
            prevPtr.className = 'node-prev-ptr';
            prevPtr.innerText = isReversed ? 'next' : 'prev';
            nodeDiv.appendChild(prevPtr);
        }

        const dataDiv = document.createElement('div');
        dataDiv.className = 'node-data';
        dataDiv.innerText = displayNodes[i];
        nodeDiv.appendChild(dataDiv);

        const nextPtr = document.createElement('div');
        nextPtr.className = 'node-ptr';
        nextPtr.innerText = isReversed && listType === 'dll' ? 'prev' : 'next';
        nodeDiv.appendChild(nextPtr);

        wrapper.appendChild(nodeDiv);
        container.appendChild(wrapper);

        // Draw Pointer Between Nodes
        if (i < displayNodes.length - 1) {
            const ptrContainer = document.createElement('div');
            ptrContainer.className = 'll-pointer-container';
            ptrContainer.id = `ptr-${actualIndex}`; // Pointer from this node to next (or prev if reversed)
            
            const arrow = document.createElement('div');
            arrow.className = 'll-arrow';
            if (listType === 'dll') arrow.classList.add('doubly-prev');
            if (isReversed && listType === 'sll') arrow.classList.add('reversed-arrow');
            
            ptrContainer.appendChild(arrow);
            container.appendChild(ptrContainer);
        }
    }

    if ((listType === 'sll' || listType === 'dll') && !isReversed) {
        const nullPtr = document.createElement('div');
        nullPtr.className = 'null-ptr';
        nullPtr.innerText = '→ NULL';
        container.appendChild(nullPtr);
    } else if (listType === 'cll' && nodes.length > 0) {
        drawCircularArrow();
    }
    
    if (hasCycle) {
        drawCycleArrow();
    }
}

function drawCircularArrow() {
    circularArrowSvg.style.display = 'block';
    setTimeout(() => {
        const headNode = document.getElementById('node-0');
        const tailNode = document.getElementById(`node-${nodes.length - 1}`);
        if (!headNode || !tailNode) return;

        const headRect = headNode.getBoundingClientRect();
        const tailRect = tailNode.getBoundingClientRect();
        const svgRect = circularArrowSvg.getBoundingClientRect();

        const startX = tailRect.right - svgRect.left;
        const startY = tailRect.top + (tailRect.height / 2) - svgRect.top;
        const endX = headRect.left + (headRect.width / 2) - svgRect.left;
        const endY = headRect.top - svgRect.top;

        const curveOffset = 60;
        const path = `M ${startX} ${startY} C ${startX + curveOffset} ${startY}, ${endX} ${startY + curveOffset + 50}, ${endX} ${endY - 10}`;
        circularPath.setAttribute('d', path);
        circularPath.classList.remove('circular-path-active');
    }, 50);
}

function drawCycleArrow() {
    // Draws a cycle from tail to index 1 (or 0 if len < 2)
    circularArrowSvg.style.display = 'block';
    setTimeout(() => {
        const targetIdx = nodes.length > 2 ? 1 : 0;
        const targetNode = document.getElementById(`node-${targetIdx}`);
        const tailNode = document.getElementById(`node-${nodes.length - 1}`);
        if (!targetNode || !tailNode) return;

        const tRect = targetNode.getBoundingClientRect();
        const tailRect = tailNode.getBoundingClientRect();
        const svgRect = circularArrowSvg.getBoundingClientRect();

        const startX = tailRect.right - svgRect.left;
        const startY = tailRect.top + (tailRect.height / 2) - svgRect.top;
        const endX = tRect.left + (tRect.width / 2) - svgRect.left;
        const endY = tRect.bottom - svgRect.top; // Point to bottom

        const path = `M ${startX} ${startY} C ${startX + 50} ${startY + 80}, ${endX} ${startY + 80}, ${endX} ${endY + 10}`;
        circularPath.setAttribute('d', path);
        circularPath.classList.add('circular-path-active');
    }, 50);
}

// --- ANIMATION UTILS ---

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

function highlightCode(type, lineNum) {
    document.querySelectorAll(`.code-line`).forEach(el => el.classList.remove('highlight-line'));
    const el = document.getElementById(`${type}-line-${lineNum}`);
    if (el) {
        el.classList.add('highlight-line');
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function setAction(text, color = "var(--text-main)") {
    actionText.innerText = text;
    actionText.style.color = color;
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = message;
    toastContainer.appendChild(toast);
    setTimeout(() => { if (toast.parentElement) toast.remove(); }, 2000);
}

function setNodeActive(index, state = 'active') { // active, slow, fast, found, none
    const node = document.getElementById(`node-${index}`);
    if (node) {
        const el = node.querySelector('.ll-node');
        el.classList.remove('active', 'node-slow', 'node-fast', 'found');
        if (state !== 'none') el.classList.add(state);
    }
}

function setPointerActive(index, state = 'active') { 
    const ptr = document.getElementById(`ptr-${index}`);
    if (ptr) {
        const arrow = ptr.querySelector('.ll-arrow');
        arrow.className = 'll-arrow';
        if (listType === 'dll') arrow.classList.add('doubly-prev');
        if (isReversed && listType === 'sll') arrow.classList.add('reversed-arrow');
        if (state !== 'default') arrow.classList.add(state);
    }
}

function updateNodeData(index, val) {
    const node = document.getElementById(`node-${index}`);
    if (node) {
        const dataDiv = node.querySelector('.node-data');
        dataDiv.innerText = val;
        dataDiv.classList.add('updated');
        setTimeout(() => dataDiv.classList.remove('updated'), 1000);
    }
}

// --- BASIC OPERATIONS ---
// Basic ops (Add/Remove) follow similar logic to what was implemented, but for brevity here, I'll implement a clean general traverse + splice.
async function basicOperation(type, position) {
    if (isRunning) return;
    if (type === 'remove' && nodes.length === 0) { alert("List is empty!"); return; }
    
    let index = position === 'first' ? 0 : (position === 'last' ? (type === 'add' ? nodes.length : nodes.length - 1) : parseInt(indexInput.value));
    if (position === 'middle' && (isNaN(index) || index < 1 || index > nodes.length - (type === 'remove' ? 2 : 1))) {
        alert("Invalid middle index."); return;
    }

    isRunning = true; disableControls();
    loadCode(type, position, type === 'add' ? codeAddDisplay : codeRemoveDisplay);
    
    let val = type === 'add' ? parseInt(valueInput.value) || Math.floor(Math.random()*100) : null;
    setAction(`${type === 'add' ? 'Adding' : 'Removing'} at index ${index}...`, type === 'add' ? "var(--accent)" : "var(--danger)");
    await sleep(DELAY_MS);

    // Simulate traversal
    let stopIdx = type === 'add' ? index - 1 : index;
    if (position === 'last' && type === 'remove') stopIdx = nodes.length - 2;
    if (position !== 'first') {
        highlightCode(type, 1); setAction("Traversing list...");
        for (let i = 0; i <= stopIdx; i++) {
            setNodeActive(i, 'active'); showToast(`curr = index ${i}`); await sleep(DELAY_MS);
            if (i < stopIdx) { setPointerActive(i, 'active'); await sleep(DELAY_MS); setNodeActive(i, 'none'); setPointerActive(i, 'default'); }
        }
    }

    highlightCode(type, position === 'first' ? 2 : 4);
    setAction(type === 'add' ? "Hooking up new pointers..." : "Severing pointers...", "var(--warning)");
    if(type === 'remove') document.getElementById(`node-${index}`).querySelector('.ll-node').classList.add('delete');
    showToast(type === 'add' ? `Inserted!` : `Deleted!`, type === 'add' ? 'success' : 'danger');
    await sleep(DELAY_MS * 1.5);

    if (type === 'add') nodes.splice(index, 0, val); else nodes.splice(index, 1);
    renderList();
    
    if(type === 'add') {
        const newEl = document.getElementById(`node-${index}`).querySelector('.ll-node');
        newEl.classList.add('new'); await sleep(DELAY_MS); newEl.classList.remove('new');
    }
    
    setAction("Operation complete.", "var(--success)");
    enableControls(); isRunning = false;
}

// --- ADVANCED OPERATIONS ---

async function runReverse() {
    if (isRunning) return; isRunning = true; disableControls();
    loadCode('advanced', 'reverse', codeAdvDisplay);
    setAction("Reversing List Pointers...", "var(--purple)");
    hasCycle = false; // Breaking cycle if any
    await sleep(DELAY_MS);

    highlightCode('advanced', 1);
    for (let i = 0; i < nodes.length; i++) {
        setNodeActive(i, 'active'); showToast(`curr = index ${i}`); await sleep(DELAY_MS);
        
        highlightCode('advanced', 4);
        setAction("Flipping pointer direction", "var(--warning)");
        if (i < nodes.length - 1) setPointerActive(i, 'active');
        await sleep(DELAY_MS);
        
        // Visually we just do it per node
        setNodeActive(i, 'none');
    }

    highlightCode('advanced', 7);
    isReversed = !isReversed;
    nodes.reverse(); // logically reverse
    renderList();
    setAction("List successfully reversed!", "var(--success)");
    showToast("Reversed!", "purple");
    await sleep(DELAY_MS);

    enableControls(); isRunning = false;
}

async function runFindMiddle() {
    if (isRunning) return; isRunning = true; disableControls();
    loadCode('advanced', 'findMiddle', codeAdvDisplay);
    setAction("Finding Middle using Fast/Slow Pointers...", "var(--purple)");
    await sleep(DELAY_MS);

    highlightCode('advanced', 0);
    let slow = 0; let fast = 0;
    setNodeActive(slow, 'node-slow'); setNodeActive(fast, 'node-fast');
    showToast("slow=0, fast=0", "info");
    await sleep(DELAY_MS);

    while (fast < nodes.length - 1 && fast + 1 < nodes.length) {
        highlightCode('advanced', 2);
        
        setNodeActive(slow, 'none'); setNodeActive(fast, 'none');
        slow += 1; fast += 2;
        
        highlightCode('advanced', 3);
        setNodeActive(slow, 'node-slow'); showToast(`slow = ${slow}`); await sleep(DELAY_MS);
        
        highlightCode('advanced', 4);
        if(fast >= nodes.length) fast = nodes.length - 1; // Cap it visually
        setNodeActive(fast, 'node-fast'); showToast(`fast = ${fast}`); await sleep(DELAY_MS);
    }

    highlightCode('advanced', 5);
    setNodeActive(fast, 'none');
    setNodeActive(slow, 'found');
    setAction(`Middle found at index ${slow}! Data: ${nodes[slow]}`, "var(--success)");
    await sleep(DELAY_MS*2);
    setNodeActive(slow, 'none');

    enableControls(); isRunning = false;
}

async function runSearchUpdate() {
    if (isRunning) return; 
    let target = parseInt(valueInput.value);
    let newVal = parseInt(newValueInput.value);
    if(isNaN(target) || isNaN(newVal)) { alert("Enter both Value to Search and New Value to Update."); return; }

    isRunning = true; disableControls();
    loadCode('advanced', 'searchUpdate', codeAdvDisplay);
    setAction(`Searching for ${target}...`, "var(--purple)");
    await sleep(DELAY_MS);

    let found = false;
    for (let i = 0; i < nodes.length; i++) {
        highlightCode('advanced', 1);
        setNodeActive(i, 'active'); showToast(`curr = ${nodes[i]}`); await sleep(DELAY_MS);
        
        highlightCode('advanced', 2);
        if (nodes[i] === target) {
            found = true;
            setAction(`Target found! Updating to ${newVal}`, "var(--success)");
            highlightCode('advanced', 3);
            setNodeActive(i, 'found');
            await sleep(DELAY_MS);
            
            nodes[i] = newVal;
            updateNodeData(i, newVal);
            showToast("Updated!", "success");
            await sleep(DELAY_MS*2);
            setNodeActive(i, 'none');
            break;
        }
        setNodeActive(i, 'none');
    }

    if(!found) { highlightCode('advanced', 6); setAction(`Value ${target} not found in list.`, "var(--danger)"); }

    enableControls(); isRunning = false;
}

async function runRemoveDuplicates() {
    if (isRunning) return; isRunning = true; disableControls();
    loadCode('advanced', 'removeDuplicates', codeAdvDisplay);
    setAction("Scanning for duplicates...", "var(--purple)");
    await sleep(DELAY_MS);

    let i = 0;
    while (i < nodes.length) {
        setNodeActive(i, 'active');
        let j = i + 1;
        while (j < nodes.length) {
            setNodeActive(j, 'node-slow');
            await sleep(DELAY_MS / 2);
            if (nodes[i] === nodes[j]) {
                setAction(`Found duplicate ${nodes[j]} at index ${j}!`, "var(--danger)");
                highlightCode('advanced', 5);
                setNodeActive(j, 'found');
                document.getElementById(`node-${j}`).querySelector('.ll-node').classList.add('delete');
                if(j > 0) setPointerActive(j-1, 'break');
                await sleep(DELAY_MS);
                
                nodes.splice(j, 1);
                renderList(); // Re-render without it
                setNodeActive(i, 'active'); // Re-highlight current
            } else {
                setNodeActive(j, 'none');
                j++;
            }
        }
        setNodeActive(i, 'none');
        i++;
    }

    setAction("All duplicates removed!", "var(--success)");
    enableControls(); isRunning = false;
}

async function runDetectCycle() {
    if (isRunning) return; isRunning = true; disableControls();
    loadCode('advanced', 'detectCycle', codeAdvDisplay);
    setAction("Detecting Cycle using Floyd's Algorithm...", "var(--purple)");
    await sleep(DELAY_MS);

    let slow = 0; let fast = 0;
    setNodeActive(slow, 'node-slow'); setNodeActive(fast, 'node-fast');
    
    // In our simulation, if it's CLL or hasCycle is true, it loops forever unless detected
    let maxSteps = 15; // Prevent infinite loop
    let steps = 0;
    let cycleFound = false;

    while (steps < maxSteps) {
        highlightCode('advanced', 3);
        setNodeActive(slow, 'none'); setNodeActive(fast, 'none');
        
        slow = (slow + 1) % nodes.length;
        if(listType === 'cll' || hasCycle) {
            fast = (fast + 2) % nodes.length;
        } else {
            fast += 2;
            if(fast >= nodes.length) break; // Reached end
        }
        
        setNodeActive(slow, 'node-slow');
        setNodeActive(fast, 'node-fast');
        await sleep(DELAY_MS);

        highlightCode('advanced', 5);
        if (slow === fast) {
            cycleFound = true;
            setAction("Collision! Cycle Detected!", "var(--danger)");
            showToast("Cycle Found!", "danger");
            setNodeActive(slow, 'found');
            break;
        }
        steps++;
    }

    if(!cycleFound) { highlightCode('advanced', 6); setAction("Reached NULL. No cycle detected.", "var(--success)"); }
    
    await sleep(DELAY_MS*2);
    setNodeActive(slow, 'none'); setNodeActive(fast, 'none');
    enableControls(); isRunning = false;
}

function runCreateCycle() {
    if (isRunning) return;
    if (listType === 'cll') { alert("CLL already inherently has a cycle from tail to head!"); return; }
    hasCycle = !hasCycle;
    renderList();
    setAction(hasCycle ? "Simulated Cycle created from Tail to Index 1" : "Cycle removed.", "var(--warning)");
}

// --- CONTROLS ---

function disableControls() {
    listTypeSelect.disabled = true;
    Object.values(btns).forEach(b => { if(b) b.disabled = true; });
}
function enableControls() {
    listTypeSelect.disabled = false;
    Object.values(btns).forEach(b => { if(b) b.disabled = false; });
}

// EVENT LISTENERS
listTypeSelect.addEventListener('change', (e) => {
    listType = e.target.value; updateWorkspace();
    setAction(`Switched to ${e.target.options[e.target.selectedIndex].text}`, "var(--accent)");
});

btns.addFirstBtn.addEventListener('click', () => basicOperation('add', 'first'));
btns.addMiddleBtn.addEventListener('click', () => basicOperation('add', 'middle'));
btns.addLastBtn.addEventListener('click', () => basicOperation('add', 'last'));
btns.removeFirstBtn.addEventListener('click', () => basicOperation('remove', 'first'));
btns.removeMiddleBtn.addEventListener('click', () => basicOperation('remove', 'middle'));
btns.removeLastBtn.addEventListener('click', () => basicOperation('remove', 'last'));

btns.reverseBtn.addEventListener('click', runReverse);
btns.findMiddleBtn.addEventListener('click', runFindMiddle);
btns.searchUpdateBtn.addEventListener('click', runSearchUpdate);
btns.removeDuplicatesBtn.addEventListener('click', runRemoveDuplicates);
btns.createCycleBtn.addEventListener('click', runCreateCycle);
btns.detectCycleBtn.addEventListener('click', runDetectCycle);

// Init
window.onload = () => { updateWorkspace(); };
