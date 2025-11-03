// Utility functions for the game

export function makeEnemyText(baseErrors, wraps) {
    const base = baseErrors[Math.floor(Math.random() * baseErrors.length)];
    const [l, r] = wraps[Math.floor(Math.random() * wraps.length)];
    return `${l}${base}${r}`;
}

export function createBgLine(index, linesPerColumn, columnWidth, indentSize, codeStructure) {
    const column = Math.floor(index / linesPerColumn);
    const lineInColumn = index % linesPerColumn;
    const snippet = codeStructure[lineInColumn % codeStructure.length];
    
    return {
        text: snippet.text,
        x: (column * columnWidth) + (snippet.indent * indentSize),
        y: -16, // bgLineHeight
        opacity: 0.15 + Math.random() * 0.1,
        index: index,
        column: column,
        lineInColumn: lineInColumn
    };
}

export function drawHexagon(ctx, x, y, size, rotation = 0) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI / 3) + rotation;
        const px = x + size * Math.cos(angle);
        const py = y + size * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
}

export function drawCursorShip(ctx, x, y, size, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = color;
  
    // symmetrical arrowhead shape (filled)
    ctx.beginPath();
    ctx.moveTo(0, -size);           // top tip
    ctx.lineTo(size * 0.9, size);   // bottom right
    ctx.lineTo(0, size * 0.4);      // inner V notch
    ctx.lineTo(-size * 0.9, size);  // bottom left
    ctx.closePath();
  
    ctx.fill();
    ctx.restore();
}