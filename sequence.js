// ==============================================================================
// Himi & Sanyam - Sequence Board Game (Official 10x10 Cross-Device Multiplayer)
// ==============================================================================

// Canonical Sequence Board Layout (Official 10x10 Grid)
// Card notation: Rank + Suit (e.g., '10H', '2S', 'AD', '6C'). Corners are 'CORNER'.
const SEQUENCE_BOARD_LAYOUT = [
    ['CORNER', '2S', '3S', '4S', '5S', '6S', '7S', '8S', '9S', 'CORNER'],
    ['6C', '5C', '4C', '3C', '2C', 'AH', 'KH', 'QH', '10H', '10S'],
    ['7C', 'AS', '2D', '3D', '4D', '5D', '6D', '7D', '9H', 'QS'],
    ['8C', 'KS', '6C', '5C', '4C', '3C', '2C', '8D', '8H', 'KS'],
    ['9C', 'QS', '7C', '6H', '5H', '4H', 'AH', '9D', '7H', 'AS'],
    ['10C', '10S', '8C', '7H', '2H', '3H', 'KH', '10D', '6H', '2D'],
    ['QC', '9S', '9C', '8H', '9H', '10H', 'QH', 'QD', '5H', '3D'],
    ['KC', '8S', '10C', 'QC', 'KC', 'AC', 'AD', 'KD', '4H', '4D'],
    ['AC', '7S', '6S', '5S', '4S', '3S', '2S', '2H', '3H', '5D'],
    ['CORNER', 'AD', 'KD', 'QD', '10D', '9D', '8D', '7D', '6D', 'CORNER']
];

// Suits & Symbols
const SUIT_DATA = {
    'S': { symbol: '♠', name: 'Spades', color: '#1E293B', isRed: false },
    'H': { symbol: '♥', name: 'Hearts', color: '#DC2626', isRed: true },
    'D': { symbol: '♦', name: 'Diamonds', color: '#EA580C', isRed: true },
    'C': { symbol: '♣', name: 'Clubs', color: '#0F172A', isRed: false }
};

// Global App State
let myRole = localStorage.getItem('sequence_player_role') || 'player1'; // 'player1' (Sanyam) | 'player2' (Himi)
let targetSequencesRule = 2; // 1 or 2
let activeRoomId = null;
let gameMode = 'online'; // 'online' | 'ai' | 'pass_and_play'
let isSoundEnabled = localStorage.getItem('sequence_sound_muted') !== 'true';
let selectedCardIndex = null;
let realtimeChannel = null;
let localGameState = null;

// Web Audio API Sound Synthesizer (Zero external dependencies)
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
    playTone(480, 'triangle', 0.08, 0.12);
}

function playChipSound() {
    playTone(320, 'sine', 0.12, 0.2);
    setTimeout(() => playTone(240, 'triangle', 0.1, 0.15), 30);
}

function playRemoveSound() {
    playTone(280, 'sawtooth', 0.18, 0.12);
    setTimeout(() => playTone(160, 'sine', 0.15, 0.1), 60);
}

function playSequenceFanfare() {
    if (!isSoundEnabled) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((f, idx) => {
        setTimeout(() => playTone(f, 'sine', 0.25, 0.25), idx * 120);
    });
}

function playWinSound() {
    if (!isSoundEnabled) return;
    const notes = [392, 523.25, 659.25, 783.99, 1046.50, 1318.51];
    notes.forEach((f, idx) => {
        setTimeout(() => playTone(f, 'triangle', 0.35, 0.3), idx * 110);
    });
}

function toggleSound() {
    isSoundEnabled = !isSoundEnabled;
    localStorage.setItem('sequence_sound_muted', (!isSoundEnabled).toString());
    const icon = document.getElementById('sound-icon');
    if (icon) icon.textContent = isSoundEnabled ? '🔊' : '🔇';
    if (isSoundEnabled) playTone(500, 'sine', 0.1, 0.15);
}

// Background Floating Books Effect
const booksContainer = document.getElementById('books-container');
function createFloatingBook() {
    if (!booksContainer) return;
    const book = document.createElement('div');
    book.classList.add('floating-book');
    book.innerHTML = `
        <svg viewBox="0 0 24 24" fill="currentColor" class="w-full h-full">
            <path d="M12 6c-3.18-2.07-7.46-2.58-10-2.58v13.5c2.54 0 6.82.51 10 2.58 3.18-2.07 7.46-2.58 10-2.58V3.42c-2.54 0-6.82.51-10 2.58zm9 11c-2.27 0-6.15.54-8 1.39V7.07c1.85-.85 5.73-1.39 8-1.39v11.32zM3 17V5.68c2.27 0 6.15.54 8 1.39v10.93c-1.85-.85-5.73-1.39-8-1.39z"/>
        </svg>
    `;
    const left = Math.random() * 100;
    const size = Math.random() * 22 + 12;
    const drift = (Math.random() - 0.5) * 150;
    const rot = (Math.random() - 0.5) * 360;
    const dur = Math.random() * 5 + 6;
    book.style.left = `${left}%`;
    book.style.width = `${size}px`;
    book.style.height = `${size}px`;
    book.style.setProperty('--random-x', `${drift}px`);
    book.style.setProperty('--random-rot', `${rot}deg`);
    book.style.setProperty('--random-scale', `${Math.random() * 0.7 + 0.6}`);
    book.style.animationDuration = `${dur}s`;
    booksContainer.appendChild(book);
    setTimeout(() => book.remove(), dur * 1000);
}
setInterval(createFloatingBook, 800);

// Pending room state for invite modal
let pendingInviteRoom = null;

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
    // Sound icon initial state
    const icon = document.getElementById('sound-icon');
    if (icon) icon.textContent = isSoundEnabled ? '🔊' : '🔇';

    // Role buttons highlight
    updateRoleSelectionUI();

    // Check URL parameters for direct room join (e.g. sequence.html?room=HIMI&role=player2)
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room');
    const roleParam = urlParams.get('role');

    // If role is explicitly specified in link (e.g. WhatsApp invite sent to Himi)
    if (roleParam === 'player1' || roleParam === 'player2') {
        myRole = roleParam;
        localStorage.setItem('sequence_player_role', roleParam);
        updateRoleSelectionUI();
    }

    if (roomParam) {
        const cleanRoom = roomParam.trim().toUpperCase();
        const input = document.getElementById('room-code-input');
        if (input) input.value = cleanRoom;

        // Check if player has already confirmed joining this room in this active tab session
        const sessionKey = 'sequence_joined_session_' + cleanRoom;
        if (sessionStorage.getItem(sessionKey) === 'true') {
            joinPresetRoom(cleanRoom);
        } else {
            // First time opening link: show invite modal so Himi can easily pick/verify her name!
            showInviteJoinModal(cleanRoom);
        }
    } else {
        checkSupabaseConnectivity();
    }
});

