import { Player } from './player.js';
import { ParticleSystem } from './particleSystem.js';
import { EnemySystem } from './enemySystem.js';
import { IntroSequence } from './introSequence.js';
import { BackgroundSystem } from './backgroundSystem.js';
import { ObstacleSystem } from './obstacleSystem.js';
import { CollectibleSystem } from './collectibleSystem.js';
import { DeathScreen } from './deathScreen.js';
import { PowerUpSystem } from './powerUpSystem.js';
import { DifficultySystem } from './difficultySystem.js';
import { CANVAS_CONFIG } from './constants.js';

export class Game {
    constructor() {
        this.canvas = document.getElementById("game");
        this.ctx = this.canvas.getContext("2d");
        this.running = false;
        this.running = false;
        this.paused = false;
        this.bgController = null; // Will be set from intro sequence

        // Initialize systems
        this.player = new Player(this.canvas);
        this.particles = new ParticleSystem();
        this.enemies = new EnemySystem(this.canvas, null); // bgController will be set later
        this.background = new BackgroundSystem(this.canvas);
        this.obstacles = new ObstacleSystem(this.canvas);
        this.collectibles = new CollectibleSystem(this.canvas);
        this.powerUps = new PowerUpSystem(this.canvas);
        this.deathScreen = new DeathScreen();
        this.difficulty = new DifficultySystem();

        // Tier transition notification
        this.tierNotification = {
            active: false,
            message: '',
            startTime: 0,
            duration: 3000 // 3 seconds
        };

        this.createPauseOverlay();
        this.setupEventListeners();
    }

    createPauseOverlay() {
        this.pauseOverlay = document.createElement('div');
        this.pauseOverlay.id = 'pauseOverlay';
        Object.assign(this.pauseOverlay.style, {
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'none',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            fontFamily: "'Press Start 2P', monospace",
            boxSizing: 'border-box'
        });

        // Build inner menu container
        const menuWrap = document.createElement('div');
        Object.assign(menuWrap.style, {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '18px',
            background: 'rgba(0,0,0,0.8)',
            padding: '24px',
            border: '2px solid #0ff',
            borderRadius: '6px'
        });

        const title = document.createElement('div');
        title.textContent = 'PAUSED';
        Object.assign(title.style, {
            color: '#0ff',
            fontSize: '20px',
            marginBottom: '6px'
        });

        // Helper to create buttons
        const makeBtn = (text) => {
            const b = document.createElement('button');
            b.textContent = text;
            Object.assign(b.style, {
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '12px',
                padding: '10px 18px',
                background: '#111',
                color: '#fff',
                border: '2px solid #0ff',
                borderRadius: '4px',
                cursor: 'pointer'
            });
            b.addEventListener('mouseover', () => { b.style.background = '#022'; });
            b.addEventListener('mouseout', () => { b.style.background = '#111'; });
            b.addEventListener('mouseenter', () => {
                if (window.audioManager && window.audioManager.playHover) {
                    window.audioManager.playHover();
                }
            });
            return b;
        };

        const resumeBtn = makeBtn('RESUME');
        const restartBtn = makeBtn('RESTART');
        const menuBtn = makeBtn('MAIN MENU');

        // Wire button actions
        resumeBtn.addEventListener('click', () => {
            // Play unpause sound and unpause
            try {
                if (window.audioManager && window.audioManager.playUnpause) {
                    window.audioManager.playUnpause();
                }
            } catch (e) {}
            if (this.paused) this.togglePause();
        });

        restartBtn.addEventListener('click', () => {
            // Play unpause sound
            try {
                if (window.audioManager && window.audioManager.playUnpause) {
                    window.audioManager.playUnpause();
                }
            } catch (e) {}
            
            // Fade to black then restart
            this.fadeTransition(() => {
                this.pauseOverlay.style.display = 'none';
                this.paused = false;
                this.restart();
            }, 500);
        });

        menuBtn.addEventListener('click', () => {
            // Play unpause sound and fade out music
            try {
                if (window.audioManager && window.audioManager.playUnpause) {
                    window.audioManager.playUnpause();
                }
                if (window.audioManager && window.audioManager.fadeOut) {
                    window.audioManager.fadeOut(500);
                }
            } catch (e) {}
            
            // Fade to black then return to menu
            this.fadeTransition(() => {
                this.pauseOverlay.style.display = 'none';
                this.paused = false;
                this.returnToMenu();
            }, 500);
        });

        // Assemble
        menuWrap.appendChild(title);
        menuWrap.appendChild(resumeBtn);
        menuWrap.appendChild(restartBtn);
        menuWrap.appendChild(menuBtn);

        this.pauseOverlay.appendChild(menuWrap);

        // Append to gameContainer instead of body
        const gameContainer = document.getElementById('gameContainer');
        if (gameContainer) {
            gameContainer.appendChild(this.pauseOverlay);
        } else {
            document.body.appendChild(this.pauseOverlay);
        }
    }

