import { createBgLine } from './utils.js';

export class BackgroundSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.lines = [];
        this.scrollSpeed = 0.5;
        this.lineHeight = 16;
        this.columnWidth = 300;
        this.indentSize = 20;
        this.initializeBackground();
    }

    initializeBackground() {
        const numColumns = Math.ceil(this.canvas.width / this.columnWidth);
        const linesPerColumn = Math.ceil(this.canvas.height / this.lineHeight) + 1;
        const numBgLines = linesPerColumn * numColumns;

        for (let i = 0; i < numBgLines; i++) {
            const line = createBgLine(i, linesPerColumn, this.columnWidth, this.indentSize, this.codeStructure);
            const lineInColumn = i % linesPerColumn;
            line.y = lineInColumn * this.lineHeight;
            this.lines.push(line);
        }
    }

    update() {
        this.lines.forEach(line => {
            line.y += this.scrollSpeed;
            if (line.y > this.canvas.height) {
                line.y = -this.lineHeight;
            }
        });
    }

    draw(ctx) {
        // Sort lines by column and Y position
        this.lines.sort((a, b) => {
            if (a.column === b.column) {
                return a.y - b.y;
            }
            return a.column - b.column;
        });
        
        // Create gradient effect for depth
        const gradient = ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, 'rgba(0, 255, 255, 0.2)');
        gradient.addColorStop(0.5, 'rgba(0, 255, 255, 0.15)');
        gradient.addColorStop(1, 'rgba(0, 255, 255, 0.1)');
        
        ctx.font = "11px 'Consolas', monospace";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        
        this.lines.forEach(line => {
            ctx.fillStyle = gradient;
            if (line.text) {
                ctx.fillText(line.text, line.x + 10, line.y + this.lineHeight/2);
            }
        });
    }

    codeStructure = [
        { text: "class GameEngine {", indent: 0 },
        { text: "constructor(canvas, options) {", indent: 1 },
        { text: "this.canvas = canvas;", indent: 2 },
        { text: "this.ctx = canvas.getContext('2d');", indent: 2 },
        { text: "this.entities = new Set();", indent: 2 },
        { text: "}", indent: 1 },
        { text: "update(deltaTime) {", indent: 1 },
        { text: "for (const entity of this.entities) {", indent: 2 },
        { text: "entity.update(deltaTime);", indent: 3 },
        { text: "this.checkCollisions(entity);", indent: 3 },
        { text: "}", indent: 2 },
        { text: "}", indent: 1 },
        { text: "private checkCollisions(entity) {", indent: 1 },
        { text: "const nearby = this.quadTree.query(entity);", indent: 2 },
        { text: "for (const other of nearby) {", indent: 2 },
        { text: "if (entity.intersects(other)) {", indent: 3 },
        { text: "this.handleCollision(entity, other);", indent: 4 },
        { text: "}", indent: 3 },
        { text: "}", indent: 2 },
        { text: "}", indent: 1 },
        { text: "spawn(entityType, position) {", indent: 1 },
        { text: "const entity = new entityType(position);", indent: 2 },
        { text: "this.entities.add(entity);", indent: 2 },
        { text: "return entity;", indent: 2 },
        { text: "}", indent: 1 },
        { text: "}", indent: 0 },
        { text: "", indent: 0 },
        { text: "class Entity extends EventEmitter {", indent: 0 },
        { text: "constructor(position, velocity) {", indent: 1 },
        { text: "this.position = Vector2.from(position);", indent: 2 },
        { text: "this.velocity = Vector2.from(velocity);", indent: 2 },
        { text: "this.acceleration = new Vector2(0, 0);", indent: 2 },
        { text: "}", indent: 1 },
        { text: "}", indent: 0 },
    ];
}