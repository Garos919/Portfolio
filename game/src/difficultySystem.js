// Tier-based difficulty progression system
// Tier progression unlocks obstacles in order: dataCubes → firewalls → corruptPointers → asciiClouds → codeWalls

export const TIER_DEFINITIONS = [
    {
        tier: 1,
        name: "Boot Sequence",
        duration: 25,
        enemySpeedMultiplier: 1.0,
        enemySpawnInterval: 1500,
        obstacleSpawnIntervals: {
            dataCube: 4000,
            firewall: null,
            corruptPointer: null,
            asciiCloud: null,
            codeWall: null
        },
        allowedObstacles: ['dataCube'],
        description: "Tutorial start - simple navigation"
    },
    {
        tier: 2,
        name: "Memory Drift",
        duration: 20,
        enemySpeedMultiplier: 1.1,
        enemySpawnInterval: 1250,
        obstacleSpawnIntervals: {
            dataCube: 3200,
            firewall: null,
            corruptPointer: null,
            asciiCloud: null,
            codeWall: null
        },
        allowedObstacles: ['dataCube'],
        description: "Faster enemies, denser cubes"
    },
    {
        tier: 3,
        name: "Firewall Breach",
        duration: 30,
        enemySpeedMultiplier: 1.2,
        enemySpawnInterval: 1100,
        obstacleSpawnIntervals: {
            dataCube: 3500,
            firewall: 5500,
            corruptPointer: null,
            asciiCloud: null,
            codeWall: null
        },
        allowedObstacles: ['dataCube', 'firewall'],
        description: "Laser beams appear"
    },
    {
        tier: 4,
        name: "Pointer Storm",
        duration: 25,
        enemySpeedMultiplier: 1.3,
        enemySpawnInterval: 950,
        obstacleSpawnIntervals: {
            dataCube: 3800,
            firewall: 5000,
            corruptPointer: 4500,
            asciiCloud: null,
            codeWall: null
        },
        allowedObstacles: ['dataCube', 'firewall', 'corruptPointer'],
        description: "Tracking obstacles begin"
    },
    {
        tier: 5,
        name: "ASCII Corruption",
        duration: 35,
        enemySpeedMultiplier: 1.4,
        enemySpawnInterval: 850,
        obstacleSpawnIntervals: {
            dataCube: 4000,
            firewall: 5500,
            corruptPointer: 5000,
            asciiCloud: 9000,
            codeWall: null
        },
        allowedObstacles: ['dataCube', 'firewall', 'corruptPointer', 'asciiCloud'],
        description: "Slowdown clouds appear"
    },
    {
        tier: 6,
        name: "Code Breaker",
        duration: 30,
        enemySpeedMultiplier: 1.5,
        enemySpawnInterval: 700,
        obstacleSpawnIntervals: {
            dataCube: 3500,
            firewall: 5000,
            corruptPointer: 4500,
            asciiCloud: 10000,
            codeWall: 3500
        },
        allowedObstacles: ['dataCube', 'firewall', 'corruptPointer', 'asciiCloud', 'codeWall'],
        description: "All obstacles unlocked - tight spaces"
    },
    {
        tier: 7,
        name: "Kernel Panic",
        duration: 40,
        enemySpeedMultiplier: 1.6,
        enemySpawnInterval: 600,
        obstacleSpawnIntervals: {
            dataCube: 3000,
            firewall: 4500,
            corruptPointer: 4000,
            asciiCloud: 9500,
            codeWall: 3200
        },
        allowedObstacles: ['dataCube', 'firewall', 'corruptPointer', 'asciiCloud', 'codeWall'],
        description: "High-intensity escalation"
    },
    {
        tier: 8,
        name: "Overflow Zone",
        duration: 35,
        enemySpeedMultiplier: 1.7,
        enemySpawnInterval: 550,
        obstacleSpawnIntervals: {
            dataCube: 2800,
            firewall: 4200,
            corruptPointer: 3800,
            asciiCloud: 9000,
            codeWall: 3000
        },
        allowedObstacles: ['dataCube', 'firewall', 'corruptPointer', 'asciiCloud', 'codeWall'],
        description: "Maximum speed - screen chaos"
    },
    {
        tier: 9,
        name: "Endless Loop",
        duration: Infinity,
        enemySpeedMultiplier: 1.7,
        enemySpawnInterval: 500,
        obstacleSpawnIntervals: {
            dataCube: 2500,
            firewall: 4000,
            corruptPointer: 3500,
            asciiCloud: 8500,
            codeWall: 2800
        },
        allowedObstacles: ['dataCube', 'firewall', 'corruptPointer', 'asciiCloud', 'codeWall'],
        description: "Endless survival mode"
    }
];