// Modal for Join via Invite Link
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
    sessionStorage.setItem('sequence_joined_session_' + room, 'true');
    const modal = document.getElementById('invite-join-modal');
    if (modal) modal.classList.add('hidden');
    joinPresetRoom(room);
}

function dismissInviteModal() {
    const modal = document.getElementById('invite-join-modal');
    if (modal) modal.classList.add('hidden');
    checkSupabaseConnectivity();
}

// In-Game Role Switcher
function togglePlayerRole() {
    myRole = (myRole === 'player1') ? 'player2' : 'player1';
    localStorage.setItem('sequence_player_role', myRole);
    updateRoleSelectionUI();
    if (localGameState) {
        renderBoard();
        renderHands();
        updateScoreboard();
    }
    playCardSound();
    showActionPrompt(`Switched player! You are now playing as ${myRole === 'player1' ? 'Sanyam 🔵' : 'Himi 🌸'}.`);
}

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

// Role and rule options
function selectRole(role) {
    myRole = role;
    localStorage.setItem('sequence_player_role', role);
    updateRoleSelectionUI();
    playCardSound();
}

function updateRoleSelectionUI() {
    // 1. Main Lobby role buttons
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

    // 2. Invite Modal role buttons
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

    // 3. Invite button text
    const inviteLabel = document.getElementById('invite-player-name-label');
    if (inviteLabel) {
        inviteLabel.textContent = myRole === 'player1' ? 'Sanyam 🔵' : 'Himi 🌸';
    }

    // 4. In-Game Role Switch button text
    const switchTarget = document.getElementById('switch-role-target-name');
    if (switchTarget) {
        switchTarget.textContent = myRole === 'player1' ? 'Himi 🌸' : 'Sanyam 🔵';
    }
}

function setTargetSequences(num) {
    targetSequencesRule = num;
    const t1 = document.getElementById('target-btn-1');
    const t2 = document.getElementById('target-btn-2');
    if (t1 && t2) {
        if (num === 1) {
            t1.className = 'target-btn active py-2 px-3 rounded-xl border-2 border-customAccent bg-customAccent text-customBg font-extrabold text-xs shadow-[2px_2px_0px_0px_#243B8F]';
            t2.className = 'target-btn py-2 px-3 rounded-xl border-2 border-customAccent bg-white text-customAccent font-extrabold text-xs hover:bg-amber-100';
        } else {
            t2.className = 'target-btn active py-2 px-3 rounded-xl border-2 border-customAccent bg-customAccent text-customBg font-extrabold text-xs shadow-[2px_2px_0px_0px_#243B8F]';
            t1.className = 'target-btn py-2 px-3 rounded-xl border-2 border-customAccent bg-white text-customAccent font-extrabold text-xs hover:bg-amber-100';
        }
    }
    playCardSound();
}

