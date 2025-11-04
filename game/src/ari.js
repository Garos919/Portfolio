/**
 * A.R.I. — Adaptive Response Interface
 * Simple ASCII-based assistant entity
 */

export class ARI {
    constructor() {
        // Position
        this.x = 0;
        this.y = 0;
        this.targetX = 0;
        this.targetY = 0;
        
        // Fixed size (reduced by 1/3 from 20 to ~13)
        this.fontSize = 13;
        
        // Smooth following
        this.lerpSpeed = 0.12;
        
        // Hover motion
        this.hoverOffset = 0;
        this.hoverTime = 0;
        
        // Animation
        this.currentFace = '<(o-o)>';
        this.currentState = 'neutral';
        this.animationFrames = [];
        this.currentFrame = 0;
        this.frameTimer = 0;
        this.frameDelay = 250; // 4 fps
        this.isAnimating = false;
        this.isLooping = false;
        this.revertToNeutral = false; // Auto-revert to neutral after animation
        
        // Colors with smooth interpolation
        this.currentShell = '#AEEFFF';
        this.currentGlow = 0.6;
        
        this.targetShell = '#AEEFFF';
        this.targetGlow = 0.6;
        
        this.colorLerpSpeed = 0.08;
        
        // State color definitions
        this.stateColors = {
            neutral: {shell:'#AEEFFF', glow:0.6},
            happy: {shell:'#4DFFFF', glow:0.8},
            sad: {shell:'#3B6BFF', glow:0.4},
            angry: {shell:'#FF2B2B', glow:1.0},
            surprised: {shell:'#FFD94D', glow:0.9},
            confused: {shell:'#D96BFF', glow:0.7},
            annoyed: {shell:'#C97D44', glow:0.5},
            worried: {shell:'#FFB64D', glow:0.7},
            curious: {shell:'#4DFFBC', glow:0.8},
            shocked: {shell:'#FFFFFF', glow:1.0},
            corrupted: {shell:'#A700FF', glow:1.2},
            warning: {shell:'#FFC94D', glow:1.0},
            glitch: {shell:'#FF00FF', glow:1.3},
            error: {shell:'#FF1A1A', glow:1.0},
            shutdown: {shell:'#404040', glow:0.0}
        };
        
        // Animation sequences
        this.animations = {
            neutral_entry: ['<(-.-)>', '<(._.)>', '<(o.o)>', '<(o-o)>'],
            happy_entry: ['<(o-o)>', '<(o^o)>', '<(^_^)>', '<(^-^)>'],
            sad_entry: ['<(o-o)>', '<(o∩o)>', '<(∪_∪)>', '<(∪-∪)>'],
            angry_entry: ['<(o-o)>', '<(>_o)>', '<(>_O)>', '<(>-<)>'],
            surprised_entry: ['<(o-o)>', '<(O.o)>', '<(O_o)>', '<(O.O)>'],
            confused_entry: ['<(o-o)>', '<(o@o)>', '<(o_o)>', '<(@_@)>'],
            annoyed_entry: ['<(o-o)>', '<(-.-)>', '<(-_.)>', '<(-_-)>'],
            worried_entry: ['<(o-o)>', '<(o_O)>', '<(O_o)>', '<(o_O)>'],
            curious_entry: ['<(o-o)>', '<(o_o)>', '<(°_o)>', '<(°-°)>'],
            shocked_entry: ['<(o-o)>', '<(O_o)>', '<(O0O)>', '<(O-O)>'],
            corrupted_entry: ['<(x_!)>', '<(=/0)>', '<(@_@)>', '<(x_x)>', '<(#x#)>', '<(#-#)>'],
            warning_entry: ['<(o-o)>', '<(o⚠o)>', '<(⚠_⚠)>', '<(⚠-⚠)>'],
            glitch_entry: ['<(o-o)>', '<(X-o)>', '<(x_X)>', '<(x_x)>'],
            error_entry: ['<(o-o)>', '<(o!o)>', '<(!0!)>', '<(!!!)>'],
            shutdown_entry: ['<(o-o)>', '<(x-x)>', '<(x_x)>', '<(___)>'],
            talk: ['<(o-o)>', '<(o=o)>', '<(o-o)>', '<(o_o)>'],
            blink: ['<(o-o)>', '<(-.o)>', '<(-.-)>', '<(o.-)>'],
            idle: ['<(o-o)>', '<(o_o)>', '<(o-o)>', '<(o-o)>'],
            processing: ['<(o.o)>', '<(o°o)>', '<(°o°)>', '<(o°o)>'],
            scan: ['<(o-o)>', '<(o>o)>', '<(o<o)>', '<(o-o)>']
        };
        
        // Static expressions
        this.staticFaces = {
            neutral: '<(o-o)>',
            happy: '<(^-^)>',
            sad: '<(∪-∪)>',
            angry: '<(>-<)>',
            surprised: '<(O.O)>',
            confused: '<(@_@)>',
            annoyed: '<(-_-)>',
            worried: '<(o_O)>',
            curious: '<(°-°)>',
            shocked: '<(O-O)>',
            corrupted: '<(#-#)>',
            warning: '<(⚠-⚠)>',
            glitch: '<(x_x)>',
            error: '<(!!!)>',
            shutdown: '<(___)>'
        };
    }
    
