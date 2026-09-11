// ==============================================================================
// Himi's Digital Scratch-Off Coupons - JavaScript & Canvas Physics
// ==============================================================================

let coupons = [];
let activeFilter = 'all';
let realtimeChannel = null;

// Background floating books spawner
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

    const leftPosition = Math.random() * 100;
    const size = Math.random() * 24 + 12;
    const drift = (Math.random() - 0.5) * 150;
    const rotation = (Math.random() - 0.5) * 360;
    const duration = Math.random() * 5 + 5;

    book.style.left = `${leftPosition}%`;
    book.style.width = `${size}px`;
    book.style.height = `${size}px`;

    book.style.setProperty('--random-x', `${drift}px`);
    book.style.setProperty('--random-rot', `${rotation}deg`);
    book.style.setProperty('--random-scale', `${Math.random() * 0.7 + 0.6}`);
    book.style.animationDuration = `${duration}s`;

    booksContainer.appendChild(book);

    setTimeout(() => {
        book.remove();
    }, duration * 1000);
}

setInterval(createFloatingBook, 600);

// Default starter coupons
const STARTER_COUPONS = [
    {
        id: '1',
        title: 'One spontaneous sunset beach run with ice cream',
        hint: '🏖️ Sunsets, beach breeze & cold sweet treats',
        description: 'Redeemable for one immediate sunset escape to the beach with your favorite ice cream in hand! 🍦🌅',
        icon: '🍦',
        is_scratched: false,
        is_redeemed: false,
        redeemed_at: null
    },
    {
        id: '2',
        title: 'Free pass to skip 1 health lecture from Sanyam',
        hint: '🤐 Zero nagging about medicines, glasses & coffee!',
        description: 'Total peace & quiet pass: zero comments or lectures about medicines, glasses, or coffee for the whole day! 😂',
        icon: '🤐',
        is_scratched: false,
        is_redeemed: false,
        redeemed_at: null
    },
    {
        id: '3',
        title: 'Sanyam cooks whatever you want from scratch',
        hint: '🍳 Chef Sanyam kitchen takeover on demand',
        description: 'Chef Sanyam is at your command! Pick whatever meal or dessert your heart desires, cooked completely from scratch 🍳',
        icon: '🍳',
        is_scratched: false,
        is_redeemed: false,
        redeemed_at: null
    },
    {
        id: '4',
        title: 'Bookstore date: Sanyam buys you any book you pick',
        hint: '📚 Cozy bookstore wander & free book pick',
        description: 'A cozy bookstore afternoon where Sanyam buys any book that catches your eye, no questions asked 📚',
        icon: '📚',
        is_scratched: false,
        is_redeemed: false,
        redeemed_at: null
    },
    {
        id: '5',
        title: 'Late night drive with your playlist on blast',
        hint: '🚗 City lights, windows down & loud tunes',
        description: 'Windows down, beach breeze, city lights, and your songs playing as loud as you want 🚗💨',
        icon: '🚗',
        is_scratched: false,
        is_redeemed: false,
        redeemed_at: null
    },
    {
        id: '6',
        title: 'Undercover office coffee delivery by Sanyam',
        hint: '☕ Secret desk coffee run during a busy day',
        description: 'Sanyam sneaks to your desk with your favorite iced beverage during a busy workday ☕❤️',
        icon: '☕',
        is_scratched: false,
        is_redeemed: false,
        redeemed_at: null
    },
    {
        id: '7',
        title: 'Movie night dictator pass: you pick the movie & snacks',
        hint: '🎬 Total screen veto power & snack monopoly',
        description: 'Full veto power over what we watch and all snacks. Zero complaints allowed from Sanyam! 🎬🍿',
        icon: '🎬',
        is_scratched: false,
        is_redeemed: false,
        redeemed_at: null
    },
    {
        id: '8',
        title: 'Spontaneous beach picnic with all your favorite treats',
        hint: '🧺 Blanket on the sand & basket full of bites',
        description: 'Blanket on the sand, cool sea breeze, and a picnic basket filled with everything you love 🧺🏖️',
        icon: '🧺',
        is_scratched: false,
        is_redeemed: false,
        redeemed_at: null
    }
];

