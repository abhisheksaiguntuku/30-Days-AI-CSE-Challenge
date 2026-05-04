/**
 * Day 7: Ultimate Dijkstra Logic Teacher
 * Edge Removal & Final Polish
 */

class GraphNode {
    constructor(id, x, y) {
        this.id = id; this.x = x; this.y = y; this.element = null;
    }
    createDOM(container) {
        const div = document.createElement('div');
        div.className = 'node-circle'; div.id = `node-${this.id}`;
        div.innerText = this.id; div.style.left = `${this.x}px`; div.style.top = `${this.y}px`;
        container.appendChild(div); this.element = div; return div;
    }
}

class DijkstraManager {
    constructor() {
        this.nodes = new Map(); this.edges = [];
        this.distances = {}; this.parents = {}; this.visited = new Set();
        this.steps = []; this.currentStep = 0; this.isSolving = false;

        this.nodesLayer = document.getElementById('nodes-layer');
        this.svgLayer = document.getElementById('graph-svg');
        this.tableBody = document.getElementById('table-body');
        this.pqContainer = document.getElementById('pq-container');
        this.explanation = document.getElementById('explanation-text');
        this.mathDisplay = document.getElementById('math-display');

        this.setupDragging();
        this.initExample();
        this.loadCodeContent();
        this.setupCopyButton();
    }

    initExample() {
        this.clear();
        this.addNode('A', 100, 350); this.addNode('B', 300, 100); this.addNode('C', 300, 600);
        this.addNode('D', 500, 100); this.addNode('E', 500, 600); this.addNode('F', 750, 350);
        this.addEdge('A', 'B', 4); this.addEdge('A', 'C', 2); this.addEdge('B', 'D', 5);
        this.addEdge('C', 'E', 3); this.addEdge('D', 'F', 6); this.addEdge('E', 'F', 1);
        this.resetState();
    }

    addNode(id, x, y) {
        if (this.nodes.has(id)) return;
        const node = new GraphNode(id, x, y); node.createDOM(this.nodesLayer);
        this.nodes.set(id, node); this.updateTable();
    }

    addEdge(from, to, weight) {
        if (from === to) return;
        this.edges.push({ from, to, weight });
        this.renderEdges();
    }

    removeEdge(from, to) {
        this.edges = this.edges.filter(e => 
            !((e.from === from && e.to === to) || (e.from === to && e.to === from))
        );
        this.renderEdges();
    }

    renderEdges() {
        this.svgLayer.innerHTML = '';
        this.nodesLayer.querySelectorAll('.weight-label').forEach(l => l.remove());
        this.edges.forEach(edge => {
            const n1 = this.nodes.get(edge.from); const n2 = this.nodes.get(edge.to);
            if (!n1 || !n2) return;
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", n1.x); line.setAttribute("y1", n1.y);
            line.setAttribute("x2", n2.x); line.setAttribute("y2", n2.y);
            line.setAttribute("class", "edge-line");
            line.id = `edge-${edge.from}-${edge.to}`;
            this.svgLayer.appendChild(line);
            const label = document.createElement('div');
            label.className = 'weight-label';
            label.style.left = `${(n1.x + n2.x) / 2}px`; label.style.top = `${(n1.y + n2.y) / 2}px`;
            label.innerText = edge.weight; this.nodesLayer.appendChild(label);
        });
    }