// Deck Generator (Double 52-card standard deck = 104 cards)
function createDoubleDeck() {
    const suits = ['S', 'H', 'D', 'C'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const deck = [];
    // 2 full decks
    for (let d = 0; d < 2; d++) {
        for (const s of suits) {
            for (const r of ranks) {
                deck.push(r + s);
            }
        }
    }
    // Fisher-Yates shuffle
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

// Jack Classification Helper
function isTwoEyedJack(card) {
    return card === 'JD' || card === 'JC'; // Wild
}

function isOneEyedJack(card) {
    return card === 'JS' || card === 'JH'; // Anti-wild / Remover
}

// Initialize New Game State
function createInitialGameState(roomId, targetSeq = 2) {
    const deck = createDoubleDeck();
    const p1Hand = deck.splice(0, 7);
    const p2Hand = deck.splice(0, 7);

    // Empty 10x10 board
    const board = Array(10).fill(null).map(() => Array(10).fill(null));

    return {
        id: roomId,
        board: board,
        deck: deck,
        discard_pile: [],
        player1_id: 'Sanyam',
        player2_id: 'Himi',
        player1_hand: p1Hand,
        player2_hand: p2Hand,
        current_turn: 'player1',
        target_sequences: targetSeq,
        player1_sequences: 0,
        player2_sequences: 0,
        completed_sequences: [],
        locked_chips: [], // coordinates of chips that cannot be removed
        last_move: null,
        winner: null,
        reactions: [],
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
}

// Start Game Modes
function joinPresetRoom(roomId) {
    activeRoomId = roomId.toUpperCase();
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
    localGameState = createInitialGameState(activeRoomId, targetSequencesRule);
    myRole = 'player1'; // You play as Sanyam (or player1)
    renderActiveGame();
}

function startPassAndPlay() {
    activeRoomId = 'LOCAL-' + Date.now().toString().slice(-4);
    gameMode = 'pass_and_play';
    localGameState = createInitialGameState(activeRoomId, targetSequencesRule);
    renderActiveGame();
}

// Start Room Session (Online Cross-Device)
async function startRoomSession(roomId) {
    showConnectingState();

    // 1. Try fetching existing game from Supabase
    let state = null;
    const client = await getSupabaseClient();

    if (client) {
        try {
            const { data, error } = await client
                .from('sequence_games')
                .select('*')
                .eq('id', roomId)
                .single();

            if (!error && data && data.board) {
                state = data;
            }
        } catch (e) {
            console.warn('Fetch room error:', e);
        }
    }

    // 2. If room does not exist, initialize a new game state and save
    if (!state) {
        state = createInitialGameState(roomId, targetSequencesRule);
        if (client) {
            try {
                await client.from('sequence_games').upsert(state);
            } catch (err) {
                console.warn('Upsert initial game error:', err);
            }
        }
    } else {
        // If state exists: ensure target_sequences is valid (defaults to 2)
        if (!state.target_sequences || state.target_sequences < 1) {
            state.target_sequences = targetSequencesRule || 2;
        }

        // Recalculate sequences with official Sequence rules to clear premature false wins
        if (state.board) {
            const p1Seqs = findSequencesForPlayer(state.board, 'player1');
            const p2Seqs = findSequencesForPlayer(state.board, 'player2');
            state.player1_sequences = p1Seqs.length;
            state.player2_sequences = p2Seqs.length;

            const target = state.target_sequences || 2;
            if (state.player1_sequences >= target) {
                state.winner = 'player1';
                state.status = 'finished';
            } else if (state.player2_sequences >= target) {
                state.winner = 'player2';
                state.status = 'finished';
            } else {
                // If it was prematurely marked as finished by the 6-in-a-row bug: resume game!
                if (state.winner) {
                    state.winner = null;
                    state.status = 'active';
                    if (client) {
                        try {
                            await client.from('sequence_games').update({
                                winner: null,
                                status: 'active',
                                player1_sequences: state.player1_sequences,
                                player2_sequences: state.player2_sequences
                            }).eq('id', roomId);
                        } catch (e) {}
                    }
                }
            }
        }
    }

    localGameState = state;

    // 3. Setup Realtime Channel (Broadcast + Database Changes)
    setupRoomRealtime(roomId, client);

    // 4. Update URL without page reload for easy copying
    try {
        const newUrl = window.location.pathname + '?room=' + encodeURIComponent(roomId);
        window.history.replaceState({ room: roomId }, '', newUrl);
    } catch (e) {}

    // 5. Render Game Arena
    renderActiveGame();
}

function showConnectingState() {
    const dot = document.getElementById('connection-dot');
    const text = document.getElementById('connection-text');
    if (dot) dot.className = 'w-2 h-2 rounded-full bg-amber-400 animate-ping';
    if (text) text.textContent = 'Joining Room...';
}

// Setup Supabase Realtime Channel
function setupRoomRealtime(roomId, client) {
    if (!client) return;

    if (realtimeChannel) {
        try { client.removeChannel(realtimeChannel); } catch (e) {}
    }

    try {
        realtimeChannel = client.channel(`sequence-room-${roomId}`, {
            config: { broadcast: { ack: false } }
        });

        // Instant Sub-second Broadcast updates
        realtimeChannel.on('broadcast', { event: 'game_update' }, (payload) => {
            if (payload && payload.payload) {
                handleRemoteGameUpdate(payload.payload);
            }
        });

        // Live Emojis Broadcast
        realtimeChannel.on('broadcast', { event: 'reaction' }, (payload) => {
            if (payload && payload.payload && payload.payload.emoji) {
                showFloatingReaction(payload.payload.emoji, false);
            }
        });

        // Postgres DB changes fallback (guarantees sync across reloads)
        realtimeChannel.on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'sequence_games',
            filter: `id=eq.${roomId}`
        }, (payload) => {
            if (payload && payload.new && payload.new.board) {
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
        console.warn('Realtime channel setup error:', err);
    }
}

// Handle Game State Received from Remote Device
function handleRemoteGameUpdate(newState) {
    if (!newState || !newState.board) return;
    
    // Play sound based on last move
    if (newState.last_move && (!localGameState || JSON.stringify(localGameState.last_move) !== JSON.stringify(newState.last_move))) {
        if (newState.last_move.type === 'remove') {
            playRemoveSound();
        } else {
            playChipSound();
        }
    }

    // Check if new sequence was completed
    if (localGameState && (newState.player1_sequences > localGameState.player1_sequences || newState.player2_sequences > localGameState.player2_sequences)) {
        playSequenceFanfare();
        triggerConfettiMini();
    }

    localGameState = newState;
    renderBoard();
    renderHands();
    updateScoreboard();

    // Check winner
    if (newState.winner) {
        showVictoryModal(newState.winner);
    }
}

// Render Complete Active Game
function renderActiveGame() {
    document.getElementById('game-lobby').classList.add('hidden');
    document.getElementById('game-arena').classList.remove('hidden');

    const roomDisp = document.getElementById('active-room-display');
    if (roomDisp) roomDisp.textContent = activeRoomId;

    // Target sequence pill update
    const targetSeqSpans = document.querySelectorAll('.target-seq-display');
    targetSeqSpans.forEach(el => el.textContent = localGameState.target_sequences || 2);

    selectedCardIndex = null;
    renderBoard();
    renderHands();
    updateScoreboard();

    if (localGameState.winner) {
        showVictoryModal(localGameState.winner);
    }
}

// Render 10x10 Sequence Board
function renderBoard() {
    const boardEl = document.getElementById('sequence-board');
    if (!boardEl || !localGameState) return;

    boardEl.innerHTML = '';
    const board = localGameState.board;
    const lockedSet = new Set(localGameState.locked_chips || []);

    // Get currently selected card
    const currentHand = getCurrentPlayerHand();
    const selectedCard = (selectedCardIndex !== null && currentHand) ? currentHand[selectedCardIndex] : null;
    const isMyTurn = isCurrentPlayerTurn();

    for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 10; c++) {
            const cardCode = SEQUENCE_BOARD_LAYOUT[r][c];
            const chipOwner = board[r][c];
            const cellKey = `${r},${c}`;
            const isLocked = lockedSet.has(cellKey);
            const isCorner = cardCode === 'CORNER';

            const cell = document.createElement('div');
            cell.className = 'board-cell bg-[#fffdf5] rounded-[4px] sm:rounded-md flex flex-col items-center justify-center p-0.5 border border-slate-300 relative shadow-sm cursor-pointer overflow-hidden';
            cell.setAttribute('data-row', r);
            cell.setAttribute('data-col', c);

            // Corner spaces styling
            if (isCorner) {
                cell.classList.add('bg-amber-100', 'border-amber-400');
                cell.innerHTML = `
                    <div class="text-[12px] sm:text-base leading-none select-none">⭐</div>
                    <span class="text-[7px] sm:text-[9px] font-black text-amber-900 tracking-tighter uppercase">WILD</span>
                `;
            } else {
                // Card space
                const suitKey = cardCode.slice(-1);
                const rank = cardCode.slice(0, -1);
                const suit = SUIT_DATA[suitKey] || { symbol: '', color: '#000', isRed: false };

                cell.innerHTML = `
                    <span class="text-[9px] sm:text-xs font-black leading-none select-none" style="color: ${suit.color}">
                        ${rank}
                    </span>
                    <span class="text-[10px] sm:text-sm leading-none select-none" style="color: ${suit.color}">
                        ${suit.symbol}
                    </span>
                `;
            }

            // Chip Overlay if placed
            if (chipOwner) {
                const chip = document.createElement('div');
                const isP1 = chipOwner === 'player1';
                const chipColorClass = isP1 ? 'bg-gradient-to-br from-[#243B8F] to-[#142358] text-white' : 'bg-gradient-to-br from-[#E25B7B] to-[#B02849] text-white';
                
                chip.className = `chip absolute inset-0.5 sm:inset-1 rounded-full flex items-center justify-center font-black text-[9px] sm:text-xs z-10 ${chipColorClass} ${isLocked ? 'chip-locked' : ''}`;
                chip.innerHTML = isP1 ? 'S' : 'H';
                if (isLocked) {
                    chip.innerHTML += `<span class="absolute -top-1 -right-0.5 text-[8px]">👑</span>`;
                }
                cell.appendChild(chip);
            }

            // Move Highlight Calculation
            if (isMyTurn && selectedCard && !localGameState.winner) {
                if (isTwoEyedJack(selectedCard)) {
                    // Wild: can play on any open non-corner space
                    if (!chipOwner && !isCorner) {
                        cell.classList.add('cell-valid-move');
                    }
                } else if (isOneEyedJack(selectedCard)) {
                    // Remover: can remove any opponent chip that is not locked
                    const opponentKey = myRole === 'player1' ? 'player2' : 'player1';
                    if (chipOwner === opponentKey && !isLocked) {
                        cell.classList.add('cell-removable-move');
                    }
                } else {
                    // Regular card: matches specific card code on open space
                    if (cardCode === selectedCard && !chipOwner) {
                        cell.classList.add('cell-valid-move');
                    }
                }
            }

            // Cell Click Listener
            cell.addEventListener('click', () => handleBoardCellClick(r, c));

            boardEl.appendChild(cell);
        }
    }
}

// Render Hand Cards
function renderHands() {
    const handContainer = document.getElementById('player-hand-container');
    const opponentFan = document.getElementById('opponent-cards-fan');
    if (!handContainer || !localGameState) return;

    const myHand = getCurrentPlayerHand() || [];
    const opponentHand = getOpponentHand() || [];
    const isMyTurn = isCurrentPlayerTurn();

    // 1. Render Your Interactive Hand
    handContainer.innerHTML = '';
    myHand.forEach((cardCode, idx) => {
        const isSelected = selectedCardIndex === idx;
        const isDead = isCardDead(cardCode);
        const cardEl = createPlayingCardElement(cardCode, isSelected, isDead, isMyTurn);

        cardEl.addEventListener('click', () => {
            if (isDead) {
                handleDeadCardSwap(idx);
                return;
            }
            if (!isMyTurn) {
                showActionPrompt("⏳ Please wait for opponent's turn!");
                return;
            }
            if (selectedCardIndex === idx) {
                selectedCardIndex = null;
            } else {
                selectedCardIndex = idx;
                playCardSound();
            }
            renderBoard();
            renderHands();
            updateActionPromptForSelection();
        });

        handContainer.appendChild(cardEl);
    });

    // 2. Render Opponent Face-Down Fan
    if (opponentFan) {
        opponentFan.innerHTML = '';
        opponentHand.forEach(() => {
            const backCard = document.createElement('div');
            backCard.className = 'w-5 h-7 sm:w-6 sm:h-8 rounded-[3px] bg-gradient-to-br from-customAccent to-blue-900 border border-amber-200 shadow-sm flex items-center justify-center';
            backCard.innerHTML = `<span class="text-[8px] text-amber-200 font-black">🎴</span>`;
            opponentFan.appendChild(backCard);
        });
    }

    // Role Label & Chip preview
    const roleLabel = document.getElementById('your-role-label');
    const chipPreview = document.getElementById('your-chip-preview');
    const oppLabel = document.getElementById('opponent-name-label');
    if (roleLabel) roleLabel.textContent = myRole === 'player1' ? 'Sanyam (Blue 🔵)' : 'Himi (Pink 🌸)';
    if (chipPreview) {
        chipPreview.className = myRole === 'player1' ? 'w-4 h-4 rounded-full bg-player1Color inline-block shadow' : 'w-4 h-4 rounded-full bg-player2Color inline-block shadow';
    }
    if (oppLabel) oppLabel.textContent = myRole === 'player1' ? 'Himi 🌸:' : 'Sanyam 🔵:';
}

// Create Card DOM Element for Hand
function createPlayingCardElement(cardCode, isSelected, isDead, isMyTurn) {
    const cardEl = document.createElement('div');
    const suitKey = cardCode.slice(-1);
    const rank = cardCode.slice(0, -1);
    const suit = SUIT_DATA[suitKey] || { symbol: '', color: '#000', isRed: false };
    const twoEyed = isTwoEyedJack(cardCode);
    const oneEyed = isOneEyedJack(cardCode);

    cardEl.className = `hand-card w-12 sm:w-16 h-18 sm:h-24 bg-white border-2 rounded-xl flex flex-col justify-between p-1 sm:p-1.5 shadow-md cursor-pointer relative ${
        isSelected ? 'selected-card border-customAccent' : 'border-slate-300 hover:border-customAccent'
    } ${isDead ? 'opacity-70 bg-amber-50 border-dashed border-red-400' : ''}`;

    let badgeText = '';
    if (twoEyed) badgeText = '👑 WILD';
    if (oneEyed) badgeText = '⚔️ REMOVE';
    if (isDead) badgeText = '💀 SWAP';

    cardEl.innerHTML = `
        <div class="flex items-center justify-between leading-none">
            <span class="font-extrabold text-xs sm:text-sm" style="color: ${suit.color}">${rank}</span>
            <span class="text-xs sm:text-sm" style="color: ${suit.color}">${suit.symbol}</span>
        </div>

        <div class="text-center">
            <span class="text-lg sm:text-2xl leading-none" style="color: ${suit.color}">${suit.symbol}</span>
            ${badgeText ? `<div class="text-[7px] sm:text-[9px] font-black uppercase tracking-tighter px-1 rounded ${twoEyed ? 'bg-amber-200 text-amber-950' : oneEyed ? 'bg-red-200 text-red-950' : 'bg-red-100 text-red-700'}">${badgeText}</div>` : ''}
        </div>

        <div class="flex items-center justify-between leading-none transform rotate-180">
            <span class="font-extrabold text-xs sm:text-sm" style="color: ${suit.color}">${rank}</span>
            <span class="text-xs sm:text-sm" style="color: ${suit.color}">${suit.symbol}</span>
        </div>
    `;

    return cardEl;
}

// Dead Card Check Rule
function isCardDead(cardCode) {
    if (!localGameState || !localGameState.board) return false;
    if (isTwoEyedJack(cardCode) || isOneEyedJack(cardCode)) return false; // Jacks never die

    const board = localGameState.board;
    let occurrences = 0;
    let covered = 0;

    for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 10; c++) {
            if (SEQUENCE_BOARD_LAYOUT[r][c] === cardCode) {
                occurrences++;
                if (board[r][c] !== null) covered++;
            }
        }
    }

    return occurrences > 0 && covered === occurrences;
}