// Helper to determine or auto-generate hint
function getCouponHint(coupon) {
    if (coupon.hint) return coupon.hint;
    const t = (coupon.title || '').toLowerCase();
    const d = (coupon.description || '').toLowerCase();
    if (t.includes('beach') || d.includes('beach') || t.includes('sunset')) return '🏖️ Sunsets, beach breeze & cold sweet treats';
    if (t.includes('coffee') || d.includes('coffee')) return '☕ Secret desk coffee run during a busy day';
    if (t.includes('book') || d.includes('book')) return '📚 Cozy bookstore wander & free book pick';
    if (t.includes('cook') || t.includes('food') || d.includes('food')) return '🍳 Chef Sanyam kitchen takeover on demand';
    if (t.includes('drive') || d.includes('drive')) return '🚗 City lights, windows down & loud tunes';
    if (t.includes('lecture') || t.includes('medicine')) return '🤐 Zero nagging about medicines, glasses & coffee!';
    if (t.includes('movie') || d.includes('movie')) return '🎬 Total screen veto power & snack monopoly';
    if (t.includes('picnic') || d.includes('picnic')) return '🧺 Blanket on the sand & basket full of bites';
    return `${coupon.icon || '✨'} A special romantic promise waiting for you`;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initCouponsApp();
});

async function initCouponsApp() {
    // Check localStorage fallback first
    const stored = loadLocalCoupons();
    if (stored && stored.length > 0) {
        coupons = stored;
    } else {
        coupons = [...STARTER_COUPONS];
    }
    renderCoupons();

    try {
        const client = await getSupabaseClient();
        if (client) {
            await fetchCoupons(client);
            setupCouponsRealtime(client);
        }
    } catch (e) {
        console.warn('Supabase coupons init error:', e);
    }
}

// Fetch from Supabase
async function fetchCoupons(client) {
    try {
        const { data, error } = await client
            .from('date_coupons')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching coupons:', error);
        } else if (data && data.length > 0) {
            coupons = data;
            saveLocalCoupons(coupons);
        } else if (data && data.length === 0) {
            await seedCoupons(client);
            return;
        }
    } catch (err) {
        console.error('Coupons fetch exception:', err);
    } finally {
        renderCoupons();
    }
}

// Seed starter coupons into Supabase
async function seedCoupons(client) {
    try {
        const toInsert = STARTER_COUPONS.map(({ title, description, icon, is_scratched, is_redeemed }) => ({
            title,
            description,
            icon,
            is_scratched: false,
            is_redeemed: false
        }));

        const { data, error } = await client
            .from('date_coupons')
            .insert(toInsert)
            .select();

        if (!error && data) {
            coupons = data;
            saveLocalCoupons(coupons);
        }
    } catch (e) {
        console.error('Coupons seed exception:', e);
    }
    renderCoupons();
}

// Realtime Subscription
function setupCouponsRealtime(client) {
    if (realtimeChannel) {
        client.removeChannel(realtimeChannel);
    }

    try {
        realtimeChannel = client
            .channel('date-coupons-live')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'date_coupons' }, () => {
                fetchCoupons(client);
            })
            .subscribe();
    } catch (e) {
        console.warn('Coupons realtime error:', e);
    }
}

