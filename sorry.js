// ==============================================================================
// Dear Himi, I'm Truly Sorry - Interactive Logic & Audio
// ==============================================================================

let currentCard = 1;
let claimedTreats = new Set();
let dodgeCount = 0;
let isSoundEnabled = localStorage.getItem('sorry_sound_muted') !== 'true';

// ------------------------------------------------------------------------------
// 1. Audio Synthesizer (Web Audio API - zero external audio dependencies)
// ------------------------------------------------------------------------------
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

function playChime() {
    playTone(523.25, 'sine', 0.12, 0.15); // C5
    setTimeout(() => playTone(659.25, 'sine', 0.18, 0.15), 60); // E5
}

function playBoop() {
    playTone(280, 'sawtooth', 0.1, 0.12);
}

function playSuccessChime() {
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((f, idx) => {
        setTimeout(() => playTone(f, 'triangle', 0.2, 0.2), idx * 80);
    });
}

function playCelebrationFanfare() {
    if (!isSoundEnabled) return;
    const melody = [
        { f: 523.25, d: 150 }, // C5
        { f: 659.25, d: 150 }, // E5
        { f: 783.99, d: 150 }, // G5
        { f: 1046.50, d: 350 }, // C6
        { f: 880.00, d: 150 }, // A5
        { f: 1046.50, d: 500 } // C6
    ];
    let time = 0;
    melody.forEach((note) => {
        setTimeout(() => playTone(note.f, 'triangle', note.d / 1000, 0.25), time);
        time += note.d * 0.9;
    });
}

function toggleSound() {
    isSoundEnabled = !isSoundEnabled;
    localStorage.setItem('sorry_sound_muted', (!isSoundEnabled).toString());
    const icon = document.getElementById('sound-icon');
    if (icon) icon.textContent = isSoundEnabled ? '🔊' : '🔇';
    if (isSoundEnabled) playTone(580, 'sine', 0.1, 0.15);
}

// ------------------------------------------------------------------------------
// 2. Background Floating Hearts & Books
// ------------------------------------------------------------------------------
const booksContainer = document.getElementById('books-container');

function createFloatingItem() {
    if (!booksContainer || booksContainer.children.length >= 14) return;

    const item = document.createElement('div');
    item.classList.add('floating-book');

    const isHeart = Math.random() > 0.4;
    if (isHeart) {
        item.innerHTML = `
            <svg viewBox="0 0 24 24" fill="currentColor" class="w-full h-full text-pink-300/40">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
        `;
    } else {
        item.innerHTML = `
            <svg viewBox="0 0 24 24" fill="currentColor" class="w-full h-full text-[#243B8F]/15">
                <path d="M12 6c-3.18-2.07-7.46-2.58-10-2.58v13.5c2.54 0 6.82.51 10 2.58 3.18-2.07 7.46-2.58 10-2.58V3.42c-2.54 0-6.82.51-10 2.58zm9 11c-2.27 0-6.15.54-8 1.39V7.07c1.85-.85 5.73-1.39 8-1.39v11.32zM3 17V5.68c2.27 0 6.15.54 8 1.39v10.93c-1.85-.85-5.73-1.39-8-1.39z"/>
            </svg>
        `;
    }

    const left = Math.random() * 84 + 8;
    const size = Math.random() * 22 + 16;
    const drift = (Math.random() - 0.5) * 80;
    const rot = (Math.random() - 0.5) * 200;
    const dur = Math.random() * 5 + 6;

    item.style.left = `${left}%`;
    item.style.width = `${size}px`;
    item.style.height = `${size}px`;
    item.style.setProperty('--random-x', `${drift}px`);
    item.style.setProperty('--random-rot', `${rot}deg`);
    item.style.setProperty('--random-scale', `${Math.random() * 0.5 + 0.7}`);
    item.style.animationDuration = `${dur}s`;

    booksContainer.appendChild(item);
    setTimeout(() => item.remove(), dur * 1000);
}

setInterval(createFloatingItem, 900);

