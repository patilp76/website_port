/* =====================================================
   ADMIN DASHBOARD — APP LOGIC
   Persists data via localStorage (shared keys with index.html)
   ===================================================== */

const STORAGE_KEYS = {
    clients: 'mp_clients',
    posts:   'mp_posts',
    settings:'mp_settings'
};

const DEMO_ADMIN_PASSWORD = 'admin123';

const storage = {
    get(key) { try { return JSON.parse(localStorage.getItem(key)) || null; } catch (e) { return null; } },
    set(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} }
};

const getClients  = () => storage.get(STORAGE_KEYS.clients) || [];
const getPosts    = () => storage.get(STORAGE_KEYS.posts)   || [];
const getSettings = () => storage.get(STORAGE_KEYS.settings) || { pricePerPost: 500, currency: '₹' };

const setClients  = (c) => storage.set(STORAGE_KEYS.clients, c);
const setPosts    = (p) => storage.set(STORAGE_KEYS.posts, p);
const setSettings = (s) => storage.set(STORAGE_KEYS.settings, s);

/* ---------- DOM HELPERS ---------- */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* ---------- TOAST ---------- */
let toastTimer;
function showToast(msg, type = 'success') {
    const t = $('#toast');
    t.textContent = msg;
    t.style.background = type === 'error' ? '#dc2626' : '#1a1d24';
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
}

/* ---------- MODAL HELPERS ---------- */
function openModal(id) {
    const overlay = $(`#${id}`);
    if (!overlay) return;
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
        const focusable = overlay.querySelector('button, input, select, textarea');
        if (focusable) focusable.focus();
    }, 50);
}
function closeModal(id) {
    const overlay = $(`#${id}`);
    if (!overlay) return;
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

/* =====================================================
   HELPERS
   ===================================================== */
function nextId(items) {
    return items.length === 0 ? 1 : Math.max(...items.map(i => i.id)) + 1;
}

function formatDate(d) {
    if (!d) return '—';
    try {
        const date = new Date(d);
        return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch { return d; }
}

function postsThisMonth() {
    const month = new Date().toISOString().slice(0, 7);
    return getPosts().filter(p => (p.date || '').startsWith(month) || (p.createdAt || '').startsWith(month));
}

function billablePostsForClient(clientId) {
    // POC: every published post is billable
    return getPosts().filter(p => p.clientId === Number(clientId) && p.published !== false).length;
}

function getCategoryPillClass(cat) {
    const map = {
        'Interior Design': 'pill-blue',
        'Construction': 'pill-orange',
        'Technology': 'pill-purple',
        'Real Estate': 'pill-green',
        'Engineering': 'pill-orange',
        'Other': 'pill-purple'
    };
    return map[cat] || 'pill-gray';
}

/* =====================================================
   RENDER — DASHBOARD
   ===================================================== */
function renderDashboard() {
    const clients = getClients();
    const posts   = getPosts();
    const settings= getSettings();

    $('#dashTotalClients').textContent  = clients.length;
    $('#dashActiveClients').textContent = clients.filter(c => c.active !== false).length;
    $('#dashTotalPosts').textContent    = posts.length;
    $('#dashPostsThisMonth').textContent= postsThisMonth().length;
    $('#dashOffers').textContent        = posts.filter(p => p.type === 'offer' && p.published !== false).length;
    $('#dashBillable').textContent      = posts.filter(p => p.published !== false).length;
    $('#dashRevenue').textContent       = formatCurrency(posts.filter(p => p.published !== false).length * settings.pricePerPost, settings.currency);

    // Recent activity (latest 8 posts)
    const recent = [...posts].sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 8);
    $('#dashRecentBody').innerHTML = recent.map(p => {
        const c = clients.find(x => x.id === p.clientId);
        const type = p.type || 'post';
        return `<tr>
            <td>${c ? `<strong>${c.name}</strong>` : '—'}</td>
            <td>${p.title || '—'}</td>
            <td><span class="pill ${type === 'offer' ? 'pill-orange' : type === 'story' ? 'pill-purple' : 'pill-blue'}">${type}</span></td>
            <td>${formatDate(p.date)}</td>
        </tr>`;
    }).join('') || `<tr><td colspan="4" style="text-align:center; color:var(--text-muted); padding:24px;">No activity yet.</td></tr>`;
}

/* =====================================================
   RENDER — CLIENTS TABLE
   ===================================================== */
function renderClientsTable() {
    const clients = getClients();
    const posts   = getPosts();
    $('#clientCount').textContent = clients.length;
    $('#clientsTableBody').innerHTML = clients.map(c => {
        const postCount = posts.filter(p => p.clientId === c.id).length;
        const status = c.active !== false
            ? '<span class="pill pill-green">Active</span>'
            : '<span class="pill pill-gray">Inactive</span>';
        return `<tr>
            <td>
                <div style="display:flex; align-items:center; gap:10px;">
                    <img src="${c.logo || c.photo || 'https://i.pravatar.cc/100'}" alt="" style="width:36px;height:36px;border-radius:50%;object-fit:cover;border:1px solid var(--border-light);">
                    <div>
                        <strong>${c.name}</strong><br>
                        <span style="font-size:11.5px;color:var(--text-muted)">${(c.tagline || '').slice(0, 50)}</span>
                    </div>
                </div>
            </td>
            <td><span class="pill ${getCategoryPillClass(c.category)}">${c.category || '—'}</span></td>
            <td>${c.location || '—'}</td>
            <td>${postCount}</td>
            <td>${status}</td>
            <td style="text-align:right; white-space:nowrap;">
                <a href="?id=${c.id}" class="admin-icon-btn" title="View public profile"><i class="fa-solid fa-eye"></i></a>
                <button class="admin-icon-btn" data-action="view" data-id="${c.id}" title="View details"><i class="fa-solid fa-circle-info"></i></button>
                <button class="admin-icon-btn" data-action="edit" data-id="${c.id}" title="Edit"><i class="fa-solid fa-pen"></i></button>
                <button class="admin-icon-btn danger" data-action="delete" data-id="${c.id}" title="Delete"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>`;
    }).join('') || `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:24px;">No clients yet. Click "New Client" to add one.</td></tr>`;

    // Bind row actions
    $$('#clientsTableBody [data-action]').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = Number(btn.dataset.id);
            const action = btn.dataset.action;
            if (action === 'view') openViewClient(id);
            else if (action === 'edit') openClientForm(id);
            else if (action === 'delete') deleteClient(id);
        });
    });
}

