// ==============================================================================
// Himi & Sanyam Bucket List & Recurring Rituals - JavaScript & Supabase Sync
// ==============================================================================

let currentItems = [];
let activeCategory = 'All';
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

// Starter items (including one-time wishes & recurring rituals)
const STARTER_ITEMS = [
    // One-time wishes
    { id: '1', title: 'Watch a beach sunset together until the stars come out', category: 'Beach', is_completed: false, is_recurring: false, completion_count: 0 },
    { id: '2', title: 'A weekend beach getaway with zero office stress', category: 'Beach', is_completed: false, is_recurring: false, completion_count: 0 },
    { id: '3', title: 'Late night beach drive with good music & windows down', category: 'Beach', is_completed: false, is_recurring: false, completion_count: 0 },
    { id: '4', title: 'Undercover office coffee date without anyone noticing', category: 'Office', is_completed: false, is_recurring: false, completion_count: 0 },
    { id: '5', title: 'Have a peaceful lunch date without rushing back to work', category: 'Office', is_completed: false, is_recurring: false, completion_count: 0 },
    { id: '6', title: 'Bookstore date where we pick out books for each other', category: 'Cozy', is_completed: false, is_recurring: false, completion_count: 0 },
    { id: '7', title: 'Rainy day movie marathon with hot chocolate & blankets', category: 'Cozy', is_completed: false, is_recurring: false, completion_count: 0 },
    { id: '8', title: 'Cook a chaotic and delicious dinner together from scratch', category: 'Cozy', is_completed: false, is_recurring: false, completion_count: 0 },
    { id: '9', title: 'Take goofy photobooth pictures together', category: 'Cozy', is_completed: false, is_recurring: false, completion_count: 0 },
    { id: '10', title: 'Our first flight & trip together to a brand new city', category: 'Adventure', is_completed: false, is_recurring: false, completion_count: 0 },
    { id: '11', title: 'Fill a memory scrapbook with our tickets, notes, and photos', category: 'Adventure', is_completed: false, is_recurring: false, completion_count: 0 },
    { id: '12', title: 'Take a spontaneous day off together with zero plans', category: 'General', is_completed: false, is_recurring: false, completion_count: 0 },
    { id: '13', title: 'Write each other love letters to open on our anniversary', category: 'General', is_completed: false, is_recurring: false, completion_count: 0 },

    // Recurring couple rituals
    { id: '14', title: 'Weekly beach date to recharge our batteries 🏖️🔋', category: 'Beach', is_completed: false, is_recurring: true, recurrence_interval: 'Weekly', completion_count: 0 },
    { id: '15', title: 'Daily goofy face & smile check across the office 🏢😂', category: 'Office', is_completed: false, is_recurring: true, recurrence_interval: 'Daily', completion_count: 0 },
    { id: '16', title: 'Remind Himi to take medicines & wear glasses without complaining 💊👓', category: 'Office', is_completed: false, is_recurring: true, recurrence_interval: 'Daily', completion_count: 0 },
    { id: '17', title: 'Monthly cozy bookstore & new coffee shop date 📚☕', category: 'Cozy', is_completed: false, is_recurring: true, recurrence_interval: 'Monthly', completion_count: 0 }
];

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    // Render starter items immediately for seamless feel
    currentItems = [...STARTER_ITEMS];
    renderItems();

    try {
        const client = await getSupabaseClient();
        if (client) {
            await fetchBucketList();
            setupRealtimeSubscription(client);
        }
    } catch (e) {
        console.warn('Supabase initialization error:', e);
    }
}

// Fetch items from Supabase
async function fetchBucketList() {
    const client = initSupabase();
    if (!client) return;

    const loadingState = document.getElementById('loading-state');
    if (loadingState && currentItems.length === 0) {
        loadingState.classList.remove('hidden');
    }

    try {
        const { data, error } = await client
            .from('bucket_list')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching bucket list:', error);
            if (currentItems.length === 0) {
                currentItems = [...STARTER_ITEMS];
            }
        } else if (data && data.length > 0) {
            currentItems = data;
        } else if (data && data.length === 0) {
            await seedStarterItems(client);
            return;
        }
    } catch (err) {
        console.error('Fetch exception:', err);
    } finally {
        renderItems();
    }
}

