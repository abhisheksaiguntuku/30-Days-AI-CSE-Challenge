// Trie Node Class
class TrieNode {
    constructor(char = '') {
        this.char = char;
        this.children = {};
        this.isEndOfWord = false;
        // For visualization
        this.id = Math.random().toString(36).substring(2, 11);
        this.x = 0;
        this.y = 0;
    }
}

// Trie Class
class Trie {
    constructor() {
        this.root = new TrieNode();
    }

    insert(word) {
        let node = this.root;
        for (let char of word) {
            if (!node.children[char]) {
                node.children[char] = new TrieNode(char);
            }
            node = node.children[char];
        }
        node.isEndOfWord = true;
    }

    delete(word) {
        let deleted = false;
        const deleteRecursively = (node, word, index) => {
            if (index === word.length) {
                if (!node.isEndOfWord) return false;
                node.isEndOfWord = false;
                deleted = true;
                return Object.keys(node.children).length === 0;
            }
            const char = word[index];
            const childNode = node.children[char];
            if (!childNode) return false;

            const shouldDeleteChild = deleteRecursively(childNode, word, index + 1);

            if (shouldDeleteChild) {
                delete node.children[char];
                return Object.keys(node.children).length === 0 && !node.isEndOfWord;
            }
            return false;
        };
        deleteRecursively(this.root, word, 0);
        return deleted;
    }

    search(prefix) {
        let node = this.root;
        for (let char of prefix) {
            if (!node.children[char]) return null;
            node = node.children[char];
        }
        return node;
    }

    getAllWords(node, prefix, words = []) {
        if (node.isEndOfWord) words.push(prefix);
        const sortedKeys = Object.keys(node.children).sort();
        for (let char of sortedKeys) {
            this.getAllWords(node.children[char], prefix + char, words);
        }
        return words;
    }
}

// UI State
const trie = new Trie();
let DELAY_MS = 500;

function switchTab(tabName, event) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    const targetTab = document.getElementById(`${tabName}-tab`);
    if (targetTab) targetTab.classList.add('active');
    
    if (event) event.currentTarget.classList.add('active');
}

// DOM Elements
const trieCanvas = document.getElementById('trie-canvas');
const treeSvg = document.getElementById('tree-svg');
const nodesContainer = document.getElementById('nodes-container');
const toastContainer = document.getElementById('toast-container');
const codeDisplay = document.getElementById('code-display');
const pathText = document.getElementById('path-text');
const autocompleteDropdown = document.getElementById('autocompleteResults');

const wordInput = document.getElementById('wordInput');
const searchInput = document.getElementById('searchInput');
const deleteInput = document.getElementById('deleteInput');

// Pseudo-code for search
const searchCodeSnippet = [
    "function search(prefix):",
    "  node = root",
    "  for each char in prefix:",
    "    if char not in node.children:",
    "      return null // Fail",
    "    node = node.children[char]",
    "    highlight(node, line)",
    "  return getAllWords(node)"
];

// Utils
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

function showToast(message, type = 'info') {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = message;
    toastContainer.insertBefore(toast, toastContainer.firstChild);
    setTimeout(() => toast.remove(), 5000);
}

function loadCode() {
    if (!codeDisplay) return;
    codeDisplay.innerHTML = '';
    searchCodeSnippet.forEach((line, index) => {
        const div = document.createElement('div');
        div.className = 'code-line';
        div.id = `code-line-${index}`;
        div.textContent = line;
        codeDisplay.appendChild(div);
    });
}

function highlightLine(index) {
    document.querySelectorAll('.code-line').forEach(el => el.classList.remove('highlight-line'));
    if (index !== -1) {
        const line = document.getElementById(`code-line-${index}`);
        if (line) line.classList.add('highlight-line');
    }
}

// Tree Layout & Rendering
function updateTreeLayout() {
    if (!trieCanvas) return;
    const levelHeight = 100;
    const nodeWidth = 60;
    
    const getSubtreeWidth = (node) => {
        const children = Object.values(node.children);
        if (children.length === 0) return nodeWidth;
        let width = 0;
        children.forEach(child => {
            width += getSubtreeWidth(child);
        });
        return Math.max(width, nodeWidth);
    };

    const calculatePositions = (node, level, startX) => {
        node.y = (level * levelHeight) + 60;
        const totalWidth = getSubtreeWidth(node);
        node.x = startX + totalWidth / 2;

        let currentX = startX;
        const childrenKeys = Object.keys(node.children).sort();
        childrenKeys.forEach(char => {
            const child = node.children[char];
            const childWidth = getSubtreeWidth(child);
            calculatePositions(child, level + 1, currentX);
            currentX += childWidth;
        });
    };

    calculatePositions(trie.root, 0, 0);
    
    // Center the tree
    const rootWidth = getSubtreeWidth(trie.root);
    const canvasWidth = trieCanvas.offsetWidth || 800;
    const offset = Math.max((canvasWidth - rootWidth) / 2, 50);
    
    const applyOffset = (node) => {
        node.x += offset;
        Object.values(node.children).forEach(applyOffset);
    };
    applyOffset(trie.root);

    renderTree();
}