/* =====================================================
   RENDER — POSTS TABLE
   ===================================================== */
function renderPostsTable() {
    const posts = getPosts();
    const clients = getClients();
    $('#postCount').textContent = posts.length;
    $('#postsTableBody').innerHTML = posts.map(p => {
        const c = clients.find(x => x.id === p.clientId);
        const type = p.type || 'post';
        return `<tr>
            <td><strong>${p.title || '—'}</strong></td>
            <td>${c ? c.name : '—'}</td>
            <td><span class="pill ${type === 'offer' ? 'pill-orange' : type === 'story' ? 'pill-purple' : 'pill-blue'}">${type}</span></td>
            <td>${formatDate(p.date)}</td>
            <td>${p.published !== false ? '<span class="pill pill-green">Published</span>' : '<span class="pill pill-gray">Draft</span>'}</td>
            <td style="text-align:right; white-space:nowrap;">
                <button class="admin-icon-btn" data-action="edit-post" data-id="${p.id}" title="Edit"><i class="fa-solid fa-pen"></i></button>
                <button class="admin-icon-btn danger" data-action="delete-post" data-id="${p.id}" title="Delete"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>`;
    }).join('') || `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:24px;">No posts yet. Click "New Post" to add one.</td></tr>`;

    $$('#postsTableBody [data-action]').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = Number(btn.dataset.id);
            const action = btn.dataset.action;
            if (action === 'edit-post') openPostForm(id);
            else if (action === 'delete-post') deletePost(id);
        });
    });
}

/* =====================================================
   RENDER — BILLING
   ===================================================== */
