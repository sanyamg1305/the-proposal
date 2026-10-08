// ==============================================================================
// Himi & Sanyam - Monopoly Deal: Date Night Edition (Official Rules)
// ==============================================================================

// 1. Color Sets & Date Properties Definition
const PROPERTY_SETS_CONFIG = {
    'brown': {
        name: 'Cafés & Brews',
        color: '#92400e',
        emoji: '☕',
        size: 2,
        rents: [1, 2], // 1 card = 1M, 2 cards = 2M
        properties: [
            { id: 'p_brown_1', name: 'Blue Tokai Espresso', value: 1, color: 'brown' },
            { id: 'p_brown_2', name: 'Third Wave Cappuccino', value: 1, color: 'brown' }
        ]
    },
    'dark_blue': {
        name: 'Desserts & Gelato',
        color: '#1e3a8a',
        emoji: '🍦',
        size: 2,
        rents: [3, 8], // 1 card = 3M, 2 cards = 8M
        properties: [
            { id: 'p_dblue_1', name: 'Sunset Gelato Scoops', value: 4, color: 'dark_blue' },
            { id: 'p_dblue_2', name: 'Midnight Sizzling Brownie', value: 4, color: 'dark_blue' }
        ]
    },
    'light_blue': {
        name: 'Street Food & Bites',
        color: '#0284c7',
        emoji: '🍕',
        size: 3,
        rents: [1, 2, 3],
        properties: [
            { id: 'p_lblue_1', name: 'Late Night Maggie', value: 1, color: 'light_blue' },
            { id: 'p_lblue_2', name: 'Sev Puri Chaat Stall', value: 1, color: 'light_blue' },
            { id: 'p_lblue_3', name: 'Woodfired Pizza Spot', value: 1, color: 'light_blue' }
        ]
    },
    'pink': {
        name: 'Cozy Indoor Dates',
        color: '#db2777',
        emoji: '🎬',
        size: 3,
        rents: [1, 2, 4],
        properties: [
            { id: 'p_pink_1', name: 'Blanket Fort & Netflix', value: 2, color: 'pink' },
            { id: 'p_pink_2', name: 'Board Game Marathon', value: 2, color: 'pink' },
            { id: 'p_pink_3', name: 'Candlelight Cooking', value: 2, color: 'pink' }
        ]
    },
    'orange': {
        name: 'Outdoor Adventures',
        color: '#ea580c',
        emoji: '🌳',
        size: 3,
        rents: [1, 3, 5],
        properties: [
            { id: 'p_orange_1', name: 'Sunset Beach Walk', value: 2, color: 'orange' },
            { id: 'p_orange_2', name: 'Stargazing Drive', value: 2, color: 'orange' },
            { id: 'p_orange_3', name: 'Botanical Garden Picnic', value: 2, color: 'orange' }
        ]
    },
    'red': {
        name: 'Cinema & Plays',
        color: '#dc2626',
        emoji: '🍿',
        size: 3,
        rents: [2, 3, 6],
        properties: [
            { id: 'p_red_1', name: 'Gold Class Premiere', value: 3, color: 'red' },
            { id: 'p_red_2', name: 'Open-Air Cinema', value: 3, color: 'red' },
            { id: 'p_red_3', name: 'Broadway Musical Play', value: 3, color: 'red' }
        ]
    },
    'yellow': {
        name: 'Bookstores & Curios',
        color: '#ca8a04',
        emoji: '📚',
        size: 3,
        rents: [2, 4, 6],
        properties: [
            { id: 'p_yellow_1', name: 'Vintage Book Fair', value: 3, color: 'yellow' },
            { id: 'p_yellow_2', name: 'Cozy Corner Library', value: 3, color: 'yellow' },
            { id: 'p_yellow_3', name: 'Antique Bookmark Hunting', value: 3, color: 'yellow' }
        ]
    },
    'green': {
        name: 'Dream Escapes',
        color: '#16a34a',
        emoji: '✈️',
        size: 3,
        rents: [2, 4, 7],
        properties: [
            { id: 'p_green_1', name: 'Udaipur Heritage Palace', value: 4, color: 'green' },
            { id: 'p_green_2', name: 'Bali Sunset Cliff Villa', value: 4, color: 'green' },
            { id: 'p_green_3', name: 'Swiss Alps Cozy Cabin', value: 4, color: 'green' }
        ]
    },
    'railroad': {
        name: 'Rides & Roadtrips',
        color: '#334155',
        emoji: '🛵',
        size: 4,
        rents: [1, 2, 3, 4],
        properties: [
            { id: 'p_rr_1', name: 'Vespa City Cruise', value: 2, color: 'railroad' },
            { id: 'p_rr_2', name: 'Coastal Highway Drive', value: 2, color: 'railroad' },
            { id: 'p_rr_3', name: 'Midnight Metro Ride', value: 2, color: 'railroad' },
            { id: 'p_rr_4', name: 'Mountain Ghat Twist', value: 2, color: 'railroad' }
        ]
    },
    'utility': {
        name: 'Midnight Chills',
        color: '#0d9488',
        emoji: '🍷',
        size: 2,
        rents: [1, 2],
        properties: [
            { id: 'p_util_1', name: 'Rooftop Starlight Mocktails', value: 2, color: 'utility' },
            { id: 'p_util_2', name: 'Campfire Cocoa & Marshmallows', value: 2, color: 'utility' }
        ]
    }
};

// 2. Global Game State
let myRole = localStorage.getItem('monopoly_player_role') || 'player1'; // 'player1' (Sanyam) | 'player2' (Himi)
let targetSetsRule = 3; // 3 or 2
let activeRoomId = null;
let gameMode = 'online'; // 'online' | 'ai' | 'pass_and_play'
let isSoundEnabled = localStorage.getItem('monopoly_sound_muted') !== 'true';
let selectedCardIndex = null;
let realtimeChannel = null;
let localGameState = null;
let pendingInviteRoom = null;
let selectedPaymentCardIds = new Set();
let pendingPaymentTargetAmount = 0;
let doubleRentActiveOnTurn = false;