function renderTree() {
    if (!nodesContainer || !treeSvg) return;
    nodesContainer.innerHTML = '';
    treeSvg.innerHTML = '';
    
    const drawNodes = (node) => {
        const nodeDiv = document.createElement('div');
        nodeDiv.className = `trie-node ${node === trie.root ? 'root-node' : ''} ${node.isEndOfWord ? 'is-word' : ''}`;
        nodeDiv.id = `node-${node.id}`;
        nodeDiv.style.left = `${node.x - 20}px`;
        nodeDiv.style.top = `${node.y - 20}px`;
        nodeDiv.innerText = node.char || 'Root';
        nodesContainer.appendChild(nodeDiv);

        for (let char in node.children) {
            const child = node.children[char];
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", node.x);
            line.setAttribute("y1", node.y);
            line.setAttribute("x2", child.x);
            line.setAttribute("y2", child.y);
            line.setAttribute("class", "tree-line");
            line.id = `line-${node.id}-${child.id}`;
            treeSvg.appendChild(line);
            drawNodes(child);
        }
    };

    drawNodes(trie.root);
}

// Search & Animation
let currentSearchProcess = 0;

async function searchAndHighlight(prefix) {
    const processId = ++currentSearchProcess;
    
    // Reset
    document.querySelectorAll('.trie-node').forEach(n => n.classList.remove('active'));
    document.querySelectorAll('.tree-line').forEach(l => l.classList.remove('active'));
    highlightLine(-1);
    
    if (!prefix) {
        if (pathText) pathText.innerText = "/root";
        if (autocompleteDropdown) autocompleteDropdown.style.display = 'none';
        return;
    }

    highlightLine(1);
    let node = trie.root;
    let currentPath = "/root";
    
    for (let i = 0; i < prefix.length; i++) {
        if (processId !== currentSearchProcess) return;

        const char = prefix[i];
        highlightLine(2);
        
        highlightLine(3);
        if (!node.children[char]) {
            highlightLine(4);
            showToast(`Fail: '${char}' not found.`, 'danger');
            if (pathText) pathText.innerText = currentPath + " -> (X)";
            if (autocompleteDropdown) autocompleteDropdown.style.display = 'none';
            return;
        }

        const prevNode = node;
        node = node.children[char];
        currentPath += ` -> ${char}`;
        if (pathText) pathText.innerText = currentPath;

        highlightLine(5);
        highlightLine(6);
        const nodeEl = document.getElementById(`node-${node.id}`);
        const lineEl = document.getElementById(`line-${prevNode.id}-${node.id}`);
        
        if (nodeEl) nodeEl.classList.add('active');
        if (lineEl) lineEl.classList.add('active');
        
        await sleep(Math.min(DELAY_MS, 200));
    }

    highlightLine(7);
    const words = trie.getAllWords(node, prefix);
    showAutocomplete(words);
}

function showAutocomplete(words) {
    if (!autocompleteDropdown) return;
    autocompleteDropdown.innerHTML = '';
    if (words.length === 0) {
        autocompleteDropdown.style.display = 'none';
        return;
    }
    
    words.forEach(word => {
        const item = document.createElement('div');
        item.className = 'autocomplete-item';
        item.innerText = word;
        item.onclick = () => {
            searchInput.value = word;
            searchAndHighlight(word);
        };
        autocompleteDropdown.appendChild(item);
    });
    autocompleteDropdown.style.display = 'block';
}

// Event Listeners
document.getElementById('addBtn').onclick = () => {
    const word = wordInput.value.trim().toLowerCase();
    if (!word) return;
    trie.insert(word);
    showToast(`Added word: "${word}"`, 'success');
    wordInput.value = '';
    updateTreeLayout();
};

document.getElementById('deleteBtn').onclick = () => {
    const word = deleteInput.value.trim().toLowerCase();
    if (!word) return;
    const success = trie.delete(word);
    if (success) {
        showToast(`Deleted word: "${word}"`, 'success');
    } else {
        showToast(`"${word}" not found as word.`, 'danger');
    }
    deleteInput.value = '';
    updateTreeLayout();
};

document.getElementById('resetBtn').onclick = () => {
    trie.root = new TrieNode();
    showToast(`Cleared Trie`, 'danger');
    updateTreeLayout();
    searchInput.value = '';
    searchAndHighlight('');
};

searchInput.oninput = (e) => {
    const prefix = e.target.value.trim().toLowerCase();
    searchAndHighlight(prefix);
};

// Init
window.onload = () => {
    setTimeout(() => {
        loadCode();
        ["app", "apple", "ball", "bat", "cat"].forEach(w => trie.insert(w));
        updateTreeLayout();
        showToast("System Re-Initialized: Day 6 Logic Ready!", "success");
    }, 200);
};

window.onresize = () => updateTreeLayout();