function renderBilling() {
    const settings = getSettings();
    $('#pricePerPost').value = settings.pricePerPost;
    $('#currencySymbol').value = settings.currency;

    const clients = getClients();
    const posts = getPosts();
    const month = new Date().toISOString().slice(0, 7);

    let totalBillable = 0;
    let totalRevenue = 0;

    $('#billingTableBody').innerHTML = clients.map(c => {
        const allPosts = posts.filter(p => p.clientId === c.id);
        const totalCount = allPosts.length;
        const thisMonth = allPosts.filter(p => (p.date || '').startsWith(month)).length;
        const billable = allPosts.filter(p => p.published !== false).length;
        const amount = billable * settings.pricePerPost;
        totalBillable += billable;
        totalRevenue += amount;
        return `<tr>
            <td><strong>${c.name}</strong></td>
            <td>${totalCount}</td>
            <td>${thisMonth}</td>
            <td>${billable}</td>
            <td style="text-align:right;"><strong>${formatCurrency(amount, settings.currency)}</strong></td>
        </tr>`;
    }).join('') || `<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding:24px;">No clients to bill.</td></tr>`;

    $('#totalBillablePosts').textContent = totalBillable;
    $('#totalRevenue').textContent = formatCurrency(totalRevenue, settings.currency);
}

function formatCurrency(amount, currency) {
    return `${currency || '₹'}${(amount || 0).toLocaleString('en-IN')}`;
}

/* =====================================================
   CLIENT FORM (Create / Edit)
   ===================================================== */
function openClientForm(id = null) {
    const clients = getClients();
    const isEdit = id !== null;
    $('#clientFormTitle').textContent = isEdit ? 'Edit Client' : 'New Client';
    $('#clientIdField').value = isEdit ? id : '';

    if (isEdit) {
        const c = clients.find(x => x.id === id);
        if (!c) return;
        $('#cfName').value        = c.name || '';
        $('#cfCategory').value    = c.category || 'Other';
        $('#cfLocation').value    = c.location || '';
        $('#cfDescription').value = c.description || '';
        $('#cfLogo').value        = c.logo || c.photo || '';
        $('#cfPhone').value       = c.phone || '';
        $('#cfEmail').value       = c.email || '';
        $('#cfWebsite').value     = c.website || '';
        $('#cfWhatsapp').value    = c.whatsapp || '';
        $('#cfTagline').value     = c.tagline || '';
        $('#cfAbout').value       = c.aboutDescription || '';
        $('#cfYears').value       = c.yearsExp || '';
        $('#cfProjects').value    = c.projects || '';
        $('#cfActive').checked    = c.active !== false;
    } else {
        $('#clientForm').reset();
        $('#cfActive').checked = true;
    }
    openModal('clientFormModal');
}

function saveClientForm(e) {
    e.preventDefault();
    const clients = getClients();
    const id = $('#clientIdField').value ? Number($('#clientIdField').value) : null;
    const data = {
        name: $('#cfName').value.trim(),
        category: $('#cfCategory').value,
        location: $('#cfLocation').value.trim(),
        description: $('#cfDescription').value.trim(),
        logo: $('#cfLogo').value.trim() || 'https://i.pravatar.cc/200?img=12',
        photo: $('#cfLogo').value.trim() || 'https://i.pravatar.cc/200?img=12',
        phone: $('#cfPhone').value.trim(),
        email: $('#cfEmail').value.trim(),
        website: $('#cfWebsite').value.trim(),
        whatsapp: $('#cfWhatsapp').value.trim(),
        tagline: $('#cfTagline').value.trim(),
        aboutDescription: $('#cfAbout').value.trim() || $('#cfDescription').value.trim(),
        yearsExp: $('#cfYears').value.trim(),
        projects: $('#cfProjects').value.trim(),
        clients: '—',
        mission: '',
        founded: '',
        active: $('#cfActive').checked
    };

    if (!data.name || !data.category || !data.location) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    if (id) {
        const idx = clients.findIndex(c => c.id === id);
        if (idx >= 0) {
            clients[idx] = { ...clients[idx], ...data };
            showToast(`Client "${data.name}" updated`);
        }
    } else {
        const newId = nextId(clients);
        clients.push({ id: newId, ...data });
        showToast(`Client "${data.name}" created`);
    }
    setClients(clients);
    closeModal('clientFormModal');
    renderAll();
}