// 3. Audio Synthesizer (Web Audio API)
let audioCtx = null;
function getAudioContext() {
    if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

function playTone(freq, type = 'sine', duration = 0.15, vol = 0.15) {
    if (!isSoundEnabled) return;
    try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(vol, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
    } catch (e) {}
}

function playCardSound() {
    playTone(520, 'triangle', 0.08, 0.15);
}

function playCashDing() {
    playTone(987.77, 'sine', 0.15, 0.25); // B5
    setTimeout(() => playTone(1318.51, 'sine', 0.25, 0.25), 80); // E6
}

function playStealSound() {
    playTone(320, 'sawtooth', 0.18, 0.18);
    setTimeout(() => playTone(240, 'triangle', 0.2, 0.2), 90);
}

function playJustSayNoSound() {
    playTone(400, 'square', 0.15, 0.2);
    setTimeout(() => playTone(220, 'square', 0.25, 0.2), 80);
}

function playSetCompletedFanfare() {
    if (!isSoundEnabled) return;
    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
    notes.forEach((f, idx) => {
        setTimeout(() => playTone(f, 'sine', 0.25, 0.25), idx * 100);
    });
}

function playWinSound() {
    if (!isSoundEnabled) return;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
    notes.forEach((f, idx) => {
        setTimeout(() => playTone(f, 'triangle', 0.35, 0.3), idx * 110);
    });
}

function toggleSound() {
    isSoundEnabled = !isSoundEnabled;
    localStorage.setItem('monopoly_sound_muted', (!isSoundEnabled).toString());
    const icon = document.getElementById('sound-icon');
    if (icon) icon.textContent = isSoundEnabled ? '🔊' : '🔇';
    if (isSoundEnabled) playTone(500, 'sine', 0.1, 0.15);
}

// 4. Background Floating Books
const booksContainer = document.getElementById('books-container');
function createFloatingBook() {
    if (!booksContainer || booksContainer.children.length >= 10) return;
    const book = document.createElement('div');
    book.classList.add('floating-book');
    book.innerHTML = `
        <svg viewBox="0 0 24 24" fill="currentColor" class="w-full h-full">
            <path d="M12 6c-3.18-2.07-7.46-2.58-10-2.58v13.5c2.54 0 6.82.51 10 2.58 3.18-2.07 7.46-2.58 10-2.58V3.42c-2.54 0-6.82.51-10 2.58zm9 11c-2.27 0-6.15.54-8 1.39V7.07c1.85-.85 5.73-1.39 8-1.39v11.32zM3 17V5.68c2.27 0 6.15.54 8 1.39v10.93c-1.85-.85-5.73-1.39-8-1.39z"/>
        </svg>
    `;
    const left = Math.random() * 80 + 10;
    const size = Math.random() * 20 + 14;
    const drift = (Math.random() - 0.5) * 60;
    const rot = (Math.random() - 0.5) * 180;
    const dur = Math.random() * 4 + 6;
    book.style.left = `${left}%`;
    book.style.width = `${size}px`;
    book.style.height = `${size}px`;
    book.style.setProperty('--random-x', `${drift}px`);
    book.style.setProperty('--random-rot', `${rot}deg`);
    book.style.setProperty('--random-scale', `${Math.random() * 0.5 + 0.7}`);
    book.style.animationDuration = `${dur}s`;
    booksContainer.appendChild(book);
    setTimeout(() => book.remove(), dur * 1000);
}
setInterval(createFloatingBook, 1200);

// 5. Deck Generator (106 Official Monopoly Deal Cards)
function createMonopolyDealDeck() {
    const deck = [];
    let uid = 1;

    // A. Standard Properties
    Object.keys(PROPERTY_SETS_CONFIG).forEach(colorKey => {
        const conf = PROPERTY_SETS_CONFIG[colorKey];
        conf.properties.forEach(p => {
            deck.push({
                uid: 'card_' + (uid++),
                type: 'property',
                name: p.name,
                color: p.color,
                value: p.value,
                desc: `${conf.emoji} ${conf.name} (${conf.size} to complete)`
            });
        });
    });

    // B. Property Wildcards
    // 2 Super Rainbow Wildcards (0M)
    for (let i = 0; i < 2; i++) {
        deck.push({
            uid: 'card_' + (uid++),
            type: 'wildcard',
            isSuperWild: true,
            colors: ['brown', 'dark_blue', 'light_blue', 'pink', 'orange', 'red', 'yellow', 'green', 'railroad', 'utility'],
            currentColor: 'pink',
            name: 'Rainbow Date Wildcard',
            value: 0,
            desc: '🌈 Counts as ANY date property! Can flip colors anytime.'
        });
    }

    // Dual-Color Wildcards (various color pairs)
    const dualPairs = [
        ['brown', 'light_blue', 1],
        ['dark_blue', 'green', 4],
        ['pink', 'orange', 2],
        ['red', 'yellow', 3],
        ['railroad', 'utility', 2],
        ['railroad', 'green', 4],
        ['railroad', 'light_blue', 4],
        ['utility', 'pink', 2]
    ];
    dualPairs.forEach(([c1, c2, val]) => {
        deck.push({
            uid: 'card_' + (uid++),
            type: 'wildcard',
            isSuperWild: false,
            colors: [c1, c2],
            currentColor: c1,
            name: `${PROPERTY_SETS_CONFIG[c1].emoji}/${PROPERTY_SETS_CONFIG[c2].emoji} Dual Wildcard`,
            value: val,
            desc: `Can flip between ${PROPERTY_SETS_CONFIG[c1].name} & ${PROPERTY_SETS_CONFIG[c2].name}.`
        });
    });

    // C. Action Cards
    // Deal Breakers (2 cards, Value 5M)
    for (let i = 0; i < 2; i++) {
        deck.push({
            uid: 'card_' + (uid++),
            type: 'action',
            actionKey: 'deal_breaker',
            name: 'Deal Breaker 💔👑',
            value: 5,
            desc: "Steal an opponent's entire COMPLETED property set!"
        });
    }

    // Just Say No (3 cards, Value 4M)
    for (let i = 0; i < 3; i++) {
        deck.push({
            uid: 'card_' + (uid++),
            type: 'action',
            actionKey: 'just_say_no',
            name: 'Just Say No 🛑🙅‍♀️',
            value: 4,
            desc: 'Cancel ANY action card played against you! Can be played out of turn.'
        });
    }

    // Sly Deal (3 cards, Value 3M)
    for (let i = 0; i < 3; i++) {
        deck.push({
            uid: 'card_' + (uid++),
            type: 'action',
            actionKey: 'sly_deal',
            name: 'Sly Deal 🕵️‍♂️',
            value: 3,
            desc: "Steal 1 single property from opponent (cannot be in a full set)."
        });
    }

    // Forced Deal (3 cards, Value 3M)
    for (let i = 0; i < 3; i++) {
        deck.push({
            uid: 'card_' + (uid++),
            type: 'action',
            actionKey: 'forced_deal',
            name: 'Forced Deal 🔄',
            value: 3,
            desc: "Swap 1 of your properties with 1 of opponent's (neither in a full set)."
        });
    }

    // Debt Collector (3 cards, Value 3M)
    for (let i = 0; i < 3; i++) {
        deck.push({
            uid: 'card_' + (uid++),
            type: 'action',
            actionKey: 'debt_collector',
            name: 'Debt Collector 💰',
            value: 3,
            desc: 'Demand $5M Love Debt from opponent!'
        });
    }

    // It\'s My Birthday! (3 cards, Value 2M)
    for (let i = 0; i < 3; i++) {
        deck.push({
            uid: 'card_' + (uid++),
            type: 'action',
            actionKey: 'birthday',
            name: "It's My Birthday! 🎂🎉",
            value: 2,
            desc: 'Opponent must give you $2M in cash/properties as a birthday gift!'
        });
    }

    // Pass Go (10 cards, Value 1M)
    for (let i = 0; i < 10; i++) {
        deck.push({
            uid: 'card_' + (uid++),
            type: 'action',
            actionKey: 'pass_go',
            name: 'Pass Go 🏃‍♂️💨',
            value: 1,
            desc: 'Draw 2 extra cards into your hand.'
        });
    }

    // Double The Rent (2 cards, Value 1M)
    for (let i = 0; i < 2; i++) {
        deck.push({
            uid: 'card_' + (uid++),
            type: 'action',
            actionKey: 'double_rent',
            name: 'Double The Rent ✖️2',
            value: 1,
            desc: 'Play with a Rent card on the same turn to double rent!'
        });
    }

    // Houses (3 cards, Value 3M)
    for (let i = 0; i < 3; i++) {
        deck.push({
            uid: 'card_' + (uid++),
            type: 'action',
            actionKey: 'house',
            name: 'Cozy House 🏡',
            value: 3,
            desc: 'Add to a completed set to boost all rent by +$3M!'
        });
    }

    // Hotels (2 cards, Value 4M)
    for (let i = 0; i < 2; i++) {
        deck.push({
            uid: 'card_' + (uid++),
            type: 'action',
            actionKey: 'hotel',
            name: 'Luxury Hotel 🏨',
            value: 4,
            desc: 'Add to a set with a House to boost rent by +$4M more!'
        });
    }

    // Rent Cards (Dual-Color & Wild Rent)
    // 3 Rainbow Wild Rent (Value 3M)
    for (let i = 0; i < 3; i++) {
        deck.push({
            uid: 'card_' + (uid++),
            type: 'rent',
            isWildRent: true,
            name: 'Wild Rent Card 🏷️✨',
            value: 3,
            desc: 'Charge rent on ANY color set you own on the board!'
        });
    }

    // Dual-Color Rent (2 of each pair, Value 1M)
    const rentPairs = [
        ['brown', 'light_blue'],
        ['dark_blue', 'green'],
        ['pink', 'orange'],
        ['red', 'yellow'],
        ['railroad', 'utility']
    ];
    rentPairs.forEach(([c1, c2]) => {
        for (let i = 0; i < 2; i++) {
            deck.push({
                uid: 'card_' + (uid++),
                type: 'rent',
                isWildRent: false,
                colors: [c1, c2],
                name: `${PROPERTY_SETS_CONFIG[c1].emoji}/${PROPERTY_SETS_CONFIG[c2].emoji} Rent`,
                value: 1,
                desc: `Charge rent for ${PROPERTY_SETS_CONFIG[c1].name} or ${PROPERTY_SETS_CONFIG[c2].name}.`
            });
        }
    });

    // D. Money Cards
    const moneyCards = [
        { count: 1, val: 10 },
        { count: 2, val: 5 },
        { count: 3, val: 4 },
        { count: 3, val: 3 },
        { count: 5, val: 2 },
        { count: 6, val: 1 }
    ];
    moneyCards.forEach(({ count, val }) => {
        for (let i = 0; i < count; i++) {
            deck.push({
                uid: 'card_' + (uid++),
                type: 'money',
                name: `$${val}M Love Coins 💰`,
                value: val,
                desc: `Pure bank money card ($${val}M). Used to pay rents & debts.`
            });
        }
    });

    // Shuffle deck (Fisher-Yates)
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    return deck;
}

// 6. Initialize Initial Game State
function createInitialGameState(roomId, targetSets = 3) {
    const deck = createMonopolyDealDeck();
    // Deal 5 cards to each player at start
    const p1Hand = deck.splice(0, 5);
    const p2Hand = deck.splice(0, 5);

    return {
        id: roomId,
        deck: deck,
        discard_pile: [],
        player1_id: 'Sanyam',
        player2_id: 'Himi',
        player1_hand: p1Hand,
        player2_hand: p2Hand,
        player1_bank: [],
        player2_bank: [],
        player1_properties: {}, // colorKey -> [ card, ... ]
        player2_properties: {},
        current_turn: 'player1',
        plays_remaining: 3,
        turn_phase: 'play', // 'play' | 'discard' | 'waiting_defense' | 'waiting_payment'
        pending_action: null,
        last_move: null,
        winner: null,
        target_sets: targetSets,
        reactions: [],
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
}

// 7. App Initialization & Lifecycle
document.addEventListener('DOMContentLoaded', async () => {
    // Sound icon state
    const icon = document.getElementById('sound-icon');
    if (icon) icon.textContent = isSoundEnabled ? '🔊' : '🔇';

    updateRoleSelectionUI();

    // Check URL parameters for direct room join (e.g. monopoly.html?room=HIMI&role=player2)
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room');
    const roleParam = urlParams.get('role');

    if (roleParam === 'player1' || roleParam === 'player2') {
        myRole = roleParam;
        localStorage.setItem('monopoly_player_role', roleParam);
        updateRoleSelectionUI();
    }

    if (roomParam) {
        const cleanRoom = roomParam.trim().toUpperCase();
        const input = document.getElementById('room-code-input');
        if (input) input.value = cleanRoom;

        const sessionKey = 'monopoly_joined_session_' + cleanRoom;
        if (sessionStorage.getItem(sessionKey) === 'true') {
            joinPresetRoom(cleanRoom);
        } else {
            showInviteJoinModal(cleanRoom);
        }
    } else {
        checkSupabaseConnectivity();
    }
});

// Check Supabase connectivity
async function checkSupabaseConnectivity() {
    const pill = document.getElementById('connection-pill');
    const dot = document.getElementById('connection-dot');
    const text = document.getElementById('connection-text');
    try {
        const client = await getSupabaseClient();
        if (client) {
            if (dot) dot.className = 'w-2 h-2 rounded-full bg-emerald-400 animate-pulse';
            if (text) text.textContent = 'Cloud Ready 🌐';
        } else {
            if (dot) dot.className = 'w-2 h-2 rounded-full bg-amber-400';
            if (text) text.textContent = 'Local / P2P Mode';
        }
    } catch (e) {
        if (dot) dot.className = 'w-2 h-2 rounded-full bg-amber-400';
        if (text) text.textContent = 'Local Mode';
    }
}

// Role and Rule Options
function selectRole(role) {
    myRole = role;
    localStorage.setItem('monopoly_player_role', role);
    updateRoleSelectionUI();
    playCardSound();
}

function updateRoleSelectionUI() {
    // Lobby buttons
    const p1Btn = document.getElementById('role-btn-p1');
    const p2Btn = document.getElementById('role-btn-p2');
    if (p1Btn && p2Btn) {
        if (myRole === 'player1') {
            p1Btn.className = 'role-btn active flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border-2 border-customAccent bg-customAccent text-customBg font-extrabold text-sm shadow-[2px_2px_0px_0px_#243B8F]';
            p2Btn.className = 'role-btn flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border-2 border-customAccent bg-white text-customAccent font-extrabold text-sm hover:bg-pink-50';
        } else {
            p2Btn.className = 'role-btn active flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border-2 border-player2Color bg-player2Color text-white font-extrabold text-sm shadow-[2px_2px_0px_0px_#E25B7B]';
            p1Btn.className = 'role-btn flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border-2 border-customAccent bg-white text-customAccent font-extrabold text-sm hover:bg-blue-50';
        }
    }

    // Invite Modal buttons
    const ip1Btn = document.getElementById('invite-role-btn-p1');
    const ip2Btn = document.getElementById('invite-role-btn-p2');
    if (ip1Btn && ip2Btn) {
        if (myRole === 'player1') {
            ip1Btn.className = 'role-btn active flex items-center justify-center gap-2 py-3 px-3 rounded-xl border-2 border-customAccent bg-customAccent text-customBg font-extrabold text-sm shadow-[2px_2px_0px_0px_#243B8F]';
            ip2Btn.className = 'role-btn flex items-center justify-center gap-2 py-3 px-3 rounded-xl border-2 border-customAccent bg-white text-customAccent font-extrabold text-sm hover:bg-pink-50';
        } else {
            ip2Btn.className = 'role-btn active flex items-center justify-center gap-2 py-3 px-3 rounded-xl border-2 border-player2Color bg-player2Color text-white font-extrabold text-sm shadow-[2px_2px_0px_0px_#E25B7B]';
            ip1Btn.className = 'role-btn flex items-center justify-center gap-2 py-3 px-3 rounded-xl border-2 border-customAccent bg-white text-customAccent font-extrabold text-sm hover:bg-blue-50';
        }
    }

    const inviteLabel = document.getElementById('invite-player-name-label');
    if (inviteLabel) {
        inviteLabel.textContent = myRole === 'player1' ? 'Sanyam 🔵' : 'Himi 🌸';
    }

    const switchTarget = document.getElementById('switch-role-target-name');
    if (switchTarget) {
        switchTarget.textContent = myRole === 'player1' ? 'Himi 🌸' : 'Sanyam 🔵';
    }
}

function setTargetSets(num) {
    targetSetsRule = num;
    const t3 = document.getElementById('target-btn-3');
    const t2 = document.getElementById('target-btn-2');
    if (t3 && t2) {
        if (num === 3) {
            t3.className = 'target-btn active py-2 px-3 rounded-xl border-2 border-customAccent bg-customAccent text-customBg font-extrabold text-xs shadow-[2px_2px_0px_0px_#243B8F]';
            t2.className = 'target-btn py-2 px-3 rounded-xl border-2 border-customAccent bg-white text-customAccent font-extrabold text-xs hover:bg-amber-100';
        } else {
            t2.className = 'target-btn active py-2 px-3 rounded-xl border-2 border-customAccent bg-customAccent text-customBg font-extrabold text-xs shadow-[2px_2px_0px_0px_#243B8F]';
            t3.className = 'target-btn py-2 px-3 rounded-xl border-2 border-customAccent bg-white text-customAccent font-extrabold text-xs hover:bg-amber-100';
        }
    }
    playCardSound();
}

// In-Game Role Switcher
function togglePlayerRole() {
    myRole = (myRole === 'player1') ? 'player2' : 'player1';
    localStorage.setItem('monopoly_player_role', myRole);
    updateRoleSelectionUI();
    if (localGameState) {
        renderActiveGame();
    }
    playCardSound();
    showActionPrompt(`Switched player! You are now playing as ${myRole === 'player1' ? 'Sanyam 🔵' : 'Himi 🌸'}.`);
}

// Invite Modal helpers
function showInviteJoinModal(roomId) {
    pendingInviteRoom = roomId;
    const modal = document.getElementById('invite-join-modal');
    const roomDisp = document.getElementById('invite-room-code-display');
    if (roomDisp) roomDisp.textContent = roomId;
    updateRoleSelectionUI();
    if (modal) modal.classList.remove('hidden');
    checkSupabaseConnectivity();
}

function confirmInviteJoin() {
    if (!pendingInviteRoom) return;
    const room = pendingInviteRoom;
    sessionStorage.setItem('monopoly_joined_session_' + room, 'true');
    const modal = document.getElementById('invite-join-modal');
    if (modal) modal.classList.add('hidden');
    joinPresetRoom(room);
}

function dismissInviteModal() {
    const modal = document.getElementById('invite-join-modal');
    if (modal) modal.classList.add('hidden');
    checkSupabaseConnectivity();
}

// Start Game Modes
function joinPresetRoom(roomId) {
    activeRoomId = roomId.toUpperCase();
    sessionStorage.setItem('monopoly_joined_session_' + activeRoomId, 'true');
    gameMode = 'online';
    startRoomSession(activeRoomId);
}

function joinCustomRoom() {
    const input = document.getElementById('room-code-input');
    const code = (input ? input.value.trim() : '') || 'HIMI';
    joinPresetRoom(code);
}

function startSinglePlayerAI() {
    activeRoomId = 'AI-' + Date.now().toString().slice(-4);
    gameMode = 'ai';
    localGameState = createInitialGameState(activeRoomId, targetSetsRule);
    myRole = 'player1';
    // Start first turn with auto-draw
    handleTurnStartDraw(localGameState);
    renderActiveGame();
}

function startPassAndPlay() {
    activeRoomId = 'LOCAL-' + Date.now().toString().slice(-4);
    gameMode = 'pass_and_play';
    localGameState = createInitialGameState(activeRoomId, targetSetsRule);
    handleTurnStartDraw(localGameState);
    renderActiveGame();
}

// Start Room Session (Online Cross-Device)
async function startRoomSession(roomId) {
    showConnectingState();

    let state = null;
    const client = await getSupabaseClient();

    if (client) {
        try {
            const { data, error } = await client
                .from('monopoly_games')
                .select('*')
                .eq('id', roomId)
                .single();

            if (!error && data && data.deck) {
                state = data;
            }
        } catch (e) {
            console.warn('Fetch monopoly game error:', e);
        }
    }

    if (!state) {
        state = createInitialGameState(roomId, targetSetsRule);
        handleTurnStartDraw(state);
        if (client) {
            try {
                await client.from('monopoly_games').upsert(state);
            } catch (err) {
                console.warn('Upsert initial monopoly game error:', err);
            }
        }
    }

    localGameState = state;
    setupRoomRealtime(roomId, client);

    try {
        const newUrl = window.location.pathname + '?room=' + encodeURIComponent(roomId);
        window.history.replaceState({ room: roomId }, '', newUrl);
    } catch (e) {}

    renderActiveGame();
}

function showConnectingState() {
    const dot = document.getElementById('connection-dot');
    const text = document.getElementById('connection-text');
    if (dot) dot.className = 'w-2 h-2 rounded-full bg-amber-400 animate-ping';
    if (text) text.textContent = 'Joining Room...';
}

// Realtime Channel
function setupRoomRealtime(roomId, client) {
    if (!client) return;

    if (realtimeChannel) {
        try { client.removeChannel(realtimeChannel); } catch (e) {}
    }

    try {
        realtimeChannel = client.channel(`monopoly-room-${roomId}`, {
            config: { broadcast: { ack: false } }
        });

        realtimeChannel.on('broadcast', { event: 'game_update' }, (payload) => {
            if (payload && payload.payload) {
                handleRemoteGameUpdate(payload.payload);
            }
        });

        realtimeChannel.on('broadcast', { event: 'reaction' }, (payload) => {
            if (payload && payload.payload && payload.payload.emoji) {
                showFloatingReaction(payload.payload.emoji, false);
            }
        });

        realtimeChannel.on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'monopoly_games',
            filter: `id=eq.${roomId}`
        }, (payload) => {
            if (payload && payload.new && payload.new.deck) {
                handleRemoteGameUpdate(payload.new);
            }
        });

        realtimeChannel.subscribe((status) => {
            const dot = document.getElementById('connection-dot');
            const text = document.getElementById('connection-text');
            if (status === 'SUBSCRIBED') {
                if (dot) dot.className = 'w-2 h-2 rounded-full bg-emerald-400 animate-pulse';
                if (text) text.textContent = 'Live Synced 🟢';
            }
        });
    } catch (err) {
        console.warn('Realtime channel error:', err);
    }
}

// Handle Remote Updates
function handleRemoteGameUpdate(newState) {
    if (!newState || !newState.deck) return;

    if (newState.last_move && (!localGameState || JSON.stringify(localGameState.last_move) !== JSON.stringify(newState.last_move))) {
        const move = newState.last_move;
        if (move.type === 'bank') playCashDing();
        else if (move.type === 'steal') playStealSound();
        else if (move.type === 'just_say_no') playJustSayNoSound();
        else playCardSound();
    }

    localGameState = newState;
    renderActiveGame();

    if (newState.winner) {
        showVictoryModal(newState.winner);
    }
}

