export class PowerUpSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.powerUps = [];
        this.activePowerUps = new Map(); // Track active power-ups and their end times
        this.maxDropsOnScreen = 3;
        this.nextDropTime = 0;
        this.dropCooldown = 500; // 500ms cooldown between drops
        
        // Power-up definitions
        this.powerUpTypes = [
            {
                id: 'bugSquasher',
                name: 'Bug Squasher',
                icon: '🪲',
                color: '#0f0',
                duration: 10000
            },
            {
                id: 'incognito',
                name: 'Incognito Mode',
                icon: '🕵️',
                color: '#0ff',
                duration: 5000
            },
            {
                id: 'overclock',
                name: 'Overclock',
                icon: '⚡',
                color: '#f00',
                duration: 10000
            },
            {
                id: 'memoryLeak',
                name: 'Memory Leak',
                icon: '🔥',
                color: '#f80',
                duration: 8000
            },
            {
                id: 'patchToken',
                name: 'Patch Token',
                icon: '�',
                color: '#ff0',
                duration: 15000
            }
        ];
        
        // Pickup definitions
        this.pickupTypes = [
            {
                id: 'health',
                name: 'Health',
                icon: '♥',
                color: '#f0f',
                type: 'pickup'
            },
            {
                id: 'shield',
                name: 'Shield',
                icon: '🛡️',
                color: '#08f',
                type: 'pickup'
            }
        ];
    }

    update() {
        // Move power-ups down
        this.powerUps.forEach(p => {
            p.y += p.speed;
            p.rotation += 0.05;
        });
        
        // Remove off-screen power-ups
        this.powerUps = this.powerUps.filter(p => p.y < this.canvas.height + 40);

        // Check for expired power-ups
        const now = Date.now();
        for (const [id, endTime] of this.activePowerUps.entries()) {
            if (now >= endTime) {
                this.activePowerUps.delete(id);
            }
        }
    }

    draw(ctx) {
        ctx.save();
        
        // Draw power-ups
        this.powerUps.forEach(p => {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            
            // Draw glow
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 20;
            
            // Draw icon
            ctx.font = "32px monospace";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(p.icon, 0, 0);
            
            ctx.restore();
        });
        
        // Draw active power-up indicators in top right
        let offsetY = 10;
        const now = Date.now();
        for (const [id, endTime] of this.activePowerUps.entries()) {
            const type = this.powerUpTypes.find(t => t.id === id);
            if (type) {
                const timeLeft = Math.ceil((endTime - now) / 1000);
                
                ctx.fillStyle = type.color;
                ctx.font = "8px 'Press Start 2P', monospace";
                ctx.textAlign = "right";
                ctx.textBaseline = "top";
                
                // Draw icon + time
                ctx.font = "16px monospace";
                ctx.fillText(type.icon, this.canvas.width - 30, offsetY);
                
                ctx.font = "8px 'Press Start 2P', monospace";
                ctx.fillText(timeLeft + "s", this.canvas.width - 10, offsetY + 5);
                
                offsetY += 25;
            }
        }
        
        ctx.restore();
    }

    // Spawn drop from enemy death
    spawnDropFromEnemy(x, y, player) {
        const now = Date.now();
        
        // Check cooldown
        if (now < this.nextDropTime) return;
        
        // Check max drops on screen
        if (this.powerUps.length >= this.maxDropsOnScreen) return;
        
        // Roll for drop
        const roll = Math.random() * 100;
        let dropType = null;
        
        // Fine-tuning: slightly increase health drop rate if player is low on HP
        const healthBonus = player && player.health < 2 ? 2 : 0;
        
        if (roll < 2) {
            // 2% shield drop
            dropType = this.pickupTypes.find(p => p.id === 'shield');
        } else if (roll < 5 + healthBonus) {
            // 3% health drop (5% if low HP)
            dropType = this.pickupTypes.find(p => p.id === 'health');
        } else if (roll < 13) {
            // 8% power-up drop
            dropType = this.getRandomPowerUp();
        }
        
        if (dropType) {
            this.powerUps.push({
                x: x,
                y: y,
                speed: 1.5,
                rotation: 0,
                icon: dropType.icon,
                color: dropType.color,
                type: dropType.type || 'powerup',
                id: dropType.id,
                duration: dropType.duration
            });
            
            // Set cooldown
            this.nextDropTime = now + this.dropCooldown;
        }
    }
    
    // Get random power-up (evenly distributed)
    getRandomPowerUp() {
        const powerUps = ['bugSquasher', 'incognito', 'overclock', 'memoryLeak', 'patchToken'];
        const randomId = powerUps[Math.floor(Math.random() * powerUps.length)];
        return this.powerUpTypes.find(p => p.id === randomId);
    }

    spawnPowerUp() {
        // Select random power-up based on rarity
        const rand = Math.random();
        let cumulative = 0;
        let selectedType = this.powerUpTypes[0];
        
        for (const type of this.powerUpTypes) {
            cumulative += type.rarity;
            if (rand <= cumulative) {
                selectedType = type;
                break;
            }
        }
        
        this.powerUps.push({
            x: Math.random() * (this.canvas.width - 60) + 30,
            y: -30,
            speed: 1.2,
            rotation: 0,
            type: selectedType
        });
    }

    checkPlayerCollision(player) {
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const p = this.powerUps[i];
            const dx = p.x - player.x;
            const dy = p.y - player.y;
            
            if (Math.sqrt(dx * dx + dy * dy) < 30) {
                // Check if it's a pickup or power-up
                if (p.type === 'pickup') {
                    // Handle pickup
                    if (p.id === 'health') {
                        player.heal(1);
                    } else if (p.id === 'shield') {
                        player.activateShield();
                    }
                } else {
                    // Activate power-up
                    this.activatePowerUp(p);
                }
                
                this.powerUps.splice(i, 1);
                return p;
            }
        }
        return null;
    }

    activatePowerUp(powerUp) {
        const endTime = Date.now() + powerUp.duration;
        this.activePowerUps.set(powerUp.id, endTime);
    }

    isActive(powerUpId) {
        return this.activePowerUps.has(powerUpId);
    }

    reset() {
        this.powerUps = [];
        this.activePowerUps.clear();
        this.nextDropTime = 0;
    }
}