    setupDragging() {
        let activeNode = null; let startX, startY, nodeStartX, nodeStartY;
        this.nodesLayer.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('node-circle')) {
                activeNode = this.nodes.get(e.target.innerText);
                startX = e.clientX; startY = e.clientY;
                nodeStartX = activeNode.x; nodeStartY = activeNode.y;
                e.preventDefault();
            }
        });
        window.addEventListener('mousemove', (e) => {
            if (activeNode) {
                const dx = e.clientX - startX; const dy = e.clientY - startY;
                activeNode.x = Math.max(30, Math.min(this.nodesLayer.offsetWidth - 30, nodeStartX + dx));
                activeNode.y = Math.max(30, Math.min(this.nodesLayer.offsetHeight - 30, nodeStartY + dy));
                activeNode.element.style.left = `${activeNode.x}px`; activeNode.element.style.top = `${activeNode.y}px`;
                this.renderEdges();
            }
        });
        window.addEventListener('mouseup', () => { activeNode = null; });
    }

    resetState() {
        this.distances = {}; this.parents = {}; this.visited.clear();
        this.nodes.forEach((_, id) => {
            this.distances[id] = Infinity; this.parents[id] = '-';
            const el = document.getElementById(`node-${id}`); if (el) el.classList.remove('current', 'visited');
        });
        this.distances['A'] = 0; this.currentStep = 0; this.steps = [];
        this.generateSteps(); this.updateTable(); this.updatePQ([]);
        this.explanation.innerText = "Dijkstra Initialized. Start at A.";
        this.mathDisplay.innerHTML = "";
    }

    generateSteps() {
        const d = { ...this.distances }; const p = { ...this.parents };
        const v = new Set(); const queue = [{ id: 'A', dist: 0 }];
        while (queue.length > 0) {
            queue.sort((a, b) => a.dist - b.dist);
            const curr = queue.shift();
            if (v.has(curr.id)) continue;
            v.add(curr.id);
            this.steps.push({ type: 'visit', id: curr.id, dist: curr.dist, pq: [...queue], text: `Visiting Node ${curr.id} (Min dist: ${curr.dist}).` });
            const adj = this.edges.filter(e => e.from === curr.id || e.to === curr.id);
            adj.forEach(edge => {
                const neighbor = edge.from === curr.id ? edge.to : edge.from;
                if (v.has(neighbor)) return;
                const newDist = d[curr.id] + edge.weight;
                const oldDist = d[neighbor];
                const better = newDist < oldDist;
                this.steps.push({ type: 'relax', u: curr.id, v: neighbor, w: edge.weight, oldDist, newDist, better, pq: better ? [...queue, {id: neighbor, dist: newDist}] : [...queue], text: better ? `Found better path to ${neighbor} via ${curr.id}!` : `Checked ${neighbor}, no change.` });
                if (better) { d[neighbor] = newDist; p[neighbor] = curr.id; queue.push({ id: neighbor, dist: newDist }); }
            });
        }
    }

    nextStep() {
        if (this.currentStep >= this.steps.length) return;
        const step = this.steps[this.currentStep++];
        document.querySelectorAll('.node-circle').forEach(n => n.classList.remove('current'));
        document.querySelectorAll('.edge-line').forEach(e => e.classList.remove('active'));
        this.explanation.innerText = step.text;
        if (step.type === 'visit') {
            document.getElementById(`node-${step.id}`).classList.add('current', 'visited');
            this.mathDisplay.innerHTML = `Current: <strong>Node ${step.id}</strong> (Dist: ${step.dist})`;
        } else {
            const edgeId = document.getElementById(`edge-${step.u}-${step.v}`) ? `edge-${step.u}-${step.v}` : `edge-${step.v}-${step.u}`;
            const line = document.getElementById(edgeId); if (line) line.classList.add('active');
            this.mathDisplay.innerHTML = `${step.u}→${step.v}: ${this.distances[step.u]} + ${step.w} = ${step.newDist}<br>Better? <strong>${step.better ? 'YES' : 'NO'}</strong>`;
            if (step.better) { this.distances[step.v] = step.newDist; this.parents[step.v] = step.u; this.updateTable(); }
        }
        this.updatePQ(step.pq);
    }

    updateTable() {
        this.tableBody.innerHTML = '';
        this.nodes.forEach((_, id) => {
            const row = document.createElement('tr');
            const d = this.distances[id] === Infinity ? '∞' : this.distances[id];
            row.innerHTML = `<td>${id}</td><td>${d}</td><td>${this.parents[id]}</td>`;
            this.tableBody.appendChild(row);
        });
    }

    updatePQ(pq) {
        this.pqContainer.innerHTML = '';
        pq.sort((a,b) => a.dist - b.dist).forEach(item => {
            const tag = document.createElement('div'); tag.className = 'pq-tag';
            tag.innerText = `${item.id}: ${item.dist}`; this.pqContainer.appendChild(tag);
        });
    }

    clear() { this.nodes.clear(); this.edges = []; this.nodesLayer.innerHTML = ''; this.svgLayer.innerHTML = ''; }

    loadCodeContent() {
        const code = `// Dijkstra Algorithm implementation...`; // This will be full in actual file
        document.getElementById('code-display').innerText = code;
    }

    setupCopyButton() {
        document.getElementById('copyBtn').onclick = () => {
            const code = document.getElementById('code-display').innerText;
            navigator.clipboard.writeText(code).then(() => {
                const btn = document.getElementById('copyBtn'); btn.innerText = "✅ Copied!";
                setTimeout(() => btn.innerText = "Copy Code", 2000);
            });
        };
    }
}

const manager = new DijkstraManager();

function switchTab(tabName, event) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`${tabName}-tab`).classList.add('active');
    event.currentTarget.classList.add('active');
}

document.getElementById('stepBtn').onclick = () => { manager.isSolving = false; manager.nextStep(); };
document.getElementById('startBtn').onclick = async () => {
    if (manager.isSolving) return; manager.isSolving = true;
    while (manager.currentStep < manager.steps.length && manager.isSolving) {
        manager.nextStep(); await new Promise(r => setTimeout(r, 1000));
    }
    manager.isSolving = false;
};
document.getElementById('resetBtn').onclick = () => manager.initExample();
document.getElementById('addEdgeBtn').onclick = () => {
    const from = document.getElementById('edge-from').value.toUpperCase();
    const to = document.getElementById('edge-to').value.toUpperCase();
    const weight = parseInt(document.getElementById('edge-weight').value);
    if (!from || !to || isNaN(weight)) return;
    if (!manager.nodes.has(from)) manager.addNode(from, Math.random()*500+50, Math.random()*500+50);
    if (!manager.nodes.has(to)) manager.addNode(to, Math.random()*500+50, Math.random()*500+50);
    manager.addEdge(from, to, weight); manager.resetState();
};
document.getElementById('removeEdgeBtn').onclick = () => {
    const from = document.getElementById('edge-from').value.toUpperCase();
    const to = document.getElementById('edge-to').value.toUpperCase();
    if (!from || !to) return;
    manager.removeEdge(from, to); manager.resetState();
};