// Seed starter items into Supabase
async function seedStarterItems(client) {
    try {
        const itemsToInsert = STARTER_ITEMS.map(({ title, category, is_completed, is_recurring, recurrence_interval, completion_count }) => ({
            title,
            category,
            is_completed,
            is_recurring: !!is_recurring,
            recurrence_interval: recurrence_interval || null,
            completion_count: completion_count || 0
        }));
        const { data, error } = await client
            .from('bucket_list')
            .insert(itemsToInsert)
            .select();

        if (!error && data) {
            currentItems = data;
        } else {
            currentItems = [...STARTER_ITEMS];
        }
    } catch (e) {
        console.error('Seed exception:', e);
        currentItems = [...STARTER_ITEMS];
    }
    renderItems();
}

// Realtime Channel
function setupRealtimeSubscription(client) {
    if (realtimeChannel) {
        client.removeChannel(realtimeChannel);
    }

    try {
        realtimeChannel = client
            .channel('bucket-list-live')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'bucket_list' }, () => {
                fetchBucketList();
            })
            .subscribe();
    } catch (e) {
        console.warn('Realtime subscription not supported:', e);
    }
}

// Toggle Complete for one-time bucket items
async function toggleComplete(id, currentStatus) {
    const item = currentItems.find(i => i.id == id);
    if (item && item.is_recurring) {
        // If it's recurring, route to increment
        incrementRecurring(id);
        return;
    }

    const newStatus = !currentStatus;

    // Optimistic UI update
    currentItems = currentItems.map(i => {
        if (i.id == id) {
            return {
                ...i,
                is_completed: newStatus,
                completed_at: newStatus ? new Date().toISOString() : null
            };
        }
        return i;
    });
    renderItems();

    if (newStatus) {
        fireCheckConfetti();
    }

    const client = initSupabase();
    if (!client) return;

    try {
        const { error } = await client
            .from('bucket_list')
            .update({
                is_completed: newStatus,
                completed_at: newStatus ? new Date().toISOString() : null
            })
            .eq('id', id);

        if (error) {
            console.error('Update error:', error);
            fetchBucketList();
        }
    } catch (err) {
        console.error('Update exception:', err);
        fetchBucketList();
    }
}

// Increment recurring ritual check-in count
async function incrementRecurring(id, event) {
    if (event) event.stopPropagation();

    let newCount = 1;
    currentItems = currentItems.map(i => {
        if (i.id == id) {
            newCount = (i.completion_count || 0) + 1;
            return {
                ...i,
                is_completed: true,
                completion_count: newCount,
                completed_at: new Date().toISOString()
            };
        }
        return i;
    });
    renderItems();
    fireCheckConfetti();

    const client = initSupabase();
    if (!client) return;

    try {
        const { error } = await client
            .from('bucket_list')
            .update({
                is_completed: true,
                completion_count: newCount,
                completed_at: new Date().toISOString()
            })
            .eq('id', id);

        if (error) {
            console.error('Recurring update error:', error);
            fetchBucketList();
        }
    } catch (err) {
        console.error('Recurring update exception:', err);
        fetchBucketList();
    }
}

// Toggle Recurrence dropdown in Add Form
function toggleRecurrenceSelect() {
    const isRecCheckbox = document.getElementById('item-is-recurring');
    const intervalSelect = document.getElementById('item-interval');
    if (isRecCheckbox && intervalSelect) {
        if (isRecCheckbox.checked) {
            intervalSelect.classList.remove('hidden');
        } else {
            intervalSelect.classList.add('hidden');
        }
    }
}

// Add Item (handles both one-time and recurring items)
async function handleAddItem(event) {
    event.preventDefault();
    const titleInput = document.getElementById('item-title');
    const categorySelect = document.getElementById('item-category');
    const isRecCheckbox = document.getElementById('item-is-recurring');
    const intervalSelect = document.getElementById('item-interval');
    const submitBtn = document.getElementById('add-submit-btn');

    const title = titleInput.value.trim();
    const category = categorySelect.value;
    const is_recurring = isRecCheckbox ? isRecCheckbox.checked : false;
    const recurrence_interval = is_recurring && intervalSelect ? intervalSelect.value : null;

    if (!title) return;

    submitBtn.disabled = true;
    submitBtn.innerText = 'Adding...';

    const client = initSupabase();

    if (client) {
        try {
            const { data, error } = await client
                .from('bucket_list')
                .insert([{
                    title,
                    category,
                    is_completed: false,
                    is_recurring,
                    recurrence_interval,
                    completion_count: 0
                }])
                .select();

            if (error) {
                console.error('Insert error:', error);
                alert('Could not save to Supabase. Check credentials or table schema.');
            } else if (data) {
                currentItems.push(data[0]);
            }
        } catch (err) {
            console.error('Insert exception:', err);
        }
    } else {
        // Local preview fallback
        const newItem = {
            id: 'custom-' + Date.now(),
            title,
            category,
            is_completed: false,
            is_recurring,
            recurrence_interval,
            completion_count: 0
        };
        currentItems.push(newItem);
    }

    titleInput.value = '';
    if (isRecCheckbox) isRecCheckbox.checked = false;
    if (intervalSelect) intervalSelect.classList.add('hidden');

    submitBtn.disabled = false;
    submitBtn.innerText = 'Add Item ❤️';
    toggleAddForm();
    renderItems();
    fireCheckConfetti();
}