// Handle Dead Card Swap
async function handleDeadCardSwap(cardIndex) {
    if (!isCurrentPlayerTurn()) {
        showActionPrompt("⏳ You can only swap a dead card on your turn!");
        return;
    }

    const currentHand = getCurrentPlayerHand();
    const deadCard = currentHand[cardIndex];

    // Discard dead card
    localGameState.discard_pile.unshift({
        player: myRole,
        card: deadCard,
        type: 'dead_swap',
        timestamp: new Date().toISOString()
    });

    // Draw replacement
    let newCard = drawCardFromDeck();
    if (newCard) {
        currentHand[cardIndex] = newCard;
    }

    playCardSound();
    showActionPrompt(`💀 Dead card (${deadCard}) swapped for a fresh card! You can now make your move.`);
    selectedCardIndex = null;

    await persistAndBroadcastGameState(localGameState);
    renderBoard();
    renderHands();
}

// Helper to draw card
function drawCardFromDeck() {
    if (!localGameState.deck || localGameState.deck.length === 0) {
        // Reshuffle discard pile into deck if empty
        if (localGameState.discard_pile && localGameState.discard_pile.length > 0) {
            const newDeck = localGameState.discard_pile.map(d => d.card);
            localGameState.discard_pile = [];
            for (let i = newDeck.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
            }
            localGameState.deck = newDeck;
        } else {
            return null;
        }
    }
    return localGameState.deck.pop();
}