// 8. Turn Start Auto-Draw (2 cards, or 5 if empty hand)
function handleTurnStartDraw(state) {
    if (!state) return;
    const currentHand = state.current_turn === 'player1' ? state.player1_hand : state.player2_hand;
    const cardsToDraw = currentHand.length === 0 ? 5 : 2;

    for (let i = 0; i < cardsToDraw; i++) {
        if (state.deck.length === 0) {
            // Reshuffle discard pile if deck empty
            if (state.discard_pile.length > 0) {
                state.deck = [...state.discard_pile];
                state.discard_pile = [];
                for (let k = state.deck.length - 1; k > 0; k--) {
                    const j = Math.floor(Math.random() * (k + 1));
                    [state.deck[k], state.deck[j]] = [state.deck[j], state.deck[k]];
                }
            } else {
                break;
            }
        }
        const card = state.deck.pop();
        if (card) currentHand.push(card);
    }

    state.plays_remaining = 3;
    state.turn_phase = 'play';
    doubleRentActiveOnTurn = false;
}

// 9. Turn helpers
function isCurrentPlayerTurn() {
    if (!localGameState) return false;
    if (gameMode === 'pass_and_play') return true;
    return localGameState.current_turn === myRole;
}

function getCurrentPlayerHand() {
    if (!localGameState) return [];
    if (gameMode === 'pass_and_play') {
        return localGameState.current_turn === 'player1' ? localGameState.player1_hand : localGameState.player2_hand;
    }
    return myRole === 'player1' ? localGameState.player1_hand : localGameState.player2_hand;
}

function getOpponentPlayerHand() {
    if (!localGameState) return [];
    if (gameMode === 'pass_and_play') {
        return localGameState.current_turn === 'player1' ? localGameState.player2_hand : localGameState.player1_hand;
    }
    return myRole === 'player1' ? localGameState.player2_hand : localGameState.player1_hand;
}

function getCurrentPlayerProperties() {
    if (!localGameState) return {};
    const role = (gameMode === 'pass_and_play') ? localGameState.current_turn : myRole;
    return role === 'player1' ? localGameState.player1_properties : localGameState.player2_properties;
}

function getOpponentProperties() {
    if (!localGameState) return {};
    const role = (gameMode === 'pass_and_play') ? localGameState.current_turn : myRole;
    return role === 'player1' ? localGameState.player2_properties : localGameState.player1_properties;
}

function getCurrentPlayerBank() {
    if (!localGameState) return [];
    const role = (gameMode === 'pass_and_play') ? localGameState.current_turn : myRole;
    return role === 'player1' ? localGameState.player1_bank : localGameState.player2_bank;
}

function getOpponentBank() {
    if (!localGameState) return [];
    const role = (gameMode === 'pass_and_play') ? localGameState.current_turn : myRole;
    return role === 'player1' ? localGameState.player2_bank : localGameState.player1_bank;
}

// Count Completed Sets for Player
function getCompletedSets(propertiesObj) {
    if (!propertiesObj) return [];
    const completed = [];
    Object.keys(propertiesObj).forEach(colorKey => {
        const cards = propertiesObj[colorKey] || [];
        const config = PROPERTY_SETS_CONFIG[colorKey];
        if (config && cards.length >= config.size) {
            completed.push({
                color: colorKey,
                name: config.name,
                emoji: config.emoji,
                cards: cards
            });
        }
    });
    return completed;
}

// Check Victory
function checkVictoryCondition(state) {
    const target = state.target_sets || 3;
    const p1Completed = getCompletedSets(state.player1_properties);
    const p2Completed = getCompletedSets(state.player2_properties);

    if (p1Completed.length >= target) {
        state.winner = 'player1';
        state.status = 'finished';
        return 'player1';
    } else if (p2Completed.length >= target) {
        state.winner = 'player2';
        state.status = 'finished';
        return 'player2';
    }
    return null;
}

// 10. Play Actions From Hand
function onCardHandClick(index) {
    if (!isCurrentPlayerTurn()) {
        showActionPrompt("⏳ Wait for opponent's turn!");
        return;
    }
    if (localGameState.pending_action) {
        showActionPrompt("⏳ Please resolve the pending action card first!");
        return;
    }
    if (localGameState.plays_remaining <= 0) {
        showActionPrompt("⚠️ No plays remaining! Tap 'End Turn'.");
        return;
    }

    selectedCardIndex = index;
    const hand = getCurrentPlayerHand();
    const card = hand[index];
    if (!card) return;

    openCardPlayModal(card, index);
}