// Render Coupons Grid
function renderCoupons() {
    const grid = document.getElementById('coupons-grid');
    if (!grid) return;

    updateCouponStats();

    // Filter coupons
    const filtered = coupons.filter(c => {
        if (activeFilter === 'unscratched') return !c.is_scratched;
        if (activeFilter === 'active') return c.is_scratched && !c.is_redeemed;
        if (activeFilter === 'redeemed') return c.is_redeemed;
        return true; // 'all'
    });

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-12 space-y-2">
                <span class="text-4xl">🎫</span>
                <p class="font-bold text-base">No coupons found in this category.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map((coupon, index) => {
        const isScratched = !!coupon.is_scratched;
        const isRedeemed = !!coupon.is_redeemed;
        const formattedDate = coupon.redeemed_at ? new Date(coupon.redeemed_at).toLocaleDateString() : '';
        const hint = getCouponHint(coupon);

        return `
            <div id="card-container-${coupon.id}" class="ticket-card relative rounded-3xl border-3 border-customAccent p-5 md:p-6 shadow-[5px_5px_0px_0px_#243B8F] overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-[7px_7px_0px_0px_#243B8F] min-h-[300px]">
                
                <!-- Ticket notches (cinema ticket cutouts) -->
                <div class="ticket-notch-left"></div>
                <div class="ticket-notch-right"></div>

                <!-- Ticket Top Header -->
                <div class="space-y-1.5">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <span id="coupon-icon-${coupon.id}" class="text-2xl md:text-3xl transition-transform duration-300">
                                ${isScratched ? (coupon.icon || '🎫') : '🎁'}
                            </span>
                            <span class="text-[11px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-md bg-amber-100/90 text-amber-950 border border-amber-300">
                                PASS #${String(index + 1).padStart(2, '0')}
                            </span>
                        </div>
                        <div class="flex items-center gap-2">
                            <div id="coupon-status-${coupon.id}">
                                ${isRedeemed ? `
                                    <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-300">
                                        Redeemed ✓
                                    </span>
                                ` : isScratched ? `
                                    <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                                        Unlocked 🎁
                                    </span>
                                ` : `
                                    <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-300 animate-pulse">
                                        Scratch Me ✨
                                    </span>
                                `}
                            </div>
                            <button onclick="deleteCoupon('${coupon.id}', event)" title="Remove coupon" class="opacity-25 hover:opacity-100 hover:text-red-600 transition-opacity p-1 rounded">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- Ticket Title (Hidden until scratched!) -->
                    <h3 id="coupon-title-${coupon.id}" class="font-extrabold text-base md:text-lg text-customAccent leading-snug pt-1">
                        ${isScratched ? escapeHtml(coupon.title) : 'Mystery Love Pass 🔒✨'}
                    </h3>

                    <!-- Hint / Teaser Banner on Card -->
                    <div id="coupon-banner-${coupon.id}" class="inline-flex items-center gap-1.5 text-[11px] font-bold ${isScratched ? 'text-amber-950 bg-amber-100/90 border-amber-300/80' : 'text-amber-950/80 bg-amber-100/70 border-amber-300/60'} border px-2.5 py-1 rounded-lg mt-1 w-full">
                        ${isScratched ? `
                            <span>💡 Perk:</span>
                            <span class="font-semibold text-customAccent truncate">${escapeHtml(hint)}</span>
                        ` : `
                            <span>✨ Mystery:</span>
                            <span class="font-semibold text-customAccent/80 italic">Scratch gold foil below to reveal this pass!</span>
                        `}
                    </div>
                </div>

                <!-- Central Scratch-Off Window -->
                <div class="relative my-3.5 w-full min-h-[145px] rounded-2xl border-2 border-customAccent bg-amber-50/70 overflow-hidden flex flex-col items-center justify-center p-3 text-center shadow-inner">
                    
                    <!-- Secret Content (Hidden under gold foil canvas when unscratched, revealed once scratched) -->
                    <div class="space-y-1.5 z-10 px-2 py-1 flex flex-col items-center justify-center w-full">
                        <div class="text-2xl md:text-3xl mb-0.5">${coupon.icon || '🎁'}</div>
                        <h4 class="font-extrabold text-sm md:text-base text-customAccent leading-tight max-w-[280px]">
                            ${escapeHtml(coupon.title)}
                        </h4>
                        <p class="text-xs md:text-sm font-semibold text-customAccent/90 leading-relaxed max-w-[290px]">
                            ${escapeHtml(coupon.description)}
                        </p>
                        <div class="inline-block text-[10px] font-mono font-bold tracking-widest text-amber-900/80 bg-amber-200/80 px-2.5 py-0.5 rounded border border-amber-300 mt-1">
                            VOUCHER: HIMI-PASS-${String(index + 1).padStart(2, '0')}
                        </div>
                    </div>

                    <!-- Shimmering Gold Foil Canvas Overlay (Only if not yet scratched) -->
                    ${!isScratched ? `
                        <canvas id="scratch-canvas-${coupon.id}" class="absolute inset-0 w-full h-full cursor-crosshair z-30 touch-none"></canvas>
                    ` : ''}

                    <!-- Redeemed Vintage Ink Stamp Overlay -->
                    ${isRedeemed ? `
                        <div class="absolute inset-0 flex items-center justify-center pointer-events-none z-40 bg-white/50 backdrop-blur-[0.5px]">
                            <div class="stamp-redeemed text-xs md:text-sm shadow-md">
                                REDEEMED ✓
                                ${formattedDate ? `<div class="text-[9px] font-sans font-bold tracking-normal opacity-90 text-center">${formattedDate}</div>` : ''}
                            </div>
                        </div>
                    ` : ''}
                </div>

                <!-- Ticket Bottom Perforation & Action -->
                <div class="pt-2.5 border-t-2 border-dashed border-customAccent/30 flex items-center justify-between flex-wrap gap-2">
                    <div class="flex items-center gap-1.5 opacity-60">
                        <span class="font-mono text-[10px] tracking-widest select-none">|||▌|▌||▌||</span>
                        <span class="text-[10px] font-bold">VALID FOREVER</span>
                    </div>

                    <div class="flex items-center gap-2">
                        ${!isRedeemed && isScratched ? `
                            <button onclick="redeemCoupon('${coupon.id}')" class="bg-customAccent text-customBg px-4 py-1.5 rounded-full font-bold text-xs hover:scale-105 active:scale-95 transition-all shadow-[2px_2px_0px_0px_#FFF0C9]">
                                Redeem with Sanyam 🎁
                            </button>
                        ` : ''}

                        ${!isScratched ? `
                            <span class="text-[11px] font-bold text-amber-900/75 italic flex items-center gap-1">
                                <span>🪙</span> Scratch above
                            </span>
                        ` : ''}

                        ${isRedeemed ? `
                            <button onclick="shareOnWhatsApp('${coupon.id}')" class="bg-emerald-600 text-white px-3 py-1.5 rounded-full font-bold text-xs hover:bg-emerald-700 transition-all flex items-center gap-1 shadow-[1px_1px_0px_0px_#243B8F]">
                                <span>💬</span> Text Sanyam
                            </button>
                        ` : ''}
                    </div>
                </div>

            </div>
        `;
    }).join('') + (activeFilter === 'all' || activeFilter === 'unscratched' ? `
        <!-- Add Your Own Pass Ticket Card -->
        <div onclick="toggleAddCouponForm()" class="ticket-card relative rounded-3xl border-3 border-dashed border-customAccent/70 p-6 shadow-[3px_3px_0px_0px_rgba(36,59,143,0.2)] hover:border-customAccent hover:shadow-[6px_6px_0px_0px_#243B8F] hover:bg-amber-50/60 cursor-pointer flex flex-col items-center justify-center text-center min-h-[300px] transition-all duration-300 group">
            <div class="ticket-notch-left"></div>
            <div class="ticket-notch-right"></div>
            <div class="w-16 h-16 rounded-2xl bg-amber-100 border-2 border-customAccent flex items-center justify-center text-3xl mb-3 group-hover:scale-110 transition-transform shadow-[2px_2px_0px_0px_#243B8F]">
                ✨
            </div>
            <h4 class="font-extrabold text-lg text-customAccent mb-1">
                + Add Your Own Pass
            </h4>
            <p class="text-xs font-semibold opacity-75 max-w-[220px] leading-relaxed mb-4">
                Create a custom love coupon for Himi with your own secret perks & teaser hint!
            </p>
            <span class="text-xs font-extrabold bg-customAccent text-customBg px-4 py-2 rounded-full shadow-[2px_2px_0px_0px_#FFF0C9] group-hover:scale-105 transition-all">
                Create New Coupon 💫
            </span>
        </div>
    ` : '');

    // Attach scratch physics to all unscratched cards
    filtered.forEach(coupon => {
        if (!coupon.is_scratched) {
            const hint = getCouponHint(coupon);
            setupScratchCanvas(coupon.id, hint);
        }
    });
}