// Handle Board Cell Click
async function handleBoardCellClick(r, c) {
    if (!localGameState || localGameState.winner) return;

    if (!isCurrentPlayerTurn()) {
        showActionPrompt("⏳ Opponent's turn! Please wait.");
        return;
    }

    if (selectedCardIndex === null) {
        showActionPrompt("👉 Select a card from your hand first!");
        return;
    }

    const currentHand = getCurrentPlayerHand();
    const cardCode = currentHand[selectedCardIndex];
    const cellCard = SEQUENCE_BOARD_LAYOUT[r][c];
    const currentOccupant = localGameState.board[r][c];
    const lockedSet = new Set(localGameState.locked_chips || []);
    const isLocked = lockedSet.has(`${r},${c}`);
    const isCorner = cellCard === 'CORNER';

    let moveValid = false;
    let moveType = 'place';

    // 1. Two-Eyed Jack (Wild)
    if (isTwoEyedJack(cardCode)) {
        if (!currentOccupant && !isCorner) {
            localGameState.board[r][c] = myRole;
            moveValid = true;
            playChipSound();
        }
    }
    // 2. One-Eyed Jack (Remover)
    else if (isOneEyedJack(cardCode)) {
        const opponentRole = myRole === 'player1' ? 'player2' : 'player1';
        if (currentOccupant === opponentRole && !isLocked) {
            localGameState.board[r][c] = null;
            moveValid = true;
            moveType = 'remove';
            playRemoveSound();
        } else if (isLocked) {
            showActionPrompt("🛡️ Cannot remove! That chip is locked in a completed sequence.");
            return;
        }
    }
    // 3. Regular Card
    else {
        if (cellCard === cardCode && !currentOccupant) {
            localGameState.board[r][c] = myRole;
            moveValid = true;
            playChipSound();
        }
    }

    if (!moveValid) {
        showActionPrompt("❌ Invalid space for this card! Choose a highlighted space.");
        return;
    }

    // Move is valid! Update game state
    // Discard played card
    localGameState.discard_pile.unshift({
        player: myRole,
        card: cardCode,
        row: r,
        col: c,
        type: moveType,
        timestamp: new Date().toISOString()
    });

    // Draw new card for player
    const drawn = drawCardFromDeck();
    if (drawn) {
        currentHand[selectedCardIndex] = drawn;
    } else {
        currentHand.splice(selectedCardIndex, 1);
    }
    selectedCardIndex = null;

    // Record last move
    localGameState.last_move = {
        player: myRole,
        card: cardCode,
        row: r,
        col: c,
        type: moveType
    };

    // Check sequences
    checkAndAwardSequences();

    // Switch turn (unless game won)
    if (!localGameState.winner) {
        localGameState.current_turn = myRole === 'player1' ? 'player2' : 'player1';
    }

    localGameState.updated_at = new Date().toISOString();

    // Persist & Broadcast
    await persistAndBroadcastGameState(localGameState);

    renderBoard();
    renderHands();
    updateScoreboard();

    // Check winner celebration
    if (localGameState.winner) {
        showVictoryModal(localGameState.winner);
    } else if (gameMode === 'ai' && localGameState.current_turn === 'player2') {
        // Trigger AI Turn
        setTimeout(runAITurn, 900);
    } else if (gameMode === 'pass_and_play') {
        // Switch role for next player
        myRole = localGameState.current_turn;
        renderHands();
        renderBoard();
    }
}

// Sequence Detection Engine
function checkAndAwardSequences() {
    const board = localGameState.board;
    const p1Seqs = findSequencesForPlayer(board, 'player1');
    const p2Seqs = findSequencesForPlayer(board, 'player2');

    localGameState.player1_sequences = p1Seqs.length;
    localGameState.player2_sequences = p2Seqs.length;

    // Collect all locked chips from completed sequences
    const allLocked = new Set();
    [...p1Seqs, ...p2Seqs].forEach(seq => {
        seq.coords.forEach(([r, c]) => {
            if (SEQUENCE_BOARD_LAYOUT[r][c] !== 'CORNER') {
                allLocked.add(`${r},${c}`);
            }
        });
    });
    localGameState.locked_chips = Array.from(allLocked);

    // Check win condition (Official Sequence requires target sequences, default 2)
    const target = localGameState.target_sequences || 2;
    if (localGameState.player1_sequences >= target) {
        localGameState.winner = 'player1';
        localGameState.status = 'finished';
    } else if (localGameState.player2_sequences >= target) {
        localGameState.winner = 'player2';
        localGameState.status = 'finished';
    } else {
        localGameState.winner = null;
        localGameState.status = 'active';
    }
}

