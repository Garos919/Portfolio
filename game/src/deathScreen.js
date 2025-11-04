export class DeathScreen {
    constructor() {
        // Meme machine data - each entry: [message, sound, gif1, gif2, rank]
        this.memes = [
            ["classic", "0classic_periptosh.mp3", "0classic_periptosh.gif", "0classic_periptosh2.gif", "rank1"],
            ["no escaping now", "0adonh-agaph-mou.mp3", "0adonh-agaph-mou.gif", "0adonh-agaph-mou2.gif", "rank1"],
            ["aura +1000000", "0aura-farmer.mp3", "0aura-farmer.gif", "0aura-farmer2.gif", "rank4"],
            ["The GOAT", "0the-goat.mp3", "0the-goat.gif", "0the-goat2.gif", "rank4"],
            ["I know chill..", "0albanian-curses.mp3", "0albanian-curses.gif", "0albanian-curses2.gif", "rank2"],
            ["You aint convincing anyone", "0i-know-what-you-did.mp3", "0i-know-what-you-did.gif", "0i-know-what-you-did2.gif", "rank2"],
            ["Your code synchronizing with the rest of the project", "0carribean-flute.mp3", "0carribean-flute.gif", "0carribean-flute2.gif", "rank1"],
            ["Why are you still here?", "0eh-eh.mp3", "0eh-eh.gif", "0eh-eh2.gif", "rank1"],
            ["You low-k chillin", "0chill-sax-guy.mp3", "0chill-sax-guy.gif", "0chill-sax-guy2.gif", "rank3"],
            ["Oh.. mhh.. you work so elegantly", "0elegant-work.mp3", "0elegant-work.gif", "0elegant-work2.gif", "rank3"],
            ["Straight to NASA", "0for-real.mp3", "0for-real.gif", "0for-real2.gif", "rank1"],
            ["Mission Passed. +respect", "0mission-passed-+respect.mp3", "0mission-passed-+respect.gif", "0mission-passed-+respect2.gif", "rank3"],
            ["Ok Ok ill say it calm down", "0say-my-name.mp3", "0say-my-name.gif", "0say-my-name2.gif", "rank4"],
            ["We all knew it", "0he-knew.mp3", "0he-knew.gif", "0he-knew2.gif", "rank1"],
            ["You are a great debugger", "0illusions.mp3", "0illusions.gif", "0illusions2.gif", "rank1"],
            ["I gave you my heart, you gave me bugs", "0indian-christmas.mp3", "0indian-christmas.gif", "0indian-christmas2.gif", "rank1"],
            ["Huh... you are a funnu guy", "0final-credits.mp3", "0final-credits.gif", "0final-credits2.gif", "rank1"],
            ["You take everything so personal?", "0sigma.mp3", "0sigma.gif", "0sigma2.gif", "rank4"],
            ["Between us... you dont know whats wrong in that code", "0spider-man-wabble.mp3", "0spider-man-wabble.gif", "0spider-man-wabble2.gif", "rank1"],
            ["oiia", "0oiia.mp3", "0oiia.gif", "0oiia2.gif", "rank1"],
            ["Uhm... what are you doing to this bug?", "0love-bug.mp3", "0love-bug.gif", "0love-bug2.gif", "rank3"],
            ["Broke, alone and with cats", "0sad-meow.mp3", "0sad-meow.gif", "0sad-meow2.gif", "rank1"],
            ["You catch bugs before they reach your web", "0spiderman-power.mp3", "0spiderman-power.gif", "0spiderman-power2.gif", "rank4"],
            ["You almost had something there", "0super-mario-maybe-not.mp3", "0super-mario-maybe-not.gif", "0super-mario-maybe-not2.gif", "rank2"],
            ["We all have bad days", "0sad-violin.mp3", "0sad-violin.gif", "0sad-violin2.gif", "rank2"],
            ["You smuggled bugs in the final product", "0the-best-pirate-ive-ever-seen.mp3", "0the-best-pirate-ive-ever-seen.gif", "0the-best-pirate-ive-ever-seen2.gif", "rank1"],
            ["I understand", "0they-just-dont-get-it.mp3", "0they-just-dont-get-it.gif", "0they-just-dont-get-it2.gif", "rank2"],
            ["Is that you talking to co-pilot?", "0why-you-put-cheese-on-my-cheeseburger.mp3", "0why-you-put-cheese-on-my-cheeseburger.gif", "0why-you-put-cheese-on-my-cheeseburger2.gif", "rank2"],
            ["Leave some bugs for the rest of us", "0anastasia_boosted.mp3", "0anastasia_boosted.gif", "0anastasia_boosted2.gif", "rank3"],
            ["I run out of bugs dude", "0xios-kai-allo.mp3", "0xios-kai-allo.gif", "0xios-kai-allo2.gif", "rank4"],
            ["Stop doing the chinese and go study", "0chinese.mp3", "0chinese.gif", "0chinese2.gif", "rank2"],
            ["You were the problem all along", "0dun-dun-dun.mp3", "0dun-dun-dun.gif", "0dun-dun-dun2.gif", "rank2"],
            ["Fixing bugs for the last hour i see", "0keyboard-bang.mp3", "0keyboard-bang.gif", "0keyboard-bang2.gif", "rank2"],
            ["Finally it boots.. nevermind", "0ps2.mp3", "0ps2.gif", "0ps22.gif", "rank2"],
        ];
    }

    getRankForScore(score) {
        if (score < 300) return "rank1";
        if (score < 700) return "rank2";
        if (score < 1200) return "rank3";
        return "rank4";
    }

    async checkFileExists(url) {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            return response.ok;
        } catch {
            return false;
        }
    }

    async getMemeForScore(score) {
        const rank = this.getRankForScore(score);
        // Filter memes by rank
        const availableMemes = this.memes.filter(meme => meme[4] === rank);
        
        // Shuffle to randomize selection order
        const shuffled = availableMemes.sort(() => Math.random() - 0.5);
        
        // Try to find a valid meme with existing files
        for (const meme of shuffled) {
            const soundPath = `meme-machine/${meme[1]}`;
            const gif1Path = `meme-machine/${meme[2]}`;
            const gif2Path = `meme-machine/${meme[3]}`;
            
            // Check if sound exists
            const soundExists = await this.checkFileExists(soundPath);
            if (!soundExists) continue;
            
            // Check if at least one gif exists
            const gif1Exists = await this.checkFileExists(gif1Path);
            const gif2Exists = await this.checkFileExists(gif2Path);
            
            if (!gif1Exists && !gif2Exists) continue;
            
            // Choose gif based on 50/50 or availability
            let gif;
            if (gif1Exists && gif2Exists) {
                // Both exist, 50/50 chance
                gif = Math.random() < 0.5 ? meme[3] : meme[2];
            } else if (gif1Exists) {
                gif = meme[2];
            } else {
                gif = meme[3];
            }
            
            return {
                message: meme[0],
                sound: meme[1],
                gif: gif
            };
        }
        
        // Fallback if no valid memes found in rank
        return {
            message: "Game Over",
            sound: null,
            gif: null
        };
    }

    async show(score, onRestart, onReturnToMenu, fadeTransition) {
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

        // Get meme based on score (async)
        const { message, sound, gif } = await this.getMemeForScore(score);

        // GIF display (only if gif exists)
        const gifDisplay = document.createElement('img');
        if (gif) {
            gifDisplay.src = `meme-machine/${gif}`;
            Object.assign(gifDisplay.style, {
                width: '300px',
                height: 'auto',
                marginBottom: '20px',
                imageRendering: 'auto'
            });
        } else {
            // Hide if no gif available
            gifDisplay.style.display = 'none';
        }

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
        
        // Play death sound once (only if sound exists)
        let deathSound = null;
        if (sound) {
            deathSound = new Audio(`meme-machine/${sound}`);
            deathSound.volume = 0.5;
            deathSound.play().catch(e => console.log('Death sound play failed:', e));
        }

        // Helper function to fade out death sound
        const fadeOutDeathSound = (duration) => {
            if (!deathSound || deathSound.paused) return;
            
            const startVolume = deathSound.volume;
            const startTime = Date.now();
            
            const fade = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                deathSound.volume = startVolume * (1 - progress);
                
                if (progress < 1) {
                    requestAnimationFrame(fade);
                } else {
                    deathSound.pause();
                }
            };
            
            requestAnimationFrame(fade);
        };

        // Button container
        const buttonContainer = document.createElement('div');
        Object.assign(buttonContainer.style, {
            display: 'flex',
            gap: '20px',
            flexDirection: 'row'
        });

        // Restart button
        const restartBtn = this.createButton('RESTART', () => {
            // Fade out death sound
            fadeOutDeathSound(500);
            
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
            // Fade out death sound
            fadeOutDeathSound(500);
            
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
        deathScreen.append(gameOver, scoreDisplay, gifDisplay, messageDisplay, buttonContainer);
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
            // Play hover sound
            if (window.audioManager && window.audioManager.playHover) {
                window.audioManager.playHover();
            }
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