    // Fade to black transition with fade in from black
    fadeTransition(callback, duration = 500) {
        const gameContainer = document.getElementById('gameContainer');
        const fadeOverlay = document.createElement('div');
        
        Object.assign(fadeOverlay.style, {
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: '#000',
            opacity: '0',
            transition: `opacity ${duration}ms ease-in-out`,
            zIndex: '9999',
            pointerEvents: 'none'
        });
        
        gameContainer.appendChild(fadeOverlay);
        
        // Trigger fade to black
        setTimeout(() => {
            fadeOverlay.style.opacity = '1';
        }, 10);
        
        // Execute callback at peak of fade (when fully black)
        setTimeout(() => {
            callback();
            
            // Wait a brief moment for new scene to render
            setTimeout(() => {
                // Fade from black to transparent
                fadeOverlay.style.opacity = '0';
                
                // Remove overlay after fade completes
                setTimeout(() => {
                    fadeOverlay.remove();
                }, duration);
            }, 100);
        }, duration);
    }

    setupEventListeners() {
        document.addEventListener("pointerlockchange", () => {
            this.mouseLocked = document.pointerLockElement === this.canvas;
            if (!this.mouseLocked) this.player.firing = false;
        });

        document.addEventListener("mousemove", (e) => {
            if (this.running && this.mouseLocked && !this.paused) {
                const speedMultiplier = this.obstacles.checkPlayerInCloud(this.player) ? 0.25 : 1;
                this.player.x += e.movementX * speedMultiplier;
                this.player.y += e.movementY * speedMultiplier;
                this.player.x = Math.max(this.player.size, Math.min(this.canvas.width - this.player.size, this.player.x));
                this.player.y = Math.max(this.player.size, Math.min(this.canvas.height - this.player.size, this.player.y));
            }
        });

        this.canvas.addEventListener("mousedown", (e) => {
            if (e.button === 0 && this.running && !this.paused) this.firing = true;
        });

        this.canvas.addEventListener("mouseup", (e) => {
            if (e.button === 0) this.firing = false;
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === " " && this.running) {
                e.preventDefault();
                this.togglePause();
            }
        });
    }

    togglePause() {
        this.paused = !this.paused;
        
        if (this.paused) {
            // Play pause sound
            try {
                if (window.audioManager && window.audioManager.playPause) {
                    window.audioManager.playPause();
                }
            } catch (e) {}
            
            this.pauseOverlay.style.display = 'flex';
            this.firing = false;
            if (this.mouseLocked) {
                document.exitPointerLock();
            }
        } else {
            // Play unpause sound
            try {
                if (window.audioManager && window.audioManager.playUnpause) {
                    window.audioManager.playUnpause();
                }
            } catch (e) {}
            
            this.pauseOverlay.style.display = 'none';
            // Immediately request pointer lock when unpausing
            if (!this.mouseLocked) {
                this.canvas.requestPointerLock();
            }
        }
    }

    start() {
        // Reset all systems
        this.player.reset();
        this.enemies.reset();
        this.obstacles.reset();
        this.collectibles.reset();
        this.powerUps.reset();
        this.difficulty.reset();
        
        // Initialize tier 1 settings
        const initialTierSettings = this.difficulty.applyTierSettings(1);
        this.enemies.updateTierSettings(initialTierSettings);
        this.obstacles.updateTierSettings(initialTierSettings);
        
        // Set bgController in enemy system if available
        if (this.bgController) {
            this.enemies.bgController = this.bgController;
        }

        // Ensure collectible timer starts counting from gameplay start (hearts spawn every spawnInterval)
        try {
            if (this.collectibles) this.collectibles.nextSpawn = Date.now() + this.collectibles.spawnInterval;
        } catch (e) {
            // ignore if collectibles not available
        }

        // Ensure canvas is visible
        this.canvas.style.display = 'block';
        this.canvas.style.opacity = '1';

        // Hide warning and dialogue elements (but keep overlay for fade transition)
        try {
            const warning = document.getElementById('warning');
            if (warning) { warning.style.display = 'none'; warning.style.opacity = '0'; }
            const mission = document.getElementById('missionText');
            if (mission) { mission.style.display = 'none'; mission.style.opacity = '0'; }
            const dialogue = document.getElementById('dialogueBox');
            if (dialogue) { dialogue.style.display = 'none'; dialogue.classList.remove('active'); }
            // Note: introOverlay is managed by IntroSequence for fade effect
        } catch (e) {
            // ignore if DOM not available
        }

        this.running = true;
        this.firing = false;
        this.canvas.style.cursor = CANVAS_CONFIG.NO_CURSOR;
        
        // Request pointer lock - if it fails, add click listener
        this.canvas.requestPointerLock();
        
        // Add fallback click listener to engage pointer lock
        const clickToLock = () => {
            if (this.running && !this.mouseLocked) {
                this.canvas.requestPointerLock();
            }
        };
        this.canvas.addEventListener('click', clickToLock);
        
        requestAnimationFrame(() => this.loop());
    }

    gameOver() {
        this.running = false;
        this.firing = false;
        document.exitPointerLock();
        this.canvas.style.cursor = CANVAS_CONFIG.DEFAULT_CURSOR;
        
        // Show death screen with score and callbacks
        this.deathScreen.show(
            this.enemies.score,
            () => this.restart(),
            () => this.returnToMenu(),
            (callback, duration) => this.fadeTransition(callback, duration)
        );
    }
    
    restart() {
        // Clear the canvas immediately to remove frozen death frame
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Reset all systems without intro
        this.player = new Player(this.canvas);
        this.particles = new ParticleSystem();
        this.enemies = new EnemySystem(this.canvas, this.bgController);
        this.background = new BackgroundSystem(this.canvas);
        this.obstacles = new ObstacleSystem(this.canvas);
        this.collectibles = new CollectibleSystem(this.canvas);
        this.powerUps = new PowerUpSystem(this.canvas);
        this.difficulty = new DifficultySystem();
        
        // Reset background to code
        if (this.bgController) {
            this.bgController.showCodeBackground();
            this.enemies.bgController = this.bgController;
        }
        
        // Initialize tier 1 settings
        const initialTierSettings = this.difficulty.applyTierSettings(1);
        this.enemies.updateTierSettings(initialTierSettings);
        this.obstacles.updateTierSettings(initialTierSettings);
        
        // Reset firing state
        this.firing = false;
        this.paused = false;
        
        // Start game immediately
        this.running = true;
        
        // MUST restart the game loop since it stopped when this.running was false
        requestAnimationFrame(() => this.loop());
        
        // Request pointer lock
        this.canvas.requestPointerLock();
        this.canvas.style.cursor = CANVAS_CONFIG.LOCKED_CURSOR;
    }
    
    returnToMenu() {
        // Simplest and most reliable solution: reload the page
        // This resets everything to initial state
        window.location.reload();
    }

    update() {
        if (!this.running || this.paused) return;

        // Update difficulty tier based on elapsed time
        const tierChanged = this.difficulty.update(this.enemies.elapsedTime);
        if (tierChanged) {
            const tierSettings = this.difficulty.applyTierSettings(this.difficulty.currentTier);
            this.enemies.updateTierSettings(tierSettings);
            this.obstacles.updateTierSettings(tierSettings);
            
            // Show tier change notification
            this.tierNotification.active = true;
            this.tierNotification.message = `TIER ${this.difficulty.currentTier}: ${tierSettings.tierName.toUpperCase()}`;
            this.tierNotification.startTime = Date.now();
        }

        // Update tier notification
        if (this.tierNotification.active) {
            if (Date.now() - this.tierNotification.startTime > this.tierNotification.duration) {
                this.tierNotification.active = false;
            }
        }

        // Update all systems
        this.background.update();
        this.particles.update();
        this.player.update(this.firing, this.powerUps);
        this.enemies.update();
        this.obstacles.update();
        this.collectibles.update();
        this.powerUps.update();

        // Check collisions
        this.enemies.checkBulletCollisions(this.player.bullets, this.powerUps, this.player);
        this.obstacles.checkBulletCollisions(this.player.bullets, this.powerUps, this.particles);
        this.collectibles.checkCollisions(this.player);
        this.powerUps.checkPlayerCollision(this.player);

        // Check enemy collision (skip if incognito mode active)
        if (!this.powerUps.isActive('incognito')) {
            if (this.enemies.checkPlayerCollision(this.player)) {
                if (this.player.takeDamage()) {
                    this.gameOver();
                } else {
                    // Reset multiplier when taking damage
                    this.enemies.resetMultiplier();
                }
            }

            // Check obstacle collision
            if (this.obstacles.checkPlayerCollision(this.player, this.particles)) {
                if (this.player.takeDamage()) {
                    this.gameOver();
                } else {
                    // Reset multiplier when taking damage
                    this.enemies.resetMultiplier();
                }
            }
        }
        
        // Update background based on score
        if (this.bgController) {
            this.bgController.updateCodeBackground(this.enemies.score);
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw all systems
        this.background.draw(this.ctx);
        this.particles.draw(this.ctx);
        this.obstacles.draw(this.ctx);
        this.collectibles.draw(this.ctx);
        this.powerUps.draw(this.ctx);
        this.enemies.draw(this.ctx);
        this.player.draw(this.ctx, this.powerUps);

        // Draw tier notification (center screen)
        if (this.tierNotification.active) {
            const elapsed = Date.now() - this.tierNotification.startTime;
            const progress = elapsed / this.tierNotification.duration;
            
            // Fade in/out effect
            let alpha = 1.0;
            if (progress < 0.2) {
                alpha = progress / 0.2;
            } else if (progress > 0.8) {
                alpha = (1.0 - progress) / 0.2;
            }
            
            this.ctx.save();
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = "#0ff";
            this.ctx.font = "16px 'Press Start 2P', monospace";
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";
            this.ctx.shadowColor = "#0ff";
            this.ctx.shadowBlur = 20;
            this.ctx.fillText(this.tierNotification.message, this.canvas.width / 2, this.canvas.height / 2 - 50);
            this.ctx.restore();
        }

        // Draw tier name (bottom center)
        if (this.running && this.difficulty) {
            const tierName = this.difficulty.getCurrentTierName();
            this.ctx.fillStyle = "#0ff";
            this.ctx.font = "10px 'Press Start 2P', monospace";
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "alphabetic";
            this.ctx.fillText(`TIER ${this.difficulty.currentTier}: ${tierName.toUpperCase()}`, this.canvas.width / 2, this.canvas.height - 10);
        }

        // Draw border
        this.ctx.strokeStyle = "#fff";
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
    }

    loop() {
        if (!this.running) return;
        this.update();
        this.draw();
        requestAnimationFrame(() => this.loop());
    }
}

// Initialize game when window loads
window.addEventListener('load', () => {
    const game = new Game();
    const intro = new IntroSequence(document.getElementById('game'));
    
    // Import the menu module and start the game sequence
    import('./menu.js').then(({ createMenu }) => {
        // menu will pass start button, title, menu container, and background controller
        createMenu(async (startBtn, titleContainer, menu, bgController) => {
            // Store background controller in game instance
            game.bgController = bgController;
            
            await intro.start(startBtn, titleContainer, menu, bgController, () => {
                game.start();
            });
        });
    });
});