// Scratch Canvas Physics
function setupScratchCanvas(couponId, hint) {
    const canvas = document.getElementById(`scratch-canvas-${couponId}`);
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const rect = canvas.getBoundingClientRect();

    // Scale canvas resolution to element dimensions
    const width = Math.round(rect.width) || canvas.offsetWidth || 320;
    const height = Math.round(rect.height) || canvas.offsetHeight || 145;
    canvas.width = width;
    canvas.height = height;

    // Paint Foil Layer with Hint
    paintFoil(ctx, width, height, hint);

    let isScratching = false;
    let totalPixels = canvas.width * canvas.height;
    let hasCleared = false;

    function getCoords(e) {
        const b = canvas.getBoundingClientRect();
        return {
            x: (e.clientX || (e.touches && e.touches[0].clientX)) - b.left,
            y: (e.clientY || (e.touches && e.touches[0].clientY)) - b.top
        };
    }

    function scratch(x, y) {
        if (hasCleared) return;

        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, 18, 0, Math.PI * 2);
        ctx.fill();

        // Sample scratch completion every few moves
        checkScratchPercentage();
    }

    function checkScratchPercentage() {
        if (hasCleared) return;

        try {
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imgData.data;
            let transparentCount = 0;

            // Sample every 16th pixel for high performance
            for (let i = 3; i < data.length; i += 64) {
                if (data[i] === 0) {
                    transparentCount++;
                }
            }

            const ratio = transparentCount / (totalPixels / 16);

            if (ratio > 0.40) {
                hasCleared = true;
                autoRevealCoupon(couponId, canvas);
            }
        } catch (err) {
            console.warn('Canvas sample error:', err);
        }
    }

    // Pointer event listeners (unifies touch + mouse)
    canvas.addEventListener('pointerdown', (e) => {
        isScratching = true;
        canvas.setPointerCapture(e.pointerId);
        const { x, y } = getCoords(e);
        scratch(x, y);
    });

    canvas.addEventListener('pointermove', (e) => {
        if (!isScratching) return;
        const { x, y } = getCoords(e);
        scratch(x, y);
    });

    canvas.addEventListener('pointerup', (e) => {
        isScratching = false;
        try { canvas.releasePointerCapture(e.pointerId); } catch(ex) {}
    });

    canvas.addEventListener('pointercancel', () => {
        isScratching = false;
    });
}

