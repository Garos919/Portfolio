# Zone Invaders - Tier-Based Difficulty System

## Overview
The game features a 9-tier progressive difficulty system that introduces obstacles gradually and increases challenge over time.

## Tier Progression

### **Tier 1 - Boot Sequence** (0:00 - 0:25)
- **Focus:** Tutorial start
- **New Obstacle:** Data Cubes only
- **Enemy Speed:** 1.0×
- **Spawn Rate:** 1500ms
- **Description:** Simple navigation to learn controls

### **Tier 2 - Memory Drift** (0:25 - 0:45)
- **Focus:** Faster pace
- **Enemy Speed:** 1.1×
- **Spawn Rate:** 1250ms
- **Description:** Same obstacles, denser spawning

### **Tier 3 - Firewall Breach** (0:45 - 1:15)
- **Focus:** New hazard introduced
- **New Obstacle:** Firewalls (laser beams)
- **Active Obstacles:** Data Cubes + Firewalls
- **Enemy Speed:** 1.2×
- **Spawn Rate:** 1100ms
- **Description:** Sweeping laser beams appear

### **Tier 4 - Pointer Storm** (1:15 - 1:40)
- **Focus:** Tracking enemies
- **New Obstacle:** Corrupt Pointers
- **Active Obstacles:** Data Cubes + Firewalls + Corrupt Pointers
- **Enemy Speed:** 1.3×
- **Spawn Rate:** 950ms
- **Description:** Tracking movement begins

### **Tier 5 - ASCII Corruption** (1:40 - 2:15)
- **Focus:** Slowdown zones
- **New Obstacle:** ASCII Clouds (slow player movement by ~70%)
- **Active Obstacles:** All except Code Walls
- **Enemy Speed:** 1.4×
- **Spawn Rate:** 850ms
- **Description:** Clouds that slow movement

### **Tier 6 - Code Breaker** (2:15 - 2:45)
- **Focus:** All obstacles unlocked
- **New Obstacle:** Code Walls (solid obstacles)
- **Active Obstacles:** ALL FIVE obstacle types
- **Enemy Speed:** 1.5×
- **Spawn Rate:** 700ms
- **Description:** Tight space navigation required

### **Tier 7 - Kernel Panic** (2:45 - 3:25)
- **Focus:** High-intensity escalation
- **All Obstacles Active**
- **Enemy Speed:** 1.6×
- **Spawn Rate:** 600ms
- **Description:** Maximum challenge ramp-up

### **Tier 8 - Overflow Zone** (3:25 - 4:00)
- **Focus:** Final rush
- **All Obstacles Active**
- **Enemy Speed:** 1.7× (CAPPED)
- **Spawn Rate:** 550ms
- **Description:** Screen chaos at peak difficulty

### **Tier 9 - Endless Loop** (4:00+)
- **Focus:** Endless survival mode
- **Duration:** ∞
- **Enemy Speed:** 1.7× (maintained)
- **Spawn Rate:** 500-550ms
- **Description:** Pure endurance test for high scores

## Obstacle Introduction Order
1. **Data Cubes** - Tier 1
2. **Firewalls** - Tier 3
3. **Corrupt Pointers** - Tier 4
4. **ASCII Clouds** - Tier 5
5. **Code Walls** - Tier 6 (FINAL)

## Technical Implementation

### Key Components
- `DifficultySystem` class tracks current tier and manages transitions
- `getTier(elapsedTime)` - Returns current tier based on game time
- `applyTierSettings(tier)` - Returns configuration object with:
  - `enemySpeed` - Speed multiplier for enemies
  - `enemySpawnInterval` - Time between enemy spawns
  - `allowedObstacles` - Array of obstacles that can spawn
  - `obstacleSpawnIntervals` - Individual spawn rates per obstacle

### System Integration
- **Enemy System** applies speed multiplier to all enemies
- **Obstacle System** only spawns allowed obstacles with tier-specific intervals
- **Visual Feedback** shows current tier name at bottom center
- **Tier Transitions** display centered notification with fade effect

## Gameplay Impact
- **Progressive Learning:** Players learn one obstacle type at a time
- **Escalating Challenge:** Enemy speed caps at 1.7× for fair gameplay
- **Endurance Mode:** Tier 9 provides infinite high-score chase
- **Strategic Depth:** Power-ups become critical in higher tiers