    follow(x, y) {
        this.targetX = x;
        this.targetY = y;
    }
    
    update(deltaTime) {
        // Smooth position lerp
        this.x += (this.targetX - this.x) * this.lerpSpeed;
        this.y += (this.targetY - this.y) * this.lerpSpeed;
        
        // Hover motion
        this.hoverTime += deltaTime * 0.001;
        this.hoverOffset = Math.sin(this.hoverTime) * 3;
        
        // Color interpolation
        this.currentShell = this.lerpColor(this.currentShell, this.targetShell, this.colorLerpSpeed);
        this.currentGlow += (this.targetGlow - this.currentGlow) * this.colorLerpSpeed;
        
        // Animation update
        if (this.isAnimating) {
            this.frameTimer += deltaTime;
            if (this.frameTimer >= this.frameDelay) {
                this.frameTimer = 0;
                this.currentFrame++;
                
                if (this.currentFrame >= this.animationFrames.length) {
                    if (this.isLooping) {
                        this.currentFrame = 0;
                    } else {
                        this.isAnimating = false;
                        this.currentFace = this.staticFaces[this.currentState] || '<(o-o)>';
                        
                        // Auto-revert to neutral if flag is set
                        if (this.revertToNeutral && this.currentState !== 'neutral') {
                            this.revertToNeutral = false;
                            this.setState('neutral');
                        }
                        return;
                    }
                }
                
                this.currentFace = this.animationFrames[this.currentFrame];
            }
        }
    }
    
    render(ctx) {
        const x = this.x;
        const y = this.y + this.hoverOffset;
        
        ctx.save();
        
        // Glow intensity with pulse
        const pulse = Math.sin(this.hoverTime * 2) * 0.1;
        const glowIntensity = Math.max(0, this.currentGlow + pulse);
        
        // Single face layer with shell color and glow
        ctx.shadowColor = this.currentShell;
        ctx.shadowBlur = 15 * glowIntensity;
        ctx.fillStyle = this.currentShell;
        ctx.globalAlpha = 1.0;
        ctx.font = `${this.fontSize}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.currentFace, x, y);
        
        ctx.restore();
    }
    
    setState(stateName, autoRevert = false) {
        if (!this.stateColors[stateName]) return;
        
        this.currentState = stateName;
        this.revertToNeutral = autoRevert;
        
        // Set target colors
        const colors = this.stateColors[stateName];
        this.targetShell = colors.shell;
        this.targetGlow = colors.glow;
        
        // Play entry animation
        const entryAnim = this.animations[stateName + '_entry'];
        if (entryAnim) {
            this.startAnimation(entryAnim, false);
        } else {
            this.currentFace = this.staticFaces[stateName] || '<(o-o)>';
        }
    }
    
    loop(loopName) {
        const anim = this.animations[loopName];
        if (anim) {
            this.startAnimation(anim, true);
        }
    }
    
    stopAll() {
        this.isAnimating = false;
        this.isLooping = false;
        this.currentFace = this.staticFaces[this.currentState] || '<(o-o)>';
    }
    
    startAnimation(frames, loop) {
        this.animationFrames = frames;
        this.currentFrame = 0;
        this.frameTimer = 0;
        this.isAnimating = true;
        this.isLooping = loop;
        this.currentFace = frames[0];
    }
    
    lerpColor(c1, c2, t) {
        const r1 = parseInt(c1.slice(1,3), 16);
        const g1 = parseInt(c1.slice(3,5), 16);
        const b1 = parseInt(c1.slice(5,7), 16);
        
        const r2 = parseInt(c2.slice(1,3), 16);
        const g2 = parseInt(c2.slice(3,5), 16);
        const b2 = parseInt(c2.slice(5,7), 16);
        
        const r = Math.round(r1 + (r2 - r1) * t);
        const g = Math.round(g1 + (g2 - g1) * t);
        const b = Math.round(b1 + (b2 - b1) * t);
        
        return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
    }
}

// Global instance
let ari = null;

export function initARI() {
    ari = new ARI();
    
    window.ARI = {
        playEmotion: (name) => ari && ari.setState(name),
        playSystem: (name) => ari && ari.setState(name),
        loop: (name) => ari && ari.loop(name),
        stopAll: () => ari && ari.stopAll()
    };
    
    return ari;
}

export function getARI() {
    return ari;
}