function openCardPlayModal(card, index) {
    const modal = document.getElementById('card-play-modal');
    const preview = document.getElementById('play-modal-card-preview');
    const title = document.getElementById('play-modal-card-title');
    const desc = document.getElementById('play-modal-card-desc');
    const rentDetails = document.getElementById('play-modal-rent-details');
    const options = document.getElementById('play-modal-options');
    const cancelBtn = document.getElementById('play-modal-cancel-btn');

    if (!modal) return;

    if (title) title.textContent = card.name;
    if (desc) desc.textContent = card.desc || '';
    if (cancelBtn) cancelBtn.textContent = (index !== null && index !== undefined) ? 'Cancel' : 'Close';

    if (preview) {
        preview.innerHTML = renderCardMiniHTML(card, true);
    }

    if (rentDetails) {
        rentDetails.innerHTML = '';
        if (card.type === 'property' || card.type === 'wildcard') {
            const colorKey = card.currentColor || card.color || (card.colors ? card.colors[0] : null);
            if (colorKey && PROPERTY_SETS_CONFIG[colorKey]) {
                const conf = PROPERTY_SETS_CONFIG[colorKey];
                const myProps = getCurrentPlayerProperties();
                const owned = (myProps[colorKey] || []);
                const currentCount = owned.length;
                const nextCount = Math.min(currentCount + 1, conf.size);
                const currentRent = currentCount > 0 ? (conf.rents[currentCount - 1] || 0) : 0;
                const nextRent = conf.rents[nextCount - 1] || 0;

                rentDetails.innerHTML = `
                    <div class="bg-amber-100/80 border border-amber-300 rounded-2xl p-3 my-2 text-left space-y-2">
                        <div class="flex items-center justify-between text-xs font-black text-customAccent pb-1 border-b border-amber-200">
                            <span>🏷️ Rent Table: ${conf.emoji} ${conf.name}</span>
                            <span class="text-[10px] text-amber-900 font-bold">${conf.size} cards to complete</span>
                        </div>
                        <div class="grid grid-cols-${conf.rents.length} gap-1.5 text-center">
                            ${conf.rents.map((r, i) => {
                                const isFull = i === conf.rents.length - 1;
                                const isNext = (i + 1) === nextCount && (index !== null && index !== undefined);
                                const isCurrent = (i + 1) === currentCount;
                                return `
                                    <div class="p-1.5 rounded-lg border text-[10px] ${isNext ? 'bg-emerald-100 border-emerald-500 font-black text-emerald-950 shadow-xs' : (isCurrent ? 'bg-amber-200 border-amber-400 font-bold' : 'bg-white border-slate-200 text-slate-700 font-semibold')}">
                                        <div class="text-[8px] uppercase font-bold opacity-75">${i + 1} ${isFull ? 'Full Set' : 'Prop'}</div>
                                        <div class="text-xs font-black text-emerald-800">$${r}M</div>
                                        ${isNext ? '<div class="text-[7.5px] text-emerald-700 font-bold">Laying this!</div>' : (isCurrent ? '<div class="text-[7.5px] text-amber-800 font-bold">Current</div>' : '')}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                        <div class="text-[10px] text-customAccent font-bold bg-white/90 rounded-lg p-2 border border-amber-200/60 leading-snug">
                            ${(index === null || index === undefined)
                                ? `ℹ️ You currently own <strong>${currentCount}/${conf.size}</strong> in this set (Current Rent: <strong>$${currentRent}M</strong>)`
                                : (currentCount === 0 
                                    ? `💡 Laying this starts your <strong>${conf.name}</strong> set! (Yields <strong>$${conf.rents[0]}M</strong> rent with Rent cards)` 
                                    : (nextCount === conf.size 
                                        ? `⭐ Laying this COMPLETES your full set! (Rent jumps from <strong>$${currentRent}M</strong> ➔ <strong>$${nextRent}M</strong>!)` 
                                        : `📈 You own ${currentCount}/${conf.size} placed. (Rent increases from <strong>$${currentRent}M</strong> ➔ <strong>$${nextRent}M</strong>!)`))}
                        </div>
                    </div>
                `;
            }
        } else if (card.type === 'rent') {
            const myProps = getCurrentPlayerProperties();
            const colorsToCheck = card.isWildRent 
                ? Object.keys(myProps).filter(k => myProps[k] && myProps[k].length > 0)
                : (card.colors || []);

            if (colorsToCheck.length > 0) {
                const list = colorsToCheck.map(cKey => {
                    const cConf = PROPERTY_SETS_CONFIG[cKey];
                    if (!cConf) return '';
                    const cCards = myProps[cKey] || [];
                    const cRent = cCards.length > 0 ? (cConf.rents[Math.min(cCards.length - 1, cConf.rents.length - 1)] || 0) : 0;
                    return `
                        <div class="flex items-center justify-between text-xs p-1.5 rounded-lg ${cCards.length > 0 ? 'bg-emerald-50 border border-emerald-300 font-bold' : 'bg-slate-50 border border-slate-200 opacity-60'}">
                            <span>${cConf.emoji} ${cConf.name} (${cCards.length}/${cConf.size} owned)</span>
                            <span class="font-black ${cCards.length > 0 ? 'text-emerald-800' : 'text-slate-500'}">${cCards.length > 0 ? `Demands $${cRent}M` : 'No cards placed'}</span>
                        </div>
                    `;
                }).join('');

                rentDetails.innerHTML = `
                    <div class="bg-amber-100/80 border border-amber-300 rounded-2xl p-3 my-2 text-left space-y-1.5">
                        <div class="text-xs font-black text-customAccent pb-1 border-b border-amber-200">
                            🏷️ Rent Demands Available On Your Table:
                        </div>
                        ${list}
                    </div>
                `;
            }
        }
    }

    if (options) {
        options.innerHTML = '';

        if (index !== null && index !== undefined) {
            // Option 1: Bank as Money (Available for Money & Action cards)
            if (card.value > 0) {
                const bankBtn = document.createElement('button');
                bankBtn.className = 'w-full bg-emerald-600 text-white py-2.5 px-4 rounded-xl font-black text-xs hover:bg-emerald-700 shadow transition-all flex items-center justify-center gap-1.5';
                bankBtn.innerHTML = `<span>💰 Deposit in Bank ($${card.value}M)</span>`;
                bankBtn.onclick = () => executeCardAction('bank', index);
                options.appendChild(bankBtn);
            }

            // Option 2: Play as Property (For Property & Wildcard)
            if (card.type === 'property' || card.type === 'wildcard') {
                const propBtn = document.createElement('button');
                propBtn.className = 'w-full bg-customAccent text-customBg py-2.5 px-4 rounded-xl font-black text-xs hover:scale-102 shadow transition-all flex items-center justify-center gap-1.5';
                propBtn.innerHTML = `<span>🏡 Lay as Date Property</span>`;
                propBtn.onclick = () => executeCardAction('property', index);
                options.appendChild(propBtn);
            }

            // Option 3: Play Action Card
            if (card.type === 'action' || card.type === 'rent') {
                if (card.actionKey === 'just_say_no') {
                    const noticeEl = document.createElement('div');
                    noticeEl.className = 'w-full bg-red-100 text-red-950 p-2.5 rounded-xl font-bold text-xs border border-red-300 text-center';
                    noticeEl.innerHTML = `<span>🛑 Keep in hand to counter opponent attacks! Or deposit as $4M in bank.</span>`;
                    options.appendChild(noticeEl);
                } else {
                    const actBtn = document.createElement('button');
                    actBtn.className = 'w-full bg-amber-500 text-amber-950 py-2.5 px-4 rounded-xl font-black text-xs hover:bg-amber-400 shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer';
                    actBtn.innerHTML = `<span>⚡ Play Action / Rent</span>`;
                    actBtn.onclick = () => executeCardAction('action', index);
                    options.appendChild(actBtn);
                }
            }
        }
    }

    modal.classList.remove('hidden');
}

function inspectCard(card) {
    if (!card) return;
    openCardPlayModal(card, null);
}
window.inspectCard = inspectCard;

function closeCardPlayModal() {
    const modal = document.getElementById('card-play-modal');
    if (modal) modal.classList.add('hidden');
    selectedCardIndex = null;
}

// 11. Execute Play Actions
async function executeCardAction(actionType, cardIndex) {
    closeCardPlayModal();
    if (!localGameState || !isCurrentPlayerTurn()) return;

    const hand = getCurrentPlayerHand();
    const card = hand[cardIndex];
    if (!card) return;

    // A. Bank Card
    if (actionType === 'bank') {
        hand.splice(cardIndex, 1);
        const bank = getCurrentPlayerBank();
        bank.push(card);
        localGameState.plays_remaining--;
        playCashDing();
        showActionPrompt(`💰 Banked ${card.name} ($${card.value}M)!`);
        recordLastMove('bank', card);
        checkVictoryCondition(localGameState);
        await persistAndBroadcastGameState(localGameState);
        renderActiveGame();
        return;
    }

    // B. Lay as Property
    if (actionType === 'property') {
        hand.splice(cardIndex, 1);
        const props = getCurrentPlayerProperties();
        const targetColor = card.currentColor || card.color || (card.colors ? card.colors[0] : 'brown');

        if (!props[targetColor]) props[targetColor] = [];
        props[targetColor].push(card);
        localGameState.plays_remaining--;

        playCardSound();
        const conf = PROPERTY_SETS_CONFIG[targetColor];
        showActionPrompt(`🏡 Laid ${card.name} into ${conf ? conf.name : targetColor}!`);
        recordLastMove('property', card);

        const completed = getCompletedSets(props);
        if (completed.length > 0) {
            playSetCompletedFanfare();
            triggerConfettiMini();
        }

        checkVictoryCondition(localGameState);
        await persistAndBroadcastGameState(localGameState);
        renderActiveGame();

        if (localGameState.winner) {
            showVictoryModal(localGameState.winner);
        }
        return;
    }

    // C. Action & Rent Cards
    if (actionType === 'action') {
        await handleActionCardPlay(card, cardIndex);
    }
}

// 12. Handle Action Cards Logic
async function handleActionCardPlay(card, cardIndex) {
    const hand = getCurrentPlayerHand();

    // Helper to safely remove card from hand by uid
    function removeCardFromHand() {
        const actualIdx = hand.findIndex(c => c.uid === card.uid);
        if (actualIdx !== -1) hand.splice(actualIdx, 1);
        else hand.splice(cardIndex, 1);
    }

    // 1. Pass Go
    if (card.actionKey === 'pass_go') {
        removeCardFromHand();
        localGameState.discard_pile.unshift(card);
        localGameState.plays_remaining--;

        // Draw 2 extra cards (with discard reshuffle if deck is low)
        for (let i = 0; i < 2; i++) {
            if (localGameState.deck.length === 0 && localGameState.discard_pile.length > 0) {
                localGameState.deck = [...localGameState.discard_pile];
                localGameState.discard_pile = [];
                for (let k = localGameState.deck.length - 1; k > 0; k--) {
                    const j = Math.floor(Math.random() * (k + 1));
                    [localGameState.deck[k], localGameState.deck[j]] = [localGameState.deck[j], localGameState.deck[k]];
                }
            }
            if (localGameState.deck.length > 0) {
                hand.push(localGameState.deck.pop());
            }
        }
        playCardSound();
        showActionPrompt("🏃‍♂️ Pass Go! Drew 2 extra cards!");
        recordLastMove('pass_go', card);
        await persistAndBroadcastGameState(localGameState);
        renderActiveGame();
        return;
    }

    // 2. Double The Rent
    if (card.actionKey === 'double_rent') {
        removeCardFromHand();
        localGameState.discard_pile.unshift(card);
        localGameState.plays_remaining--;
        doubleRentActiveOnTurn = true;
        playTone(600, 'triangle', 0.15, 0.2);
        showActionPrompt("✖️2 Double Rent activated! Next Rent card this turn will double!");
        recordLastMove('double_rent', card);
        await persistAndBroadcastGameState(localGameState);
        renderActiveGame();
        return;
    }

    // 3. House & Hotel
    if (card.actionKey === 'house' || card.actionKey === 'hotel') {
        const props = getCurrentPlayerProperties();
        const eligibleColors = [];
        Object.keys(props).forEach(cKey => {
            const conf = PROPERTY_SETS_CONFIG[cKey];
            if (conf && cKey !== 'railroad' && cKey !== 'utility' && props[cKey].length >= conf.size) {
                const hasHouse = props[cKey].some(c => c.actionKey === 'house');
                if (card.actionKey === 'house' && !hasHouse) eligibleColors.push(cKey);
                if (card.actionKey === 'hotel' && hasHouse && !props[cKey].some(c => c.actionKey === 'hotel')) eligibleColors.push(cKey);
            }
        });

        if (eligibleColors.length === 0) {
            showActionPrompt(`⚠️ You need a completed property set (with House for Hotel) to place a ${card.name}!`);
            return;
        }

        openTargetSelectionModal(
            `Place ${card.name}`,
            'Select which completed set to upgrade:',
            eligibleColors.map(cKey => ({
                id: cKey,
                title: `${PROPERTY_SETS_CONFIG[cKey].emoji} ${PROPERTY_SETS_CONFIG[cKey].name}`,
                desc: `Current set size: ${props[cKey].length} cards`
            })),
            async (chosenColor) => {
                removeCardFromHand();
                props[chosenColor].push(card);
                localGameState.plays_remaining--;
                playCashDing();
                showActionPrompt(`🏡 Added ${card.name} to ${PROPERTY_SETS_CONFIG[chosenColor].name}!`);
                recordLastMove('upgrade', card);
                await persistAndBroadcastGameState(localGameState);
                renderActiveGame();
            }
        );
        return;
    }

    // 4. Rent Cards
    if (card.type === 'rent') {
        const props = getCurrentPlayerProperties();
        let rentOptions = [];

        if (card.isWildRent) {
            rentOptions = Object.keys(props).filter(cKey => props[cKey] && props[cKey].length > 0);
        } else {
            rentOptions = (card.colors || []).filter(cKey => props[cKey] && props[cKey].length > 0);
        }

        if (rentOptions.length === 0) {
            showActionPrompt("⚠️ You don't own any matching properties on table to charge rent for!");
            return;
        }

        openTargetSelectionModal(
            "Charge Rent 🏷️",
            "Select which property set to charge rent for:",
            rentOptions.map(cKey => {
                const conf = PROPERTY_SETS_CONFIG[cKey];
                const cardCount = props[cKey].length;
                let rentVal = conf.rents[Math.min(cardCount - 1, conf.rents.length - 1)] || 1;
                // Add house & hotel bonuses
                if (props[cKey].some(c => c.actionKey === 'house')) rentVal += 3;
                if (props[cKey].some(c => c.actionKey === 'hotel')) rentVal += 4;
                if (doubleRentActiveOnTurn) rentVal *= 2;

                return {
                    id: cKey,
                    title: `${conf.emoji} ${conf.name}`,
                    desc: `Rent: $${rentVal}M (${cardCount} cards)${doubleRentActiveOnTurn ? ' [DOUBLED!]' : ''}`
                };
            }),
            async (chosenColor) => {
                const conf = PROPERTY_SETS_CONFIG[chosenColor];
                const cardCount = props[chosenColor].length;
                let rentVal = conf.rents[Math.min(cardCount - 1, conf.rents.length - 1)] || 1;
                if (props[chosenColor].some(c => c.actionKey === 'house')) rentVal += 3;
                if (props[chosenColor].some(c => c.actionKey === 'hotel')) rentVal += 4;
                if (doubleRentActiveOnTurn) {
                    rentVal *= 2;
                    doubleRentActiveOnTurn = false;
                }

                removeCardFromHand();
                localGameState.discard_pile.unshift(card);
                localGameState.plays_remaining--;

                playTone(480, 'sine', 0.2, 0.2);
                showActionPrompt(`🏷️ Demanded $${rentVal}M rent for ${conf.name}!`);
                recordLastMove('rent', { card, amount: rentVal, color: chosenColor });

                await triggerPaymentOrJustSayNo(rentVal, `Rent for ${conf.name} ($${rentVal}M)`);
            }
        );
        return;
    }

    // 5. Debt Collector ($5M)
    if (card.actionKey === 'debt_collector') {
        removeCardFromHand();
        localGameState.discard_pile.unshift(card);
        localGameState.plays_remaining--;
        playStealSound();
        showActionPrompt("💰 Debt Collector played! Demanded $5M from opponent.");
        recordLastMove('debt_collector', card);
        await triggerPaymentOrJustSayNo(5, "Debt Collector demand ($5M)");
        return;
    }

    // 6. Birthday ($2M)
    if (card.actionKey === 'birthday') {
        removeCardFromHand();
        localGameState.discard_pile.unshift(card);
        localGameState.plays_remaining--;
        playCashDing();
        showActionPrompt("🎂 Happy Birthday! Demanded $2M birthday gift.");
        recordLastMove('birthday', card);
        await triggerPaymentOrJustSayNo(2, "Birthday Gift demand ($2M)");
        return;
    }

    // 7. Deal Breaker (Steal Complete Set)
    if (card.actionKey === 'deal_breaker') {
        const oppProps = getOpponentProperties();
        const completedSets = getCompletedSets(oppProps);

        if (completedSets.length === 0) {
            showActionPrompt("⚠️ Opponent has no completed property sets to steal!");
            return;
        }

        openTargetSelectionModal(
            "Deal Breaker! 💔👑",
            "Select which completed set to steal:",
            completedSets.map(s => ({
                id: s.color,
                title: `${s.emoji} ${s.name} (${s.cards.length} cards)`,
                desc: 'Steal the entire completed set!'
            })),
            async (chosenColor) => {
                removeCardFromHand();
                localGameState.discard_pile.unshift(card);
                localGameState.plays_remaining--;

                await triggerStealOrJustSayNo('deal_breaker', chosenColor);
            }
        );
        return;
    }

    // 8. Sly Deal (Steal 1 property not in full set)
    if (card.actionKey === 'sly_deal') {
        const oppProps = getOpponentProperties();
        const stealable = [];

        Object.keys(oppProps).forEach(cKey => {
            const conf = PROPERTY_SETS_CONFIG[cKey];
            if (conf && oppProps[cKey].length < conf.size) {
                oppProps[cKey].forEach((p, idx) => {
                    stealable.push({
                        id: `${cKey}_${idx}`,
                        color: cKey,
                        cardIndex: idx,
                        title: `${p.name}`,
                        desc: `From ${conf.name} ($${p.value}M)`
                    });
                });
            }
        });

        if (stealable.length === 0) {
            showActionPrompt("⚠️ Opponent has no single properties (outside completed sets) to steal!");
            return;
        }

        openTargetSelectionModal(
            "Sly Deal 🕵️‍♂️",
            "Select 1 property to steal:",
            stealable,
            async (chosenId) => {
                const item = stealable.find(s => s.id === chosenId);
                removeCardFromHand();
                localGameState.discard_pile.unshift(card);
                localGameState.plays_remaining--;

                await triggerStealOrJustSayNo('sly_deal', item);
            }
        );
        return;
    }

    // 9. Forced Deal (Swap 1 property not in full set)
    if (card.actionKey === 'forced_deal') {
        const myProps = getCurrentPlayerProperties();
        const oppProps = getOpponentProperties();

        const mySwapList = [];
        Object.keys(myProps).forEach(cKey => {
            const conf = PROPERTY_SETS_CONFIG[cKey];
            if (conf && myProps[cKey].length < conf.size) {
                myProps[cKey].forEach((p, idx) => {
                    mySwapList.push({ id: `${cKey}_${idx}`, color: cKey, cardIndex: idx, title: p.name });
                });
            }
        });

        const oppSwapList = [];
        Object.keys(oppProps).forEach(cKey => {
            const conf = PROPERTY_SETS_CONFIG[cKey];
            if (conf && oppProps[cKey].length < conf.size) {
                oppProps[cKey].forEach((p, idx) => {
                    oppSwapList.push({ id: `${cKey}_${idx}`, color: cKey, cardIndex: idx, title: p.name });
                });
            }
        });

        if (mySwapList.length === 0 || oppSwapList.length === 0) {
            showActionPrompt("⚠️ Both you and opponent must have an incomplete property to swap!");
            return;
        }

        // Pick your card first
        openTargetSelectionModal(
            "Forced Deal: Your Property",
            "Select which of YOUR properties to give away:",
            mySwapList.map(s => ({ id: s.id, title: s.title, desc: 'Your property to trade' })),
            (chosenMyId) => {
                const myItem = mySwapList.find(s => s.id === chosenMyId);

                // Pick opponent's card
                openTargetSelectionModal(
                    "Forced Deal: Opponent Property",
                    "Select which of OPPONENT'S properties to take:",
                    oppSwapList.map(s => ({ id: s.id, title: s.title, desc: "Opponent's property to take" })),
                    async (chosenOppId) => {
                        const oppItem = oppSwapList.find(s => s.id === chosenOppId);

                        removeCardFromHand();
                        localGameState.discard_pile.unshift(card);
                        localGameState.plays_remaining--;

                        await triggerStealOrJustSayNo('forced_deal', { myItem, oppItem });
                    }
                );
            }
        );
        return;
    }

    // 10. Just Say No
    if (card.actionKey === 'just_say_no') {
        showActionPrompt("🛑 'Just Say No' is kept in hand to block opponent attacks, or deposited in your bank as $4M cash!");
        return;
    }
}

// 13. Just Say No & Payment Flow
async function triggerPaymentOrJustSayNo(amount, reason) {
    const toRole = localGameState.current_turn;
    const fromRole = toRole === 'player1' ? 'player2' : 'player1';
    const oppHand = fromRole === 'player1' ? localGameState.player1_hand : localGameState.player2_hand;
    const oppBank = fromRole === 'player1' ? localGameState.player1_bank : localGameState.player2_bank;
    const oppProps = fromRole === 'player1' ? localGameState.player1_properties : localGameState.player2_properties;

    const hasJSN = oppHand.some(c => c.actionKey === 'just_say_no');

    // Case 1: Playing vs AI
    if (gameMode === 'ai' && toRole === 'player1') {
        if (hasJSN && Math.random() < 0.75) {
            const jsnIdx = oppHand.findIndex(c => c.actionKey === 'just_say_no');
            const jsnCard = oppHand.splice(jsnIdx, 1)[0];
            localGameState.discard_pile.unshift(jsnCard);
            playJustSayNoSound();
            showActionPrompt("🛑 AI blocked with 'Just Say No'!");
            recordLastMove('just_say_no', jsnCard);
            await persistAndBroadcastGameState(localGameState);
            renderActiveGame();
            return;
        } else {
            settleAIPayment(amount);
            return;
        }
    }

    // Calculate total assets defender has on board
    let totalAssets = oppBank.reduce((a, c) => a + c.value, 0);
    Object.keys(oppProps).forEach(cKey => {
        totalAssets += (oppProps[cKey] || []).reduce((a, c) => a + c.value, 0);
    });

    // If opponent has no JSN and $0 total assets on board, waive immediately
    if (!hasJSN && totalAssets === 0) {
        const defName = fromRole === 'player1' ? 'Sanyam' : 'Himi';
        showActionPrompt(`💸 ${defName} has no money or properties on table to pay! Debt waived.`);
        await persistAndBroadcastGameState(localGameState);
        renderActiveGame();
        return;
    }

    // Set pending action
    localGameState.pending_action = {
        type: 'payment',
        amount: amount,
        reason: reason,
        fromPlayer: fromRole,
        toPlayer: toRole
    };

    await persistAndBroadcastGameState(localGameState);
    renderActiveGame();
}

async function triggerStealOrJustSayNo(stealType, targetData) {
    const toRole = localGameState.current_turn;
    const fromRole = toRole === 'player1' ? 'player2' : 'player1';
    const oppHand = fromRole === 'player1' ? localGameState.player1_hand : localGameState.player2_hand;
    const hasJSN = oppHand.some(c => c.actionKey === 'just_say_no');

    // Case 1: Playing vs AI
    if (gameMode === 'ai' && toRole === 'player1') {
        if (hasJSN && Math.random() < 0.8) {
            const jsnIdx = oppHand.findIndex(c => c.actionKey === 'just_say_no');
            const jsnCard = oppHand.splice(jsnIdx, 1)[0];
            localGameState.discard_pile.unshift(jsnCard);
            playJustSayNoSound();
            showActionPrompt("🛑 AI blocked with 'Just Say No'!");
            recordLastMove('just_say_no', jsnCard);
            await persistAndBroadcastGameState(localGameState);
            renderActiveGame();
            return;
        } else {
            executeStealTransfer(stealType, targetData, 'player1', 'player2');
            return;
        }
    }

    // Case 2: Human Opponent (Pass & Play or Online)
    // If opponent has NO Just Say No, execute steal immediately!
    if (!hasJSN) {
        executeStealTransfer(stealType, targetData, toRole, fromRole);
        return;
    }

    // Opponent HAS Just Say No in hand -> prompt them to block or accept
    localGameState.pending_action = {
        type: 'steal',
        stealType: stealType,
        targetData: targetData,
        fromPlayer: fromRole,
        toPlayer: toRole
    };

    await persistAndBroadcastGameState(localGameState);
    renderActiveGame();
}

function executeStealTransfer(stealType, targetData, toRole, fromRole) {
    const toProps = toRole === 'player1' ? localGameState.player1_properties : localGameState.player2_properties;
    const fromProps = fromRole === 'player1' ? localGameState.player1_properties : localGameState.player2_properties;

    if (stealType === 'deal_breaker') {
        const color = targetData;
        const stolenSet = fromProps[color] || [];
        delete fromProps[color];
        if (!toProps[color]) toProps[color] = [];
        toProps[color].push(...stolenSet);

        playStealSound();
        const conf = PROPERTY_SETS_CONFIG[color];
        showActionPrompt(`👑 Deal Breaker! Stole the ${conf ? conf.name : color} set!`);
    } else if (stealType === 'sly_deal') {
        const { color, cardIndex, cardUid } = targetData;
        let stolenCard = null;
        if (cardUid && fromProps[color]) {
            const idx = fromProps[color].findIndex(c => c.uid === cardUid);
            if (idx !== -1) stolenCard = fromProps[color].splice(idx, 1)[0];
        }
        if (!stolenCard && fromProps[color] && fromProps[color][cardIndex]) {
            stolenCard = fromProps[color].splice(cardIndex, 1)[0];
        }
        if (stolenCard) {
            if (fromProps[color].length === 0) delete fromProps[color];
            const dest = stolenCard.currentColor || stolenCard.color || color;
            if (!toProps[dest]) toProps[dest] = [];
            toProps[dest].push(stolenCard);
            playStealSound();
            showActionPrompt(`🕵️‍♂️ Sly Deal! Stole ${stolenCard.name}!`);
        }
    } else if (stealType === 'forced_deal') {
        const { myItem, oppItem } = targetData;
        let giveCard = null;
        if (myItem.cardUid && toProps[myItem.color]) {
            const idx = toProps[myItem.color].findIndex(c => c.uid === myItem.cardUid);
            if (idx !== -1) giveCard = toProps[myItem.color].splice(idx, 1)[0];
        }
        if (!giveCard && toProps[myItem.color] && toProps[myItem.color][myItem.cardIndex]) {
            giveCard = toProps[myItem.color].splice(myItem.cardIndex, 1)[0];
        }

        let takeCard = null;
        if (oppItem.cardUid && fromProps[oppItem.color]) {
            const idx = fromProps[oppItem.color].findIndex(c => c.uid === oppItem.cardUid);
            if (idx !== -1) takeCard = fromProps[oppItem.color].splice(idx, 1)[0];
        }
        if (!takeCard && fromProps[oppItem.color] && fromProps[oppItem.color][oppItem.cardIndex]) {
            takeCard = fromProps[oppItem.color].splice(oppItem.cardIndex, 1)[0];
        }

        if (giveCard && takeCard) {
            if (toProps[myItem.color] && toProps[myItem.color].length === 0) delete toProps[myItem.color];
            if (fromProps[oppItem.color] && fromProps[oppItem.color].length === 0) delete fromProps[oppItem.color];

            const takeDest = takeCard.currentColor || takeCard.color || oppItem.color;
            if (!toProps[takeDest]) toProps[takeDest] = [];
            toProps[takeDest].push(takeCard);

            const giveDest = giveCard.currentColor || giveCard.color || myItem.color;
            if (!fromProps[giveDest]) fromProps[giveDest] = [];
            fromProps[giveDest].push(giveCard);

            playCardSound();
            showActionPrompt(`🔄 Forced Deal! Swapped ${giveCard.name} for ${takeCard.name}!`);
        }
    }

    localGameState.pending_action = null;
    checkVictoryCondition(localGameState);
    persistAndBroadcastGameState(localGameState);
    renderActiveGame();

    if (localGameState.winner) {
        showVictoryModal(localGameState.winner);
    }
}

// Respond to Just Say No Prompt
async function respondWithJustSayNo(useJSN) {
    const modal = document.getElementById('just-say-no-modal');
    if (modal) modal.classList.add('hidden');

    if (!localGameState || !localGameState.pending_action) return;
    const pending = localGameState.pending_action;
    const fromRole = pending.fromPlayer;
    const toRole = pending.toPlayer;
    const defHand = fromRole === 'player1' ? localGameState.player1_hand : localGameState.player2_hand;

    if (useJSN) {
        const jsnIdx = defHand.findIndex(c => c.actionKey === 'just_say_no');
        if (jsnIdx !== -1) {
            const jsn = defHand.splice(jsnIdx, 1)[0];
            localGameState.discard_pile.unshift(jsn);
            playJustSayNoSound();
            const defName = fromRole === 'player1' ? 'Sanyam' : 'Himi';
            showActionPrompt(`🛑 ${defName} played JUST SAY NO! Attack blocked!`);
            recordLastMove('just_say_no', jsn);
            localGameState.pending_action = null;
            await persistAndBroadcastGameState(localGameState);
            renderActiveGame();
            return;
        }
    }

    // Accepted hit
    if (pending.type === 'steal') {
        executeStealTransfer(pending.stealType, pending.targetData, toRole, fromRole);
    } else if (pending.type === 'payment') {
        const fromBank = fromRole === 'player1' ? localGameState.player1_bank : localGameState.player2_bank;
        const fromProps = fromRole === 'player1' ? localGameState.player1_properties : localGameState.player2_properties;
        let totalAssets = fromBank.reduce((a, c) => a + c.value, 0);
        Object.keys(fromProps).forEach(cKey => {
            totalAssets += (fromProps[cKey] || []).reduce((a, c) => a + c.value, 0);
        });

        if (totalAssets === 0) {
            localGameState.pending_action = null;
            const defName = fromRole === 'player1' ? 'Sanyam' : 'Himi';
            showActionPrompt(`💸 ${defName} has no money or properties on table to pay! Debt waived.`);
            await persistAndBroadcastGameState(localGameState);
            renderActiveGame();
            return;
        }

        openPaymentModal(pending.amount, pending.reason);
    }
}

// Payment Modal Handlers
function openPaymentModal(amount, reason) {
    pendingPaymentTargetAmount = amount;
    selectedPaymentCardIds.clear();

    const modal = document.getElementById('payment-modal');
    const debtMsg = document.getElementById('payment-debt-message');
    const targetSum = document.getElementById('payment-target-sum');

    const fromRole = (localGameState && localGameState.pending_action) ? localGameState.pending_action.fromPlayer : ((gameMode === 'pass_and_play') ? (localGameState.current_turn === 'player1' ? 'player2' : 'player1') : myRole);
    const toRole = (localGameState && localGameState.pending_action) ? localGameState.pending_action.toPlayer : (fromRole === 'player1' ? 'player2' : 'player1');
    const fromName = fromRole === 'player1' ? 'Sanyam' : 'Himi';
    const toName = toRole === 'player1' ? 'Sanyam' : 'Himi';
    const prefix = gameMode === 'pass_and_play' ? `${fromName}: ` : '';

    if (debtMsg) debtMsg.textContent = `${prefix}You owe $${amount}M to ${toName} for: ${reason}. Select cards to pay:`;
    if (targetSum) targetSum.textContent = `$${amount}M`;

    renderPaymentSelectionList();
    if (modal) modal.classList.remove('hidden');
}

function renderPaymentSelectionList() {
    const list = document.getElementById('payment-selectable-cards');
    const sumEl = document.getElementById('payment-selected-sum');
    if (!list) return;

    list.innerHTML = '';
    const payingRole = (localGameState && localGameState.pending_action)
        ? localGameState.pending_action.fromPlayer
        : ((gameMode === 'pass_and_play') ? (localGameState.current_turn === 'player1' ? 'player2' : 'player1') : myRole);

    const payerBank = payingRole === 'player1' ? localGameState.player1_bank : localGameState.player2_bank;
    const payerProps = payingRole === 'player1' ? localGameState.player1_properties : localGameState.player2_properties;

    let totalSelected = 0;

    // Bank Cards
    payerBank.forEach(card => {
        const isSelected = selectedPaymentCardIds.has(card.uid);
        if (isSelected) totalSelected += card.value;

        const cardEl = document.createElement('div');
        cardEl.className = `p-2 rounded-lg border-2 text-left cursor-pointer transition-all ${
            isSelected ? 'bg-emerald-100 border-emerald-600 shadow' : 'bg-white border-slate-300 hover:border-slate-400'
        }`;
        cardEl.innerHTML = `
            <div class="text-[10px] font-black text-emerald-800">Bank ($${card.value}M)</div>
            <div class="text-xs font-bold truncate">${card.name}</div>
        `;
        cardEl.onclick = () => {
            if (selectedPaymentCardIds.has(card.uid)) selectedPaymentCardIds.delete(card.uid);
            else selectedPaymentCardIds.add(card.uid);
            renderPaymentSelectionList();
        };
        list.appendChild(cardEl);
    });

    // Property Cards on Table
    Object.keys(payerProps).forEach(cKey => {
        payerProps[cKey].forEach(card => {
            const isSelected = selectedPaymentCardIds.has(card.uid);
            if (isSelected) totalSelected += card.value;

            const cardEl = document.createElement('div');
            cardEl.className = `p-2 rounded-lg border-2 text-left cursor-pointer transition-all ${
                isSelected ? 'bg-emerald-100 border-emerald-600 shadow' : 'bg-white border-slate-300 hover:border-slate-400'
            }`;
            cardEl.innerHTML = `
                <div class="text-[10px] font-black text-amber-900">${PROPERTY_SETS_CONFIG[cKey] ? PROPERTY_SETS_CONFIG[cKey].emoji : '🏡'} Prop ($${card.value}M)</div>
                <div class="text-xs font-bold truncate">${card.name}</div>
            `;
            cardEl.onclick = () => {
                if (selectedPaymentCardIds.has(card.uid)) selectedPaymentCardIds.delete(card.uid);
                else selectedPaymentCardIds.add(card.uid);
                renderPaymentSelectionList();
            };
            list.appendChild(cardEl);
        });
    });

    if (sumEl) sumEl.textContent = `$${totalSelected}M`;

    // Calculate total assets on table/bank
    let totalAssets = payerBank.reduce((a, c) => a + c.value, 0);
    Object.keys(payerProps).forEach(cKey => {
        totalAssets += payerProps[cKey].reduce((a, c) => a + c.value, 0);
    });

    const confirmBtn = document.getElementById('payment-confirm-btn');
    if (confirmBtn) {
        if (totalSelected >= pendingPaymentTargetAmount || (totalSelected === totalAssets && totalAssets > 0)) {
            confirmBtn.disabled = false;
            confirmBtn.className = 'w-full bg-emerald-600 text-white py-3 rounded-2xl font-black text-sm shadow hover:bg-emerald-700 transition-all cursor-pointer';
        } else {
            confirmBtn.disabled = true;
            confirmBtn.className = 'w-full bg-slate-300 text-slate-600 py-3 rounded-2xl font-black text-sm shadow cursor-not-allowed';
        }
    }
}

async function confirmPaymentSubmit() {
    const modal = document.getElementById('payment-modal');
    if (modal) modal.classList.add('hidden');

    if (!localGameState || !localGameState.pending_action) return;
    const pending = localGameState.pending_action;
    const fromRole = pending.fromPlayer;
    const toRole = pending.toPlayer;

    const fromBank = fromRole === 'player1' ? localGameState.player1_bank : localGameState.player2_bank;
    const toBank = toRole === 'player1' ? localGameState.player1_bank : localGameState.player2_bank;
    const fromProps = fromRole === 'player1' ? localGameState.player1_properties : localGameState.player2_properties;
    const toProps = toRole === 'player1' ? localGameState.player1_properties : localGameState.player2_properties;

    // Transfer selected cards
    selectedPaymentCardIds.forEach(uid => {
        // Look in Bank
        const bIdx = fromBank.findIndex(c => c.uid === uid);
        if (bIdx !== -1) {
            const paidCard = fromBank.splice(bIdx, 1)[0];
            toBank.push(paidCard);
            return;
        }
        // Look in Properties
        Object.keys(fromProps).forEach(cKey => {
            const pIdx = fromProps[cKey].findIndex(c => c.uid === uid);
            if (pIdx !== -1) {
                const paidCard = fromProps[cKey].splice(pIdx, 1)[0];
                if (fromProps[cKey].length === 0) delete fromProps[cKey];
                if (paidCard.type === 'action') {
                    toBank.push(paidCard);
                } else {
                    const targetColor = paidCard.currentColor || paidCard.color || cKey;
                    if (!toProps[targetColor]) toProps[targetColor] = [];
                    toProps[targetColor].push(paidCard);
                }
            }
        });
    });

    selectedPaymentCardIds.clear();
    localGameState.pending_action = null;

    playCashDing();
    const recipientName = toRole === 'player1' ? 'Sanyam' : 'Himi';
    showActionPrompt(`💸 Debt paid to ${recipientName}!`);
    checkVictoryCondition(localGameState);
    await persistAndBroadcastGameState(localGameState);
    renderActiveGame();

    if (localGameState.winner) {
        showVictoryModal(localGameState.winner);
    }
}

// AI Payment Settle Helper
function settleAIPayment(amount) {
    const aiBank = localGameState.player2_bank;
    const aiProps = localGameState.player2_properties;
    const toBank = localGameState.player1_bank;
    const toProps = localGameState.player1_properties;

    let paid = 0;
    while (aiBank.length > 0 && paid < amount) {
        const c = aiBank.pop();
        paid += c.value;
        toBank.push(c);
    }
    if (paid < amount) {
        Object.keys(aiProps).forEach(cKey => {
            while (aiProps[cKey] && aiProps[cKey].length > 0 && paid < amount) {
                const c = aiProps[cKey].pop();
                paid += c.value;
                if (aiProps[cKey].length === 0) delete aiProps[cKey];
                const dest = c.currentColor || c.color || cKey;
                if (!toProps[dest]) toProps[dest] = [];
                toProps[dest].push(c);
            }
        });
    }

    localGameState.pending_action = null;
    playCashDing();
    showActionPrompt(`💸 AI settled $${paid}M in debts!`);
    checkVictoryCondition(localGameState);
    persistAndBroadcastGameState(localGameState);
    renderActiveGame();
}

// 14. Wildcard Color Flip
async function flipWildcardColor(colorKey, cardIndex) {
    if (!isCurrentPlayerTurn()) return;
    const props = getCurrentPlayerProperties();
    if (!props[colorKey] || !props[colorKey][cardIndex]) return;

    const card = props[colorKey][cardIndex];
    if (card.type !== 'wildcard') return;

    let availableColors = card.colors || [];
    if (card.isSuperWild) {
        availableColors = Object.keys(PROPERTY_SETS_CONFIG);
    }

    openTargetSelectionModal(
        `Flip Wildcard Color 🔄`,
        'Choose new color set for this wildcard:',
        availableColors.map(cKey => ({
            id: cKey,
            title: `${PROPERTY_SETS_CONFIG[cKey].emoji} ${PROPERTY_SETS_CONFIG[cKey].name}`,
            desc: `Move wildcard to ${PROPERTY_SETS_CONFIG[cKey].name}`
        })),
        async (newColor) => {
            props[colorKey].splice(cardIndex, 1);
            if (props[colorKey].length === 0) delete props[colorKey];

            card.currentColor = newColor;
            if (!props[newColor]) props[newColor] = [];
            props[newColor].push(card);

            playCardSound();
            showActionPrompt(`🔄 Wildcard flipped to ${PROPERTY_SETS_CONFIG[newColor].name}!`);

            checkVictoryCondition(localGameState);
            await persistAndBroadcastGameState(localGameState);
            renderActiveGame();

            if (localGameState.winner) {
                showVictoryModal(localGameState.winner);
            }
        }
    );
}

// 15. End Turn & Discard Down to 7
async function handleEndTurn() {
    if (!isCurrentPlayerTurn()) return;
    if (localGameState.pending_action) {
        showActionPrompt("⏳ Please wait for opponent to resolve pending action before ending turn!");
        return;
    }

    const hand = getCurrentPlayerHand();
    if (hand.length > 7) {
        openDiscardToSevenModal();
        return;
    }

    // Switch turn
    localGameState.current_turn = localGameState.current_turn === 'player1' ? 'player2' : 'player1';
    handleTurnStartDraw(localGameState);
    localGameState.updated_at = new Date().toISOString();

    playCardSound();
    await persistAndBroadcastGameState(localGameState);
    renderActiveGame();

    // Trigger AI if AI mode
    if (gameMode === 'ai' && localGameState.current_turn === 'player2') {
        setTimeout(runAITurn, 1000);
    }
}

function openDiscardToSevenModal() {
    const modal = document.getElementById('discard-to-seven-modal');
    const items = document.getElementById('discard-limit-items');
    const msg = document.getElementById('discard-limit-message');
    if (!modal || !items) return;

    const hand = getCurrentPlayerHand();
    const excess = hand.length - 7;
    if (msg) msg.textContent = `You have ${hand.length} cards. Hand limit is 7. Discard ${excess} card(s):`;

    items.innerHTML = '';
    hand.forEach((card, idx) => {
        const cardEl = document.createElement('div');
        cardEl.className = 'w-18 flex-shrink-0 cursor-pointer transform hover:scale-105';
        cardEl.innerHTML = renderCardMiniHTML(card);
        cardEl.onclick = async () => {
            hand.splice(idx, 1);
            localGameState.discard_pile.unshift(card);
            playCardSound();
            if (hand.length <= 7) {
                modal.classList.add('hidden');
                handleEndTurn();
            } else {
                openDiscardToSevenModal();
            }
        };
        items.appendChild(cardEl);
    });

    modal.classList.remove('hidden');
}

// 16. AI Bot Engine (Smart Heuristic)
async function runAITurn() {
    if (!localGameState || localGameState.winner || localGameState.current_turn !== 'player2') return;

    const aiHand = localGameState.player2_hand;
    const aiProps = localGameState.player2_properties;
    const aiBank = localGameState.player2_bank;

    // AI plays up to 3 cards smartly
    let playsDone = 0;
    while (playsDone < 3 && aiHand.length > 0) {
        // Priority 1: Play Pass Go
        const passGoIdx = aiHand.findIndex(c => c.actionKey === 'pass_go');
        if (passGoIdx !== -1) {
            const card = aiHand.splice(passGoIdx, 1)[0];
            localGameState.discard_pile.unshift(card);
            localGameState.plays_remaining--;
            for (let i = 0; i < 2; i++) {
                if (localGameState.deck.length > 0) aiHand.push(localGameState.deck.pop());
            }
            playsDone++;
            continue;
        }

        // Priority 2: Play Properties & Wildcards
        const propIdx = aiHand.findIndex(c => c.type === 'property' || c.type === 'wildcard');
        if (propIdx !== -1) {
            const card = aiHand.splice(propIdx, 1)[0];
            const targetColor = card.currentColor || card.color || (card.colors ? card.colors[0] : 'brown');
            if (!aiProps[targetColor]) aiProps[targetColor] = [];
            aiProps[targetColor].push(card);
            localGameState.plays_remaining--;
            playsDone++;
            continue;
        }

        // Priority 3: Bank Money Cards
        const moneyIdx = aiHand.findIndex(c => c.type === 'money');
        if (moneyIdx !== -1) {
            const card = aiHand.splice(moneyIdx, 1)[0];
            aiBank.push(card);
            localGameState.plays_remaining--;
            playsDone++;
            continue;
        }

        // Priority 4: Rent card if AI owns matching set
        const rentIdx = aiHand.findIndex(c => c.type === 'rent');
        if (rentIdx !== -1) {
            const card = aiHand[rentIdx];
            const matchColors = card.isWildRent ? Object.keys(aiProps) : (card.colors || []).filter(c => aiProps[c]);
            if (matchColors.length > 0) {
                const color = matchColors[0];
                const conf = PROPERTY_SETS_CONFIG[color];
                let rentVal = conf.rents[Math.min(aiProps[color].length - 1, conf.rents.length - 1)] || 1;
                aiHand.splice(rentIdx, 1);
                localGameState.discard_pile.unshift(card);
                localGameState.plays_remaining--;
                playsDone++;
                await triggerPaymentOrJustSayNo(rentVal, `Rent for ${conf.name}`);
                continue;
            }
        }

        // Priority 5: Bank high-value action card if needed
        const actIdx = aiHand.findIndex(c => c.type === 'action' && c.actionKey !== 'just_say_no');
        if (actIdx !== -1) {
            const card = aiHand.splice(actIdx, 1)[0];
            aiBank.push(card);
            localGameState.plays_remaining--;
            playsDone++;
            continue;
        }

        break;
    }

    // Check Victory
    checkVictoryCondition(localGameState);

    // End AI turn
    if (!localGameState.winner) {
        if (aiHand.length > 7) {
            aiHand.splice(7); // discard down
        }
        localGameState.current_turn = 'player1';
        handleTurnStartDraw(localGameState);
    }

    await persistAndBroadcastGameState(localGameState);
    renderActiveGame();
}

// 17. Target Selection Modal
let currentTargetCallback = null;
function openTargetSelectionModal(title, subtitle, items, onSelectCallback) {
    const modal = document.getElementById('target-selection-modal');
    const titleEl = document.getElementById('target-modal-title');
    const subEl = document.getElementById('target-modal-subtitle');
    const container = document.getElementById('target-modal-items');

    if (titleEl) titleEl.textContent = title;
    if (subEl) subEl.textContent = subtitle;
    currentTargetCallback = onSelectCallback;

    if (container) {
        container.innerHTML = '';
        items.forEach(item => {
            const btn = document.createElement('button');
            btn.className = 'p-3 bg-amber-50 hover:bg-amber-100 border-2 border-customAccent rounded-xl text-left shadow-sm transition-all';
            btn.innerHTML = `
                <div class="font-extrabold text-xs text-customAccent">${item.title}</div>
                <div class="text-[10px] font-bold opacity-80">${item.desc || ''}</div>
            `;
            btn.onclick = () => {
                const cb = currentTargetCallback;
                closeTargetSelectionModal();
                if (cb) cb(item.id);
            };
            container.appendChild(btn);
        });
    }

    if (modal) modal.classList.remove('hidden');
}

function closeTargetSelectionModal() {
    const modal = document.getElementById('target-selection-modal');
    if (modal) modal.classList.add('hidden');
    currentTargetCallback = null;
}

// 18. Card Mini HTML Renderer
function renderCardMiniHTML(card, isBig = false) {
    const isMoney = card.type === 'money';
    const isProp = card.type === 'property';
    const isWild = card.type === 'wildcard';
    const isAct = card.type === 'action';
    const isRent = card.type === 'rent';

    let headerBg = '#243B8F';
    let headerText = 'ACTION';
    let icon = '⚡';

    if (isMoney) {
        headerBg = '#10B981';
        headerText = `$${card.value}M MONEY`;
        icon = '💰';
    } else if (isProp || isWild) {
        const colorKey = card.currentColor || card.color || (card.colors ? card.colors[0] : 'brown');
        const conf = PROPERTY_SETS_CONFIG[colorKey] || {};
        headerBg = conf.color || '#243B8F';
        headerText = conf.name || 'PROPERTY';
        icon = conf.emoji || '🏡';
    } else if (isRent) {
        headerBg = '#f59e0b';
        headerText = 'RENT';
        icon = '🏷️';
    }

    if (isBig) {
        // --- BIG PREVIEW CARD (Authentic Monopoly Deal Trading Card with Full Rent Table) ---
        let centerHTML = '';

        if (isProp) {
            const colorKey = card.color;
            const conf = PROPERTY_SETS_CONFIG[colorKey] || {};
            const rents = conf.rents || [1];
            const rentTableRows = rents.map((r, i) => {
                const isFull = i === rents.length - 1;
                const countText = (i + 1) === 1 ? '1 Property' : (isFull ? `Full Set (${i + 1})` : `${i + 1} Properties`);
                return `
                    <div class="flex items-center justify-between px-2 py-0.5 rounded text-[10px] sm:text-[11px] ${isFull ? 'bg-amber-100 font-black text-amber-950' : 'text-slate-700 font-bold'}">
                        <span>${countText}</span>
                        <span class="font-black text-emerald-800">$${r}M</span>
                    </div>
                `;
            }).join('');

            centerHTML = `
                <div class="text-center my-auto py-1">
                    <div class="font-black text-customAccent text-sm sm:text-base leading-snug mb-0.5">${card.name}</div>
                    <div class="text-[10px] font-bold text-customAccent/70 mb-2">${conf.emoji || '🏡'} ${conf.name || ''} (${conf.size || rents.length} to complete)</div>
                    <div class="bg-amber-50/90 border border-customAccent/20 rounded-xl p-2 text-left shadow-2xs">
                        <div class="text-[9px] font-black uppercase tracking-wider text-customAccent/80 text-center pb-1 border-b border-customAccent/15 mb-1 flex items-center justify-center gap-1">
                            <span>🏷️</span> <span>RENT VALUE</span>
                        </div>
                        <div class="space-y-0.5">
                            ${rentTableRows}
                        </div>
                        <div class="text-[8px] text-slate-400 text-center mt-1 pt-0.5 border-t border-slate-200/60 font-semibold">
                            House adds +$3M • Hotel adds +$4M
                        </div>
                    </div>
                </div>
            `;
        } else if (isWild) {
            const colorKey = card.currentColor || card.color || (card.colors ? card.colors[0] : 'brown');
            const conf = PROPERTY_SETS_CONFIG[colorKey] || {};
            centerHTML = `
                <div class="text-center my-auto py-1">
                    <div class="font-black text-customAccent text-sm sm:text-base leading-snug mb-0.5">${card.name}</div>
                    <div class="text-[10px] font-bold text-customAccent/70 mb-2">${card.desc || ''}</div>
                    <div class="bg-amber-50/90 border border-customAccent/20 rounded-xl p-2 text-left space-y-1 shadow-2xs">
                        <div class="text-[9px] font-black uppercase tracking-wider text-customAccent/80 text-center pb-1 border-b border-customAccent/15 mb-1">
                            🏷️ SET RENTS
                        </div>
                        ${card.isSuperWild ? `
                            <div class="text-[10px] font-bold text-center text-slate-700 py-1">
                                🌈 Counts as ANY date property! Adopts current set's rent table.
                            </div>
                        ` : (card.colors || []).map(cKey => {
                            const cConf = PROPERTY_SETS_CONFIG[cKey];
                            if (!cConf) return '';
                            const isCurrent = card.currentColor === cKey;
                            return `
                                <div class="p-1 rounded text-[10px] ${isCurrent ? 'bg-amber-200/90 font-black border border-amber-300' : 'bg-slate-50 font-bold text-slate-700'}">
                                    <div class="flex justify-between items-center text-[10px]">
                                        <span>${cConf.emoji} ${cConf.name} ${isCurrent ? '⭐' : ''}</span>
                                        <span class="text-emerald-800 font-extrabold">${cConf.rents.map(r => `$${r}M`).join(' / ')}</span>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        } else if (isRent) {
            centerHTML = `
                <div class="text-center my-auto py-1">
                    <div class="font-black text-customAccent text-sm sm:text-base leading-snug mb-0.5">${card.name}</div>
                    <div class="text-[10px] font-bold text-customAccent/70 mb-2">${card.desc || ''}</div>
                    <div class="bg-amber-50/90 border border-customAccent/20 rounded-xl p-2 text-left space-y-1 shadow-2xs">
                        <div class="text-[9px] font-black uppercase tracking-wider text-customAccent/80 text-center pb-1 border-b border-customAccent/15 mb-1">
                            🏷️ APPLICABLE RENTS
                        </div>
                        ${card.isWildRent ? `
                            <div class="text-[10px] font-bold text-center text-slate-700 py-1">
                                ✨ Charges rent on ANY property set you own!
                            </div>
                        ` : (card.colors || []).map(cKey => {
                            const cConf = PROPERTY_SETS_CONFIG[cKey];
                            if (!cConf) return '';
                            return `
                                <div class="flex justify-between items-center p-1 rounded bg-slate-50 font-bold text-slate-700 text-[10px]">
                                    <span>${cConf.emoji} ${cConf.name}</span>
                                    <span class="text-emerald-800 font-extrabold">${cConf.rents.map(r => `$${r}M`).join(' / ')}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        } else if (isMoney) {
            centerHTML = `
                <div class="text-center my-auto py-2">
                    <div class="text-4xl my-2">💰</div>
                    <div class="font-black text-emerald-800 text-3xl mb-1">$${card.value}M</div>
                    <div class="text-xs font-bold text-slate-600">Monopoly Currency</div>
                    <div class="text-[10px] opacity-75 mt-1">Deposit in bank to pay rent or debts safely!</div>
                </div>
            `;
        } else {
            centerHTML = `
                <div class="text-center my-auto py-1">
                    <div class="text-3xl my-1">${card.name.includes('💔') ? '💔' : (card.name.includes('🛑') ? '🛑' : '⚡')}</div>
                    <div class="font-black text-customAccent text-sm sm:text-base leading-snug mb-1">${card.name}</div>
                    <div class="text-[11px] font-bold text-customAccent/85 leading-snug bg-amber-50 rounded-xl p-2 border border-customAccent/20">${card.desc || ''}</div>
                </div>
            `;
        }

        return `
            <div class="deal-card w-52 sm:w-56 min-h-[17.5rem] bg-white border-3 border-customAccent rounded-2xl shadow-xl flex flex-col justify-between overflow-hidden relative cursor-pointer p-3">
                <div class="rounded-xl px-2 py-1 text-center font-black text-white text-[11px] sm:text-xs uppercase tracking-wider shadow-xs mb-1" style="background-color: ${headerBg}">
                    ${icon} ${headerText}
                </div>
                ${centerHTML}
                <div class="flex items-center justify-between text-[11px] font-black border-t border-slate-200 pt-1.5 mt-1">
                    <span class="text-emerald-700 font-black text-sm">$${card.value}M</span>
                    <span class="opacity-60 text-[9px] tracking-wider uppercase">${card.type.toUpperCase()}</span>
                </div>
            </div>
        `;
    }

    // --- STANDARD MINI CARD (In hand & table) ---
    const colorKey = card.currentColor || card.color || (card.colors ? card.colors[0] : 'brown');
    const conf = PROPERTY_SETS_CONFIG[colorKey] || {};
    const sizeClass = 'w-20 sm:w-24 h-28 sm:h-34 p-1.5 text-[9px] sm:text-[10px]';

    return `
        <div class="deal-card ${sizeClass} bg-white border-2 border-customAccent rounded-xl shadow-md flex flex-col justify-between overflow-hidden relative cursor-pointer">
            <div class="rounded px-1 py-0.5 text-center font-black text-white text-[8px] sm:text-[9px] uppercase tracking-wider truncate" style="background-color: ${headerBg}">
                ${icon} ${headerText}
            </div>
            <div class="text-center my-auto py-0.5">
                <div class="font-extrabold text-customAccent line-clamp-2 leading-tight">${card.name}</div>
                ${isProp && conf.rents ? `
                    <div class="text-[7.5px] sm:text-[8px] font-black text-emerald-900 bg-emerald-50 rounded px-1 py-0.2 mt-0.5 border border-emerald-200/80 truncate" title="Rent: ${conf.rents.map(r => '$' + r + 'M').join(' · ')}">
                        Rent: ${conf.rents.map(r => `$${r}M`).join('·')}
                    </div>
                ` : ''}
                ${isWild ? `
                    <div class="text-[7px] sm:text-[7.5px] font-black text-amber-900 bg-amber-50 rounded px-1 py-0.2 mt-0.5 border border-amber-200/80 truncate">
                        ${card.isSuperWild ? 'Rainbow Wild' : 'Dual Wildcard'}
                    </div>
                ` : ''}
                ${isRent ? `
                    <div class="text-[7.5px] sm:text-[8px] font-black text-amber-900 bg-amber-50 rounded px-1 py-0.2 mt-0.5 border border-amber-200/80 truncate">
                        ${card.isWildRent ? 'Wild Rent' : 'Dual Rent'}
                    </div>
                ` : ''}
                ${!isProp && !isWild && !isRent && card.desc ? `
                    <div class="text-[7px] sm:text-[8px] opacity-75 mt-0.5 line-clamp-2">${card.desc}</div>
                ` : ''}
            </div>
            <div class="flex items-center justify-between text-[8px] sm:text-[9px] font-black border-t border-slate-200 pt-0.5">
                <span class="text-emerald-700">$${card.value}M</span>
                <span class="opacity-60 text-[7px]">${card.type.toUpperCase()}</span>
            </div>
        </div>
    `;
}

// 19. Complete Game Arena Rendering
function renderActiveGame() {
    if (!localGameState) return;

    document.getElementById('game-lobby').classList.add('hidden');
    document.getElementById('game-arena').classList.remove('hidden');

    const roomDisp = document.getElementById('active-room-display');
    if (roomDisp) roomDisp.textContent = activeRoomId;

    // Target sets display
    const targetSpans = document.querySelectorAll('.target-sets-display');
    targetSpans.forEach(el => el.textContent = localGameState.target_sets || 3);

    // Scoreboard counts
    const p1Sets = getCompletedSets(localGameState.player1_properties);
    const p2Sets = getCompletedSets(localGameState.player2_properties);
    const p1BankTotal = localGameState.player1_bank.reduce((a, c) => a + c.value, 0);
    const p2BankTotal = localGameState.player2_bank.reduce((a, c) => a + c.value, 0);

    const p1SetCount = document.getElementById('p1-set-count');
    const p2SetCount = document.getElementById('p2-set-count');
    const p1BankDisp = document.getElementById('p1-bank-display');
    const p2BankDisp = document.getElementById('p2-bank-display');

    if (p1SetCount) p1SetCount.textContent = p1Sets.length;
    if (p2SetCount) p2SetCount.textContent = p2Sets.length;
    if (p1BankDisp) p1BankDisp.textContent = `$${p1BankTotal}M`;
    if (p2BankDisp) p2BankDisp.textContent = `$${p2BankTotal}M`;

    // Active Card Turn Banner
    const isP1Turn = localGameState.current_turn === 'player1';
    const turnBanner = document.getElementById('turn-banner');
    if (turnBanner) {
        if (localGameState.winner) {
            turnBanner.className = 'text-xs sm:text-sm font-black px-4 py-1 rounded-full bg-emerald-500 text-white shadow-sm';
            turnBanner.textContent = localGameState.winner === 'player1' ? 'Sanyam Won! 🏆' : 'Himi Won! 🏆';
        } else if (localGameState.pending_action) {
            const pending = localGameState.pending_action;
            const isTargetMe = (gameMode === 'pass_and_play') || (pending.fromPlayer === myRole);
            if (isTargetMe) {
                turnBanner.className = 'text-xs sm:text-sm font-black px-4 py-1 rounded-full bg-red-500 text-white shadow-sm animate-pulse';
                turnBanner.textContent = pending.type === 'steal' ? '⚠️ Incoming Attack! Respond now' : '💸 Rent Demanded! Pay debt';
            } else {
                const oppName = pending.fromPlayer === 'player1' ? 'Sanyam' : 'Himi';
                turnBanner.className = 'text-xs sm:text-sm font-black px-4 py-1 rounded-full bg-amber-400 text-amber-950 shadow-sm animate-pulse';
                turnBanner.textContent = `⏳ Waiting for ${oppName} to respond...`;
            }
        } else if (isCurrentPlayerTurn()) {
            turnBanner.className = 'text-xs sm:text-sm font-black px-4 py-1 rounded-full bg-emerald-200 text-emerald-950 border border-emerald-400 shadow-sm animate-pulse';
            turnBanner.textContent = '🎯 Your Turn! Play up to 3 cards';
        } else {
            const oppName = myRole === 'player1' ? 'Himi' : 'Sanyam';
            turnBanner.className = 'text-xs sm:text-sm font-black px-4 py-1 rounded-full bg-amber-100 text-amber-950 border border-amber-300 shadow-sm';
            turnBanner.textContent = `💭 Waiting for ${oppName}...`;
        }
    }

    // Plays Remaining Dots
    const playsRem = localGameState.plays_remaining !== undefined ? localGameState.plays_remaining : 3;
    for (let i = 1; i <= 3; i++) {
        const dot = document.getElementById(`play-dot-${i}`);
        if (dot) {
            if (i <= playsRem) dot.className = 'play-dot active w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm';
            else dot.className = 'play-dot w-2.5 h-2.5 rounded-full bg-slate-300';
        }
    }

    // Deck & Discard Center
    const deckCount = document.getElementById('deck-count-text');
    const centerDeckCount = document.getElementById('center-deck-count');
    const discardDesc = document.getElementById('center-discard-desc');
    const discardCard = document.getElementById('center-discard-card');

    if (deckCount) deckCount.textContent = localGameState.deck ? localGameState.deck.length : 0;
    if (centerDeckCount) centerDeckCount.textContent = localGameState.deck ? localGameState.deck.length : 0;

    if (localGameState.discard_pile && localGameState.discard_pile.length > 0) {
        const top = localGameState.discard_pile[0];
        if (discardDesc) discardDesc.textContent = top.name;
        if (discardCard) discardCard.innerHTML = `<span class="text-[9px] font-black line-clamp-2">${top.name}</span>`;
    } else {
        if (discardDesc) discardDesc.textContent = 'Empty';
        if (discardCard) discardCard.innerHTML = '🗑️';
    }

    // Opponent Board
    renderOpponentBoard();

    // Your Board & Hand
    renderYourBoard();
    renderYourHand();

    // Check Just Say No Prompt
    checkIncomingActionPrompt();

    // Check Victory Modal
    if (localGameState.winner) {
        showVictoryModal(localGameState.winner);
    }
}

// Render Opponent Board
function renderOpponentBoard() {
    const oppHead = document.getElementById('opponent-table-heading');
    const oppHandCount = document.getElementById('opp-hand-count');
    const oppBankTotal = document.getElementById('opp-bank-total');
    const oppCardsFan = document.getElementById('opp-cards-fan');
    const oppBankTray = document.getElementById('opp-bank-tray');
    const oppPropsContainer = document.getElementById('opp-properties-container');

    const oppRole = myRole === 'player1' ? 'player2' : 'player1';
    const oppName = oppRole === 'player1' ? 'Sanyam 🔵' : 'Himi 🌸';
    if (oppHead) oppHead.textContent = `Opponent's Board (${oppName})`;

    const oppHand = getOpponentPlayerHand();
    const oppBank = getOpponentBank();
    const oppProps = getOpponentProperties();

    if (oppHandCount) oppHandCount.textContent = oppHand.length;
    const bankSum = oppBank.reduce((a, c) => a + c.value, 0);
    if (oppBankTotal) oppBankTotal.textContent = `$${bankSum}M`;

    // Opponent Fan
    if (oppCardsFan) {
        oppCardsFan.innerHTML = '';
        oppHand.forEach(() => {
            const cardEl = document.createElement('div');
            cardEl.className = 'w-5 h-8 bg-gradient-to-br from-customAccent to-blue-900 border border-amber-200 rounded shadow-xs flex items-center justify-center text-[7px] text-amber-200';
            cardEl.innerHTML = '🎴';
            oppCardsFan.appendChild(cardEl);
        });
    }

    // Opponent Bank Tray
    if (oppBankTray) {
        oppBankTray.innerHTML = '';
        if (oppBank.length === 0) {
            oppBankTray.innerHTML = `<span class="text-[10px] text-amber-900/60 font-semibold italic">Empty</span>`;
        } else {
            oppBank.forEach(c => {
                const bCard = document.createElement('div');
                bCard.className = 'px-1.5 py-0.5 bg-emerald-100 border border-emerald-400 rounded text-[9px] font-black text-emerald-800 whitespace-nowrap shadow-xs';
                bCard.textContent = `$${c.value}M`;
                oppBankTray.appendChild(bCard);
            });
        }
    }

    // Opponent Properties
    if (oppPropsContainer) {
        oppPropsContainer.innerHTML = '';
        const propKeys = Object.keys(oppProps);
        if (propKeys.length === 0) {
            oppPropsContainer.innerHTML = `<div class="col-span-full py-2 text-xs font-semibold opacity-60">Opponent has no properties placed yet.</div>`;
        } else {
            propKeys.forEach(colorKey => {
                const conf = PROPERTY_SETS_CONFIG[colorKey];
                const cards = oppProps[colorKey];
                const isFull = cards.length >= conf.size;
                const currentRent = conf.rents[Math.min(cards.length - 1, conf.rents.length - 1)] || 0;

                const groupEl = document.createElement('div');
                groupEl.className = `p-1.5 sm:p-2 rounded-xl border-2 transition-all ${
                    isFull ? 'bg-amber-100 border-amber-500 complete-set-glow' : 'bg-white border-slate-300'
                }`;
                groupEl.innerHTML = `
                    <div class="flex items-center justify-between text-[10px] font-black px-1.5 py-0.5 rounded text-white mb-1" style="background-color: ${conf.color}">
                        <span class="truncate">${conf.emoji} ${conf.name}</span>
                        <span class="ml-1 whitespace-nowrap">${cards.length}/${conf.size}</span>
                    </div>
                    <div class="flex items-center justify-between text-[9px] font-black px-1.5 py-0.5 bg-amber-50 rounded border border-amber-200/80 mb-1 text-customAccent">
                        <span>🏷️ Current Rent:</span>
                        <span class="font-black text-emerald-800 text-[10px]">$${currentRent}M</span>
                    </div>
                    <div class="space-y-1">
                        ${cards.map((c, idx) => `
                            <div onclick="inspectCard(getOpponentProperties()['${colorKey}'][${idx}])" class="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200 truncate cursor-pointer hover:bg-amber-50" title="Tap to inspect">
                                ${c.name}
                            </div>
                        `).join('')}
                    </div>
                    <div class="text-[8px] text-slate-500 font-semibold text-center mt-1 pt-0.5 border-t border-slate-200/70 flex justify-around">
                        ${conf.rents.map((r, i) => {
                            const isCurrentTier = (i + 1) === cards.length;
                            return `<span class="${isCurrentTier ? 'font-black text-emerald-800 bg-emerald-100 px-1 rounded' : 'opacity-70'}">${i + 1}: $${r}M</span>`;
                        }).join('')}
                    </div>
                    ${isFull ? `<div class="mt-1 text-[8px] font-black text-amber-900 text-center bg-amber-200 rounded px-1 py-0.2">⭐ FULL SET!</div>` : ''}
                `;
                oppPropsContainer.appendChild(groupEl);
            });
        }
    }
}

// Render Your Board & Properties
function renderYourBoard() {
    const yourBankTotal = document.getElementById('your-bank-total');
    const yourBankTray = document.getElementById('your-bank-tray');
    const yourPropsContainer = document.getElementById('your-properties-container');
    const bankCountLabel = document.getElementById('bank-cards-count-label');

    const myBank = getCurrentPlayerBank();
    const myProps = getCurrentPlayerProperties();

    const bankSum = myBank.reduce((a, c) => a + c.value, 0);
    if (yourBankTotal) yourBankTotal.textContent = `$${bankSum}M`;
    if (bankCountLabel) bankCountLabel.textContent = `${myBank.length} cards`;

    // Your Bank Tray
    if (yourBankTray) {
        yourBankTray.innerHTML = '';
        if (myBank.length === 0) {
            yourBankTray.innerHTML = `<span class="text-xs text-amber-900/60 font-semibold italic py-1">No money banked yet.</span>`;
        } else {
            myBank.forEach(c => {
                const bCard = document.createElement('div');
                bCard.className = 'px-2 py-1 bg-emerald-100 border border-emerald-500 rounded-lg text-xs font-black text-emerald-900 whitespace-nowrap shadow-xs flex items-center gap-1';
                bCard.innerHTML = `<span>💰</span> <span>$${c.value}M</span> <span class="text-[9px] opacity-75 font-normal truncate max-w-[70px]">${c.name}</span>`;
                yourBankTray.appendChild(bCard);
            });
        }
    }

    // Your Properties
    if (yourPropsContainer) {
        yourPropsContainer.innerHTML = '';
        const propKeys = Object.keys(myProps);
        if (propKeys.length === 0) {
            yourPropsContainer.innerHTML = `<div class="col-span-full py-4 text-xs font-bold opacity-60 text-center">No properties on your table yet. Play property cards from your hand!</div>`;
        } else {
            propKeys.forEach(colorKey => {
                const conf = PROPERTY_SETS_CONFIG[colorKey];
                const cards = myProps[colorKey];
                const isFull = cards.length >= conf.size;
                const currentRent = conf.rents[Math.min(cards.length - 1, conf.rents.length - 1)] || 0;

                const groupEl = document.createElement('div');
                groupEl.className = `p-2 rounded-xl border-2 transition-all ${
                    isFull ? 'bg-amber-100 border-amber-500 complete-set-glow' : 'bg-white border-slate-300'
                }`;

                const cardsHTML = cards.map((c, idx) => `
                    <div onclick="inspectCard(getCurrentPlayerProperties()['${colorKey}'][${idx}])" class="flex items-center justify-between text-[10px] font-extrabold px-1.5 py-1 rounded bg-slate-50 border border-slate-200 cursor-pointer hover:bg-amber-50 transition-all" title="Tap to inspect">
                        <span class="truncate pr-1">${c.name}</span>
                        ${c.type === 'wildcard' ? `
                            <button onclick="event.stopPropagation(); flipWildcardColor('${colorKey}', ${idx})" class="text-[8px] bg-amber-200 text-amber-950 px-1 py-0.2 rounded font-black hover:bg-amber-300 ml-1" title="Flip Wildcard color">
                                🔄 Flip
                            </button>
                        ` : ''}
                    </div>
                `).join('');

                groupEl.innerHTML = `
                    <div class="flex items-center justify-between text-xs font-black px-1.5 py-0.5 rounded text-white mb-1" style="background-color: ${conf.color}">
                        <span class="truncate">${conf.emoji} ${conf.name}</span>
                        <span class="ml-1 whitespace-nowrap">${cards.length}/${conf.size}</span>
                    </div>
                    <div class="flex items-center justify-between text-[9px] font-black px-1.5 py-0.5 bg-amber-50 rounded border border-amber-200/80 mb-1.5 text-customAccent">
                        <span>🏷️ Current Rent:</span>
                        <span class="font-black text-emerald-800 text-[10px]">$${currentRent}M</span>
                    </div>
                    <div class="space-y-1">
                        ${cardsHTML}
                    </div>
                    <div class="text-[8px] text-slate-500 font-semibold text-center mt-1.5 pt-1 border-t border-slate-200 flex justify-around">
                        ${conf.rents.map((r, i) => {
                            const isCurrentTier = (i + 1) === cards.length;
                            return `<span class="${isCurrentTier ? 'font-black text-emerald-800 bg-emerald-100 px-1 rounded' : 'opacity-70'}">${i + 1}: $${r}M</span>`;
                        }).join('')}
                    </div>
                    ${isFull ? `<div class="mt-1.5 text-[9px] font-black text-amber-950 text-center bg-amber-300 rounded px-1 py-0.5 shadow-xs">🏆 COMPLETE SET!</div>` : ''}
                `;
                yourPropsContainer.appendChild(groupEl);
            });
        }
    }
}

// Render Your Hand
function renderYourHand() {
    const container = document.getElementById('player-hand-container');
    const roleLabel = document.getElementById('your-role-label');
    const chipPreview = document.getElementById('your-chip-preview');

    if (roleLabel) roleLabel.textContent = myRole === 'player1' ? 'Sanyam (Blue 🔵)' : 'Himi (Pink 🌸)';
    if (chipPreview) {
        chipPreview.className = myRole === 'player1' ? 'w-4 h-4 rounded-full bg-player1Color inline-block shadow' : 'w-4 h-4 rounded-full bg-player2Color inline-block shadow';
    }

    if (!container) return;
    container.innerHTML = '';
    const myHand = getCurrentPlayerHand();

    if (myHand.length === 0) {
        container.innerHTML = `<div class="py-6 text-xs font-bold opacity-60 text-center w-full">Your hand is empty! You will draw 5 fresh cards on your turn.</div>`;
        return;
    }

    myHand.forEach((card, idx) => {
        const isSelected = selectedCardIndex === idx;
        const cardWrapper = document.createElement('div');
        cardWrapper.className = `flex-shrink-0 cursor-pointer ${isSelected ? 'selected-card' : ''}`;
        cardWrapper.innerHTML = renderCardMiniHTML(card);
        cardWrapper.onclick = () => onCardHandClick(idx);
        container.appendChild(cardWrapper);
    });
}

// Check if incoming attack requires Just Say No prompt
function checkIncomingActionPrompt() {
    if (!localGameState || !localGameState.pending_action) return;
    const pending = localGameState.pending_action;

    // Check if this action is targeting me or we are in pass and play
    const isTargetingMe = (gameMode === 'pass_and_play') || (pending.fromPlayer === myRole);
    if (!isTargetingMe) return;

    const modal = document.getElementById('just-say-no-modal');
    const attackMsg = document.getElementById('jsn-attack-message');
    const defHand = pending.fromPlayer === 'player1' ? localGameState.player1_hand : localGameState.player2_hand;
    const hasJSN = defHand.some(c => c.actionKey === 'just_say_no');

    if (hasJSN) {
        if (attackMsg) {
            const defName = pending.fromPlayer === 'player1' ? 'Sanyam' : 'Himi';
            const attName = pending.toPlayer === 'player1' ? 'Sanyam' : 'Himi';
            const prefix = gameMode === 'pass_and_play' ? `${defName}: ` : '';
            if (pending.type === 'steal') {
                const sName = pending.stealType === 'deal_breaker' ? 'DEAL BREAKER 💔' : (pending.stealType === 'sly_deal' ? 'SLY DEAL 🕵️‍♂️' : 'FORCED DEAL 🔄');
                attackMsg.textContent = `${prefix}${attName} played ${sName} against your properties!`;
            } else if (pending.type === 'payment') {
                attackMsg.textContent = `${prefix}${attName} demands $${pending.amount}M for: ${pending.reason}!`;
            }
        }
        if (modal) modal.classList.remove('hidden');
    } else {
        // No Just Say No in hand
        if (pending.type === 'steal') {
            executeStealTransfer(pending.stealType, pending.targetData, pending.toPlayer, pending.fromPlayer);
        } else if (pending.type === 'payment') {
            const defBank = pending.fromPlayer === 'player1' ? localGameState.player1_bank : localGameState.player2_bank;
            const defProps = pending.fromPlayer === 'player1' ? localGameState.player1_properties : localGameState.player2_properties;
            let totalAssets = defBank.reduce((a, c) => a + c.value, 0);
            Object.keys(defProps).forEach(cKey => {
                totalAssets += (defProps[cKey] || []).reduce((a, c) => a + c.value, 0);
            });
            if (totalAssets === 0) {
                localGameState.pending_action = null;
                const defName = pending.fromPlayer === 'player1' ? 'Sanyam' : 'Himi';
                showActionPrompt(`💸 ${defName} has no money or properties on table to pay! Debt waived.`);
                persistAndBroadcastGameState(localGameState);
                renderActiveGame();
            } else {
                openPaymentModal(pending.amount, pending.reason);
            }
        }
    }
}

// Show Action Prompt Toast
function showActionPrompt(msg) {
    const el = document.getElementById('action-prompt');
    if (el) el.innerHTML = `<span>${msg}</span>`;
}

// Record Last Move for Sound & Sync
function recordLastMove(type, card) {
    if (!localGameState) return;
    localGameState.last_move = {
        type: type,
        player: myRole,
        cardName: card ? card.name : '',
        timestamp: new Date().toISOString()
    };
}

// 20. Victory Celebration Modal
function showVictoryModal(winner) {
    const modal = document.getElementById('victory-modal');
    const title = document.getElementById('winner-title');
    const sub = document.getElementById('winner-subtitle');
    const setsDisplay = document.getElementById('winning-sets-display');
    if (!modal) return;

    playWinSound();
    triggerConfettiMega();

    const isP1 = winner === 'player1';
    if (title) {
        title.textContent = isP1 ? 'Sanyam Wins! 🔵' : 'Himi Wins! 🌸';
        title.style.color = isP1 ? '#243B8F' : '#E25B7B';
    }

    if (sub) {
        sub.textContent = isP1
            ? 'Completed 3 Date Sets! Himi must treat Sanyam to the winning date night of his choice! 🍦🌅'
            : 'Himi is the Monopoly Queen! Sanyam must fulfill all dates from her winning sets! 🍕🍳❤️';
    }

    if (setsDisplay && localGameState) {
        const props = isP1 ? localGameState.player1_properties : localGameState.player2_properties;
        const sets = getCompletedSets(props);
        setsDisplay.innerHTML = sets.map(s => `
            <span class="px-2.5 py-1 rounded-full text-xs font-black text-white shadow" style="background-color: ${PROPERTY_SETS_CONFIG[s.color].color}">
                ${s.emoji} ${s.name}
            </span>
        `).join('');
    }

    modal.classList.remove('hidden');
}

async function rematchGame() {
    const modal = document.getElementById('victory-modal');
    if (modal) modal.classList.add('hidden');

    localGameState = createInitialGameState(activeRoomId, targetSetsRule || 3);
    handleTurnStartDraw(localGameState);
    await persistAndBroadcastGameState(localGameState);
    renderActiveGame();
}

function returnToLobby() {
    const modal = document.getElementById('victory-modal');
    if (modal) modal.classList.add('hidden');
    confirmExitGame();
}

function confirmExitGame() {
    if (activeRoomId) {
        sessionStorage.removeItem('monopoly_joined_session_' + activeRoomId);
    }
    document.getElementById('game-arena').classList.add('hidden');
    document.getElementById('game-lobby').classList.remove('hidden');
    selectedCardIndex = null;
    activeRoomId = null;
    try {
        window.history.replaceState({}, '', window.location.pathname);
    } catch (e) {}
}

async function confirmResetCurrentGame() {
    if (!confirm("Start a new game with fresh cards and empty table?")) return;
    localGameState = createInitialGameState(activeRoomId, targetSetsRule || 3);
    handleTurnStartDraw(localGameState);
    await persistAndBroadcastGameState(localGameState);
    renderActiveGame();
    showActionPrompt("🔄 Fresh Monopoly Deal match started! Target: 3 Complete Sets 🏆");
}

// 21. Sharing Links
function copyRoomLink() {
    const oppRole = myRole === 'player1' ? 'player2' : 'player1';
    const oppName = oppRole === 'player2' ? 'Himi 🌸' : 'Sanyam 🔵';
    const url = window.location.origin + window.location.pathname + '?room=' + encodeURIComponent(activeRoomId) + '&role=' + oppRole;
    navigator.clipboard.writeText(url).then(() => {
        showActionPrompt(`📋 Room invite link copied! (Configured for ${oppName})`);
    }).catch(() => {
        prompt("Copy this invite link for " + oppName + ":", url);
    });
}

function shareGameWhatsApp() {
    const oppRole = myRole === 'player1' ? 'player2' : 'player1';
    const recipientName = oppRole === 'player2' ? 'Himi' : 'Sanyam';
    const url = window.location.origin + window.location.pathname + '?room=' + encodeURIComponent(activeRoomId) + '&role=' + oppRole;
    const msg = `Hey ${recipientName}! 🥰 I set up our Monopoly Deal board! Tap here to join me in Room "${activeRoomId}":\n\n${url}\n\nGet ready for some serious competition! ❤️🃏💰`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
}

// 22. Discard History Inspection
function showDiscardModal() {
    const modal = document.getElementById('discard-modal');
    const list = document.getElementById('discard-history-list');
    if (!modal || !list || !localGameState) return;

    const pile = localGameState.discard_pile || [];
    if (pile.length === 0) {
        list.innerHTML = `<p class="py-4 text-center opacity-70">No cards discarded yet.</p>`;
    } else {
        list.innerHTML = pile.map(item => `
            <div class="flex items-center justify-between p-1.5 rounded bg-white border border-customAccent/20">
                <span class="font-extrabold text-customAccent">${item.name}</span>
                <span class="text-[11px] font-bold opacity-80">$${item.value}M</span>
            </div>
        `).join('');
    }
    modal.classList.remove('hidden');
}

function hideDiscardModal() {
    const modal = document.getElementById('discard-modal');
    if (modal) modal.classList.add('hidden');
}

// 23. State Persistence & Broadcast
async function persistAndBroadcastGameState(state) {
    if (realtimeChannel) {
        try {
            realtimeChannel.send({
                type: 'broadcast',
                event: 'game_update',
                payload: state
            });
        } catch (e) {
            console.warn('Broadcast error:', e);
        }
    }

    if (gameMode === 'online') {
        try {
            const client = await getSupabaseClient();
            if (client) {
                await client.from('monopoly_games').upsert(state);
            }
        } catch (e) {
            console.warn('DB upsert error:', e);
        }
    }
}

// 24. Live Floating Reactions
function sendLiveReaction(emoji) {
    showFloatingReaction(emoji, true);
    playTone(700, 'sine', 0.1, 0.15);

    if (realtimeChannel) {
        try {
            realtimeChannel.send({
                type: 'broadcast',
                event: 'reaction',
                payload: { emoji, player: myRole }
            });
        } catch (e) {}
    }
}

function showFloatingReaction(emoji, isSelf) {
    const el = document.createElement('div');
    el.className = 'floating-reaction';
    el.textContent = emoji;
    const randomLeft = Math.random() * 60 + 20;
    el.style.left = `${randomLeft}%`;
    el.style.bottom = isSelf ? '110px' : '40%';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2500);
}

// Confetti triggers
function triggerConfettiMini() {
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#243B8F', '#FFF0C9', '#E25B7B', '#F59E0B']
        });
    }
}

function triggerConfettiMega() {
    if (typeof confetti === 'function') {
        const duration = 3.5 * 1000;
        const animationEnd = Date.now() + duration;
        const interval = setInterval(function() {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);
            confetti({
                particleCount: 40,
                startVelocity: 30,
                spread: 360,
                origin: { x: Math.random(), y: Math.random() - 0.2 },
                colors: ['#243B8F', '#FFF0C9', '#E25B7B', '#F59E0B', '#10B981']
            });
        }, 250);
    }
}
