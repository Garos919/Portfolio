export class DeathScreen {
    constructor() {
        this.messages = {
            catastrophic: [
                "This project has been a disaster.",
                "Bugs ate the code. And your sanity.",
                "Critical failure: developer terminated.",
                "What the bug is going on?!",
                "Syntax Error: You.",
                "The compiler laughed. Then cried."
            ],
            functional: [
                "The code runs… occasionally.",
                "Half the errors fixed, half plotting revenge.",
                "Build succeeded (…with warnings).",
                "Not bad — just don't open the console.",
                "You hot-patched your way through chaos.",
                "QA is both impressed and concerned."
            ],
            clean: [
                "System stabilized. Refactor complete.",
                "You squashed bugs faster than QA could report them.",
                "Solid commit — no rollbacks needed.",
                "Zone 01 would be proud.",
                "Production build ready for deployment.",
                "Release notes: 'Everything actually works.' Maybe."
            ],
            mythic: [
                "Zero Errors Detected. Reality Compiled.",
                "Perfect Build — Ship It!",
                "Console clean. You achieved digital nirvana.",
                "From chaos to clean code — legend achieved.",
                "🏆 You are the final merge request.",
                "The matrix submits to your pull request."
            ]
        };
    }

    getMessageForScore(score) {
        let category;
        let emoji;
        
        if (score < 200) {
            category = 'catastrophic';
            emoji = '🧨';
        } else if (score < 500) {
            category = 'functional';
            emoji = '⚙️';
        } else if (score < 900) {
            category = 'clean';
            emoji = '🚀';
        } else {
            category = 'mythic';
            emoji = '🧠';
        }
        
        const messages = this.messages[category];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        
        return { emoji, message: randomMessage };
    }

    show(score, onRestart, onReturnToMenu, fadeTransition) {
        const gameContainer = document.getElementById('gameContainer');
        
        // Create death screen overlay
        const deathScreen = document.createElement('div');
        deathScreen.id = 'deathScreen';
        
        Object.assign(deathScreen.style, {
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'rgba(0,0,0,0.95)',
            color: '#f33',
            textAlign: 'center',
            fontFamily: "'Press Start 2P', monospace",
            zIndex: 200,
            border: '2px solid #f33',
            boxSizing: 'border-box',
            padding: '40px'
        });

        // Game Over title
        const gameOver = document.createElement('div');
        gameOver.textContent = 'GAME OVER';
        Object.assign(gameOver.style, {
            fontSize: '48px',
            marginBottom: '30px',
            textShadow: '0 0 10px #f33, 0 0 30px #f33',
            letterSpacing: '4px'
        });

        // Score display
        const scoreDisplay = document.createElement('div');
        scoreDisplay.textContent = `SCORE: ${score}`;
        Object.assign(scoreDisplay.style, {
            fontSize: '24px',
            color: '#0ff',
            marginBottom: '40px',
            textShadow: '0 0 8px #0ff'
        });

        // Get message based on score
        const { emoji, message } = this.getMessageForScore(score);

        // Emoji display
        const emojiDisplay = document.createElement('div');
        emojiDisplay.textContent = emoji;
        Object.assign(emojiDisplay.style, {
            fontSize: '64px',
            marginBottom: '20px'
        });

        // Message display
        const messageDisplay = document.createElement('div');
        messageDisplay.textContent = message;
        Object.assign(messageDisplay.style, {
            fontSize: '14px',
            color: '#fff',
            maxWidth: '500px',
            lineHeight: '1.8',
            marginBottom: '50px',
            textShadow: 'none'
        });

        // Button container
        const buttonContainer = document.createElement('div');
        Object.assign(buttonContainer.style, {
            display: 'flex',
            gap: '20px',
            flexDirection: 'row'
        });

        // Restart button
        const restartBtn = this.createButton('RESTART', () => {
            // Play unpause sound
            try {
                if (window.audioManager && window.audioManager.playUnpause) {
                    window.audioManager.playUnpause();
                }
            } catch (e) {}
            
            // Fade to black then restart
            if (fadeTransition) {
                fadeTransition(() => {
                    onRestart();
                    deathScreen.remove();
                }, 500);
            } else {
                deathScreen.remove();
                onRestart();
            }
        });

        // Return to menu button
        const menuBtn = this.createButton('MAIN MENU', () => {
            // Play unpause sound
            try {
                if (window.audioManager && window.audioManager.playUnpause) {
                    window.audioManager.playUnpause();
                }
            } catch (e) {}
            
            // Fade to black then return to menu
            if (fadeTransition) {
                fadeTransition(() => {
                    deathScreen.remove();
                    onReturnToMenu();
                }, 500);
            } else {
                deathScreen.remove();
                onReturnToMenu();
            }
        });

        buttonContainer.append(restartBtn, menuBtn);
        deathScreen.append(gameOver, scoreDisplay, emojiDisplay, messageDisplay, buttonContainer);
        gameContainer.appendChild(deathScreen);
    }

    createButton(text, onClick) {
        const button = document.createElement('button');
        button.textContent = text;
        
        Object.assign(button.style, {
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.1) 1px, rgba(0,0,0,0.1) 2px), repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(0,0,0,0.1) 1px, rgba(0,0,0,0.1) 2px), linear-gradient(180deg, #0ff 0%, #0dd 50%, #0bb 100%)",
            border: "2px solid #0dd",
            color: "#000",
            fontFamily: "'Press Start 2P', monospace",
            fontWeight: "normal",
            padding: "15px 30px",
            borderRadius: "0",
            cursor: "pointer",
            fontSize: "12px",
            boxShadow: "0 4px 0 #088, 0 0 20px rgba(0,255,255,0.5)",
            textShadow: "1px 1px 0 rgba(0,0,0,0.3)",
            imageRendering: "pixelated",
            transition: "all 0.1s ease",
            position: "relative"
        });

        button.addEventListener("mouseenter", () => {
            button.style.backgroundImage = "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.1) 1px, rgba(0,0,0,0.1) 2px), repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(0,0,0,0.1) 1px, rgba(0,0,0,0.1) 2px), linear-gradient(180deg, #fff 0%, #ddd 50%, #bbb 100%)";
            button.style.color = "#0ff";
            button.style.boxShadow = "0 4px 0 #088, 0 0 30px rgba(0,255,255,0.8)";
            button.style.transform = "translateY(-2px)";
        });

        button.addEventListener("mouseleave", () => {
            button.style.backgroundImage = "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.1) 1px, rgba(0,0,0,0.1) 2px), repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(0,0,0,0.1) 1px, rgba(0,0,0,0.1) 2px), linear-gradient(180deg, #0ff 0%, #0dd 50%, #0bb 100%)";
            button.style.color = "#000";
            button.style.boxShadow = "0 4px 0 #088, 0 0 20px rgba(0,255,255,0.5)";
            button.style.transform = "translateY(0)";
        });

        button.addEventListener("click", onClick);

        return button;
    }
}