// Helper: check if coordinate is a board corner space
function isCornerSpace(r, c) {
    return (r === 0 || r === 9) && (c === 0 || c === 9);
}

// Check if two sequences are legally compatible per official Sequence rules:
// - Between any two sequences, at most ONE non-corner space may be shared.
// - A straight line of 6, 7, or 8 chips is ONLY ONE sequence.
function areSequencesCompatible(seqA, seqB) {
    let sharedNonCornerCount = 0;
    for (const [rA, cA] of seqA.coords) {
        if (isCornerSpace(rA, cA)) continue;
        for (const [rB, cB] of seqB.coords) {
            if (rA === rB && cA === cB) {
                sharedNonCornerCount++;
                if (sharedNonCornerCount > 1) return false;
            }
        }
    }
    return true;
}

// Find maximal collection of mutually compatible sequences
function getMaxMutuallyCompatibleSequences(candidates) {
    if (!candidates || candidates.length === 0) return [];
    if (candidates.length === 1) return [candidates[0]];

    let bestSet = [];

    function search(startIdx, currentSet, chipUsageMap) {
        if (currentSet.length > bestSet.length) {
            bestSet = [...currentSet];
        }
        // Sequence game targets at most 2 sequences (official win condition)
        if (bestSet.length >= 2) return;

        for (let i = startIdx; i < candidates.length; i++) {
            const cand = candidates[i];

            // 1. Must share at most 1 non-corner chip with every already-chosen sequence
            let isCompatible = true;
            for (const chosen of currentSet) {
                if (!areSequencesCompatible(chosen, cand)) {
                    isCompatible = false;
                    break;
                }
            }
            if (!isCompatible) continue;

            // 2. No individual chip may be used in more than 2 sequences total
            let chipOverused = false;
            for (const [r, c] of cand.coords) {
                if (isCornerSpace(r, c)) continue;
                const count = chipUsageMap.get(`${r},${c}`) || 0;
                if (count >= 2) {
                    chipOverused = true;
                    break;
                }
            }
            if (chipOverused) continue;

            // Add candidate to set
            for (const [r, c] of cand.coords) {
                if (!isCornerSpace(r, c)) {
                    chipUsageMap.set(`${r},${c}`, (chipUsageMap.get(`${r},${c}`) || 0) + 1);
                }
            }
            currentSet.push(cand);

            search(i + 1, currentSet, chipUsageMap);

            // Backtrack
            currentSet.pop();
            for (const [r, c] of cand.coords) {
                if (!isCornerSpace(r, c)) {
                    const count = chipUsageMap.get(`${r},${c}`) - 1;
                    if (count <= 0) chipUsageMap.delete(`${r},${c}`);
                    else chipUsageMap.set(`${r},${c}`, count);
                }
            }
        }
    }

    search(0, [], new Map());
    return bestSet;
}

// Find all unique valid sequences for player
function findSequencesForPlayer(board, player) {
    const candidates = [];

    // Direction vectors: Horizontal [0,1], Vertical [1,0], Diagonal DR [1,1], Diagonal UR [-1,1]
    const directions = [
        [0, 1],   // Horizontal
        [1, 0],   // Vertical
        [1, 1],   // Diagonal Down-Right
        [-1, 1]   // Diagonal Up-Right
    ];

    for (const [dr, dc] of directions) {
        for (let r = 0; r < 10; r++) {
            for (let c = 0; c < 10; c++) {
                const endR = r + 4 * dr;
                const endC = c + 4 * dc;

                if (endR < 0 || endR >= 10 || endC < 0 || endC >= 10) continue;

                // Check 5 consecutive spaces
                let valid = true;
                const coords = [];
                let nonCornerCount = 0;

                for (let step = 0; step < 5; step++) {
                    const currR = r + step * dr;
                    const currC = c + step * dc;
                    coords.push([currR, currC]);

                    if (isCornerSpace(currR, currC)) {
                        // Corner counts as wild for both players
                    } else {
                        nonCornerCount++;
                        if (board[currR][currC] !== player) {
                            valid = false;
                            break;
                        }
                    }
                }

                // A valid sequence must have at least 3 actual chips (if 2 corners) or 4 (if 1 corner) or 5 (no corners)
                if (valid && nonCornerCount >= 3) {
                    candidates.push({ coords });
                }
            }
        }
    }

    return getMaxMutuallyCompatibleSequences(candidates);
}