export class DifficultySystem {
    constructor() {
        this.currentTier = 1;
        this.tierStartTime = 0;
        this.gameStartTime = 0;
        this.cumulativeDurations = this.calculateCumulativeDurations();
    }

    calculateCumulativeDurations() {
        const cumulative = [];
        let total = 0;
        
        for (let i = 0; i < TIER_DEFINITIONS.length; i++) {
            cumulative.push(total);
            total += TIER_DEFINITIONS[i].duration;
        }
        
        return cumulative;
    }

    /**
     * Get current tier based on elapsed time in seconds
     * @param {number} elapsedTime - Time elapsed since game start in seconds
     * @returns {number} Current tier (1-9)
     */
    getTier(elapsedTime) {
        // Find the appropriate tier based on cumulative time
        for (let i = TIER_DEFINITIONS.length - 1; i >= 0; i--) {
            if (elapsedTime >= this.cumulativeDurations[i]) {
                return i + 1; // Tiers are 1-indexed
            }
        }
        return 1; // Default to tier 1
    }

    /**
     * Get tier settings for a specific tier number
     * @param {number} tier - Tier number (1-9)
     * @returns {Object} Tier configuration object
     */
    getTierSettings(tier) {
        const index = Math.max(0, Math.min(tier - 1, TIER_DEFINITIONS.length - 1));
        return TIER_DEFINITIONS[index];
    }

    /**
     * Apply tier settings and return configuration object
     * @param {number} tier - Current tier number
     * @returns {Object} Configuration with enemySpeed, spawnInterval, and allowedObstacles
     */
    applyTierSettings(tier) {
        const settings = this.getTierSettings(tier);
        
        return {
            enemySpeed: settings.enemySpeedMultiplier,
            enemySpawnInterval: settings.enemySpawnInterval,
            allowedObstacles: settings.allowedObstacles,
            obstacleSpawnIntervals: settings.obstacleSpawnIntervals,
            tierName: settings.name,
            tierDescription: settings.description
        };
    }

    /**
     * Update current tier based on elapsed time
     * @param {number} elapsedTime - Time in seconds since game start
     * @returns {boolean} True if tier changed
     */
    update(elapsedTime) {
        const newTier = this.getTier(elapsedTime);
        const tierChanged = newTier !== this.currentTier;
        
        if (tierChanged) {
            this.currentTier = newTier;
            this.tierStartTime = elapsedTime;
        }
        
        return tierChanged;
    }

    /**
     * Get time remaining in current tier
     * @param {number} elapsedTime - Time in seconds since game start
     * @returns {number} Seconds remaining in tier (Infinity for tier 9)
     */
    getTimeRemainingInTier(elapsedTime) {
        const settings = this.getTierSettings(this.currentTier);
        
        if (settings.duration === Infinity) {
            return Infinity;
        }
        
        const tierElapsed = elapsedTime - this.tierStartTime;
        return Math.max(0, settings.duration - tierElapsed);
    }

    /**
     * Get progress through current tier (0-1)
     * @param {number} elapsedTime - Time in seconds since game start
     * @returns {number} Progress value 0-1 (1.0 for tier 9)
     */
    getTierProgress(elapsedTime) {
        const settings = this.getTierSettings(this.currentTier);
        
        if (settings.duration === Infinity) {
            return 1.0;
        }
        
        const tierElapsed = elapsedTime - this.tierStartTime;
        return Math.min(1.0, tierElapsed / settings.duration);
    }

    reset() {
        this.currentTier = 1;
        this.tierStartTime = 0;
        this.gameStartTime = 0;
    }

    getCurrentTier() {
        return this.currentTier;
    }

    getCurrentTierName() {
        return this.getTierSettings(this.currentTier).name;
    }
}
