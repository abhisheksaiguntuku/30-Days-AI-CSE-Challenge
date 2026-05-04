/**
 * Day 7: Academic Dijkstra Sum Solver
 */

const nodes = [
    { id: 'A', x: 80, y: 300 },
    { id: 'B', x: 250, y: 150 },
    { id: 'C', x: 250, y: 450 },
    { id: 'D', x: 500, y: 150 },
    { id: 'E', x: 500, y: 450 },
    { id: 'F', x: 700, y: 300 }
];

const edges = [
    { from: 'A', to: 'B', weight: 4 },
    { from: 'A', to: 'C', weight: 2 },
    { from: 'B', to: 'C', weight: 5 },
    { from: 'B', to: 'D', weight: 10 },
    { from: 'C', to: 'E', weight: 3 },
    { from: 'E', to: 'D', weight: 4 },
    { from: 'D', to: 'F', weight: 11 },
    { from: 'E', to: 'F', weight: 1 }
];

class DijkstraSolver {
    constructor() {
        this.distances = {};
        this.parents = {};
        this.visited = new Set();
        this.pq = []; // Priority Queue (Simple sorted array)
        this.currentStep = 0;
        this.isSolving = false;
        this.steps = [];
        this.finalPath = [];

        // DOM
        this.nodesLayer = document.getElementById('nodes-layer');
        this.svgLayer = document.getElementById('graph-svg');
        this.tableBody = document.getElementById('table-body');
        this.actionText = document.getElementById('action-text');
        this.pqContainer = document.getElementById('pq-container');
    }

    init() {
        this.nodesLayer.innerHTML = '';
        this.svgLayer.innerHTML = '';
        this.tableBody.innerHTML = '';
        this.pqContainer.innerHTML = '';
        this.visited.clear();
        this.distances = {};
        this.parents = {};
        this.finalPath = [];
        this.steps = [];
        this.currentStep = 0;
        this.isSolving = false;
        this.actionText.innerText = "Ready to solve (Start at A)";

        // Draw Edges
        edges.forEach(edge => {
            const n1 = nodes.find(n => n.id === edge.from);
            const n2 = nodes.find(n => n.id === edge.to);
            
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", n1.x);
            line.setAttribute("y1", n1.y);
            line.setAttribute("x2", n2.x);
            line.setAttribute("y2", n2.y);
            line.setAttribute("class", "graph-edge");
            line.id = `edge-${edge.from}-${edge.to}`;
            this.svgLayer.appendChild(line);

            // Weight Label
            const label = document.createElement('div');
            label.className = 'weight-label';
            label.style.left = `${(n1.x + n2.x) / 2}px`;
            label.style.top = `${(n1.y + n2.y) / 2}px`;
            label.innerText = edge.weight;
            this.nodesLayer.appendChild(label);
        });

        // Draw Nodes
        nodes.forEach(node => {
            const div = document.createElement('div');
            div.className = 'graph-node';
            div.id = `node-${node.id}`;
            div.style.left = `${node.x}px`;
            div.style.top = `${node.y}px`;
            div.innerText = node.id;
            this.nodesLayer.appendChild(div);

            // Init State
            this.distances[node.id] = Infinity;
            this.parents[node.id] = '-';
            this.updateTableRow(node.id);
        });

        this.distances['A'] = 0;
        this.updateTableRow('A');
        this.generateSteps();
    }

    updateTableRow(id) {
        let row = document.getElementById(`row-${id}`);
        if (!row) {
            row = document.createElement('tr');
            row.id = `row-${id}`;
            row.innerHTML = `<td>${id}</td><td id="dist-${id}">∞</td><td id="parent-${id}">-</td>`;
            this.tableBody.appendChild(row);
        }
        document.getElementById(`dist-${id}`).innerText = this.distances[id] === Infinity ? '∞' : this.distances[id];
        document.getElementById(`parent-${id}`).innerText = this.parents[id];
    }

