/**
 * Day 7: Dijkstra's Shortest Path Visualizer
 */

class DijkstraVisualizer {
    constructor() {
        this.rows = 20;
        this.cols = 40;
        this.grid = [];
        this.startNode = { r: 10, c: 5 };
        this.targetNode = { r: 10, c: 35 };
        this.isMouseDown = false;
        this.movingStart = false;
        this.movingTarget = false;
        this.isVisualizing = false;
        this.speed = 90;

        // DOM elements
        this.gridContainer = document.getElementById('grid-container');
        this.statusText = document.getElementById('status-text');
        this.visualizeBtn = document.getElementById('visualizeBtn');
    }

    init() {
        this.grid = [];
        this.gridContainer.innerHTML = '';
        this.gridContainer.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;

        for (let r = 0; r < this.rows; r++) {
            const row = [];
            for (let c = 0; c < this.cols; c++) {
                const node = {
                    r, c,
                    isStart: r === this.startNode.r && c === this.startNode.c,
                    isTarget: r === this.targetNode.r && c === this.targetNode.c,
                    isWall: false,
                    isVisited: false,
                    distance: Infinity,
                    previous: null,
                    element: null
                };

                const div = document.createElement('div');
                div.className = 'node';
                if (node.isStart) div.classList.add('node-start');
                if (node.isTarget) div.classList.add('node-target');

                // Mouse Events
                div.onmousedown = (e) => this.handleMouseDown(r, c, e);
                div.onmouseenter = () => this.handleMouseEnter(r, c);
                div.onmouseup = () => this.handleMouseUp();

                node.element = div;
                this.gridContainer.appendChild(div);
                row.push(node);
            }
            this.grid.push(row);
        }

        window.onmouseup = () => this.handleMouseUp();
    }

    handleMouseDown(r, c, e) {
        if (this.isVisualizing) return;
        const node = this.grid[r][c];
        if (node.isStart) {
            this.movingStart = true;
        } else if (node.isTarget) {
            this.movingTarget = true;
        } else {
            this.isMouseDown = true;
            this.toggleWall(r, c);
        }
    }

    handleMouseEnter(r, c) {
        if (this.isVisualizing) return;
        if (this.movingStart) {
            this.moveStart(r, c);
        } else if (this.movingTarget) {
            this.moveTarget(r, c);
        } else if (this.isMouseDown) {
            this.toggleWall(r, c);
        }
    }

    handleMouseUp() {
        this.isMouseDown = false;
        this.movingStart = false;
        this.movingTarget = false;
    }

    toggleWall(r, c) {
        const node = this.grid[r][c];
        if (node.isStart || node.isTarget) return;
        node.isWall = !node.isWall;
        node.element.classList.toggle('node-wall', node.isWall);
    }

    moveStart(r, c) {
        if (this.grid[r][c].isTarget || this.grid[r][c].isWall) return;
        this.grid[this.startNode.r][this.startNode.c].element.classList.remove('node-start');
        this.grid[this.startNode.r][this.startNode.c].isStart = false;
        
        this.startNode = { r, c };
        this.grid[r][c].isStart = true;
        this.grid[r][c].element.classList.add('node-start');
    }

    moveTarget(r, c) {
        if (this.grid[r][c].isStart || this.grid[r][c].isWall) return;
        this.grid[this.targetNode.r][this.targetNode.c].element.classList.remove('node-target');
        this.grid[this.targetNode.r][this.targetNode.c].isTarget = false;
        
        this.targetNode = { r, c };
        this.grid[r][c].isTarget = true;
        this.grid[r][c].element.classList.add('node-target');
    }

