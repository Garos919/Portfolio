import { drawCursorShip } from './utils.js';
import { PLAYER_CONFIG } from './constants.js';

export class Player {
    constructor(canvas) {
        this.canvas = canvas;
        this.x = canvas.width / 2;
        this.y = canvas.height - 60;
        this.size = 14;
        this.bullets = [];
        this.health = PLAYER_CONFIG.DEFAULT_HEALTH;
        this.invulnerable = 0;
        this.speedMultiplier = PLAYER_CONFIG.NORMAL_SPEED;
        this.lastShot = 0;
        this.hasShield = false; // Shield state
    }

    update(firing, powerUps) {
        if (firing) this.tryFire(powerUps);
        
        if (this.invulnerable > 0) {
            this.invulnerable--;
        }

        // Update bullets - faster speed with overclock
        const bulletSpeed = powerUps && powerUps.isActive('overclock') 
            ? PLAYER_CONFIG.BULLET_SPEED * 1.5 
            : PLAYER_CONFIG.BULLET_SPEED;
        this.bullets.forEach(b => b.y -= bulletSpeed);
        this.bullets = this.bullets.filter(b => b.y > -10);
    }

    tryFire(powerUps) {
        const now = Date.now();
        // Faster fire rate with overclock
        const fireDelay = powerUps && powerUps.isActive('overclock') 
            ? PLAYER_CONFIG.FIRE_DELAY / 1.5 
            : PLAYER_CONFIG.FIRE_DELAY;
            
        if (now - this.lastShot >= fireDelay) {
            this.bullets.push({ 
                x: this.x, 
                y: this.y - this.size, 
                r: 2,
                damage: powerUps && powerUps.isActive('memoryLeak') ? 2 : 1
            });
            this.lastShot = now;
        }
    }

    draw(ctx, powerUps) {
        // Draw player with power-up effects
        let shipColor = "#fff";
        let shipOpacity = 1;
        
        // Flash effect when invulnerable (hit damage)
        if (this.invulnerable > 0) {
            // Fast flash animation - alternates between white and transparent
            const flashSpeed = 6; // Frames between flashes
            const flashPhase = Math.floor(this.invulnerable / flashSpeed) % 2;
            
            if (flashPhase === 0) {
                shipColor = "#fff";
                shipOpacity = 1;
                ctx.shadowColor = "#fff";
                ctx.shadowBlur = 30;
            } else {
                shipOpacity = 0.3;
            }
        }
        
        // Bug Squasher - green outline (override flash color if active)
        if (powerUps && powerUps.isActive('bugSquasher') && this.invulnerable === 0) {
            shipColor = "#0f0";
            ctx.shadowColor = "#0f0";
            ctx.shadowBlur = 20;
        }
        
        // Incognito - reduced opacity (override flash opacity if active)
        if (powerUps && powerUps.isActive('incognito') && this.invulnerable === 0) {
            shipOpacity = 0.4;
            shipColor = "#0ff";
            ctx.shadowColor = "#0ff";
            ctx.shadowBlur = 15;
        }
        
        // Overclock - red glow (can combine with flash)
        if (powerUps && powerUps.isActive('overclock') && this.invulnerable === 0) {
            ctx.shadowColor = "#f00";
            ctx.shadowBlur = 25;
        }
        
        ctx.save();
        ctx.globalAlpha = shipOpacity;
        drawCursorShip(ctx, this.x, this.y, this.size, shipColor);
        ctx.restore();
        
        // Draw shield if active
        if (this.hasShield) {
            const shieldRadius = this.size + 8;
            const pulse = Math.sin(Date.now() * 0.005) * 0.3 + 0.7;
            
            ctx.save();
            ctx.strokeStyle = "#00ffff";
            ctx.lineWidth = 2;
            ctx.globalAlpha = pulse * 0.6;
            ctx.shadowColor = "#00ffff";
            ctx.shadowBlur = 15;
            
            // Draw hexagonal shield
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI / 3) * i + (Date.now() * 0.001);
                const x = this.x + Math.cos(angle) * shieldRadius;
                const y = this.y + Math.sin(angle) * shieldRadius;
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.closePath();
            ctx.stroke();
            
            // Inner glow
            ctx.globalAlpha = pulse * 0.3;
            ctx.fillStyle = "#00ffff";
            ctx.fill();
            
            ctx.restore();
        }
        
        ctx.shadowBlur = 0;

        // Draw bullets with power-up effects
        this.bullets.forEach(b => {
            if (powerUps && powerUps.isActive('memoryLeak')) {
                // Orange bullets for memory leak
                ctx.fillStyle = "#f80";
                ctx.shadowColor = "#f80";
                ctx.shadowBlur = 10;
            } else if (powerUps && powerUps.isActive('overclock')) {
                // Red-tinted bullets for overclock
                ctx.fillStyle = "#f0f";
                ctx.shadowColor = "#f0f";
                ctx.shadowBlur = 8;
            } else {
                ctx.fillStyle = "#0ff";
                ctx.shadowBlur = 0;
            }
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.shadowBlur = 0;

        // Draw health
        ctx.font = "24px monospace";
        ctx.textAlign = "right";
        ctx.textBaseline = "top";
        for (let i = 0; i < PLAYER_CONFIG.DEFAULT_HEALTH; i++) {
            const x = this.canvas.width - 20 - (i * 35);
            const y = 20;
            if (i < this.health) {
                if (this.invulnerable > 0 && Math.sin(Date.now() * 0.1) > 0) {
                    ctx.fillStyle = 'rgba(255, 20, 147, 0.5)'; // Blink when invulnerable
                } else {
                    ctx.fillStyle = 'rgb(255, 20, 147)';
                }
            } else {
                ctx.fillStyle = 'rgba(255, 20, 147, 0.3)'; // Dimmed for lost hearts
            }
            ctx.fillText("♥", x, y);
        }
        
        // Draw shield indicator next to health
        if (this.hasShield) {
            const shieldX = this.canvas.width - 20 - (PLAYER_CONFIG.DEFAULT_HEALTH * 35);
            const shieldY = 20;
            ctx.fillStyle = '#0ff';
            ctx.shadowColor = '#0ff';
            ctx.shadowBlur = 10;
            ctx.fillText("🛡️", shieldX, shieldY);
            ctx.shadowBlur = 0;
        }
    }

    takeDamage() {
        if (this.invulnerable <= 0) {
            // Shield blocks one hit
            if (this.hasShield) {
                this.hasShield = false;
                this.invulnerable = PLAYER_CONFIG.INVULNERABILITY_FRAMES;
                return false; // Shield absorbed the hit
            }
            
            // No shield, take health damage
            this.health--;
            this.invulnerable = PLAYER_CONFIG.INVULNERABILITY_FRAMES;
            return this.health <= 0;
        }
        return false;
    }
    
    activateShield() {
        this.hasShield = true;
    }
    
    heal(amount) {
        this.health = Math.min(this.health + amount, PLAYER_CONFIG.DEFAULT_HEALTH);
    }

    reset() {
        this.x = this.canvas.width / 2;
        this.y = this.canvas.height - 60;
        this.bullets = [];
        this.health = PLAYER_CONFIG.DEFAULT_HEALTH;
        this.invulnerable = 0;
        this.speedMultiplier = PLAYER_CONFIG.NORMAL_SPEED;
        this.hasShield = false;
    }
}