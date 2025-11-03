export class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    createParticle(x, y, color = null) {
        this.particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5,
            life: 1,
            char: Math.random() > 0.5 ? "0" : "1",
            color: color
        });
    }

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= 0.05;
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        ctx.font = "12px 'Consolas', monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        this.particles.forEach(particle => {
            if (particle.color) {
                // Use custom color with alpha based on life
                const alpha = particle.life;
                // Extract RGB from hex color or use as-is
                ctx.fillStyle = particle.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba').replace('rgba', 'rgba');
                // Simpler: just use color with global alpha
                ctx.globalAlpha = particle.life;
                ctx.fillStyle = particle.color;
                ctx.fillText(particle.char, particle.x, particle.y);
                ctx.globalAlpha = 1;
            } else {
                ctx.fillStyle = `rgba(255, 0, 127, ${particle.life})`;
                ctx.fillText(particle.char, particle.x, particle.y);
            }
        });
    }

    createExplosion(x, y, count = 10, color = null) {
        for (let i = 0; i < count; i++) {
            this.createParticle(x, y, color);
        }
    }
}