// Game constants and configurations

export const CANVAS_CONFIG = {
    DEFAULT_CURSOR: 'default',
    NO_CURSOR: 'none'
};

export const SPAWN_INTERVALS = {
    codeWall: 3000,
    dataCube: 4000,
    firewall: 5000,
    corruptPointer: 6000,
    asciiCloud: 12000
};

export const OBSTACLE_TYPES = {
    CODE_WALL: 'codeWall',
    DATA_CUBE: 'dataCube',
    FIREWALL: 'firewall',
    CORRUPT_POINTER: 'corruptPointer',
    ASCII_CLOUD: 'asciiCloud'
};

export const GLITCH_TEXT = ['<404>', '{NULL}', '#??#', 'ERR!', '0xDEAD', 'FAULT', '<!>', '[???]'];
export const ASCII_CHARS = '@#$%&*+=?<>';
export const BASE_ERRORS = [
    "SyntaxError", "TypeError", "NullRef", "SegFault", "StackOverflow",
    "NameError", "IOError", "ValueErr", "IndexErr", "DivideBy0"
];
export const WRAPS = [
    ["{", "}"], ["[", "]"], ["<", ">"], ["(", ")"], ["!", "!"], ["#", "#"]
];

export const PLAYER_CONFIG = {
    DEFAULT_HEALTH: 3,
    FIRE_DELAY: 200,
    INVULNERABILITY_FRAMES: 60,
    BULLET_SPEED: 6,
    SPEED_IN_CLOUD: 0.25,
    NORMAL_SPEED: 1
};

export const COLLECTIBLE_CONFIG = {
    SPAWN_INTERVAL: 15000
};