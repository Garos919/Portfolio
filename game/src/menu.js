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

    titleContainer.append(zone, invaders);

    const start = document.createElement("button");
    start.textContent = "Start Game";
    Object.assign(start.style, {
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.1) 1px, rgba(0,0,0,0.1) 2px), repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(0,0,0,0.1) 1px, rgba(0,0,0,0.1) 2px), linear-gradient(180deg, #0ff 0%, #0dd 50%, #0bb 100%)",
        border: "2px solid #0dd",
        color: "#000",
        fontFamily: "'Press Start 2P', monospace",
        fontWeight: "normal",
        padding: "15px 30px",
        borderRadius: "0",
        cursor: "pointer",
        marginTop: "20px",
        fontSize: "14px",
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
    start.addEventListener("click", async () => {
        // Play explosion sound
        if (window.audioManager && window.audioManager.playExplosion) {
            window.audioManager.playExplosion();
        }
        
        // Disable both buttons to prevent double-click
        start.style.pointerEvents = 'none';
        exit.style.pointerEvents = 'none';
        
        // Explode both buttons simultaneously
        await Promise.all([
            animateButtonBreak(start),
            animateButtonBreak(exit)
        ]);
        
        // Pass the start button and title container to the callback so the intro can animate them.
        startCallback(start, titleContainer, menu, bgController);
    });

    const exit = document.createElement("button");
    exit.textContent = "Exit";
    Object.assign(exit.style, {
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.1) 1px, rgba(0,0,0,0.1) 2px), repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(0,0,0,0.1) 1px, rgba(0,0,0,0.1) 2px), linear-gradient(180deg, #f33 0%, #d33 50%, #b33 100%)",
        border: "2px solid #d33",
        color: "#000",
        fontFamily: "'Press Start 2P', monospace",
        fontWeight: "normal",
        padding: "15px 30px",
        borderRadius: "0",
        cursor: "pointer",
        marginTop: "10px",
        fontSize: "14px",
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
    exit.addEventListener("click", async () => {
        // Play explosion sound and store reference
        let explosionSound = null;
        if (window.audioManager && window.audioManager.playExplosion) {
            explosionSound = window.audioManager.playExplosion();
        }
        
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
        
        // Disable both buttons to prevent double-click
        start.style.pointerEvents = 'none';
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
        
        // Explode both buttons simultaneously (non-blocking)
        Promise.all([
            animateButtonBreak(start),
            animateButtonBreak(exit)
        ]);
        
        // Navigate after fade completes
        setTimeout(() => {
            window.location.href = "../home.html";
        }, 1500);
    });

    menu.append(titleContainer, start, exit);
    gameContainer.appendChild(menu);
}