// AI Player Logic (Play vs Sanyam AI or Himi AI)
async function runAITurn() {
    if (!localGameState || localGameState.winner) return;

    const aiRole = 'player2';
    const opponentRole = 'player1';
    const hand = localGameState.player2_hand;
    const board = localGameState.board;
    const lockedSet = new Set(localGameState.locked_chips || []);

    // 1. Check if AI holds any dead card; if so, swap it first!
    for (let i = 0; i < hand.length; i++) {
        if (isCardDead(hand[i])) {
            const deadCard = hand[i];
            localGameState.discard_pile.unshift({
                player: aiRole,
                card: deadCard,
                type: 'dead_swap',
                timestamp: new Date().toISOString()
            });
            const drawn = drawCardFromDeck();
            if (drawn) hand[i] = drawn;
            showActionPrompt(`🤖 AI swapped a dead card (${deadCard})!`);
            break;
        }
    }

    // 2. Evaluate all legal moves for AI
    let bestMove = null;
    let highestScore = -Infinity;

    hand.forEach((card, cardIdx) => {
        if (isTwoEyedJack(card)) {
            // Wild: evaluate any open space
            for (let r = 0; r < 10; r++) {
                for (let c = 0; c < 10; c++) {
                    if (!board[r][c] && SEQUENCE_BOARD_LAYOUT[r][c] !== 'CORNER') {
                        const score = evaluateBoardMove(r, c, aiRole, opponentRole);
                        if (score > highestScore) {
                            highestScore = score;
                            bestMove = { cardIdx, r, c, type: 'place' };
                        }
                    }
                }
            }
        } else if (isOneEyedJack(card)) {
            // Remover: remove best opponent chip
            for (let r = 0; r < 10; r++) {
                for (let c = 0; c < 10; c++) {
                    if (board[r][c] === opponentRole && !lockedSet.has(`${r},${c}`)) {
                        const score = evaluateRemoval(r, c, opponentRole);
                        if (score > highestScore) {
                            highestScore = score;
                            bestMove = { cardIdx, r, c, type: 'remove' };
                        }
                    }
                }
            }
        } else {
            // Regular card
            for (let r = 0; r < 10; r++) {
                for (let c = 0; c < 10; c++) {
                    if (SEQUENCE_BOARD_LAYOUT[r][c] === card && !board[r][c]) {
                        const score = evaluateBoardMove(r, c, aiRole, opponentRole);
                        if (score > highestScore) {
                            highestScore = score;
                            bestMove = { cardIdx, r, c, type: 'place' };
                        }
                    }
                }
            }
        }
    });

    // Fallback: pick any valid move
    if (!bestMove && hand.length > 0) {
        bestMove = { cardIdx: 0, r: 1, c: 1, type: 'place' };
    }

    // Execute AI Move
    if (bestMove) {
        const cardCode = hand[bestMove.cardIdx];
        if (bestMove.type === 'remove') {
            localGameState.board[bestMove.r][bestMove.c] = null;
            playRemoveSound();
            showActionPrompt(`🤖 AI used One-Eyed Jack! Removed chip at [${bestMove.r + 1}, ${bestMove.c + 1}] 😱`);
        } else {
            localGameState.board[bestMove.r][bestMove.c] = aiRole;
            playChipSound();
            showActionPrompt(`🤖 AI played ${cardCode} at [${bestMove.r + 1}, ${bestMove.c + 1}] ✨`);
        }

        localGameState.discard_pile.unshift({
            player: aiRole,
            card: cardCode,
            row: bestMove.r,
            col: bestMove.c,
            type: bestMove.type,
            timestamp: new Date().toISOString()
        });

        // Draw new card for AI
        const drawn = drawCardFromDeck();
        if (drawn) {
            hand[bestMove.cardIdx] = drawn;
        } else {
            hand.splice(bestMove.cardIdx, 1);
        }

        localGameState.last_move = {
            player: aiRole,
            card: cardCode,
            row: bestMove.r,
            col: bestMove.c,
            type: bestMove.type
        };

        checkAndAwardSequences();
        localGameState.current_turn = 'player1';
        localGameState.updated_at = new Date().toISOString();

        renderBoard();
        renderHands();
        updateScoreboard();

        if (localGameState.winner) {
            showVictoryModal(localGameState.winner);
        }
    }
}

// AI Heuristic: Evaluate value of placing chip at r,c
function evaluateBoardMove(r, c, me, opponent) {
    let score = Math.random() * 5; // slight variance
    // Prefer center spaces
    const distFromCenter = Math.abs(r - 4.5) + Math.abs(c - 4.5);
    score += (10 - distFromCenter) * 2;

    // Check streak potential in all 4 directions
    const directions = [[0, 1], [1, 0], [1, 1], [-1, 1]];
    for (const [dr, dc] of directions) {
        let myChips = 0;
        let oppChips = 0;
        for (let step = -4; step <= 4; step++) {
            const nr = r + step * dr;
            const nc = c + step * dc;
            if (nr >= 0 && nr < 10 && nc >= 0 && nc < 10) {
                if (localGameState.board[nr][nc] === me) myChips++;
                if (localGameState.board[nr][nc] === opponent) oppChips++;
            }
        }
        // Winning streak priority
        if (myChips >= 4) score += 1000;
        else if (myChips === 3) score += 120;
        else if (myChips === 2) score += 30;

        // Block opponent priority
        if (oppChips >= 4) score += 800;
        else if (oppChips === 3) score += 90;
    }
    return score;
}

// AI Heuristic: Evaluate value of removing opponent chip
function evaluateRemoval(r, c, opponent) {
    let score = 50;
    const directions = [[0, 1], [1, 0], [1, 1], [-1, 1]];
    for (const [dr, dc] of directions) {
        let oppChips = 0;
        for (let step = -3; step <= 3; step++) {
            const nr = r + step * dr;
            const nc = c + step * dc;
            if (nr >= 0 && nr < 10 && nc >= 0 && nc < 10) {
                if (localGameState.board[nr][nc] === opponent) oppChips++;
            }
        }
        if (oppChips >= 4) score += 500;
        else if (oppChips === 3) score += 150;
    }
    return score;
}

// Persist and Broadcast Game State
async function persistAndBroadcastGameState(state) {
    // 1. Broadcast over Supabase Realtime Channel for instant cross-device updates
    if (realtimeChannel) {
        try {
            realtimeChannel.send({
                type: 'broadcast',
                event: 'game_update',
                payload: state
            });
        } catch (e) {
            console.warn('Broadcast send error:', e);
        }
    }

    // 2. Persist to Supabase Database table
    if (gameMode === 'online') {
        try {
            const client = await getSupabaseClient();
            if (client) {
                await client.from('sequence_games').upsert(state);
            }
        } catch (err) {
            console.warn('Supabase DB upsert error:', err);
        }
    }

    // 3. Save to localStorage fallback
    try {
        localStorage.setItem(`sequence_game_${activeRoomId}`, JSON.stringify(state));
    } catch (e) {}
}

// Send Live Reaction Emojis Across Devices
function sendLiveReaction(emoji) {
    showFloatingReaction(emoji, true);
    playTone(520, 'sine', 0.1, 0.2);

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
    const randomLeft = Math.random() * 60 + 20; // 20% to 80%
    el.style.left = `${randomLeft}%`;
    el.style.bottom = isSelf ? '110px' : '40%';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2500);
}

