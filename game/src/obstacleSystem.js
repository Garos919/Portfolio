import { OBSTACLE_TYPES, GLITCH_TEXT, ASCII_CHARS, SPAWN_INTERVALS } from './constants.js';

export class ObstacleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.obstacles = {
            codeWalls: [],
            dataCubes: [],
            firewalls: [],
            corruptPointers: [],
            asciiClouds: []
        };
        this.lastSpawns = {
            codeWall: 0,
            dataCube: 0,
            firewall: 0,
            corruptPointer: 0,
            asciiCloud: 0
        };
        // single scroll speed used for vertical movement of all obstacle types
        // tweak this to make the scene scroll faster/slower
        this.scrollSpeed = 1.2;
        
        // Tier-based spawn intervals (will be updated by difficulty system)
        this.currentSpawnIntervals = {
            dataCube: 4000,
            firewall: null,
            corruptPointer: null,
            asciiCloud: null,
            codeWall: null
        };
        
        // Obstacles allowed to spawn in current tier
        this.allowedObstacles = ['dataCube'];
    }

    createCodeWall() {
        return {
            x: Math.random() * (this.canvas.width - 60) + 30,
            y: -50,
            width: 40,
            height: 80,
            rotation: Math.random() * Math.PI / 4 - Math.PI / 8,
            text: GLITCH_TEXT[Math.floor(Math.random() * GLITCH_TEXT.length)],
            alpha: 1,
            flicker: 0,
            // use common scroll speed
            speed: this.scrollSpeed,
            driftX: Math.random() * 2 - 1
        };
    }

    createDataCube() {
        const size = 20 + Math.random() * 10;
        return {
            x: Math.random() * (this.canvas.width - size),
            y: -size,
            size: size,
            oscillateSpeed: 0.02 + Math.random() * 0.02,
            oscillateRange: 30 + Math.random() * 20,
            startX: 0,
            angle: 0,
            // align vertical movement to global scroll speed
            speed: this.scrollSpeed,
            glow: 0
        };
    }

    createFirewall() {
        const fromRight = Math.random() > 0.5;
        const width = this.canvas.width * 0.6;
        return {
            y: -10,
            x: fromRight ? this.canvas.width : -width,
            width: width,
            height: 12,
            fromRight: fromRight,
            alpha: 0,
            active: false,
            pulsePhase: 0,
            // firewall will move down at global scroll speed; horizontal movement uses a multiplier
            speed: this.scrollSpeed
        };
    }

    createCorruptPointer() {
        return {
            x: Math.random() * this.canvas.width,
            y: -20,
            size: 10,
            jitterPhase: 0,
            // vertical movement follows the global scroll speed
            speed: this.scrollSpeed,
            horizontalSpeed: Math.random() * 2 - 1
        };
    }

    createAsciiCloud() {
        const width = 150 + Math.random() * 100;
        const height = 150 + Math.random() * 100;
        const padding = 50;
        let x, y, attempts = 0;
        
        do {
            x = Math.random() * (this.canvas.width - width);
            y = -height;
            attempts++;
            
            const overlaps = this.obstacles.asciiClouds.some(cloud => {
                return !(x + width + padding < cloud.x || 
                        x > cloud.x + cloud.width + padding ||
                        y + height + padding < cloud.y || 
                        y > cloud.y + cloud.height + padding);
            });
            
            if (!overlaps || attempts > 10) break;
        } while (true);

        const area = width * height;
        const symbolDensity = 0.001;
        const numSymbols = Math.floor(area * symbolDensity);

        return {
            x: x,
            y: y,
            width: width,
            height: height,
            symbols: Array(numSymbols).fill(0).map(() => ({ 
                char: ASCII_CHARS[Math.floor(Math.random() * ASCII_CHARS.length)],
                x: Math.random(),
                y: Math.random(),
                alpha: 0.4 + Math.random() * 0.6
            })),
            alpha: 0,
            fadeIn: true,
            // clouds share the global scroll speed
            speed: this.scrollSpeed
        };
    }

    /**
     * Update tier settings from difficulty system
     * @param {Object} tierConfig - Configuration from difficulty system
     */
    updateTierSettings(tierConfig) {
        this.allowedObstacles = tierConfig.allowedObstacles;
        this.currentSpawnIntervals = tierConfig.obstacleSpawnIntervals;
    }


    // allow runtime tuning of overall scroll speed and update existing obstacles
    setScrollSpeed(newSpeed) {
        this.scrollSpeed = newSpeed;
        // update existing obstacles so they match immediately
        this.obstacles.codeWalls.forEach(o => o.speed = newSpeed);
        this.obstacles.dataCubes.forEach(o => o.speed = newSpeed);
        this.obstacles.firewalls.forEach(o => o.speed = newSpeed);
        this.obstacles.corruptPointers.forEach(o => o.speed = newSpeed);
        this.obstacles.asciiClouds.forEach(o => o.speed = newSpeed);
    }

    update() {
        const now = Date.now();

        // Spawn new obstacles based on tier-allowed obstacles and intervals
        if (!this.lastSpawns.codeWall) this.lastSpawns.codeWall = 0;
        if (!this.lastSpawns.dataCube) this.lastSpawns.dataCube = 0;
        if (!this.lastSpawns.firewall) this.lastSpawns.firewall = 0;
        if (!this.lastSpawns.corruptPointer) this.lastSpawns.corruptPointer = 0;
        if (!this.lastSpawns.asciiCloud) this.lastSpawns.asciiCloud = 0;

        // Only spawn obstacles that are allowed in current tier and have valid intervals
        if (this.allowedObstacles.includes('dataCube') && this.currentSpawnIntervals.dataCube) {
            if (now - this.lastSpawns.dataCube > this.currentSpawnIntervals.dataCube) {
                this.obstacles.dataCubes.push(this.createDataCube());
                this.lastSpawns.dataCube = now;
            }
        }
        
        if (this.allowedObstacles.includes('firewall') && this.currentSpawnIntervals.firewall) {
            if (now - this.lastSpawns.firewall > this.currentSpawnIntervals.firewall) {
                this.obstacles.firewalls.push(this.createFirewall());
                this.lastSpawns.firewall = now;
            }
        }
        
        if (this.allowedObstacles.includes('corruptPointer') && this.currentSpawnIntervals.corruptPointer) {
            if (now - this.lastSpawns.corruptPointer > this.currentSpawnIntervals.corruptPointer) {
                this.obstacles.corruptPointers.push(this.createCorruptPointer());
                this.lastSpawns.corruptPointer = now;
            }
        }
        
        if (this.allowedObstacles.includes('asciiCloud') && this.currentSpawnIntervals.asciiCloud) {
            if (now - this.lastSpawns.asciiCloud > this.currentSpawnIntervals.asciiCloud) {
                this.obstacles.asciiClouds.push(this.createAsciiCloud());
                this.lastSpawns.asciiCloud = now;
            }
        }
        
        if (this.allowedObstacles.includes('codeWall') && this.currentSpawnIntervals.codeWall) {
            if (now - this.lastSpawns.codeWall > this.currentSpawnIntervals.codeWall) {
                this.obstacles.codeWalls.push(this.createCodeWall());
                this.lastSpawns.codeWall = now;
            }
        }

        // Update Code Walls
        this.obstacles.codeWalls.forEach(wall => {
            wall.y += wall.speed;
            wall.x += wall.driftX * 0.5;
            wall.rotation += 0.01;
            wall.flicker = Math.random() > 0.9 ? Math.random() : wall.flicker;
        });
        this.obstacles.codeWalls = this.obstacles.codeWalls.filter(wall => wall.y < this.canvas.height + 50);

        // Update Data Cubes
        this.obstacles.dataCubes.forEach(cube => {
            if (cube.startX === 0) cube.startX = cube.x;
            cube.y += cube.speed;
            cube.angle += cube.oscillateSpeed;
            cube.x = cube.startX + Math.sin(cube.angle) * cube.oscillateRange;
            cube.glow = (Math.sin(cube.angle * 2) + 1) * 0.5;
        });
        this.obstacles.dataCubes = this.obstacles.dataCubes.filter(cube => cube.y < this.canvas.height + cube.size);

        // Update Firewalls
        const MIN_FIREWALL_DISTANCE = 150;
        this.obstacles.firewalls.forEach(wall => {
            wall.y += wall.speed;
            wall.pulsePhase += 0.1;
            wall.alpha = Math.sin(wall.pulsePhase) * 0.5 + 0.5;
            wall.active = wall.alpha > 0.7;
            
            if (wall.fromRight) {
                wall.x -= wall.speed * 1.5;
            } else {
                wall.x += wall.speed * 1.5;
            }
        });
        
        this.obstacles.firewalls = this.obstacles.firewalls.filter(wall => {
            if (wall.y >= this.canvas.height) return false;
            if (wall.fromRight && wall.x + wall.width < 0) return false;
            if (!wall.fromRight && wall.x > this.canvas.width) return false;
            
            const tooClose = this.obstacles.firewalls.some(other => {
                if (wall === other) return false;
                return Math.abs(wall.y - other.y) < MIN_FIREWALL_DISTANCE;
            });
            
            return !tooClose;
        });

        // Update Corrupt Pointers
        this.obstacles.corruptPointers.forEach(pointer => {
            pointer.y += pointer.speed;
            pointer.jitterPhase += 0.2;
            pointer.x += Math.sin(pointer.jitterPhase) * 2;
            pointer.x += pointer.horizontalSpeed;
            
            if (pointer.x < 0 || pointer.x > this.canvas.width) {
                pointer.horizontalSpeed *= -1;
            }
        });
        this.obstacles.corruptPointers = this.obstacles.corruptPointers.filter(pointer => pointer.y < this.canvas.height + 20);

        // Update ASCII Clouds
        this.obstacles.asciiClouds.forEach(cloud => {
            cloud.y += cloud.speed;
            if (cloud.fadeIn && cloud.alpha < 1) {
                cloud.alpha += 0.02;
            }
            cloud.symbols.forEach(symbol => {
                symbol.alpha = Math.sin(Date.now() * 0.01 + symbol.x * 10) * 0.3 + 0.7;
            });
        });
        this.obstacles.asciiClouds = this.obstacles.asciiClouds.filter(cloud => cloud.y < this.canvas.height + cloud.height);
    }

    draw(ctx) {
        // Draw Code Walls
        ctx.font = "16px 'Consolas', monospace";
        this.obstacles.codeWalls.forEach(wall => {
            ctx.save();
            ctx.translate(wall.x, wall.y);
            ctx.rotate(wall.rotation);
            const alpha = wall.flicker > 0 ? wall.flicker : 1;
            ctx.fillStyle = `rgba(255, 0, 127, ${alpha * 0.8})`;
            ctx.strokeStyle = `rgba(255, 0, 127, ${alpha})`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.strokeText(wall.text, 0, 0);
            ctx.fillText(wall.text, 0, 0);
            ctx.restore();
        });

        // Draw Data Cubes
        this.obstacles.dataCubes.forEach(cube => {
            ctx.save();
            ctx.translate(cube.x + cube.size/2, cube.y + cube.size/2);
            
            const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, cube.size * 1.5);
            glow.addColorStop(0, `rgba(0, 255, 255, ${0.3 * cube.glow})`);
            glow.addColorStop(1, 'rgba(0, 255, 255, 0)');
            ctx.fillStyle = glow;
            ctx.fillRect(-cube.size*1.5, -cube.size*1.5, cube.size*3, cube.size*3);

            ctx.strokeStyle = '#0ff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.rect(-cube.size/2, -cube.size/2, cube.size, cube.size);
            ctx.stroke();

            ctx.strokeStyle = `rgba(0, 255, 255, 0.5)`;
            ctx.beginPath();
            ctx.moveTo(-cube.size/2, -cube.size/2);
            ctx.lineTo(-cube.size/4, -cube.size/4);
            ctx.moveTo(cube.size/2, -cube.size/2);
            ctx.lineTo(cube.size/4, -cube.size/4);
            ctx.stroke();
            ctx.restore();
        });

        // Draw Firewalls
        this.obstacles.firewalls.forEach(wall => {
            ctx.save();
            
            const gradient = ctx.createLinearGradient(wall.x, wall.y, wall.x + wall.width, wall.y);
            gradient.addColorStop(0, `rgba(255, 165, 0, 0)`);
            gradient.addColorStop(0.1, `rgba(255, 165, 0, ${wall.alpha})`);
            gradient.addColorStop(0.9, `rgba(255, 165, 0, ${wall.alpha})`);
            gradient.addColorStop(1, `rgba(255, 165, 0, 0)`);
            
            ctx.shadowColor = 'rgba(255, 165, 0, 0.5)';
            ctx.shadowBlur = 15;
            ctx.fillStyle = gradient;
            ctx.fillRect(wall.x, wall.y, wall.width, wall.height);

            if (wall.active) {
                ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
                ctx.shadowBlur = 20;
                const coreGradient = ctx.createLinearGradient(wall.x, wall.y, wall.x + wall.width, wall.y);
                coreGradient.addColorStop(0.1, `rgba(255, 255, 255, ${wall.alpha * 0.9})`);
                coreGradient.addColorStop(0.9, `rgba(255, 255, 255, ${wall.alpha * 0.9})`);
                ctx.fillStyle = coreGradient;
                
                const coreHeight = wall.height * 0.4;
                ctx.fillRect(wall.x, wall.y + (wall.height - coreHeight)/2, wall.width, coreHeight);
            }
            ctx.restore();
        });

        // Draw Corrupt Pointers
        this.obstacles.corruptPointers.forEach(pointer => {
            ctx.save();
            ctx.translate(pointer.x, pointer.y);
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.beginPath();
            ctx.moveTo(0, -pointer.size * 1.2);
            ctx.lineTo(pointer.size * 1.2, pointer.size * 1.2);
            ctx.lineTo(0, pointer.size * 0.5);
            ctx.lineTo(-pointer.size * 1.2, pointer.size * 1.2);
            ctx.fill();
            
            ctx.fillStyle = '#000';
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, -pointer.size);
            ctx.lineTo(pointer.size, pointer.size);
            ctx.lineTo(0, pointer.size * 0.4);
            ctx.lineTo(-pointer.size, pointer.size);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        });

        // Draw ASCII Clouds
        ctx.font = "14px 'Consolas', monospace";
        this.obstacles.asciiClouds.forEach(cloud => {
            for (let layer = 0; layer < 2; layer++) {
                cloud.symbols.forEach(symbol => {
                    const x = cloud.x + symbol.x * cloud.width;
                    const y = cloud.y + symbol.y * cloud.height;
                    const layerAlpha = layer === 0 ? 0.7 : 0.4;
                    ctx.fillStyle = `rgba(255, 255, 255, ${symbol.alpha * cloud.alpha * layerAlpha})`;
                    ctx.fillText(symbol.char, 
                        x + (layer * 2 - 1),
                        y + (layer * 2 - 1)
                    );
                });
            }
        });
    }

    checkPlayerInCloud(player) {
        for (let cloud of this.obstacles.asciiClouds) {
            if (cloud.alpha > 0.3 &&
                player.x > cloud.x && player.x < cloud.x + cloud.width &&
                player.y > cloud.y && player.y < cloud.y + cloud.height) {
                return true;
            }
        }
        return false;
    }

    checkPlayerCollision(player, particleSystem) {
        let collision = false;
        
        // Code Wall collisions
        for (let wall of this.obstacles.codeWalls) {
            const dx = wall.x - player.x;
            const dy = wall.y - player.y;
            if (Math.abs(dx) < 30 && Math.abs(dy) < 40) {
                collision = true;
                particleSystem.createExplosion(wall.x, wall.y, 10);
                this.obstacles.codeWalls = this.obstacles.codeWalls.filter(w => w !== wall);
            }
        }

        // Data Cube collisions
        for (let cube of this.obstacles.dataCubes) {
            const dx = (cube.x + cube.size/2) - player.x;
            const dy = (cube.y + cube.size/2) - player.y;
            if (Math.abs(dx) < cube.size/2 + 10 && Math.abs(dy) < cube.size/2 + 10) {
                collision = true;
            }
        }

        // Firewall collisions
        for (let wall of this.obstacles.firewalls) {
            if (wall.active && player.y > wall.y && player.y < wall.y + wall.height) {
                if (player.x > wall.x && player.x < wall.x + wall.width) {
                    collision = true;
                }
            }
        }

        // Corrupt Pointer collisions
        for (let pointer of this.obstacles.corruptPointers) {
            const dx = pointer.x - player.x;
            const dy = pointer.y - player.y;
            if (Math.sqrt(dx * dx + dy * dy) < 20) {
                collision = true;
            }
        }

        return collision;
    }
    
    // Check if bullets can destroy obstacles (with Bug Squasher power-up)
    checkBulletCollisions(bullets, powerUps, particleSystem) {
        if (!powerUps || !powerUps.isActive('bugSquasher')) return;
        
        bullets.forEach((b, bi) => {
            // Check Code Wall collisions
            this.obstacles.codeWalls.forEach((wall, wi) => {
                const dx = wall.x - b.x;
                const dy = wall.y - b.y;
                if (Math.abs(dx) < 30 && Math.abs(dy) < 40) {
                    // Destroy obstacle and bullet
                    this.obstacles.codeWalls.splice(wi, 1);
                    bullets.splice(bi, 1);
                    // Green explosion effect
                    particleSystem.createExplosion(wall.x, wall.y, 15, '#0f0');
                }
            });
            
            // Check Data Cube collisions
            this.obstacles.dataCubes.forEach((cube, ci) => {
                const dx = (cube.x + cube.size/2) - b.x;
                const dy = (cube.y + cube.size/2) - b.y;
                if (Math.abs(dx) < cube.size/2 && Math.abs(dy) < cube.size/2) {
                    this.obstacles.dataCubes.splice(ci, 1);
                    bullets.splice(bi, 1);
                    particleSystem.createExplosion(cube.x + cube.size/2, cube.y + cube.size/2, 12, '#0f0');
                }
            });
            
            // Check Corrupt Pointer collisions
            this.obstacles.corruptPointers.forEach((pointer, pi) => {
                const dx = pointer.x - b.x;
                const dy = pointer.y - b.y;
                if (Math.sqrt(dx * dx + dy * dy) < 20) {
                    this.obstacles.corruptPointers.splice(pi, 1);
                    bullets.splice(bi, 1);
                    particleSystem.createExplosion(pointer.x, pointer.y, 10, '#0f0');
                }
            });
        });
    }

    reset() {
        this.obstacles = {
            codeWalls: [],
            dataCubes: [],
            firewalls: [],
            corruptPointers: [],
            asciiClouds: []
        };
        // start with zero so first update can spawn immediately
        this.lastSpawns = {
            codeWall: 0,
            dataCube: 0,
            firewall: 0,
            corruptPointer: 0,
            asciiCloud: 0
        };
        
        // Reset to tier 1 settings
        this.allowedObstacles = ['dataCube'];
        this.currentSpawnIntervals = {
            dataCube: 4000,
            firewall: null,
            corruptPointer: null,
            asciiCloud: null,
            codeWall: null
        };
    }
}