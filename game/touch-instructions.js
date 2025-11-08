// Touch instructions overlay for mobile users
export function showTouchInstructions() {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (!isTouchDevice) return;
    
    // Create instruction overlay
    const overlay = document.createElement('div');
    overlay.id = 'touchInstructions';
    Object.assign(overlay.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: '10000',
        fontFamily: "'Press Start 2P', monospace",
        color: '#0ff',
        textAlign: 'center',
        padding: '20px',
        boxSizing: 'border-box'
    });
    
    overlay.innerHTML = `
        <div style="max-width: 300px;">
            <h2 style="margin-bottom: 30px; font-size: 16px;">TOUCH CONTROLS</h2>
            <div style="margin-bottom: 20px; font-size: 12px;">
                <div style="margin-bottom: 15px;">📱 MOVE: Drag in left area</div>
                <div style="margin-bottom: 15px;">🔥 FIRE: Hold right area</div>
                <div style="margin-bottom: 15px;">⏸️ PAUSE: Tap spacebar or pause button</div>
            </div>
            <button id="gotItBtn" style="
                font-family: 'Press Start 2P', monospace;
                font-size: 12px;
                padding: 15px 25px;
                background: #111;
                color: #0ff;
                border: 2px solid #0ff;
                border-radius: 4px;
                cursor: pointer;
                margin-top: 20px;
            ">GOT IT!</button>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Handle button click
    document.getElementById('gotItBtn').addEventListener('click', () => {
        overlay.remove();
        // Store that user has seen instructions
        localStorage.setItem('touchInstructionsSeen', 'true');
    });
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
        if (overlay.parentNode) {
            overlay.remove();
            localStorage.setItem('touchInstructionsSeen', 'true');
        }
    }, 10000);
}

// Show instructions on first mobile visit
export function checkAndShowTouchInstructions() {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const hasSeenInstructions = localStorage.getItem('touchInstructionsSeen');
    
    if (isTouchDevice && !hasSeenInstructions) {
        // Show after a brief delay to let the game load
        setTimeout(showTouchInstructions, 1000);
    }
}