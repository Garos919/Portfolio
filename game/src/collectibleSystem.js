export class CollectibleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.collectibles = {
            health: []
        };
        this.spawnInterval = 30000; // 30 seconds (less frequent)
        // nextSpawn timestamp ensures periodic spawns every spawnInterval
        this.nextSpawn = Date.now() + this.spawnInterval;
    }

    createHealthCollectible() {
        return {
            x: Math.random() * (this.canvas.width - 40) + 20,
            y: -30,
            size: 20,
            width: 40,
            height: 30,
            speed: 1,
            pulsePhase: 0
        };
    }

    update() {
        // Update collectibles position and animation
        this.collectibles.health.forEach(h => {
            h.y += h.speed;
            h.pulsePhase += 0.1;
        });

        // Remove off-screen collectibles
        this.collectibles.health = this.collectibles.health.filter(h => h.y < this.canvas.height + h.height);

        // Spawn new collectibles on a repeating schedule
        const now = Date.now();
        if (now >= this.nextSpawn) {
            const item = this.createHealthCollectible();
            this.collectibles.health.push(item);
            // schedule next spawn
            this.nextSpawn += this.spawnInterval;
            // debug log
            if (typeof console !== 'undefined' && console.debug) console.debug('[Collectible] spawned heart at', item.x.toFixed(0), item.y.toFixed(0), 'next in', this.spawnInterval);
        }
    }

    draw(ctx) {
        // Draw health collectibles as heart glyphs
        ctx.font = "20px 'Press Start 2P', monospace";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        this.collectibles.health.forEach(h => {
            const alpha = (Math.sin(h.pulsePhase) + 1) * 0.5;
            ctx.fillStyle = `rgba(255, 20, 147, ${alpha})`;
            ctx.fillText('♥', h.x, h.y);
        });
    }

    checkCollisions(player) {
        // Check health collectibles
        this.collectibles.health = this.collectibles.health.filter(h => {
            const dx = h.x - player.x;
            const dy = h.y - player.y;
            const collision = Math.abs(dx) < (h.width || h.size)/2 + player.size &&
                              Math.abs(dy) < (h.height || h.size)/2 + player.size;

            if (collision && player.health < 3) {
                player.health++;
                return false;
            }
            return true;
        });
    }

    reset() {
        this.collectibles = {
            health: []
        };
        this.nextSpawn = Date.now() + this.spawnInterval;
    }
}