// Paint glamorous champagne gold foil on canvas with Hint
function paintFoil(ctx, width, height, hint) {
    // 1. Radiant Gold Metallic Gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#F5D77F');
    grad.addColorStop(0.25, '#FFE8A3');
    grad.addColorStop(0.5, '#D4AF37');
    grad.addColorStop(0.75, '#F3D079');
    grad.addColorStop(1, '#C59B27');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // 2. Add subtle metallic sparkle dots/flakes
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    for (let i = 0; i < 35; i++) {
        const sx = (i * 29 + 13) % width;
        const sy = (i * 37 + 7) % height;
        const sr = (i % 3) + 1;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
    }

    // 3. Delicate gold foil border
    ctx.strokeStyle = '#835C0F';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(6, 6, width - 12, height - 12);
    ctx.setLineDash([]);

    // 4. Little decorative corner stars
    ctx.fillStyle = '#6B4A08';
    drawStar(ctx, 20, 20, 4, 3);
    drawStar(ctx, width - 20, 20, 4, 3);
    drawStar(ctx, 20, height - 20, 4, 3);
    drawStar(ctx, width - 20, height - 20, 4, 3);

    // 5. Embossed foil text with Hint
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = 'bold 12px Quicksand, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText('✨ SCRATCH TO REVEAL ✨', width / 2, 25);
    ctx.fillStyle = '#5A3E06';
    ctx.fillText('✨ SCRATCH TO REVEAL ✨', width / 2, 24);

    // Centered hint banner on the foil
    if (hint) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        const badgeW = Math.min(width - 32, 270);
        const badgeH = 28;
        const bx = (width - badgeW) / 2;
        const by = height / 2 - 14;
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(bx, by, badgeW, badgeH, 14);
        } else {
            ctx.rect(bx, by, badgeW, badgeH);
        }
        ctx.fill();
        ctx.strokeStyle = 'rgba(131, 92, 15, 0.4)';
        ctx.stroke();

        ctx.font = 'bold 11px Quicksand, sans-serif';
        ctx.fillStyle = '#452E04';
        let displayHint = hint;
        if (displayHint.length > 36) {
            displayHint = displayHint.substring(0, 34) + '...';
        }
        ctx.fillText(`💡 ${displayHint}`, width / 2, height / 2);
    }

    ctx.font = 'semibold 10px Quicksand, sans-serif';
    ctx.fillStyle = '#6E4B07';
    ctx.fillText('🪙 Rub with finger or mouse to unlock', width / 2, height - 16);
}

