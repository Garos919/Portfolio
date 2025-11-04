# A.R.I. Implementation Guide

## Overview
A.R.I. (Adaptive Response Interface) is now implemented as a simple ASCII-based assistant that follows the player and reacts to game events through color and emotional expressions.

## Features

### Visual Design
- **Pure ASCII text rendering**: `<(o-o)>` style emoticon faces
- **Fixed size**: 20px monospace font
- **Smooth following**: Follows player with offset (x+40, y-60)
- **Hover animation**: Gentle sine wave vertical motion
- **Color transitions**: Smooth interpolation between emotional states
- **Glow effects**: Dynamic shadow blur with pulse

### Emotional States
Each state has unique colors and animations:

| State | Shell Color | Face Color | Glow | Expression |
|-------|-------------|------------|------|------------|
| neutral | #AEEFFF | #FFFFFF | 0.6 | `<(o-o)>` |
| happy | #4DFFFF | #FFF6CC | 0.8 | `<(^-^)>` |
| sad | #3B6BFF | #E8F0FF | 0.4 | `<(∪-∪)>` |
| angry | #FF2B2B | #FFFFFF | 1.0 | `<(>-<)>` |
| surprised | #FFD94D | #FFFFFF | 0.9 | `<(O.O)>` |
| confused | #D96BFF | #FFFFFF | 0.7 | `<(@_@)>` |
| annoyed | #C97D44 | #FFFFFF | 0.5 | `<(-_-)>` |
| worried | #FFB64D | #FFFFFF | 0.7 | `<(o_O)>` |
| curious | #4DFFBC | #FFFFFF | 0.8 | `<(°-°)>` |
| shocked | #FFFFFF | #FF2B2B | 1.0 | `<(O-O)>` |
| corrupted | #A700FF | #FFFFFF | 1.2 | `<(#-#)>` |
| warning | #FFC94D | #FFFFFF | 1.0 | `<(⚠-⚠)>` |
| glitch | #FF00FF | #FFFFFF | 1.3 | `<(x_x)>` |
| error | #FF1A1A | #FFFFFF | 1.0 | `<(!!!)>` |
| shutdown | #404040 | #808080 | 0.0 | `<(___)>` |

### Animations
- **Entry animations**: Smooth 4-frame transitions when changing states
- **Loop animations**: `talk`, `blink`, `idle`, `processing`, `scan`
- **Frame rate**: 4 FPS (250ms per frame)
- **Auto-complete**: Entry animations play once, then hold final expression

### Current Game Integrations
- **Player damage**: A.R.I. becomes `worried` when player takes hit
- **Player death**: A.R.I. becomes `shocked` when player dies
- **Restart**: A.R.I. resets to `neutral` when game restarts

## Global API

A.R.I. can be controlled via the global `window.ARI` object:

```javascript
// Change emotional state (plays entry animation)
window.ARI.playEmotion('happy');
window.ARI.playEmotion('sad');
window.ARI.playEmotion('shocked');

// Change system state
window.ARI.playSystem('warning');
window.ARI.playSystem('error');
window.ARI.playSystem('corrupted');

// Start looping animation
window.ARI.loop('talk');
window.ARI.loop('blink');
window.ARI.loop('processing');

// Stop all animations and return to static face
window.ARI.stopAll();
```

## Technical Details

### Class Structure
```javascript
class ARI {
    // Position tracking with smooth lerp
    x, y, targetX, targetY
    lerpSpeed = 0.12
    
    // Visual properties
    fontSize = 20
    currentFace = '<(o-o)>'
    currentState = 'neutral'
    
    // Color interpolation
    currentShell, targetShell
    currentFaceColor, targetFaceColor
    currentGlow, targetGlow
    colorLerpSpeed = 0.08
    
    // Animation system
    animationFrames[]
    currentFrame
    frameDelay = 250ms
    isAnimating, isLooping
}
```

### Integration Points

**In engine.js:**
```javascript
// Import
import { initARI, getARI } from './ari.js';

// Initialize (in constructor)
this.ari = initARI();

// Update (in update method)
this.ari.follow(this.player.x + 40, this.player.y - 60);
this.ari.update(16);

// Render (in draw method)
this.ari.render(this.ctx);
```

## Future Enhancement Ideas
- React to power-up collection (curious/happy)
- React to enemy waves (warning/worried)
- React to score milestones (happy)
- React to tier changes (surprised/processing)
- Scan animation when glitch swarms appear
- Blink animation during idle periods
- Talk animation during tier notifications
- Corrupted state during background corruption events

## File Structure
```
game/src/ari.js         - Main implementation
game/entities/ari/      - Design specifications
  ari_animations.txt    - Animation sequences
  ari_visual_identity_framework.txt - Color palettes
  timing_&_engine_map.txt - Timing specifications
```

## Notes
- A.R.I. is rendered AFTER the player, so it appears in front
- Smooth position lerp creates natural following motion
- Color transitions are smooth and gradual (8% per frame)
- Glow pulses are subtle (±10% of base glow intensity)
- All animations are non-blocking and can be interrupted