function deleteClient(id) {
    if (!confirm('Delete this client? This will also remove all their posts.')) return;
    const clients = getClients().filter(c => c.id !== id);
    const posts   = getPosts().filter(p => p.clientId !== id);
    setClients(clients);
    setPosts(posts);
    showToast('Client deleted');
    renderAll();
}

function openViewClient(id) {
    const c = getClients().find(x => x.id === id);
    if (!c) return;
    const posts = getPosts().filter(p => p.clientId === id);
    $('#viewClientBody').innerHTML = `
        <div class="view-client-detail">
            <div class="view-client-header">
                <img src="${c.logo || c.photo || ''}" alt="">
                <div>
                    <h4>${c.name}</h4>
                    <span>${c.tagline || ''}</span>
                </div>
            </div>
            <div class="view-client-row"><strong>Category</strong><span>${c.category || '—'}</span></div>
            <div class="view-client-row"><strong>Location</strong><span>${c.location || '—'}</span></div>
            <div class="view-client-row"><strong>Phone</strong><span>${c.phone || '—'}</span></div>
            <div class="view-client-row"><strong>Email</strong><span>${c.email || '—'}</span></div>
            <div class="view-client-row"><strong>Website</strong><span>${c.website || '—'}</span></div>
            <div class="view-client-row"><strong>WhatsApp</strong><span>${c.whatsapp || '—'}</span></div>
            <div class="view-client-row"><strong>Description</strong><span>${c.description || '—'}</span></div>
            <div class="view-client-row"><strong>About</strong><span>${c.aboutDescription || '—'}</span></div>
            <div class="view-client-row"><strong>Total Posts</strong><span>${posts.length}</span></div>
            <div class="view-client-row"><strong>Public Profile</strong><span><a href="?id=${c.id}" target="_blank" style="color:var(--color-blue)">Open →</a></span></div>
        </div>
    `;
    openModal('viewClientModal');
}

/* =====================================================
   POST FORM (Create / Edit)
   ===================================================== */
function openPostForm(id = null) {
    const clients = getClients();
    const posts = getPosts();
    const isEdit = id !== null;

    // Populate client select
    const sel = $('#pfClient');
    sel.innerHTML = '<option value="">— Select client —</option>' + clients.map(c =>
        `<option value="${c.id}">${c.name}</option>`
    ).join('');

    $('#postFormTitle').textContent = isEdit ? 'Edit Post' : 'New Post';
    $('#postIdField').value = isEdit ? id : '';

    if (isEdit) {
        const p = posts.find(x => x.id === id);
        if (!p) return;
        $('#pfClient').value     = p.clientId;
        $('#pfType').value       = p.type || 'post';
        $('#pfTitle').value      = p.title || '';
        $('#pfDescription').value= p.description || '';
        $('#pfImage').value      = p.image || '';
        $('#pfDate').value       = p.date || '';
        $('#pfBadge').value      = p.badge || '';
        $('#pfValidity').value   = p.validity || '';
        $('#pfPublished').checked= p.published !== false;
    } else {
        $('#postForm').reset();
        $('#pfType').value = 'post';
        $('#pfDate').value = new Date().toISOString().slice(0, 10);
        $('#pfPublished').checked = true;
        $('#pfClient').value = '';
    }
    toggleOfferFields();
    openModal('postFormModal');
}

function toggleOfferFields() {
    const type = $('#pfType').value;
    const isOffer = type === 'offer';
    $('#pfBadgeField').hidden = !isOffer;
    $('#pfValidityField').hidden = !isOffer;
    $('#pfImageField').hidden = type === 'story' && !$('#pfImage').value;
    // Image is required for posts and offers, optional for stories
}

