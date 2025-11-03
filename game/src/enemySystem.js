import { makeEnemyText } from './utils.js';
import { BASE_ERRORS, WRAPS } from './constants.js';

export class EnemySystem {
    constructor(canvas, bgController = null) {
        this.canvas = canvas;
        this.enemies = [];
        this.lastSpawn = 0;
        this.spawnInterval = 800;
        this.score = 0;
        this.multiplier = 1.0;
        this.bgController = bgController;
        this.onEnemyReachedBottom = null; // Callback for when enemy reaches bottom
        this.startTime = 0; // Game start time for timer
        this.elapsedTime = 0; // Elapsed time in seconds
        
        // Tier-based difficulty settings
        this.baseEnemySpeed = 1.5;
        this.enemySpeedMultiplier = 1.0;
    }

    update() {
        // Update timer
        if (this.startTime > 0) {
            this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
        }
        
        // Move enemies
        this.enemies.forEach(e => e.y += e.speed);
        
        // Check for enemies that reached the bottom
        const enemiesReachingBottom = this.enemies.filter(e => e.y >= this.canvas.height + 40);
        
        if (enemiesReachingBottom.length > 0) {
            // Penalty: -5 score and reset multiplier for each enemy that got through
            enemiesReachingBottom.forEach(() => {
                this.score = Math.max(0, this.score - 5); // Don't go below 0
                this.multiplier = 1.0; // Reset multiplier
                
                // Add an error back to the background
                if (this.bgController) {
                    this.bgController.addBackgroundError();
                }
                
                // Trigger callback if set
                if (this.onEnemyReachedBottom) {
                    this.onEnemyReachedBottom();
                }
            });
        }
        
        // Filter out enemies that went past bottom
        this.enemies = this.enemies.filter(e => e.y < this.canvas.height + 40);

        // Check if we should spawn a new enemy
        if (Date.now() - this.lastSpawn > this.spawnInterval) {
            this.spawnEnemy();
            this.lastSpawn = Date.now();
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.font = "14px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        this.enemies.forEach(e => {
            const hue = 5 + Math.random() * 20;
            ctx.fillStyle = `hsl(${hue}, 100%, 60%)`;
            ctx.save();
            ctx.translate(e.x, e.y);
            ctx.rotate(-Math.PI / 2);
            ctx.fillText(e.text, 0, 0);
            ctx.restore();
        });
        ctx.restore();

        // Draw score with multiplier
        ctx.fillStyle = "#fff";
        ctx.font = "12px 'Press Start 2P', monospace";
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";
        ctx.fillText("Fixed: " + this.score, 10, 24);
        
        // Draw multiplier if > 1.0
        if (this.multiplier > 1.0) {
            ctx.fillStyle = "#0ff";
            ctx.font = "10px 'Press Start 2P', monospace";
            ctx.fillText("x" + this.multiplier.toFixed(1), 10, 45);
        }
        
        // Draw timer in center top
        ctx.fillStyle = "#fff";
        ctx.font = "10px 'Press Start 2P', monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "alphabetic";
        const minutes = Math.floor(this.elapsedTime / 60);
        const seconds = this.elapsedTime % 60;
        const timeString = String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
        ctx.fillText(timeString, this.canvas.width / 2, 24);
    }

    spawnEnemy() {
        const speedVariation = Math.random() * 1.5;
        this.enemies.push({
            x: Math.random() * (this.canvas.width - 60) + 30,
            y: -30,
            text: makeEnemyText(BASE_ERRORS, WRAPS),
            speed: (this.baseEnemySpeed + speedVariation) * this.enemySpeedMultiplier
        });
    }

    /**
     * Update tier settings from difficulty system
     * @param {Object} tierConfig - Configuration from difficulty system
     */
    updateTierSettings(tierConfig) {
        this.enemySpeedMultiplier = tierConfig.enemySpeed;
        this.spawnInterval = tierConfig.enemySpawnInterval;
    }

    checkBulletCollisions(bullets, powerUps, player) {
        bullets.forEach((b, bi) => {
            this.enemies.forEach((en, ei) => {
                const dx = b.x - en.x;
                const dy = b.y - en.y;
                if (Math.abs(dx) < 15 && Math.abs(dy) < 20) {
                    // Check bullet damage (2x with memory leak power-up)
                    const damage = b.damage || 1;
                    
                    if (damage >= 1) {
                        // Store enemy position before removing
                        const enemyX = en.x;
                        const enemyY = en.y;
                        
                        this.enemies.splice(ei, 1);
                        bullets.splice(bi, 1);
                        
                        // Add points with multiplier
                        // Patch token doubles score
                        const scoreMultiplier = powerUps && powerUps.isActive('patchToken') ? 2 : 1;
                        const pointsEarned = Math.round(1 * this.multiplier * scoreMultiplier);
                        this.score += pointsEarned;
                        
                        // Increase multiplier by 0.1 for each successful hit
                        this.multiplier += 0.1;
                        this.multiplier = Math.round(this.multiplier * 10) / 10; // Round to 1 decimal
                        
                        // Try to spawn drop from enemy death
                        if (powerUps && player) {
                            powerUps.spawnDropFromEnemy(enemyX, enemyY, player);
                        }
                    }
                }
            });
        });
    }
    
    // Reset multiplier when player takes damage
    resetMultiplier() {
        this.multiplier = 1.0;
    }

    checkPlayerCollision(player) {
        for (let en of this.enemies) {
            const dx = en.x - player.x;
            const dy = en.y - player.y;
            if (Math.sqrt(dx * dx + dy * dy) < 22) {
                return true;
            }
        }
        return false;
    }

    reset() {
        this.enemies = [];
        this.score = 0;
        this.multiplier = 1.0;
        this.lastSpawn = Date.now();
        this.startTime = Date.now(); // Start the timer
        this.elapsedTime = 0;
    }
}