// ------------------------------------------------------------------------------
// 3. Card Navigation & Stepper
// ------------------------------------------------------------------------------
function goToCard(cardIndex) {
    if (cardIndex < 1 || cardIndex > 6) return;

    // Hide all cards
    for (let i = 1; i <= 6; i++) {
        const card = document.getElementById(`sorry-card-${i}`);
        if (card) card.classList.add('hidden');
    }

    // Show target card
    const targetCard = document.getElementById(`sorry-card-${cardIndex}`);
    if (targetCard) {
        targetCard.classList.remove('hidden');
    }

    // Update Stepper Pills
    for (let i = 1; i <= 5; i++) {
        const pill = document.getElementById(`step-pill-${i}`);
        if (pill) {
            if (i === cardIndex || (cardIndex === 6 && i === 5)) {
                pill.className = 'step-pill active text-[11px] sm:text-xs font-extrabold px-3 py-1 rounded-full border-2 border-customAccent bg-customAccent text-customBg transition-all shadow-[2px_2px_0px_0px_rgba(36,59,143,0.3)]';
            } else {
                pill.className = 'step-pill text-[11px] sm:text-xs font-extrabold px-3 py-1 rounded-full border-2 border-customAccent bg-white text-customAccent transition-all shadow-xs hover:bg-amber-50';
            }
        }
    }

    currentCard = cardIndex;
    playChime();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ------------------------------------------------------------------------------
// 4. Claim Peace Offerings
// ------------------------------------------------------------------------------
function claimPeaceTreat(element, treatTitle) {
    if (!element) return;

    const isClaimed = element.classList.contains('claimed');
    const badge = element.querySelector('.claim-badge');

    if (isClaimed) {
        // Unclaim
        element.classList.remove('claimed', 'bg-emerald-50', 'border-emerald-600');
        element.classList.add('bg-white', 'border-customAccent');
        if (badge) {
            badge.className = 'claim-badge text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-amber-100 text-amber-950 border border-amber-300';
            badge.textContent = 'Claim 🎁';
        }
        claimedTreats.delete(treatTitle);
        playBoop();
    } else {
        // Claim
        element.classList.add('claimed', 'bg-emerald-50', 'border-emerald-600');
        element.classList.remove('bg-white', 'border-customAccent');
        if (badge) {
            badge.className = 'claim-badge text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-600 text-white border border-emerald-700 shadow-xs animate-bounce';
            badge.textContent = 'Claimed! ✅';
        }
        claimedTreats.add(treatTitle);
        playSuccessChime();
        triggerMiniConfetti();
    }

    // Update count display
    const counterEl = document.getElementById('claimed-count-num');
    if (counterEl) {
        counterEl.textContent = claimedTreats.size;
    }
}

// ------------------------------------------------------------------------------
// 5. Playful "Nope" Button Dodging
// ------------------------------------------------------------------------------
const DODGE_RESPONSES = [
    { text: "Wait! What if I throw in extra ice cream? 🍦🥺", emoji: "🥺" },
    { text: "Please don't stay mad at your favorite idiot! 🙈", emoji: "🙈" },
    { text: "Chef Sanyam kitchen takeover on demand! 🍳", emoji: "🍳" },
    { text: "Unlimited warm hugs & zero nagging forever! 🫂", emoji: "🫂" },
    { text: "Look at this face 🥺👉👈 How can you resist?", emoji: "🥺" },
    { text: "Okay, the button is shrinking... you have to say yes! 😂", emoji: "😂" },
    { text: "Come on Himi, you know you love me! ❤️", emoji: "❤️" }
];

function dodgeNoButton() {
    dodgeCount++;
    playBoop();

    const noBtn = document.getElementById('forgive-no-btn');
    const subtext = document.getElementById('forgive-subtext');
    const emoji = document.getElementById('forgive-emoji');
    const yesBtn = document.getElementById('forgive-yes-btn');

    // Get response data
    const resp = DODGE_RESPONSES[(dodgeCount - 1) % DODGE_RESPONSES.length];
    if (subtext) {
        subtext.textContent = resp.text;
        subtext.style.color = '#E25B7B';
        subtext.classList.add('font-black');
    }
    if (emoji) {
        emoji.textContent = resp.emoji;
    }

    // Shrink No button slightly, grow Yes button
    if (noBtn) {
        const randomX = (Math.random() - 0.5) * 120;
        const randomY = (Math.random() - 0.5) * 60;
        const scale = Math.max(0.65, 1 - dodgeCount * 0.06);

        noBtn.style.transform = `translate(${randomX}px, ${randomY}px) scale(${scale})`;
    }

    if (yesBtn) {
        const yesScale = Math.min(1.25, 1 + dodgeCount * 0.05);
        yesBtn.style.transform = `scale(${yesScale})`;
    }
}

// ------------------------------------------------------------------------------
// 6. Celebrate Forgiveness
// ------------------------------------------------------------------------------
function celebrateForgiveness() {
    playCelebrationFanfare();
    triggerMegaConfetti();
    goToCard(6);
}

// ------------------------------------------------------------------------------
// 7. WhatsApp Quick Message
// ------------------------------------------------------------------------------
function sendForgivenessWhatsApp() {
    const claimedList = Array.from(claimedTreats);
    let extraText = '';
    if (claimedList.length > 0) {
        extraText = ` I've also officially claimed my peace offerings: ${claimedList.join(', ')}! 🎁`;
    }

    const message = `Hey Sanyam 🥰 I read your sorry letter... and yes, I forgive you! ❤️ But you owe me big time!${extraText} See you soon! 🍦🏖️`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// ------------------------------------------------------------------------------
// 8. Confetti Bursts
// ------------------------------------------------------------------------------
function triggerMiniConfetti() {
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 40,
            spread: 60,
            origin: { y: 0.65 },
            colors: ['#243B8F', '#FFF0C9', '#E25B7B', '#10B981']
        });
    }
}

function triggerMegaConfetti() {
    if (typeof confetti === 'function') {
        const duration = 4 * 1000;
        const animationEnd = Date.now() + duration;
        const colors = ['#243B8F', '#FFF0C9', '#E25B7B', '#10B981', '#F59E0B'];

        const interval = setInterval(function() {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);

            confetti({
                particleCount: 45,
                startVelocity: 35,
                spread: 360,
                origin: { x: Math.random(), y: Math.random() - 0.2 },
                colors: colors
            });
        }, 220);
    }
}

// ------------------------------------------------------------------------------
// Initial Setup on DOMContentLoaded
// ------------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    const icon = document.getElementById('sound-icon');
    if (icon) icon.textContent = isSoundEnabled ? '🔊' : '🔇';
    goToCard(1);
});