// Helper: draw cute stars on the foil
function drawStar(ctx, cx, cy, spikes, r) {
    let rot = Math.PI / 2 * 3;
    let step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    for (let i = 0; i < spikes; i++) {
        let x = cx + Math.cos(rot) * r;
        let y = cy + Math.sin(rot) * r;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * (r / 2);
        y = cy + Math.sin(rot) * (r / 2);
        ctx.lineTo(x, y);
        rot += step;
    }
    ctx.lineTo(cx, cy - r);
    ctx.closePath();
    ctx.fill();
}

// Auto-reveal when scratch reaches threshold
async function autoRevealCoupon(couponId, canvas) {
    // Fade out canvas animation
    canvas.style.transition = 'opacity 0.4s ease-out';
    canvas.style.opacity = '0';

    setTimeout(() => {
        canvas.remove();
    }, 450);

    // Celebration confetti!
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#243B8F', '#FFF0C9', '#F39C12', '#E74C3C']
        });
    }

    // Update in-memory state
    coupons = coupons.map(c => {
        if (c.id == couponId) {
            return { ...c, is_scratched: true };
        }
        return c;
    });

    // Instant visual update for card header in DOM
    const target = coupons.find(c => c.id == couponId);
    if (target) {
        const titleEl = document.getElementById(`coupon-title-${couponId}`);
        if (titleEl) {
            titleEl.textContent = target.title;
        }
        const iconEl = document.getElementById(`coupon-icon-${couponId}`);
        if (iconEl && target.icon) {
            iconEl.textContent = target.icon;
        }
        const statusEl = document.getElementById(`coupon-status-${couponId}`);
        if (statusEl) {
            statusEl.innerHTML = `
                <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Unlocked 🎁
                </span>
            `;
        }
        const bannerEl = document.getElementById(`coupon-banner-${couponId}`);
        if (bannerEl) {
            const hint = getCouponHint(target);
            bannerEl.className = 'inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-950 bg-amber-100/90 border-amber-300/80 border px-2.5 py-1 rounded-lg mt-1 w-full';
            bannerEl.innerHTML = `
                <span>💡 Perk:</span>
                <span class="font-semibold text-customAccent truncate">${escapeHtml(hint)}</span>
            `;
        }
    }

    saveLocalCoupons(coupons);
    updateCouponStats();

    // Persist to Supabase
    try {
        const client = await getSupabaseClient();
        if (client) {
            await client.from('date_coupons').update({ is_scratched: true }).eq('id', couponId);
        }
    } catch (e) {
        console.warn('Supabase update scratch error:', e);
    }

    // Re-render in 500ms to show the Redeem button
    setTimeout(() => {
        renderCoupons();
    }, 500);
}