// Scoreboard & Turn UI Updates
function updateScoreboard() {
    if (!localGameState) return;

    const p1Count = document.getElementById('p1-sequence-count');
    const p2Count = document.getElementById('p2-sequence-count');
    const p1Card = document.getElementById('p1-score-card');
    const p2Card = document.getElementById('p2-score-card');
    const turnBanner = document.getElementById('turn-banner');
    const deckCount = document.getElementById('deck-count-text');
    const discardText = document.getElementById('discard-last-text');

    if (p1Count) p1Count.textContent = localGameState.player1_sequences || 0;
    if (p2Count) p2Count.textContent = localGameState.player2_sequences || 0;
    if (deckCount) deckCount.textContent = localGameState.deck ? localGameState.deck.length : 0;

    if (discardText) {
        if (localGameState.discard_pile && localGameState.discard_pile.length > 0) {
            const last = localGameState.discard_pile[0];
            discardText.innerHTML = `Discard: <strong class="text-customAccent">${last.card} (${last.player === 'player1' ? 'Sanyam' : 'Himi'})</strong> 🎴`;
        } else {
            discardText.innerHTML = `Discard: <strong>None</strong>`;
        }
    }

    const isP1Turn = localGameState.current_turn === 'player1';
    if (p1Card && p2Card) {
        if (isP1Turn) {
            p1Card.classList.add('ring-3', 'ring-customAccent', 'scale-[1.03]');
            p2Card.classList.remove('ring-3', 'ring-player2Color', 'scale-[1.03]');
        } else {
            p2Card.classList.add('ring-3', 'ring-player2Color', 'scale-[1.03]');
            p1Card.classList.remove('ring-3', 'ring-customAccent', 'scale-[1.03]');
        }
    }

    if (turnBanner) {
        if (localGameState.winner) {
            turnBanner.className = 'text-xs sm:text-sm font-black px-4 py-1 rounded-full bg-emerald-500 text-white shadow-sm';
            turnBanner.textContent = localGameState.winner === 'player1' ? 'Sanyam Won! 🏆' : 'Himi Won! 🏆';
        } else if (isCurrentPlayerTurn()) {
            turnBanner.className = 'text-xs sm:text-sm font-black px-4 py-1 rounded-full bg-emerald-200 text-emerald-950 border border-emerald-400 shadow-sm animate-pulse';
            turnBanner.textContent = '🎯 Your Turn! Play a card';
        } else {
            const oppName = myRole === 'player1' ? 'Himi' : 'Sanyam';
            turnBanner.className = 'text-xs sm:text-sm font-black px-4 py-1 rounded-full bg-amber-100 text-amber-950 border border-amber-300 shadow-sm';
            turnBanner.textContent = `💭 Waiting for ${oppName}...`;
        }
    }
}

// Update Action Prompt Text
function updateActionPromptForSelection() {
    if (selectedCardIndex === null) {
        showActionPrompt("Select a card from your hand below to see matching board spaces!");
        return;
    }
    const currentHand = getCurrentPlayerHand();
    const card = currentHand[selectedCardIndex];

    if (isTwoEyedJack(card)) {
        showActionPrompt("👑 Two-Eyed Jack selected! Tap ANY open space to place your wild chip.");
    } else if (isOneEyedJack(card)) {
        showActionPrompt("⚔️ One-Eyed Jack selected! Tap an opponent's chip to remove it.");
    } else {
        showActionPrompt(`🎯 Playing ${card}! Tap one of the matching glowing spaces on the board.`);
    }
}

function showActionPrompt(msg) {
    const el = document.getElementById('action-prompt');
    if (el) el.innerHTML = `<span>${msg}</span>`;
}

// Current player helpers
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

function getOpponentHand() {
    if (!localGameState) return [];
    if (gameMode === 'pass_and_play') {
        return localGameState.current_turn === 'player1' ? localGameState.player2_hand : localGameState.player1_hand;
    }
    return myRole === 'player1' ? localGameState.player2_hand : localGameState.player1_hand;
}

// Victory Modal
function showVictoryModal(winner) {
    const modal = document.getElementById('victory-modal');
    const title = document.getElementById('winner-title');
    const sub = document.getElementById('winner-subtitle');
    if (!modal) return;

    playWinSound();
    triggerConfettiMega();

    const isWinnerP1 = winner === 'player1';
    if (title) {
        title.textContent = isWinnerP1 ? 'Sanyam Wins! 🔵' : 'Himi Wins! 🌸';
        title.style.color = isWinnerP1 ? '#243B8F' : '#E25B7B';
    }
    if (sub) {
        sub.textContent = isWinnerP1
            ? 'Completed the target sequences! Time for that promised sunset ice cream date! 🍦🌅'
            : 'Himi reigns supreme! Sanyam must cook whatever she desires from scratch! 🍳❤️';
    }

    modal.classList.remove('hidden');
}

// Rematch Game
async function rematchGame() {
    const modal = document.getElementById('victory-modal');
    if (modal) modal.classList.add('hidden');

    localGameState = createInitialGameState(activeRoomId, targetSequencesRule);
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
        sessionStorage.removeItem('sequence_joined_session_' + activeRoomId);
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
    if (!confirm("Start a new game with fresh cards and clear board?")) return;
    localGameState = createInitialGameState(activeRoomId, targetSequencesRule || 2);
    await persistAndBroadcastGameState(localGameState);
    renderActiveGame();
    showActionPrompt("🔄 Fresh game started! Target: 2 Sequences 🏆");
}

// Share Links
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
    const msg = `Hey ${recipientName}! 🥰 I set up our Sequence game board! Tap here to join me in Room "${activeRoomId}":\n\n${url}\n\nGet ready for some serious competition! ❤️🎲`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
}

// Discard History Modal
function showDiscardModal() {
    const modal = document.getElementById('discard-modal');
    const list = document.getElementById('discard-history-list');
    if (!modal || !list || !localGameState) return;

    const pile = localGameState.discard_pile || [];
    if (pile.length === 0) {
        list.innerHTML = `<p class="py-4 text-center opacity-70">No cards discarded yet.</p>`;
    } else {
        list.innerHTML = pile.map((item, idx) => `
            <div class="flex items-center justify-between p-1.5 rounded bg-white border border-customAccent/20">
                <span class="font-extrabold text-customAccent">${item.card}</span>
                <span class="text-[11px] font-bold opacity-80">${item.player === 'player1' ? 'Sanyam 🔵' : 'Himi 🌸'} (${item.type || 'place'})</span>
            </div>
        `).join('');
    }
    modal.classList.remove('hidden');
}

function hideDiscardModal() {
    const modal = document.getElementById('discard-modal');
    if (modal) modal.classList.add('hidden');
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
