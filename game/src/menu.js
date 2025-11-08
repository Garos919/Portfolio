import { BackgroundController } from './backgroundController.js';

// Helper function to create button break animation
function animateButtonBreak(button) {
    return new Promise(resolve => {
        const rect = button.getBoundingClientRect();
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
            const startX = pageX + (Math.random() * rect.width);
            const startY = pageY + (Math.random() * rect.height);
            Object.assign(frag.style, {
                position: 'fixed',
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

        // animate fragments
        requestAnimationFrame(() => {
            for (const f of fragments) {
                const frag = f.el;
                const tx = (Math.random() - 0.5) * vw * 1.6;
                const ty = (Math.random() - 0.5) * vh * 1.6 - 60;
                const rot = (Math.random() - 0.5) * 720;
                const scale = 0.2 + Math.random() * 1.2;
                frag.style.transform = `translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(${scale})`;
                frag.style.opacity = '0';
            }

            setTimeout(() => {
                for (const f of fragments) if (f.el.parentElement) f.el.parentElement.removeChild(f.el);
                resolve();
            }, 650);
        });
    });
}

export function createMenu(startCallback) {
    const gameContainer = document.getElementById('gameContainer');
    const bgController = new BackgroundController();
    
    // Show starfield background for menu
    bgController.showStarfield();
    
    // Try to start music when menu is created
    if (typeof window.ensureMusicPlaying === 'function') {
        window.ensureMusicPlaying();
    }
    
    const menu = document.createElement("div");
    menu.id = "menu";
    
    // Position menu absolutely within gameContainer to overlay it completely
    Object.assign(menu.style, {
        position: "absolute",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "transparent",
        color: "#0ff",
        textAlign: "center",
        fontFamily: "'Press Start 2P', monospace",
        zIndex: 100,
        border: "none",
        boxSizing: "border-box"
    });

    // retro title block
    const titleContainer = document.createElement("div");
    Object.assign(titleContainer.style, {
        textTransform: "uppercase",
        marginBottom: "30px",
        transformOrigin: "center center",
        position: "relative"
    });

    const zone = document.createElement("div");
    zone.textContent = "ZONE";
    Object.assign(zone.style, {
        color: "#0ff",
        fontSize: "38px",
        letterSpacing: "6px",
        transform: "perspective(400px) scaleX(1.2) rotateX(25deg)",
        textShadow: "0 0 8px #0ff, 0 0 20px #0ff",
        marginBottom: "10px"
    });

    const invaders = document.createElement("div");
    invaders.textContent = "INVADERS";
    Object.assign(invaders.style, {
        color: "#f33",
        fontSize: "44px",
        letterSpacing: "4px",
        transform: "perspective(400px) scaleX(1.4) rotateX(35deg)",
        textShadow: "0 0 8px #f33, 0 0 20px #f33",
    });
    
    // Mobile responsiveness
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
        zone.style.fontSize = "28px";
        zone.style.letterSpacing = "4px";
        invaders.style.fontSize = "32px";
        invaders.style.letterSpacing = "3px";
    }
    if (window.innerWidth <= 480) {
        zone.style.fontSize = "20px";
        zone.style.letterSpacing = "2px";
        invaders.style.fontSize = "24px";
        invaders.style.letterSpacing = "2px";
    }

    titleContainer.append(zone, invaders);

    // Version display under title
    const versionDisplay = document.createElement("div");
    versionDisplay.textContent = "v0.6.0";
    Object.assign(versionDisplay.style, {
        fontFamily: "'Press Start 2P', monospace",
        fontSize: "10px",
        color: "rgba(0, 255, 255, 0.3)",
        textAlign: "center",
        marginTop: "15px",
        letterSpacing: "2px"
    });
    titleContainer.appendChild(versionDisplay);

    const start = document.createElement("button");
    start.textContent = "Start Game";
    Object.assign(start.style, {
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.1) 1px, rgba(0,0,0,0.1) 2px), repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(0,0,0,0.1) 1px, rgba(0,0,0,0.1) 2px), linear-gradient(180deg, #0ff 0%, #0dd 50%, #0bb 100%)",
        border: "2px solid #0dd",
        color: "#000",
        fontFamily: "'Press Start 2P', monospace",
        fontWeight: "normal",
        padding: isMobile ? "12px 20px" : "15px 30px",
        borderRadius: "0",
        cursor: "pointer",
        marginTop: "20px",
        fontSize: isMobile ? "12px" : "14px",
        boxShadow: "0 4px 0 #088, 0 0 20px rgba(0,255,255,0.5)",
        textShadow: "1px 1px 0 rgba(0,0,0,0.3)",
        imageRendering: "pixelated",
        transition: "all 0.1s ease",
        position: "relative"
    });
    start.addEventListener("mouseenter", () => {
        // Play hover sound
        if (window.audioManager && window.audioManager.playHover) {
            window.audioManager.playHover();
        }
        start.style.backgroundImage = "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.1) 1px, rgba(0,0,0,0.1) 2px), repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(0,0,0,0.1) 1px, rgba(0,0,0,0.1) 2px), linear-gradient(180deg, #fff 0%, #ddd 50%, #bbb 100%)";
        start.style.color = "#0ff";
        start.style.boxShadow = "0 4px 0 #088, 0 0 30px rgba(0,255,255,0.8)";
        start.style.transform = "translateY(-2px)";
    });
    start.addEventListener("mouseleave", () => {
        start.style.backgroundImage = "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.1) 1px, rgba(0,0,0,0.1) 2px), repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(0,0,0,0.1) 1px, rgba(0,0,0,0.1) 2px), linear-gradient(180deg, #0ff 0%, #0dd 50%, #0bb 100%)";
        start.style.color = "#000";
        start.style.boxShadow = "0 4px 0 #088, 0 0 20px rgba(0,255,255,0.5)";
        start.style.transform = "translateY(0)";
    });
    // Click handler will be added after skipIntro button is created

    const exit = document.createElement("button");
    exit.textContent = "Exit";
    Object.assign(exit.style, {
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.1) 1px, rgba(0,0,0,0.1) 2px), repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(0,0,0,0.1) 1px, rgba(0,0,0,0.1) 2px), linear-gradient(180deg, #f33 0%, #d33 50%, #b33 100%)",
        border: "2px solid #d33",
        color: "#000",
        fontFamily: "'Press Start 2P', monospace",
        fontWeight: "normal",
        padding: isMobile ? "12px 20px" : "15px 30px",
        borderRadius: "0",
        cursor: "pointer",
        marginTop: "10px",
        fontSize: isMobile ? "12px" : "14px",
        boxShadow: "0 4px 0 #833, 0 0 20px rgba(255,51,51,0.5)",
        textShadow: "1px 1px 0 rgba(0,0,0,0.3)",
        imageRendering: "pixelated",
        transition: "all 0.1s ease",
        position: "relative"
    });
    exit.addEventListener("mouseenter", () => {
        // Play hover sound
        if (window.audioManager && window.audioManager.playHover) {
            window.audioManager.playHover();
        }
        exit.style.backgroundImage = "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.1) 1px, rgba(0,0,0,0.1) 2px), repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(0,0,0,0.1) 1px, rgba(0,0,0,0.1) 2px), linear-gradient(180deg, #fff 0%, #ddd 50%, #bbb 100%)";
        exit.style.color = "#f33";
        exit.style.boxShadow = "0 4px 0 #833, 0 0 30px rgba(255,51,51,0.8)";
        exit.style.transform = "translateY(-2px)";
    });
    exit.addEventListener("mouseleave", () => {
        exit.style.backgroundImage = "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.1) 1px, rgba(0,0,0,0.1) 2px), repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(0,0,0,0.1) 1px, rgba(0,0,0,0.1) 2px), linear-gradient(180deg, #f33 0%, #d33 50%, #b33 100%)";
        exit.style.color = "#000";
        exit.style.boxShadow = "0 4px 0 #833, 0 0 20px rgba(255,51,51,0.5)";
        exit.style.transform = "translateY(0)";
    });
    // Click handler will be added after skipIntro button is created

    // Skip Intro button - go straight to game without intro sequence
    const skipIntro = document.createElement("button");
    skipIntro.textContent = "Start Game (No Intro)";
    Object.assign(skipIntro.style, {
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.1) 1px, rgba(0,0,0,0.1) 2px), repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(0,0,0,0.1) 1px, rgba(0,0,0,0.1) 2px), linear-gradient(180deg, #fa0 0%, #d90 50%, #b70 100%)",
        border: "2px solid #d90",
        color: "#000",
        fontFamily: "'Press Start 2P', monospace",
        fontWeight: "normal",
        padding: isMobile ? "10px 16px" : "15px 30px",
        borderRadius: "0",
        cursor: "pointer",
        marginTop: "10px",
        fontSize: isMobile ? "10px" : "12px",
        boxShadow: "0 4px 0 #860, 0 0 20px rgba(255,170,0,0.5)",
        textShadow: "1px 1px 0 rgba(0,0,0,0.3)",
        imageRendering: "pixelated",
        transition: "all 0.1s ease",
        position: "relative"
    });
    skipIntro.addEventListener("mouseenter", () => {
        if (window.audioManager && window.audioManager.playHover) {
            window.audioManager.playHover();
        }
        skipIntro.style.backgroundImage = "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.1) 1px, rgba(0,0,0,0.1) 2px), repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(0,0,0,0.1) 1px, rgba(0,0,0,0.1) 2px), linear-gradient(180deg, #fff 0%, #ddd 50%, #bbb 100%)";
        skipIntro.style.color = "#fa0";
        skipIntro.style.boxShadow = "0 4px 0 #860, 0 0 30px rgba(255,170,0,0.8)";
        skipIntro.style.transform = "translateY(-2px)";
    });
    skipIntro.addEventListener("mouseleave", () => {
        skipIntro.style.backgroundImage = "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.1) 1px, rgba(0,0,0,0.1) 2px), repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(0,0,0,0.1) 1px, rgba(0,0,0,0.1) 2px), linear-gradient(180deg, #fa0 0%, #d90 50%, #b70 100%)";
        skipIntro.style.color = "#000";
        skipIntro.style.boxShadow = "0 4px 0 #860, 0 0 20px rgba(255,170,0,0.5)";
        skipIntro.style.transform = "translateY(0)";
    });
    skipIntro.addEventListener("click", async () => {
        // Play explosion sound
        if (window.audioManager && window.audioManager.playExplosion) {
            window.audioManager.playExplosion();
        }
        
        // Fade out version display
        versionDisplay.style.transition = 'opacity 300ms ease-out';
        versionDisplay.style.opacity = '0';
        
        // Disable all buttons to prevent double-click
        start.style.pointerEvents = 'none';
        skipIntro.style.pointerEvents = 'none';
        exit.style.pointerEvents = 'none';
        
        // Explode all three buttons simultaneously
        await Promise.all([
            animateButtonBreak(start),
            animateButtonBreak(skipIntro),
            animateButtonBreak(exit)
        ]);
        
        // Skip intro completely - pass null values to trigger direct game start
        startCallback(null, null, menu, bgController);
    });

    // Now add click handlers for Start and Exit buttons (after skipIntro is created)
    start.addEventListener("click", async () => {
        // Play explosion sound
        if (window.audioManager && window.audioManager.playExplosion) {
            window.audioManager.playExplosion();
        }
        
        // Fade out version display
        versionDisplay.style.transition = 'opacity 300ms ease-out';
        versionDisplay.style.opacity = '0';
        
        // Disable all buttons to prevent double-click
        start.style.pointerEvents = 'none';
        skipIntro.style.pointerEvents = 'none';
        exit.style.pointerEvents = 'none';
        
        // Explode all three buttons simultaneously
        await Promise.all([
            animateButtonBreak(start),
            animateButtonBreak(skipIntro),
            animateButtonBreak(exit)
        ]);
        
        // Pass the start button and title container to the callback so the intro can animate them.
        startCallback(start, titleContainer, menu, bgController);
    });

    exit.addEventListener("click", async () => {
        // Play explosion sound and store reference
        let explosionSound = null;
        if (window.audioManager && window.audioManager.playExplosion) {
            explosionSound = window.audioManager.playExplosion();
        }
        
        // Fade out version display
        versionDisplay.style.transition = 'opacity 300ms ease-out';
        versionDisplay.style.opacity = '0';
        
        // Fade out music
        if (window.audioManager && window.audioManager.fadeOut) {
            window.audioManager.fadeOut(1000);
        }
        
        // Fade out explosion sound in the last 500ms
        setTimeout(() => {
            if (explosionSound && window.audioManager && window.audioManager.fadeOutSound) {
                window.audioManager.fadeOutSound(explosionSound, 500);
            }
        }, 1000); // Start fade at 1000ms (1500ms total - 500ms fade = 1000ms delay)
        
        // Disable all buttons to prevent double-click
        start.style.pointerEvents = 'none';
        skipIntro.style.pointerEvents = 'none';
        exit.style.pointerEvents = 'none';
        
        // Create fade overlay that covers entire viewport
        const fadeOverlay = document.createElement('div');
        Object.assign(fadeOverlay.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: '#000',
            opacity: '0',
            transition: 'opacity 500ms ease-in-out',
            zIndex: '99999',
            pointerEvents: 'none'
        });
        document.body.appendChild(fadeOverlay);
        
        // Start fade to black immediately
        setTimeout(() => {
            fadeOverlay.style.opacity = '1';
        }, 10);
        
        // Explode all three buttons simultaneously (non-blocking)
        Promise.all([
            animateButtonBreak(start),
            animateButtonBreak(skipIntro),
            animateButtonBreak(exit)
        ]);
        
        // Navigate after fade completes
        setTimeout(() => {
            window.location.href = "../home.html";
        }, 1500);
    });

    menu.append(titleContainer, start, skipIntro, exit);
    gameContainer.appendChild(menu);
}