// Delete Item
async function deleteItem(id, event) {
    event.stopPropagation();
    if (!confirm('Remove this item from our list?')) return;

    currentItems = currentItems.filter(item => item.id != id);
    renderItems();

    const client = initSupabase();
    if (!client) return;

    try {
        await client.from('bucket_list').delete().eq('id', id);
    } catch (err) {
        console.error('Delete error:', err);
    }
}

// Toggle Add Form Visibility
function toggleAddForm() {
    const form = document.getElementById('add-form');
    if (form) {
        form.classList.toggle('hidden');
        if (!form.classList.contains('hidden')) {
            document.getElementById('item-title').focus();
        }
    }
}

// Category Filter
function filterCategory(category) {
    activeCategory = category;

    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        const cat = btn.getAttribute('data-category');
        if (cat === category) {
            btn.classList.add('bg-customAccent', 'text-customBg', 'shadow-[2px_2px_0px_0px_#243B8F]');
            btn.classList.remove('bg-white', 'text-customAccent');
        } else {
            btn.classList.remove('bg-customAccent', 'text-customBg', 'shadow-[2px_2px_0px_0px_#243B8F]');
            btn.classList.add('bg-white', 'text-customAccent');
        }
    });

    renderItems();
}

// Render Bucket List & Recurring Items
function renderItems() {
    const listContainer = document.getElementById('items-list');
    const emptyState = document.getElementById('empty-state');

    // Filter items
    let filtered = [];
    if (activeCategory === 'All') {
        filtered = currentItems;
    } else if (activeCategory === 'Recurring') {
        filtered = currentItems.filter(i => !!i.is_recurring);
    } else if (activeCategory.toLowerCase() === 'general') {
        filtered = currentItems.filter(i => !i.category || i.category.toLowerCase() === 'general' || i.category.toLowerCase().includes('general'));
    } else {
        filtered = currentItems.filter(i => (i.category || '').toLowerCase().includes(activeCategory.toLowerCase()));
    }

    updateProgressBar();

    if (filtered.length === 0) {
        listContainer.innerHTML = '';
        if (emptyState) emptyState.classList.remove('hidden');
        return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    listContainer.innerHTML = filtered.map(item => {
        const isDone = !!item.is_completed;
        const isRecurring = !!item.is_recurring;
        const count = item.completion_count || 0;
        const categoryBadge = getCategoryBadge(item.category);

        if (isRecurring) {
            return `
                <div class="group flex items-center justify-between p-4 rounded-2xl border-2 border-customAccent bg-white hover:bg-customBg/40 transition-all duration-200 shadow-[3px_3px_0px_0px_#243B8F]">
                    <div class="flex items-center gap-3.5 flex-grow pr-2">
                        <!-- Recurring Icon Badge -->
                        <div class="w-8 h-8 rounded-xl bg-purple-100 border-2 border-customAccent flex items-center justify-center flex-shrink-0 text-sm">
                            🔄
                        </div>

                        <!-- Title & Details -->
                        <div class="flex flex-col">
                            <span class="font-bold text-sm md:text-base leading-snug text-customAccent">
                                ${escapeHtml(item.title)}
                            </span>
                            <div class="flex flex-wrap items-center gap-2 mt-1">
                                <span class="text-xs font-semibold px-2 py-0.5 rounded-full border border-customAccent bg-customBg/80 text-customAccent">
                                    ${categoryBadge}
                                </span>
                                <span class="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-300">
                                    🔄 ${item.recurrence_interval || 'Weekly'} Ritual
                                </span>
                                <span class="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                                    🔥 Done ${count} ${count === 1 ? 'time' : 'times'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex items-center gap-2">
                        <button onclick="incrementRecurring('${item.id}', event)" class="bg-customAccent text-customBg px-3 py-1.5 rounded-full font-bold text-xs hover:scale-105 active:scale-95 transition-all shadow-[2px_2px_0px_0px_#FFF0C9] flex items-center gap-1">
                            <span>+1</span> Check-in ✨
                        </button>
                        <button onclick="deleteItem('${item.id}', event)" title="Remove item" class="opacity-30 hover:opacity-100 hover:text-red-600 transition-opacity p-2 rounded-lg">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                        </button>
                    </div>
                </div>
            `;
        }

        // Standard One-time Bucket Item
        return `
            <div onclick="toggleComplete('${item.id}', ${isDone})" class="group cursor-pointer flex items-center justify-between p-4 rounded-2xl border-2 border-customAccent transition-all duration-200 ${isDone ? 'bg-amber-100/60 opacity-80' : 'bg-white hover:bg-customBg/50 hover:-translate-y-0.5 shadow-[3px_3px_0px_0px_#243B8F]'}">
                <div class="flex items-center gap-3.5 flex-grow pr-2">
                    <!-- Checkbox -->
                    <div class="w-6 h-6 rounded-lg border-2 border-customAccent flex items-center justify-center flex-shrink-0 transition-all ${isDone ? 'bg-customAccent text-customBg' : 'bg-white group-hover:border-customAccent'}">
                        ${isDone ? `
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                            </svg>
                        ` : ''}
                    </div>

                    <!-- Title & Details -->
                    <div class="flex flex-col">
                        <span class="font-bold text-sm md:text-base leading-snug transition-all ${isDone ? 'line-through opacity-70' : 'text-customAccent'}">
                            ${escapeHtml(item.title)}
                        </span>
                        <div class="flex items-center gap-2 mt-1">
                            <span class="text-xs font-semibold px-2 py-0.5 rounded-full border border-customAccent bg-customBg/80 text-customAccent">
                                ${categoryBadge}
                            </span>
                            ${isDone ? `<span class="text-xs font-bold text-emerald-700">✓ Completed ❤️</span>` : ''}
                        </div>
                    </div>
                </div>

                <!-- Delete button -->
                <button onclick="deleteItem('${item.id}', event)" title="Remove item" class="opacity-30 hover:opacity-100 hover:text-red-600 transition-opacity p-2 rounded-lg">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                </button>
            </div>
        `;
    }).join('');
}

// Category badge helper
function getCategoryBadge(cat) {
    const c = (cat || '').toLowerCase();
    if (c.includes('beach')) return '🏖️ Beach';
    if (c.includes('office')) return '🏢 Office';
    if (c.includes('cozy')) return '📚 Cozy';
    if (c.includes('adventure')) return '✈️ Adventure';
    if (c.includes('general') || !cat) return '✨ General';
    return `✨ ${cat}`;
}

// Progress Bar & Cheer Messages
function updateProgressBar() {
    // Only one-time items or items checked count towards total completion progress
    const oneTimeItems = currentItems.filter(i => !i.is_recurring);
    const total = oneTimeItems.length;
    const completed = oneTimeItems.filter(i => i.is_completed).length;
    const recurringChecks = currentItems.filter(i => i.is_recurring).reduce((sum, i) => sum + (i.completion_count || 0), 0);
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    const bar = document.getElementById('progress-bar');
    const text = document.getElementById('progress-text');
    const cheer = document.getElementById('progress-cheer');

    if (bar) bar.style.width = `${percentage}%`;
    if (text) text.innerText = `${completed} / ${total} (${percentage}%)`;

    if (cheer) {
        if (completed === 0 && recurringChecks === 0) {
            cheer.innerText = "Check off memories and recurring rituals as we make them! 💕";
        } else if (percentage < 30) {
            cheer.innerText = `Off to a wonderful start! (${recurringChecks} recurring rituals completed 🔥)`;
        } else if (percentage < 70) {
            cheer.innerText = `Look at all our memories and ${recurringChecks} ritual check-ins! 🏖️📖`;
        } else if (percentage < 100) {
            cheer.innerText = "Almost every dream fulfilled together! ❤️";
        } else {
            cheer.innerText = "🎉 Every single wish achieved with Himi! Let's dream up more!";
        }
    }
}

// Confetti micro-celebration
function fireCheckConfetti() {
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#243B8F', '#FFF0C9', '#E74C3C', '#2ECC71', '#9B59B6']
        });
    }
}


// Basic HTML escaping
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