// Redeem Coupon Action
async function redeemCoupon(couponId) {
    const coupon = coupons.find(c => c.id == couponId);
    if (!coupon) return;

    if (!confirm(`Redeem "${coupon.title}" with Sanyam now? ❤️`)) return;

    const now = new Date().toISOString();

    coupons = coupons.map(c => {
        if (c.id == couponId) {
            return {
                ...c,
                is_redeemed: true,
                redeemed_at: now
            };
        }
        return c;
    });

    saveLocalCoupons(coupons);
    renderCoupons();

    // Celebration burst
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.5 },
            colors: ['#243B8F', '#FFF0C9', '#E74C3C', '#27AE60']
        });
    }

    // Persist to Supabase
    try {
        const client = await getSupabaseClient();
        if (client) {
            await client.from('date_coupons').update({
                is_redeemed: true,
                redeemed_at: now
            }).eq('id', couponId);
        }
    } catch (e) {
        console.warn('Supabase redeem error:', e);
    }
}

// Share on WhatsApp shortcut
function shareOnWhatsApp(couponId) {
    const coupon = coupons.find(c => c.id == couponId);
    if (!coupon) return;

    const message = `Hey Sanyam! 🥰 I'm officially redeeming my coupon:\n\n"${coupon.title}"\n\nGet ready! ❤️`;
    const encoded = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
}

// Filter Coupons
function filterCoupons(filter) {
    activeFilter = filter;

    const buttons = document.querySelectorAll('.coupon-filter-btn');
    buttons.forEach(btn => {
        const f = btn.getAttribute('data-filter');
        if (f === filter) {
            btn.classList.add('bg-customAccent', 'text-customBg', 'shadow-[2px_2px_0px_0px_#243B8F]');
            btn.classList.remove('bg-white', 'text-customAccent');
        } else {
            btn.classList.remove('bg-customAccent', 'text-customBg', 'shadow-[2px_2px_0px_0px_#243B8F]');
            btn.classList.add('bg-white', 'text-customAccent');
        }
    });

    renderCoupons();
}

// Stats counter updater
function updateCouponStats() {
    const availableEl = document.getElementById('stat-available');
    const scratchedEl = document.getElementById('stat-scratched');
    const redeemedEl = document.getElementById('stat-redeemed');

    const total = coupons.length;
    const scratched = coupons.filter(c => c.is_scratched && !c.is_redeemed).length;
    const redeemed = coupons.filter(c => c.is_redeemed).length;
    const readyToScratch = coupons.filter(c => !c.is_scratched).length;

    if (availableEl) availableEl.innerText = readyToScratch;
    if (scratchedEl) scratchedEl.innerText = scratched;
    if (redeemedEl) redeemedEl.innerText = redeemed;
}

