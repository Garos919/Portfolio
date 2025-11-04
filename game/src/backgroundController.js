export class BackgroundController {
    constructor() {
        this.background = document.getElementById('backgroundLayer');
        this.gameContainer = document.getElementById('gameContainer');
        this.currentState = null;
        this.codeSymbols = ['(', ')', '{', '}', '[', ']', '<', '>', '/', '\\', '|', ';', ':', '.', ',', '=', '+', '-', '*', '&', '%', '$', '#', '@', '!', '?', '"', "'", '`'];
        
        // Code templates with proper syntax
        this.codeTemplates = [
            { text: 'function calculate(x, y) {', color: '#dcdcaa' },
            { text: '  return x + y;', color: '#9cdcfe' },
            { text: '}', color: '#dcdcaa' },
            { text: 'const data = await fetch(url);', color: '#4ec9b0' },
            { text: '// Initialize variables', color: '#6a9955' },
            { text: 'let count = 0;', color: '#9cdcfe' },
            { text: 'for (let i = 0; i < 10; i++) {', color: '#c586c0' },
            { text: '  console.log(i);', color: '#dcdcaa' },
            { text: '}', color: '#dcdcaa' },
            { text: 'const arr = [1, 2, 3, 4, 5];', color: '#4ec9b0' },
            { text: 'if (value > 10) {', color: '#c586c0' },
            { text: '  process(value);', color: '#dcdcaa' },
            { text: '} else {', color: '#c586c0' },
            { text: '  return null;', color: '#c586c0' },
            { text: '}', color: '#dcdcaa' },
            { text: 'class Component extends React.Component {', color: '#4ec9b0' },
            { text: '  render() {', color: '#dcdcaa' },
            { text: '    return <div>Hello</div>;', color: '#9cdcfe' },
            { text: '  }', color: '#dcdcaa' },
            { text: '}', color: '#dcdcaa' },
            { text: 'async function getData() {', color: '#dcdcaa' },
            { text: '  try {', color: '#c586c0' },
            { text: '    const response = await api.get();', color: '#4ec9b0' },
            { text: '    return response.json();', color: '#9cdcfe' },
            { text: '  } catch (error) {', color: '#c586c0' },
            { text: '    console.error(error);', color: '#ce9178' },
            { text: '  }', color: '#dcdcaa' },
            { text: '}', color: '#dcdcaa' },
            { text: 'import { useState } from "react";', color: '#c586c0' },
            { text: 'export default MyComponent;', color: '#c586c0' },
        ];
        
        // Error versions (syntax errors)
        this.errorTemplates = [
            'function calculate( {',
            '  return x +',
            'const data = await fetch(',
            'let count == 0;',
            'for (let i = 0; i < 10 i++) {',
            'if (value > 10 {',
            '} else if {',
            'const arr = [1, 2, 3,',
            'return <div>Hello</div>',
            'async function getData {',
            'const { name, age = data;',
            'console.log("error);',
            'import { Component from;',
            'export default',
        ];
    }

    // Menu state - starfield with tunnel effect
    showStarfield() {
        this.clear();
        this.currentState = 'starfield';
        
        // Fade transition
        this.background.style.transition = 'opacity 1s ease';
        this.background.style.opacity = '0';
        
        setTimeout(() => {
            this.background.style.opacity = '1';
            // Start the tunnel animation
            this.startTunnelEffect();
        }, 100);
    }
    
    startTunnelEffect() {
        // Stop any existing tunnel animation
        this.stopTunnelEffect();
        
        // Spawn new stars continuously
        this.tunnelInterval = setInterval(() => {
            this.spawnTunnelStar();
        }, 30); // Spawn a new star every 30ms (more stars)
    }
    
    spawnTunnelStar() {
        if (this.currentState !== 'starfield') return;
        
        const symbol = document.createElement('div');
        symbol.className = 'tunnel-star';
        symbol.textContent = this.codeSymbols[Math.floor(Math.random() * this.codeSymbols.length)];
        
        // Random angle for direction
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.3 + Math.random() * 0.7; // Variable speed for depth
        
        // Start at center
        symbol.style.position = 'absolute';
        symbol.style.left = '50%';
        symbol.style.top = '50%';
        symbol.style.color = '#fff';
        symbol.style.fontSize = '8px';
        symbol.style.opacity = '0';
        symbol.style.pointerEvents = 'none';
        symbol.style.willChange = 'transform, opacity, font-size';
        symbol.style.textShadow = '0 0 6px rgba(255, 255, 255, 0.8)';
        
        // Store animation properties on the element
        symbol.dataset.angle = angle;
        symbol.dataset.speed = speed;
        symbol.dataset.distance = 0;
        
        this.background.appendChild(symbol);
        
        // Animate the star
        this.animateTunnelStar(symbol);
    }
    
    animateTunnelStar(star) {
        let startTime = null;
        const duration = 4000; // 4 seconds to travel from center to edge (slower, goes further)
        
        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            if (this.currentState !== 'starfield' || !star.parentNode) {
                return; // Stop if state changed or star removed
            }
            
            const angle = parseFloat(star.dataset.angle);
            const speed = parseFloat(star.dataset.speed);
            
            // Calculate position (moving outward from center)
            const distance = progress * 200 * speed; // Max distance increased to 200
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            
            // Scale and opacity based on progress
            const scale = 0.5 + progress * 3; // Start small, grow larger
            const opacity = progress < 0.1 ? progress * 10 : (progress > 0.9 ? (1 - progress) * 10 : 1); // Fade out later
            
            star.style.transform = `translate(calc(-50% + ${x}vw), calc(-50% + ${y}vh)) scale(${scale})`;
            star.style.opacity = opacity;
            star.style.fontSize = (8 + progress * 10) + 'px';
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Remove star when animation completes
                star.remove();
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    stopTunnelEffect() {
        if (this.tunnelInterval) {
            clearInterval(this.tunnelInterval);
            this.tunnelInterval = null;
        }
    }
    
    getRandomColor() {
        const colors = ['#0ff', '#0f0', '#ff0', '#f0f', '#fff', '#0af', '#fa0'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Dialogue state - solid black
    showBlack() {
        this.currentState = 'black';
        
        // Fade out current content
        this.background.style.transition = 'opacity 0.8s ease';
        this.background.style.opacity = '0';
        
        setTimeout(() => {
            this.clear();
            this.background.style.backgroundColor = '#000';
            this.background.style.opacity = '1';
        }, 800);
    }

    // Warning state - flashing warning symbols with red pulse
    showWarnings() {
        this.currentState = 'warnings';
        
        // Fade out current
        this.background.style.transition = 'opacity 0.6s ease';
        this.background.style.opacity = '0';
        
        setTimeout(() => {
            this.clear();
            
            // Red pulsing background
            this.background.style.animation = 'redPulse 2s infinite';
            
            // Add red pulse overlay to game container too
            this.addGameRedPulse();
            
            // Create 30 warning symbols (only outside game container)
            for (let i = 0; i < 30; i++) {
                const warning = document.createElement('div');
                warning.className = 'bg-warning';
                warning.textContent = '⚠';
                
                warning.style.left = Math.random() * 100 + '%';
                warning.style.top = Math.random() * 100 + '%';
                warning.style.animationDelay = Math.random() * 1 + 's';
                warning.style.transform = `rotate(${Math.random() * 360}deg)`;
                
                this.background.appendChild(warning);
            }
            
            this.background.style.opacity = '1';
        }, 600);
    }
    
    // Add red pulse to game container
    addGameRedPulse() {
        // Remove any existing pulse overlay
        const existing = document.getElementById('gameRedPulse');
        if (existing) existing.remove();
        
        const redPulse = document.createElement('div');
        redPulse.id = 'gameRedPulse';
        redPulse.style.position = 'absolute';
        redPulse.style.top = '0';
        redPulse.style.left = '0';
        redPulse.style.width = '100%';
        redPulse.style.height = '100%';
        redPulse.style.pointerEvents = 'none';
        redPulse.style.zIndex = '5';
        redPulse.style.animation = 'redPulse 2s infinite';
        
        this.gameContainer.appendChild(redPulse);
    }
    
    // Add stars to game container
    addGameStars() {
        // Remove any existing stars in game container
        this.removeGameStars();
        
        const starsContainer = document.createElement('div');
        starsContainer.id = 'gameStars';
        starsContainer.style.position = 'absolute';
        starsContainer.style.top = '0';
        starsContainer.style.left = '0';
        starsContainer.style.width = '100%';
        starsContainer.style.height = '100%';
        starsContainer.style.pointerEvents = 'none';
        starsContainer.style.zIndex = '0';
        starsContainer.style.overflow = 'hidden';
        
        // Create 50 code symbols inside game container
        for (let i = 0; i < 50; i++) {
            const symbol = document.createElement('div');
            symbol.className = 'star';
            symbol.textContent = this.codeSymbols[Math.floor(Math.random() * this.codeSymbols.length)];
            symbol.style.fontSize = (Math.random() * 10 + 8) + 'px'; // 8-18px
            symbol.style.color = '#fff';
            symbol.style.left = Math.random() * 100 + '%';
            symbol.style.top = Math.random() * 100 + '%';
            symbol.style.animationDelay = Math.random() * 3 + 's';
            
            starsContainer.appendChild(symbol);
        }
        
        this.gameContainer.appendChild(starsContainer);
    }
    
    // Remove stars from game container
    removeGameStars() {
        const existing = document.getElementById('gameStars');
        if (existing) {
            existing.style.transition = 'opacity 0.5s ease';
            existing.style.opacity = '0';
            setTimeout(() => existing.remove(), 500);
        }
    }
    
    // Remove red pulse from game container
    removeGameRedPulse() {
        const existing = document.getElementById('gameRedPulse');
        if (existing) {
            existing.style.transition = 'opacity 0.5s ease';
            existing.style.opacity = '0';
            setTimeout(() => existing.remove(), 500);
        }
    }

    // Clear all background elements
    clear() {
        this.stopTunnelEffect();
        this.background.innerHTML = '';
        this.background.style.backgroundColor = '#000';
        this.background.style.animation = '';
        this.background.style.transition = '';
    }
    
    // Show code background for gameplay
    showCodeBackground(errorPercentage = 100) {
        this.currentState = 'code';
        this.lastScore = 0; // Track last score to detect changes
        
        // Fade transition
        this.background.style.transition = 'opacity 0.8s ease';
        this.background.style.opacity = '0';
        
        setTimeout(() => {
            this.clear();
            this.background.style.backgroundColor = '#000';
            
            // Create full-screen code editor effect
            const codeContainer = document.createElement('div');
            codeContainer.id = 'codeBackground';
            codeContainer.style.position = 'absolute';
            codeContainer.style.top = '0';
            codeContainer.style.left = '0';
            codeContainer.style.width = '100%';
            codeContainer.style.height = '100%';
            codeContainer.style.overflow = 'hidden';
            codeContainer.style.fontFamily = "'Courier New', monospace";
            codeContainer.style.fontSize = '11px';
            codeContainer.style.lineHeight = '14px';
            codeContainer.style.padding = '5px';
            codeContainer.style.boxSizing = 'border-box';
            codeContainer.style.display = 'grid';
            codeContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(250px, 1fr))';
            codeContainer.style.gap = '8px';
            codeContainer.style.alignContent = 'start';
            
            // Calculate how many lines needed to fill screen densely
            const totalLines = Math.ceil((window.innerHeight / 14) * 6);
            
            // Generate STATIC lines of code (won't change text)
            for (let i = 0; i < totalLines; i++) {
                const line = document.createElement('div');
                line.className = 'code-line';
                line.style.height = '14px';
                line.style.whiteSpace = 'nowrap';
                line.style.overflow = 'hidden';
                
                // Line number
                const lineNum = document.createElement('span');
                lineNum.textContent = String(i + 1).padStart(3, ' ') + '  ';
                lineNum.style.color = '#858585';
                lineNum.style.marginRight = '5px';
                lineNum.style.userSelect = 'none';
                line.appendChild(lineNum);
                
                // Determine if this line should have an error (STATIC - won't change)
                const hasError = Math.random() * 100 < errorPercentage;
                
                if (hasError) {
                    // Add error line
                    const errorText = this.errorTemplates[Math.floor(Math.random() * this.errorTemplates.length)];
                    const errorSpan = document.createElement('span');
                    errorSpan.textContent = errorText;
                    errorSpan.style.color = '#f33';
                    errorSpan.style.textDecoration = 'underline wavy #f33';
                    errorSpan.style.textDecorationSkipInk = 'none';
                    line.appendChild(errorSpan);
                    
                    // Mark as error for later fixing
                    line.dataset.hasError = 'true';
                } else {
                    // Add correct syntax line
                    const template = this.codeTemplates[Math.floor(Math.random() * this.codeTemplates.length)];
                    const codeSpan = document.createElement('span');
                    codeSpan.textContent = template.text;
                    codeSpan.style.color = template.color;
                    line.appendChild(codeSpan);
                    
                    line.dataset.hasError = 'false';
                }
                
                codeContainer.appendChild(line);
            }
            
            this.background.appendChild(codeContainer);
            this.background.style.opacity = '1';
        }, 800);
    }
    
    // Update code background based on score - fix one error every +5 points
    updateCodeBackground(score) {
        if (this.currentState !== 'code') return;
        
        // Only update if score actually changed
        if (this.lastScore === score) return;
        
        // Check if we've reached a new +2 milestone (forward) or lost a -2 milestone (backward)
        const currentMilestone = Math.floor(score / 2);
        const lastMilestone = Math.floor(this.lastScore / 2);
        
        const milestoneDiff = currentMilestone - lastMilestone;
        
        this.lastScore = score;
        
        // If we've crossed a +2 boundary forward, fix errors
        if (milestoneDiff > 0) {
            const codeContainer = document.getElementById('codeBackground');
            if (codeContainer) {
                // Fix one error per milestone crossed
                for (let i = 0; i < milestoneDiff; i++) {
                    // Get all lines that still have errors
                    const errorLines = Array.from(codeContainer.querySelectorAll('.code-line'))
                        .filter(line => line.dataset.hasError === 'true');
                    
                    // If there are errors left to fix, pick one randomly
                    if (errorLines.length > 0) {
                        const randomIndex = Math.floor(Math.random() * errorLines.length);
                        const line = errorLines[randomIndex];
                        
                        // Keep line number
                        const lineNum = line.querySelector('span');
                        line.innerHTML = '';
                        line.appendChild(lineNum);
                        
                        // Replace error with correct syntax
                        const template = this.codeTemplates[Math.floor(Math.random() * this.codeTemplates.length)];
                        const codeSpan = document.createElement('span');
                        codeSpan.textContent = template.text;
                        codeSpan.style.color = template.color;
                        line.appendChild(codeSpan);
                        
                        line.dataset.hasError = 'false';
                        line.dataset.wasError = 'true'; // Track that it was fixed
                    }
                }
            }
        }
        // If we've crossed a -2 boundary backward, corrupt lines
        else if (milestoneDiff < 0) {
            const codeContainer = document.getElementById('codeBackground');
            if (codeContainer) {
                // Corrupt one line per milestone lost
                for (let i = 0; i < Math.abs(milestoneDiff); i++) {
                    // Get all lines that are currently correct code
                    const correctLines = Array.from(codeContainer.querySelectorAll('.code-line'))
                        .filter(line => line.dataset.hasError === 'false');
                    
                    // If there are correct lines, pick one randomly to break
                    if (correctLines.length > 0) {
                        const randomIndex = Math.floor(Math.random() * correctLines.length);
                        const line = correctLines[randomIndex];
                        
                        // Keep line number
                        const lineNum = line.querySelector('span');
                        line.innerHTML = '';
                        line.appendChild(lineNum);
                        
                        // Replace with error syntax
                        const errorText = this.errorTemplates[Math.floor(Math.random() * this.errorTemplates.length)];
                        const errorSpan = document.createElement('span');
                        errorSpan.textContent = errorText;
                        errorSpan.style.color = '#f33';
                        errorSpan.style.textDecoration = 'underline wavy #f33';
                        errorSpan.style.textDecorationSkipInk = 'none';
                        line.appendChild(errorSpan);
                        
                        line.dataset.hasError = 'true';
                    }
                }
            }
        }
    }
    
    // Add an error back to the background (when enemy reaches bottom)
    addBackgroundError() {
        if (this.currentState !== 'code') return;
        
        const codeContainer = document.getElementById('codeBackground');
        if (codeContainer) {
            // Get all lines that are currently correct code
            const correctLines = Array.from(codeContainer.querySelectorAll('.code-line'))
                .filter(line => line.dataset.hasError === 'false');
            
            // If there are correct lines, pick one randomly to break
            if (correctLines.length > 0) {
                const randomIndex = Math.floor(Math.random() * correctLines.length);
                const line = correctLines[randomIndex];
                
                // Keep line number
                const lineNum = line.querySelector('span');
                line.innerHTML = '';
                line.appendChild(lineNum);
                
                // Replace with error syntax
                const errorText = this.errorTemplates[Math.floor(Math.random() * this.errorTemplates.length)];
                const errorSpan = document.createElement('span');
                errorSpan.textContent = errorText;
                errorSpan.style.color = '#f33';
                errorSpan.style.textDecoration = 'underline wavy #f33';
                errorSpan.style.textDecorationSkipInk = 'none';
                line.appendChild(errorSpan);
                
                line.dataset.hasError = 'true';
            }
        }
    }
}