    async visualize() {
        if (this.isVisualizing) return;
        this.resetVisualization();
        this.isVisualizing = true;
        this.statusText.innerText = "Searching...";
        this.visualizeBtn.disabled = true;

        const visitedNodesInOrder = [];
        const startNode = this.grid[this.startNode.r][this.startNode.c];
        startNode.distance = 0;

        const unvisitedNodes = this.getAllNodes();

        while (unvisitedNodes.length > 0) {
            // Sort by distance (simplest priority queue)
            unvisitedNodes.sort((a, b) => a.distance - b.distance);
            const closestNode = unvisitedNodes.shift();

            if (closestNode.isWall) continue;
            if (closestNode.distance === Infinity) break;

            closestNode.isVisited = true;
            visitedNodesInOrder.push(closestNode);

            if (closestNode.isTarget) {
                await this.animateDijkstra(visitedNodesInOrder);
                await this.animateShortestPath(closestNode);
                this.statusText.innerText = "Path Found!";
                this.visualizeBtn.disabled = false;
                this.isVisualizing = false;
                return;
            }

            this.updateNeighbors(closestNode);
        }

        await this.animateDijkstra(visitedNodesInOrder);
        this.statusText.innerText = "No Path Possible!";
        this.visualizeBtn.disabled = false;
        this.isVisualizing = false;
    }

    updateNeighbors(node) {
        const neighbors = this.getNeighbors(node);
        for (const neighbor of neighbors) {
            if (neighbor.isVisited || neighbor.isWall) continue;
            const newDist = node.distance + 1;
            if (newDist < neighbor.distance) {
                neighbor.distance = newDist;
                neighbor.previous = node;
            }
        }
    }

    getNeighbors(node) {
        const neighbors = [];
        const { r, c } = node;
        if (r > 0) neighbors.push(this.grid[r - 1][c]);
        if (r < this.rows - 1) neighbors.push(this.grid[r + 1][c]);
        if (c > 0) neighbors.push(this.grid[r][c - 1]);
        if (c < this.cols - 1) neighbors.push(this.grid[r][c + 1]);
        return neighbors;
    }

    getAllNodes() {
        const nodes = [];
        for (const row of this.grid) {
            for (const node of row) nodes.push(node);
        }
        return nodes;
    }

    async animateDijkstra(visitedNodes) {
        for (let i = 0; i < visitedNodes.length; i++) {
            const node = visitedNodes[i];
            if (!node.isStart && !node.isTarget) {
                node.element.classList.add('node-visited');
            }
            if (i % 5 === 0) await new Promise(r => setTimeout(r, 101 - this.speed));
        }
    }

    async animateShortestPath(targetNode) {
        const path = [];
        let curr = targetNode;
        while (curr !== null) {
            path.unshift(curr);
            curr = curr.previous;
        }

        for (const node of path) {
            if (!node.isStart && !node.isTarget) {
                node.element.classList.add('node-shortest-path');
            }
            await new Promise(r => setTimeout(r, 30));
        }
    }

    resetVisualization() {
        for (const row of this.grid) {
            for (const node of row) {
                node.distance = Infinity;
                node.isVisited = false;
                node.previous = null;
                node.element.classList.remove('node-visited', 'node-shortest-path');
            }
        }
        this.statusText.innerText = "Ready";
    }

    clearWalls() {
        if (this.isVisualizing) return;
        for (const row of this.grid) {
            for (const node of row) {
                node.isWall = false;
                node.element.classList.remove('node-wall');
            }
        }
        this.resetVisualization();
    }
}

// UI Controller
const pathfinder = new DijkstraVisualizer();

function switchTab(tabName, event) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`${tabName}-tab`).classList.add('active');
    event.currentTarget.classList.add('active');
}

document.getElementById('visualizeBtn').onclick = () => pathfinder.visualize();
document.getElementById('clearWallsBtn').onclick = () => pathfinder.clearWalls();
document.getElementById('resetBtn').onclick = () => {
    pathfinder.startNode = { r: 10, c: 5 };
    pathfinder.targetNode = { r: 10, c: 35 };
    pathfinder.init();
};
document.getElementById('speedSlider').oninput = (e) => {
    pathfinder.speed = parseInt(e.target.value);
};

window.onload = () => pathfinder.init();
