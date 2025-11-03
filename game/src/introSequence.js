export class IntroSequence {
    constructor(canvas) {
        this.canvas = canvas;
        this.overlay = document.getElementById('introOverlay');
        this.dialogueBox = document.getElementById('dialogueBox');
        this.dialogueText = document.getElementById('dialogueText');
        this.cursor = document.getElementById('cursor');
        this.warning = document.getElementById('warning');
        this.missionText = document.getElementById('missionText');
        this.onComplete = null;
        this.isComplete = false; // Track if intro is finished
        this.bgController = null; // Will be set when start() is called
        this.dialogueLines = [
            "Ah, what a nice day to code...",
            "Let's see where we left off last time...",
            "Oh no... what is that?!",
            "Our code is full of errors!!",
            "We must fix them..."
        ];
        this.currentLine = 0;
        this.isTyping = false;

        // Make sure elements are initially hidden
        this.warning.style.display = 'none';
        this.missionText.style.display = 'none';
        this.dialogueBox.style.display = 'none';
    }

    updateOverlayPosition() {
        // No longer needed - overlay is positioned by CSS relative to container
        // Keeping method for compatibility but it does nothing now
    }

    async start(startButton, titleContainer, menu, bgController, onComplete) {
        // signature: start(startButton, titleContainer, menu, bgController, onComplete)
        this.onComplete = onComplete;
        this.bgController = bgController;

        // Prevent page scrolling/shifting during intro
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        // Show overlay - it's already positioned by CSS
        this.overlay.style.display = 'block';
        this.overlay.style.pointerEvents = 'auto';
        
        // No need for resize listener - CSS handles positioning
        // No manual positioning needed - overlay is absolutely positioned within gameContainer


        // Phase 1 - Menu breakdown & camera dive
        if (startButton && titleContainer && menu) {
            await this.playMenuBreakdownSequence(startButton, titleContainer, menu);
        } else {
            // if not provided, give a brief pause
            await new Promise(resolve => setTimeout(resolve, 300));
        }

        // After the camera dive we should be in a black screen; fade back into the canvas
        // Make sure canvas is visible but keep it hidden under black until fade completes
        this.canvas.style.display = 'block';

        // Small pause before continuing to dialogue
        await new Promise(resolve => setTimeout(resolve, 1700));

        // Phase 3 - Dialogue sequence (black background)
        if (this.bgController) this.bgController.showBlack();
        await this.playDialogueSequence();

        // Phase 4 - Warning sequence (no background pulse - using custom pulses per sound)
        // Don't call showWarnings() as it has continuous red pulse animation
        // if (this.bgController) this.bgController.showWarnings();
        await this.playWarningSequence();

        // Phase 5 - Start gameplay with fade from black
        await this.startGameplay();
    }

    // Phase 1 implementation
    async playMenuBreakdownSequence(startButton, titleContainer, menu) {
        // Remove game stars when button is pressed
        if (this.bgController) {
            this.bgController.removeGameStars();
        }
        
        // Skip button break effect - it's already done in menu.js
        // The buttons are already exploded before this function is called
        
        // Small pause to let button explosion finish
        await new Promise(resolve => setTimeout(resolve, 300));

        // 1B Logo zoom effect with background fade happening simultaneously
        if (titleContainer) {
            // Apply perspective to the menu element, NOT the body
            if (menu) {
                menu.style.perspective = '1000px';
                menu.style.perspectiveOrigin = 'center center';
            }
            
            titleContainer.style.transformStyle = 'preserve-3d';
            titleContainer.style.willChange = 'transform, opacity, filter';
            titleContainer.style.transformOrigin = 'center center';
            
            // Animate using requestAnimationFrame with exponential ease-in
            // This will also fade the background to black
            await this.animateLogoZoom(titleContainer);
        }

        // Now remove menu after animation is complete
        try { if (menu && menu.parentElement) menu.parentElement.removeChild(menu); } catch (e) {}
        
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Exponential ease-in animation for logo zoom
    animateLogoZoom(titleContainer) {
        return new Promise(resolve => {
            // Play whoosh sound at the start of the zoom
            if (window.audioManager && window.audioManager.playWhoosh) {
                window.audioManager.playWhoosh();
            }
            
            // Fade out music in the last 500ms of the animation (at 2000ms)
            setTimeout(() => {
                if (window.audioManager && window.audioManager.fadeOutAndStop) {
                    window.audioManager.fadeOutAndStop(500);
                }
            }, 2000); // Start fade out at 2000ms (2500ms total - 500ms fade = 2000ms delay)
            
            const duration = 2500; // 2.5 seconds
            const startScale = 1;
            const endScale = 20;
            const startOpacity = 1;
            const endOpacity = 0;
            const startBrightness = 1;
            const endBrightness = 0.5;
            const startTime = performance.now();
            const k = 5; // controls how sharply acceleration increases
            
            // Get the zone and invaders elements to fade their glow
            const zone = titleContainer.children[0];
            const invaders = titleContainer.children[1];
            
            // Get background layer to fade it to black
            const backgroundLayer = this.bgController ? this.bgController.background : null;
            if (backgroundLayer) {
                backgroundLayer.style.transition = 'none'; // Use manual animation instead
            }

            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const tNorm = Math.min(elapsed / duration, 1); // normalized time 0 → 1
                
                // Exponential ease-in: (e^(k*t) - 1) / (e^k - 1)
                const easeInExp = (Math.exp(k * tNorm) - 1) / (Math.exp(k) - 1);
                
                // Interpolate values
                const scale = startScale + (endScale - startScale) * easeInExp;
                const opacity = startOpacity + (endOpacity - startOpacity) * easeInExp;
                const brightness = startBrightness + (endBrightness - startBrightness) * easeInExp;
                
                // Fade glow from full to zero using the same curve
                const glowIntensity = 1 - easeInExp; // inverted so it goes 1 → 0
                const zoneBlur = 8 * glowIntensity;
                const zoneSpread = 20 * glowIntensity;
                const invadersBlur = 8 * glowIntensity;
                const invadersSpread = 20 * glowIntensity;
                
                // Fade background to black using the same curve
                const bgOpacity = 1 - easeInExp; // stars fade out
                if (backgroundLayer) {
                    backgroundLayer.style.opacity = bgOpacity;
                }
                
                // Apply transform
                titleContainer.style.transform = `scale(${scale}) translateZ(${1000 * easeInExp}px)`;
                titleContainer.style.opacity = opacity;
                titleContainer.style.filter = `brightness(${brightness})`;
                
                // Fade the glow on both title elements
                if (zone) {
                    zone.style.textShadow = `0 0 ${zoneBlur}px #0ff, 0 0 ${zoneSpread}px #0ff`;
                }
                if (invaders) {
                    invaders.style.textShadow = `0 0 ${invadersBlur}px #f33, 0 0 ${invadersSpread}px #f33`;
                }
                
                // Continue animation or resolve
                if (tNorm < 1) {
                    requestAnimationFrame(animate);
                } else {
                    // Clear the background after animation completes
                    if (this.bgController) {
                        this.bgController.clear();
                        this.bgController.background.style.backgroundColor = '#000';
                        this.bgController.background.style.opacity = '1';
                        this.bgController.currentState = 'black';
                    }
                    resolve();
                }
            };

            requestAnimationFrame(animate);
        });
    }

    animateButtonBreak(button, menu) {
        return new Promise(resolve => {
            const rect = button.getBoundingClientRect();
            // Use viewport coordinates, not page coordinates
            const pageX = rect.left;
            const pageY = rect.top;

            // hide original button but keep layout until fragments created
            button.style.visibility = 'hidden';

            // create many small pixel-like fragments to scatter across the whole viewport
            const fragmentCount = 160;
            const fragments = [];
            const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
            const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

            for (let i = 0; i < fragmentCount; i++) {
                const size = 2 + Math.floor(Math.random() * 4); // 2-5px
                const frag = document.createElement('div');
                frag.className = 'btn-frag';
                // start from button area
                const startX = pageX + (Math.random() * rect.width);
                const startY = pageY + (Math.random() * rect.height);
                Object.assign(frag.style, {
                    position: 'fixed', // Changed from absolute to fixed
                    left: `${startX}px`,
                    top: `${startY}px`,
                    width: `${size}px`,
                    height: `${size}px`,
                    background: window.getComputedStyle(button).backgroundColor || '#0ff',
                    pointerEvents: 'none',
                    zIndex: 9999,
                    transform: 'translate(0,0) rotate(0deg) scale(1)',
                    opacity: '1',
                    transition: 'transform 0.6s cubic-bezier(.2,.8,.2,1), opacity 0.6s linear',
                    willChange: 'transform, opacity'
                });
                document.body.appendChild(frag);
                fragments.push({el: frag, startX, startY});
            }

            // animate fragments to many random positions across viewport
            requestAnimationFrame(() => {
                for (const f of fragments) {
                    const frag = f.el;
                    // target somewhere across the whole viewport
                    const tx = (Math.random() - 0.5) * vw * 1.6; // allow off-screen
                    const ty = (Math.random() - 0.5) * vh * 1.6 - 60;
                    const rot = (Math.random() - 0.5) * 720;
                    const scale = 0.2 + Math.random() * 1.2;
                    frag.style.transform = `translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(${scale})`;
                    frag.style.opacity = '0';
                }

                // fragments visually disappear within 0.6s
                setTimeout(() => {
                    for (const f of fragments) if (f.el.parentElement) f.el.parentElement.removeChild(f.el);
                    // Don't remove button - just keep it invisible to maintain layout
                    // This prevents the title from shifting when button is removed
                }, 650);

                // Wait 1 second before proceeding to logo zoom
                setTimeout(() => resolve(), 1000);
            });
        });
    }

    async playDialogueSequence() {
        // Show and fade in dialogue box
        this.dialogueBox.style.display = 'block';
        await new Promise(resolve => setTimeout(resolve, 10));
        this.dialogueBox.classList.add('active');

        for (const line of this.dialogueLines) {
            await this.typeLine(line);
            await this.waitForClick();
        }

        // Fade out dialogue box
        this.dialogueBox.classList.remove('active');
        await new Promise(resolve => setTimeout(resolve, 500));
        this.dialogueBox.style.display = 'none';
    }

    async typeLine(text) {
        this.isTyping = true;
        this.dialogueText.textContent = '';
        
        // Play digital typing sound at the start of each message
        if (window.audioManager && window.audioManager.playDigitalTyping) {
            window.audioManager.playDigitalTyping();
        }

        for (const char of text) {
            this.dialogueText.textContent += char;
            await new Promise(resolve => setTimeout(resolve, 40));
        }

        this.isTyping = false;
    }

    async waitForClick() {
        return new Promise(resolve => {
            const clickHandler = () => {
                if (!this.isTyping) {
                    document.removeEventListener('mousedown', clickHandler);
                    resolve();
                }
            };
            document.addEventListener('mousedown', clickHandler);
        });
    }

    async playWarningSequence() {
        // Prepare border to fade in (start invisible)
        this.canvas.style.borderColor = 'rgba(255, 255, 255, 0)';
        this.canvas.style.border = '2px solid rgba(255, 255, 255, 0)';
        this.overlay.style.border = '2px solid rgba(255, 255, 255, 0)';
        this.canvas.style.transition = 'border-color 0.6s ease';
        this.overlay.style.transition = 'border-color 0.6s ease';
        
        // Show warning elements simultaneously with the same animation
        this.warning.style.display = 'block';
        this.missionText.style.display = 'block';

    // Make the triangle larger for emphasis
    try { this.warning.style.fontSize = '150px'; } catch (e) {}

    // Temporarily disable pulse animation during fade-in
    const prevWarnAnim = this.warning.style.animation;
    try { this.warning.style.animation = 'none'; } catch (e) {}

    // Prepare initial state (hidden, slightly scaled down) — keep centering translate intact
    const transition = 'opacity 0.6s ease, transform 0.6s ease';
    this.warning.style.transition = transition;
    this.missionText.style.transition = transition;
    this.warning.style.opacity = '0';
    this.missionText.style.opacity = '0';
    this.warning.style.transform = 'translate(-50%, -50%) scale(0.92)';
    this.missionText.style.transform = 'translate(-50%, -50%) scale(0.92)';

    // Apply show on next frame so both start simultaneously
    await new Promise(resolve => requestAnimationFrame(resolve));
    this.warning.style.opacity = '1';
    this.missionText.style.opacity = '1';
    this.warning.style.transform = 'translate(-50%, -50%) scale(1)';
    this.missionText.style.transform = 'translate(-50%, -50%) scale(1)';
    
    // Fade in the border along with the warning elements
    this.canvas.style.borderColor = 'rgba(255, 255, 255, 1)';
    this.overlay.style.borderColor = 'rgba(255, 255, 255, 1)';
    
    // Wait for fade-in to complete
    await new Promise(resolve => setTimeout(resolve, 600));
    try { this.warning.style.animation = prevWarnAnim || 'pulse 1s infinite'; } catch (e) {}
    this.warning.style.transform = 'translate(-50%, -50%) scale(1)';
    this.missionText.style.transform = 'translate(-50%, -50%) scale(1)';

    // Play two warning sounds with synchronized red pulse
    console.log('Playing warning 1');
    await this.playWarningWithPulse('warning1Sound');
    await new Promise(resolve => setTimeout(resolve, 300)); // Brief pause
    console.log('Playing warning 2');
    await this.playWarningWithPulse('warning2Sound');
    console.log('Warnings complete');

    // Hold both visible for a moment
    await new Promise(resolve => setTimeout(resolve, 200));

    // Fade both out together (same transform and opacity)
    this.warning.style.opacity = '0';
    this.missionText.style.opacity = '0';
    this.warning.style.transform = 'translate(-50%, -50%) scale(0.92)';
    this.missionText.style.transform = 'translate(-50%, -50%) scale(0.92)';

    // Wait for transition to finish (600ms) then hide both together
    await new Promise(resolve => setTimeout(resolve, 600));
    this.warning.style.display = 'none';
    this.missionText.style.display = 'none';

    // restore previous animation value
    try { this.warning.style.animation = prevWarnAnim || ''; } catch (e) {}
    
    // Fade to black before starting gameplay
    this.overlay.style.transition = 'background-color 0.8s ease';
    this.overlay.style.backgroundColor = 'rgba(0,0,0,1)';
    await new Promise(resolve => setTimeout(resolve, 800));
    }

    async playWarningWithPulse(soundId) {
        // Get the warning sound
        const warningSound = document.getElementById(soundId);
        if (!warningSound) return;
        
        // Get sound duration (assume ~1-2 seconds, adjust as needed)
        const soundDuration = 1500; // Adjust this based on actual sound length
        const halfDuration = soundDuration / 2;
        
        // Start the sound
        warningSound.volume = 0.6;
        warningSound.currentTime = 0;
        warningSound.play().catch(e => console.log('Warning sound play failed:', e));
        
        // Animate red pulse overlay for full screen background
        const pulseOverlay = document.createElement('div');
        pulseOverlay.style.position = 'fixed';
        pulseOverlay.style.top = '0';
        pulseOverlay.style.left = '0';
        pulseOverlay.style.width = '100%';
        pulseOverlay.style.height = '100%';
        pulseOverlay.style.backgroundColor = 'rgba(255, 0, 0, 0)';
        pulseOverlay.style.pointerEvents = 'none';
        pulseOverlay.style.zIndex = '5';
        document.body.appendChild(pulseOverlay);
        
        // Animate red pulse overlay for game window
        const gamePulseOverlay = document.createElement('div');
        gamePulseOverlay.style.position = 'absolute';
        gamePulseOverlay.style.top = '0';
        gamePulseOverlay.style.left = '0';
        gamePulseOverlay.style.width = '100%';
        gamePulseOverlay.style.height = '100%';
        gamePulseOverlay.style.backgroundColor = 'rgba(255, 0, 0, 0)';
        gamePulseOverlay.style.pointerEvents = 'none';
        gamePulseOverlay.style.zIndex = '3';
        this.overlay.appendChild(gamePulseOverlay);
        
        // Fade in to half duration (both overlays)
        pulseOverlay.style.transition = `background-color ${halfDuration}ms ease-in`;
        gamePulseOverlay.style.transition = `background-color ${halfDuration}ms ease-in`;
        await new Promise(resolve => requestAnimationFrame(resolve));
        pulseOverlay.style.backgroundColor = 'rgba(255, 0, 0, 0.25)';
        gamePulseOverlay.style.backgroundColor = 'rgba(255, 0, 0, 0.25)';
        await new Promise(resolve => setTimeout(resolve, halfDuration));
        
        // Fade out for remaining half duration (both overlays)
        pulseOverlay.style.transition = `background-color ${halfDuration}ms ease-out`;
        gamePulseOverlay.style.transition = `background-color ${halfDuration}ms ease-out`;
        pulseOverlay.style.backgroundColor = 'rgba(255, 0, 0, 0)';
        gamePulseOverlay.style.backgroundColor = 'rgba(255, 0, 0, 0)';
        await new Promise(resolve => setTimeout(resolve, halfDuration));
        
        // Remove both overlays
        pulseOverlay.remove();
        gamePulseOverlay.remove();
    }

    async startGameplay() {
        // Disable music from being restarted by click events
        if (window.disableMusicRestart) {
            window.disableMusicRestart();
        }
        
        // Ensure music is stopped
        if (window.audioManager) {
            const bgMusic = document.getElementById('bgMusic');
            if (bgMusic) {
                bgMusic.pause();
                bgMusic.currentTime = 0;
                bgMusic.volume = 0;
            }
        }
        
        // Transition background - remove red pulse, show code background
        if (this.bgController) {
            this.bgController.removeGameRedPulse();
            this.bgController.showCodeBackground(100); // Start with 100% errors
        }
        
        // Make canvas background black for gameplay (not transparent)
        this.canvas.style.background = '#000';
        
        // Make absolutely sure overlay is black before starting
        this.overlay.style.backgroundColor = 'rgb(0, 0, 0)';
        this.overlay.style.transition = 'none';
        
        // Disable pointer events on overlay so clicks go through to canvas
        this.overlay.style.pointerEvents = 'none';
        
        // Force a reflow
        this.overlay.offsetHeight;
        
        // Restore body overflow
        document.body.style.overflow = '';
        
        // Start the game callback - this starts the game loop
        if (this.onComplete) {
            this.onComplete();
        }
        
        // Wait for game to render a couple frames
        await new Promise(resolve => setTimeout(resolve, 150));
        
        // Now set up the fade transition
        this.overlay.style.transition = 'background-color 1.5s ease-out';
        
        // Force another reflow to ensure transition is registered
        this.overlay.offsetHeight;
        
        // Start fading to transparent
        this.overlay.style.backgroundColor = 'rgba(0, 0, 0, 0)';
        
        // Wait for fade to complete
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Mark intro as complete
        this.isComplete = true;
        
        // Completely remove overlay from DOM to prevent resize issues
        if (this.overlay && this.overlay.parentElement) {
            this.overlay.parentElement.removeChild(this.overlay);
        }
        
        // Clean up references
        this.overlay = null;
        this.dialogueBox = null;
        this.dialogueText = null;
        this.cursor = null;
        this.warning = null;
        this.missionText = null;
    }

}