function savePostForm(e) {
    e.preventDefault();
    const posts = getPosts();
    const id = $('#postIdField').value ? Number($('#postIdField').value) : null;
    const clientId = Number($('#pfClient').value);
    if (!clientId) { showToast('Please select a client', 'error'); return; }
    if (!$('#pfTitle').value.trim()) { showToast('Title is required', 'error'); return; }

    const data = {
        clientId,
        type: $('#pfType').value,
        title: $('#pfTitle').value.trim(),
        description: $('#pfDescription').value.trim(),
        image: $('#pfImage').value.trim() || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=600&fit=crop',
        date: $('#pfDate').value || new Date().toISOString().slice(0, 10),
        badge: $('#pfBadge').value.trim() || 'OFFER',
        validity: $('#pfValidity').value.trim() || '',
        published: $('#pfPublished').checked
    };

    if (id) {
        const idx = posts.findIndex(p => p.id === id);
        if (idx >= 0) {
            posts[idx] = { ...posts[idx], ...data };
            showToast(`Post updated`);
        }
    } else {
        const newId = nextId(posts);
        posts.push({ id: newId, ...data, createdAt: new Date().toISOString() });
        showToast(`Post added`);
    }
    setPosts(posts);
    closeModal('postFormModal');
    renderAll();
}

function deletePost(id) {
    if (!confirm('Delete this post?')) return;
    const posts = getPosts().filter(p => p.id !== id);
    setPosts(posts);
    showToast('Post deleted');
    renderAll();
}

/* =====================================================
   TABS
   ===================================================== */
function switchAdminTab(tabName) {
    $$('.admin-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tabName));
    $$('.admin-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === tabName));
    if (tabName === 'dashboard') renderDashboard();
    else if (tabName === 'clients') renderClientsTable();
    else if (tabName === 'posts') renderPostsTable();
    else if (tabName === 'billing') renderBilling();
}

/* =====================================================
   RENDER ALL
   ===================================================== */
function renderAll() {
    renderDashboard();
    renderClientsTable();
    renderPostsTable();
    renderBilling();
}

/* =====================================================
   EVENTS
   ===================================================== */
function bindEvents() {
    // Tabs
    $$('.admin-tab').forEach(tab => {
        tab.addEventListener('click', () => switchAdminTab(tab.dataset.tab));
    });

    // Add buttons
    $('#addClientBtn').addEventListener('click', () => openClientForm());
    $('#addClientBtn2').addEventListener('click', () => openClientForm());
    $('#addPostBtn').addEventListener('click', () => openPostForm());
    $('#addPostBtn2').addEventListener('click', () => openPostForm());

    // Forms
    $('#clientForm').addEventListener('submit', saveClientForm);
    $('#postForm').addEventListener('submit', savePostForm);
    $('#pfType').addEventListener('change', toggleOfferFields);

    // Modal close
    $$('[data-close]').forEach(btn => {
        btn.addEventListener('click', () => closeModal(btn.dataset.close));
    });

    // Click outside modal
    $$('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal(overlay.id);
        });
    });

    // ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            $$('.modal-overlay.active').forEach(o => closeModal(o.id));
        }
    });

    // Billing config
    $('#pricePerPost').addEventListener('change', (e) => {
        const s = getSettings();
        s.pricePerPost = Number(e.target.value) || 0;
        setSettings(s);
        renderBilling();
        renderDashboard();
    });
    $('#currencySymbol').addEventListener('change', (e) => {
        const s = getSettings();
        s.currency = e.target.value || '₹';
        setSettings(s);
        renderBilling();
        renderDashboard();
    });
}

/* =====================================================
   INIT
   ===================================================== */
function init() {
    $('#adminLoginForm').addEventListener('submit', handleAdminLogin);
    $('#adminLogoutBtn').addEventListener('click', lockAdmin);
    bindEvents();
    $('#adminPassword').focus();
}

function handleAdminLogin(event) {
    event.preventDefault();
    if ($('#adminPassword').value !== DEMO_ADMIN_PASSWORD) {
        $('#adminLoginError').hidden = false;
        $('#adminPassword').select();
        return;
    }

    $('#adminLogin').hidden = true;
    $('#adminLoginError').hidden = true;
    $('#adminApp').classList.remove('is-locked');
    renderAll();
}

function lockAdmin() {
    $('#adminApp').classList.add('is-locked');
    $('#adminLogin').hidden = false;
    $('#adminPassword').value = '';
    $('#adminPassword').focus();
}

document.addEventListener('DOMContentLoaded', init);