// Local Storage helpers for instant offline/fallback persistence
function loadLocalCoupons() {
    try {
        const raw = localStorage.getItem('himi_date_coupons');
        if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
}

function saveLocalCoupons(data) {
    try {
        localStorage.setItem('himi_date_coupons', JSON.stringify(data));
    } catch (e) {}
}

// HTML escape helper
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Toggle Add Coupon Form
function toggleAddCouponForm() {
    const form = document.getElementById('add-coupon-form');
    if (form) {
        form.classList.toggle('hidden');
        if (!form.classList.contains('hidden')) {
            document.getElementById('coupon-title').focus();
        }
    }
}

// Add New Coupon Handler
async function handleAddCoupon(event) {
    event.preventDefault();
    const titleInput = document.getElementById('coupon-title');
    const descInput = document.getElementById('coupon-desc');
    const hintInput = document.getElementById('coupon-hint');
    const iconSelect = document.getElementById('coupon-icon');
    const submitBtn = document.getElementById('coupon-submit-btn');

    const title = titleInput.value.trim();
    const description = descInput.value.trim();
    const customHint = hintInput ? hintInput.value.trim() : '';
    const icon = iconSelect.value;
    const hint = customHint || getCouponHint({ title, description, icon });

    if (!title || !description) return;

    submitBtn.disabled = true;
    submitBtn.innerText = 'Creating...';

    const client = await getSupabaseClient();

    if (client) {
        try {
            const { data, error } = await client
                .from('date_coupons')
                .insert([{
                    title,
                    description,
                    icon,
                    is_scratched: false,
                    is_redeemed: false
                }])
                .select();

            if (error) {
                console.error('Insert coupon error:', error);
                alert('Could not save to Supabase. Check credentials or table schema.');
            } else if (data) {
                const inserted = { ...data[0], hint };
                coupons.push(inserted);
                saveLocalCoupons(coupons);
            }
        } catch (err) {
            console.error('Insert coupon exception:', err);
        }
    } else {
        // Local preview fallback
        const newCoupon = {
            id: 'coupon-' + Date.now(),
            title,
            description,
            hint,
            icon,
            is_scratched: false,
            is_redeemed: false,
            redeemed_at: null
        };
        coupons.push(newCoupon);
        saveLocalCoupons(coupons);
    }

    titleInput.value = '';
    descInput.value = '';
    if (hintInput) hintInput.value = '';
    submitBtn.disabled = false;
    submitBtn.innerText = 'Create Coupon ❤️';
    toggleAddCouponForm();
    renderCoupons();

    if (typeof confetti === 'function') {
        confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#243B8F', '#FFF0C9', '#E74C3C', '#F39C12']
        });
    }
}

// Delete Coupon Handler
async function deleteCoupon(couponId, event) {
    if (event) event.stopPropagation();
    if (!confirm('Remove this love coupon?')) return;

    coupons = coupons.filter(c => c.id != couponId);
    saveLocalCoupons(coupons);
    renderCoupons();

    try {
        const client = await getSupabaseClient();
        if (client) {
            await client.from('date_coupons').delete().eq('id', couponId);
        }
    } catch (e) {
        console.warn('Delete coupon error:', e);
    }
}

// Reset All Coupons Handler
async function handleResetAllCoupons() {
    if (!confirm('Reset all love passes back to fresh unscratched state? 🎟️✨')) return;

    coupons = coupons.map(c => ({
        ...c,
        is_scratched: false,
        is_redeemed: false,
        redeemed_at: null
    }));

    saveLocalCoupons(coupons);
    renderCoupons();

    try {
        const client = await getSupabaseClient();
        if (client) {
            // Update all rows in date_coupons
            const { error } = await client
                .from('date_coupons')
                .update({
                    is_scratched: false,
                    is_redeemed: false,
                    redeemed_at: null
                })
                .neq('title', '___NEVER_MATCH___');

            if (error) console.warn('Supabase reset error:', error);
        }
    } catch (e) {
        console.warn('Reset all coupons error:', e);
    }

    if (typeof confetti === 'function') {
        confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.5 },
            colors: ['#243B8F', '#FFF0C9', '#F5D77F']
        });
    }
}