    generateSteps() {
        const d = { ...this.distances };
        const p = { ...this.parents };
        const v = new Set();
        const queue = [{ id: 'A', dist: 0 }];

        while (queue.length > 0) {
            queue.sort((a, b) => a.dist - b.dist);
            const curr = queue.shift();
            
            if (v.has(curr.id)) continue;
            v.add(curr.id);

            this.steps.push({
                type: 'visit',
                node: curr.id,
                action: `Selecting Node ${curr.id} (Smallest distance: ${curr.dist})`,
                pq: [...queue]
            });

            const adj = edges.filter(e => e.from === curr.id || e.to === curr.id);
            adj.forEach(edge => {
                const neighborId = edge.from === curr.id ? edge.to : edge.from;
                if (v.has(neighborId)) return;

                const newDist = d[curr.id] + edge.weight;
                if (newDist < d[neighborId]) {
                    d[neighborId] = newDist;
                    p[neighborId] = curr.id;
                    queue.push({ id: neighborId, dist: newDist });

                    this.steps.push({
                        type: 'relax',
                        from: curr.id,
                        to: neighborId,
                        weight: edge.weight,
                        oldDist: d[neighborId],
                        newDist: newDist,
                        action: `Relaxing edge ${curr.id}->${neighborId}: ${d[curr.id]} + ${edge.weight} = ${newDist} (Better!)`,
                        pq: [...queue]
                    });
                } else {
                    this.steps.push({
                        type: 'skip',
                        from: curr.id,
                        to: neighborId,
                        action: `Checking ${curr.id}->${neighborId}: ${d[curr.id]} + ${edge.weight} = ${newDist} (Not better)`,
                        pq: [...queue]
                    });
                }
            });
        }
        this.steps.push({ type: 'finish', action: 'Dijkstra Completed! Shortest paths found.' });
    }

    nextStep() {
        if (this.currentStep >= this.steps.length) return;
        const step = this.steps[this.currentStep];
        this.currentStep++;

        // Reset highlights
        document.querySelectorAll('.graph-node').forEach(n => n.classList.remove('current'));
        document.querySelectorAll('.graph-edge').forEach(e => e.classList.remove('active'));
        document.querySelectorAll('tr').forEach(r => r.classList.remove('highlight-row'));

        this.actionText.innerText = step.action;

        if (step.type === 'visit') {
            const nodeEl = document.getElementById(`node-${step.node}`);
            nodeEl.classList.add('current', 'visited');
            document.getElementById(`row-${step.node}`).classList.add('highlight-row');
        } else if (step.type === 'relax') {
            const edgeId = document.getElementById(`edge-${step.from}-${step.to}`) ? `edge-${step.from}-${step.to}` : `edge-${step.to}-${step.from}`;
            document.getElementById(edgeId).classList.add('active');
            
            this.distances[step.to] = step.newDist;
            this.parents[step.to] = step.from;
            this.updateTableRow(step.to);
            document.getElementById(`row-${step.to}`).classList.add('highlight-row');
        } else if (step.type === 'skip') {
            const edgeId = document.getElementById(`edge-${step.from}-${step.to}`) ? `edge-${step.from}-${step.to}` : `edge-${step.to}-${step.from}`;
            document.getElementById(edgeId).classList.add('active');
        }

        this.updatePQ(step.pq);
    }

    updatePQ(pq) {
        if (!pq) return;
        this.pqContainer.innerHTML = '';
        pq.sort((a, b) => a.dist - b.dist).forEach(item => {
            const div = document.createElement('div');
            div.className = 'pq-item';
            div.innerText = `${item.id}: ${item.dist}`;
            this.pqContainer.appendChild(div);
        });
    }

    async autoRun() {
        if (this.isSolving) return;
        this.isSolving = true;
        while (this.currentStep < this.steps.length && this.isSolving) {
            this.nextStep();
            await new Promise(r => setTimeout(r, 800));
        }
        this.isSolving = false;
    }
}

// UI Setup
const solver = new DijkstraSolver();

function switchTab(tabName, event) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`${tabName}-tab`).classList.add('active');
    event.currentTarget.classList.add('active');
}

document.getElementById('startBtn').onclick = () => solver.autoRun();
document.getElementById('stepBtn').onclick = () => {
    solver.isSolving = false;
    solver.nextStep();
};
document.getElementById('resetBtn').onclick = () => solver.init();

function loadCode() {
    const code = `// Dijkstra's Algorithm (JavaScript)
function dijkstra(graph, startNode) {
  let distances = {};
  let parents = {};
  let visited = new Set();
  let pq = new PriorityQueue();

  // 1. Initialize
  for (let node in graph) {
    distances[node] = Infinity;
    parents[node] = null;
  }
  distances[startNode] = 0;
  pq.enqueue(startNode, 0);

  // 2. Loop until all nodes processed
  while (!pq.isEmpty()) {
    let { node: curr } = pq.dequeue();
    if (visited.has(curr)) continue;
    visited.add(curr);

    // 3. Relax Edges
    for (let neighbor in graph[curr]) {
      let weight = graph[curr][neighbor];
      let newDist = distances[curr] + weight;

      if (newDist < distances[neighbor]) {
        distances[neighbor] = newDist;
        parents[neighbor] = curr;
        pq.enqueue(neighbor, newDist);
      }
    }
  }
  return { distances, parents };
}`;
    document.getElementById('code-display').innerText = code;
}

window.onload = () => {
    solver.init();
    loadCode();
};
