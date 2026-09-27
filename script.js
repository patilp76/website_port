/* =====================================================
   MULTI-CLIENT PLATFORM — APP LOGIC
   Extends the original business profile POC.

   Architecture:
   - Portfolio: list of all clients
   - Client profile: existing UI, now data-driven per clientId
   - Admin: separate page (admin.html) for client/post management
   - Persistence: localStorage (POC), ready to swap for REST APIs

   Future REST endpoints (mirrored in code):
     GET    /api/clients
     GET    /api/clients/{id}
     POST   /api/clients
     PUT    /api/clients/{id}
     GET    /api/clients/{id}/posts
     POST   /api/clients/{id}/posts
     GET    /api/admin/dashboard
     GET    /api/admin/billing
   ===================================================== */

/* ---------- STORAGE LAYER (localStorage, swap for fetch) ---------- */
const STORAGE_KEYS = {
    clients: 'mp_clients',
    posts:   'mp_posts',
    settings:'mp_settings'
};

const storage = {
    get(key) {
        try { return JSON.parse(localStorage.getItem(key)) || null; }
        catch (e) { return null; }
    },
    set(key, val) {
        try { localStorage.setItem(key, JSON.stringify(val)); }
        catch (e) { console.warn('localStorage write failed', e); }
    }
};

/* ---------- SEED DATA (used only on first load) ---------- */
const SEED_CLIENTS = [
    {
        id: 1,
        name: "ABC Interiors",
        category: "Interior Design",
        location: "Pune, Maharashtra",
        description: "Award-winning interior design studio specializing in corporate offices, retail, and residential spaces.",
        logo: "https://i.pravatar.cc/200?img=12",
        photo: "https://i.pravatar.cc/200?img=12",
        phone: "+91 98765 43210",
        email: "hello@abcinteriors.com",
        website: "https://abcinteriors.com",
        whatsapp: "+919876543210",
        tagline: "Architect • Interior Designer • Project Consultant",
        yearsExp: "12+", projects: "180+", clients: "45+",
        aboutDescription: "ABC Interiors is a Pune-based architecture and interior design firm specializing in commercial, residential, and corporate projects. With over 12 years of experience, we deliver thoughtful design, transparent execution, and lasting partnerships.",
        mission: "To design functional, beautiful, and sustainable spaces that elevate the way people live and work.",
        founded: "Established 2012",
        active: true
    },
    {
        id: 2,
        name: "Sai Construction",
        category: "Construction",
        location: "Pune, Maharashtra",
        description: "Full-service construction company delivering commercial buildings, villas, and industrial projects on time.",
        logo: "https://i.pravatar.cc/200?img=33",
        photo: "https://i.pravatar.cc/200?img=33",
        phone: "+91 90111 22334",
        email: "contact@saiconstruction.in",
        website: "https://saiconstruction.in",
        whatsapp: "+919011122334",
        tagline: "Building Trust. Delivering Quality.",
        yearsExp: "20+", projects: "320+", clients: "120+",
        aboutDescription: "Sai Construction is one of Pune's most reliable construction firms with two decades of experience in residential, commercial, and industrial projects.",
        mission: "To deliver on-time, on-budget construction with uncompromising quality and safety.",
        founded: "Established 2004",
        active: true
    },
    {
        id: 3,
        name: "TechNova Solutions",
        category: "Technology",
        location: "Mumbai, Maharashtra",
        description: "B2B software and cloud services for SMEs — websites, mobile apps, and ERP integrations.",
        logo: "https://i.pravatar.cc/200?img=68",
        photo: "https://i.pravatar.cc/200?img=68",
        phone: "+91 99876 55432",
        email: "hi@technova.io",
        website: "https://technova.io",
        whatsapp: "+919987655432",
            tagline: "Engineering digital experiences.",
        yearsExp: "8+", projects: "210+", clients: "85+",
        aboutDescription: "TechNova Solutions builds reliable web, mobile, and cloud products for ambitious SMEs across India.",
        mission: "Make enterprise-grade technology accessible and affordable for growing businesses.",
        founded: "Established 2016",
        active: true
    },
    {
        id: 4,
        name: "Shree Real Estate",
        category: "Real Estate",
        location: "Pune, Maharashtra",
        description: "Trusted real estate advisory for residential plots, apartments, and commercial properties across Pune.",
        logo: "https://i.pravatar.cc/200?img=51",
        photo: "https://i.pravatar.cc/200?img=51",
        phone: "+91 90909 90909",
        email: "info@shreerealestate.com",
        website: "https://shreerealestate.com",
        whatsapp: "+919090990909",
        tagline: "Your property, our priority.",
        yearsExp: "15+", projects: "500+", clients: "400+",
        aboutDescription: "Shree Real Estate is a customer-first real estate advisory helping families and investors find the right property in Pune and PCMC.",
        mission: "Make property ownership simple, transparent, and rewarding.",
        founded: "Established 2009",
        active: true
    },
    {
        id: 5,
        name: "Patil Engineering",
        category: "Engineering",
        location: "Nashik, Maharashtra",
        description: "Precision engineering and fabrication services for industrial and agricultural sectors.",
        logo: "https://i.pravatar.cc/200?img=15",
        photo: "https://i.pravatar.cc/200?img=15",
        phone: "+91 88888 77777",
        email: "sales@patilengineering.in",
        website: "https://patilengineering.in",
        whatsapp: "+918888877777",
        tagline: "Engineered to last.",
        yearsExp: "25+", projects: "1000+", clients: "200+",
        aboutDescription: "Patil Engineering has been delivering precision-engineered components and assemblies for industries across Maharashtra for 25+ years.",
        mission: "Combine craftsmanship with modern manufacturing to deliver reliable engineering solutions.",
        founded: "Established 1999",
        active: true
    },
    {
            id: 6,
        name: "GreenLeaf Organics",
        category: "Other",
        location: "Satara, Maharashtra",
        description: "Farm-to-table organic produce and natural wellness products sourced from Sahyadri farms.",
        logo: "https://i.pravatar.cc/200?img=47",
        photo: "https://i.pravatar.cc/200?img=47",
        phone: "+91 77777 66666",
        email: "hello@greenleaf.farm",
        website: "https://greenleaf.farm",
        whatsapp: "+917777766666",
        tagline: "Pure. Natural. Honest.",
        yearsExp: "6+", projects: "90+", clients: "1500+",
        aboutDescription: "GreenLeaf Organics works directly with farmers in the Sahyadri ranges to bring certified organic produce to urban homes.",
        mission: "Make healthy, chemical-free food accessible to every household.",
        founded: "Established 2018",
        active: true
    }
];

/* Each post/stories/offer/services/requirement belongs to one client via clientId */
const SEED_POSTS = [
    // ABC Interiors (id:1)
    { id: 1,  clientId: 1, type: 'post',  title: "Special Offer on Office Interiors", description: "Get exclusive discounts on modern and customized office interior solutions.", date: "2026-05-20", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=600&fit=crop", published: true, likes: 124 },
    { id: 2,  clientId: 1, type: 'post',  title: "We are Hiring!", description: "Looking for talented designers and PMs to join our growing team.", date: "2026-05-18", image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&h=600&fit=crop", published: true, likes: 89 },
    { id: 3,  clientId: 1, type: 'post',  title: "New Corporate Project Completed", description: "Successfully delivered a 12,000 sqft corporate office in Pune.", date: "2026-05-15", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=600&fit=crop", published: true, likes: 215 },
    { id: 4,  clientId: 1, type: 'post',  title: "Awarded Best Design Studio 2026", description: "Honored to receive the Best Design Studio award at the Maharashtra Architecture Summit 2026.", date: "2026-05-10", image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&h=600&fit=crop", published: true, likes: 167 },
    { id: 5,  clientId: 1, type: 'story', title: "Studio Tour",         image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=200&h=200&fit=crop" },
    { id: 6,  clientId: 1, type: 'story', title: "New Project",         image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=200&h=200&fit=crop" },
    { id: 7,  clientId: 1, type: 'story', title: "Team Meet",           image: "https://images.unsplash.com/photo-1542744095-291d1f67b221?w=200&h=200&fit=crop" },
    { id: 8,  clientId: 1, type: 'offer', badge: "20% OFF", title: "Summer Interior Sale",     description: "Flat 20% off on full home interior packages.", validity: "Valid till June 30, 2026" },
    { id: 9,  clientId: 1, type: 'offer', badge: "NEW",    title: "Free Consultation",         description: "Free on-site consultation for office interior projects.", validity: "Limited slots" },
    { id: 10, clientId: 1, type: 'offer', badge: "BUNDLE", title: "Design + Build Combo",      description: "Save more with our combined design and execution packages.", validity: "Ongoing offer" },
    // Sai Construction (id:2)
    { id: 11, clientId: 2, type: 'post',  title: "New Villa Project Launch",     description: "Groundbreaking ceremony for our 4500 sqft luxury villa in Koregaon Park.", date: "2026-05-19", image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&h=600&fit=crop", published: true, likes: 102 },
    { id: 12, clientId: 2, type: 'post',  title: "Construction Offer This Month", description: "5% discount on contracts signed before June 30.", date: "2026-05-16", image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=600&fit=crop", published: true, likes: 76 },
    { id: 13, clientId: 2, type: 'post',  title: "Completed Commercial Project",  description: "Delivered a 25,000 sqft commercial complex in Baner ahead of schedule.", date: "2026-05-12", image: "https://images.unsplash.com/photo-1503387837-b154d5074bd2?w=600&h=600&fit=crop", published: true, likes: 145 },
    { id: 14, clientId: 2, type: 'story', title: "Site Visit",           image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=200&h=200&fit=crop" },
    { id: 15, clientId: 2, type: 'story', title: "Equipment",            image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=200&h=200&fit=crop" },
    { id: 16, clientId: 2, type: 'offer', badge: "5% OFF", title: "Early-Bird Contract Discount", description: "Sign before June 30 to lock in 5% off total contract value.", validity: "Valid till June 30, 2026" },
    { id: 17, clientId: 2, type: 'offer', badge: "FREE",  title: "Free Site Inspection",         description: "Book a free site visit and quotation this month.", validity: "Limited slots" },
    // TechNova Solutions (id:3)
    { id: 18, clientId: 3, type: 'post',  title: "New SaaS Product Launch",   description: "Introducing CloudDesk — our new ERP for retail businesses.", date: "2026-05-21", image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=600&fit=crop", published: true, likes: 312 },
    { id: 19, clientId: 3, type: 'post',  title: "We Are Hiring Engineers",    description: "Looking for full-stack and DevOps engineers (3-7 yrs).", date: "2026-05-17", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=600&fit=crop", published: true, likes: 198 },
    { id: 20, clientId: 3, type: 'post',  title: "Office Move to BKC",         description: "We've moved to a new 6000 sqft office in Bandra Kurla Complex.", date: "2026-05-09", image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=600&h=600&fit=crop", published: true, likes: 87 },
    { id: 21, clientId: 3, type: 'story', title: "Team Offsite",  image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=200&h=200&fit=crop" },
    { id: 22, clientId: 3, type: 'story', title: "Hackathon",     image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=200&h=200&fit=crop" },
    { id: 23, clientId: 3, type: 'offer', badge: "30% OFF", title: "CloudDesk Launch Pricing", description: "30% off for the first 3 months on any annual plan.", validity: "First 50 customers" },
    // Shree Real Estate (id:4)
    { id: 24, clientId: 4, type: 'post',  title: "New Project: Green Valley",     description: "Pre-launch of 2 & 3 BHK apartments in Wagholi.", date: "2026-05-20", image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=600&fit=crop", published: true, likes: 256 },
    { id: 25, clientId: 4, type: 'post',  title: "Open House This Saturday",      description: "Visit our sample flat in Hinjewadi this Saturday 10am-6pm.", date: "2026-05-15", image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&h=600&fit=crop", published: true, likes: 134 },
    { id: 26, clientId: 4, type: 'post',  title: "100 Families Settled",         description: "Crossed 100 happy families in our Riverside project.", date: "2026-05-08", image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&h=600&fit=crop", published: true, likes: 412 },
    { id: 27, clientId: 4, type: 'story', title: "Site Walk",   image: "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=200&h=200&fit=crop" },
    { id: 28, clientId: 4, type: 'offer', badge: "PRE-LAUNCH", title: "Green Valley Pre-Launch Offer", description: "Book a 2 BHK at pre-launch prices with 0% processing fees.", validity: "Limited units" },
    // Patil Engineering (id:5)
    { id: 29, clientId: 5, type: 'post',  title: "New CNC Machine Installed",    description: "Installed state-of-the-art 5-axis CNC for precision parts.", date: "2026-05-18", image: "https://images.unsplash.com/photo-1565043666747-69f6646db940?w=600&h=600&fit=crop", published: true, likes: 78 },
    { id: 30, clientId: 5, type: 'post',  title: "ISO 9001:2015 Re-certified",   description: "Successfully renewed our ISO 9001:2015 certification.", date: "2026-05-11", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=600&fit=crop", published: true, likes: 56 },
    { id: 31, clientId: 5, type: 'story', title: "Factory Floor", image: "https://images.unsplash.com/photo-1581092335397-9583eb92d232?w=200&h=200&fit=crop" },
    { id: 32, clientId: 5, type: 'offer', badge: "BULK", title: "Bulk Order Discount", description: "10% off on orders above ₹5 lakhs.", validity: "Ongoing" },

    // GreenLeaf Organics (id:6)
    { id: 33, clientId: 6, type: 'post',  title: "Monsoon Harvest Begins",      description: "Fresh leafy greens and millets now available.", date: "2026-05-22", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=600&fit=crop", published: true, likes: 289 },
    { id: 34, clientId: 6, type: 'post',  title: "Farm Visit Saturday",         description: "Bring your family for a free tour of our Sahyadri farm.", date: "2026-05-14", image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&h=600&fit=crop", published: true, likes: 167 },
    { id: 35, clientId: 6, type: 'story', title: "Farm Tour",  image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=200&h=200&fit=crop" },
    { id: 36, clientId: 6, type: 'offer', badge: "FREE", title: "First Box Free", description: "Get your first organic produce box absolutely free.", validity: "New customers only" }
];
const SEED_SERVICES = {
    1: [
        { icon: "fa-pen-ruler", name: "Office Interior Design", description: "End-to-end interior design for corporate offices." },
        { icon: "fa-building", name: "Commercial Construction", description: "Turnkey construction for commercial spaces." },
        { icon: "fa-drafting-compass", name: "Architecture Services", description: "Concept design, planning, and architectural drawings." },
        { icon: "fa-tasks", name: "Project Management", description: "Dedicated PMs for timelines, vendors, and quality." },
        { icon: "fa-comments", name: "Consulting Services", description: "Expert advice on space planning and materials." }
    ],
    2: [
        { icon: "fa-home", name: "Residential Construction", description: "Villas, bungalows, and apartment buildings." },
        { icon: "fa-industry", name: "Industrial Projects", description: "Factories, warehouses, and industrial sheds." },
        { icon: "fa-hard-hat", name: "Renovation", description: "Structural renovation and remodeling." },
        { icon: "fa-tasks", name: "Project Management", description: "Time, cost, and quality control." }
    ],
    3: [
        { icon: "fa-code", name: "Web Development", description: "Modern web apps using React, Node, and cloud." },
        { icon: "fa-mobile-screen", name: "Mobile Apps", description: "iOS and Android apps for SMEs." },
        { icon: "fa-cloud", name: "Cloud Services", description: "AWS, Azure, and GCP migrations." },
        { icon: "fa-sitemap", name: "ERP Integration", description: "Connect your business tools end-to-end." }
    ],
    4: [
        { icon: "fa-house-chimney", name: "Residential Sales", description: "Plots, apartments, and villas." },
        { icon: "fa-building", name: "Commercial Properties", description: "Offices, shops, and showrooms." },
        { icon: "fa-file-contract", name: "Property Consulting", description: "Investment and legal advisory." }
    ],
    5: [
        { icon: "fa-cogs", name: "CNC Machining", description: "Precision CNC turning and milling." },
        { icon: "fa-industry", name: "Fabrication", description: "Custom metal fabrication and assembly." },
        { icon: "fa-truck", name: "Industrial Supplies", description: "OEM and replacement parts." }
    ],
    6: [
        { icon: "fa-leaf", name: "Organic Produce", description: "Fruits, vegetables, millets, and pulses." },
        { icon: "fa-truck-fast", name: "Home Delivery", description: "Same-day delivery in Pune and Mumbai." },
        { icon: "fa-store", name: "Wholesale Supply", description: "Bulk orders for restaurants and stores." }
    ]
};

const SEED_REQUIREMENTS = {
    1: [
        { title: "Looking for Interior Designers", description: "Experienced interior designers (2-6 yrs) for full-time roles.", date: "Posted: May 20, 2026" },
        { title: "Looking for Construction Partners", description: "Vendors for civil, electrical, and plumbing work.", date: "Posted: May 15, 2026" },
        { title: "Looking for Material Suppliers", description: "Reliable suppliers of plywood, laminates, paints, hardware.", date: "Posted: May 10, 2026" }
    ],
    2: [
        { title: "Hiring Civil Engineers", description: "Site engineers and project managers (3-8 yrs).", date: "Posted: May 18, 2026" },
        { title: "Equipment Rental", description: "Need JCB, poclain, and tower crane on rent.", date: "Posted: May 12, 2026" }
    ],
    3: [
        { title: "Senior Full-Stack Engineer", description: "React/Node, 4+ yrs, immediate joiners preferred.", date: "Posted: May 21, 2026" },
        { title: "DevOps Engineer", description: "AWS, Kubernetes, CI/CD pipelines.", date: "Posted: May 16, 2026" },
        { title: "UI/UX Designer", description: "Portfolio-driven designer for product team.", date: "Posted: May 8, 2026" }
    ],
    4: [
        { title: "Channel Partners", description: "Real estate agents for project sales.", date: "Posted: May 14, 2026" },
        { title: "Loan Partners", description: "Banks and NBFCs for home loan tie-ups.", date: "Posted: May 5, 2026" }
    ],
    5: [
        { title: "CNC Operators", description: "Experienced CNC operators for night shift.", date: "Posted: May 19, 2026" },
        { title: "Raw Material Suppliers", description: "MS, SS, and aluminum sheets and rods.", date: "Posted: May 11, 2026" }
    ],
    6: [
        { title: "Farming Partners", description: "Organic-certified farmers in Western Maharashtra.", date: "Posted: May 13, 2026" },
        { title: "Delivery Partners", description: "Refrigerated van owners for daily routes.", date: "Posted: May 6, 2026" }
    ]
};

const DEFAULT_SETTINGS = {
    pricePerPost: 500,
    currency: '₹'
};

/* ---------- STATE (loaded from storage or seed) ---------- */
function initStore() {
    let clients = storage.get(STORAGE_KEYS.clients);
    let posts   = storage.get(STORAGE_KEYS.posts);
    let settings= storage.get(STORAGE_KEYS.settings);

    if (!clients) { clients = SEED_CLIENTS; storage.set(STORAGE_KEYS.clients, clients); }
    if (!posts)   { posts   = SEED_POSTS;   storage.set(STORAGE_KEYS.posts,   posts); }
    if (!settings){ settings= DEFAULT_SETTINGS; storage.set(STORAGE_KEYS.settings, settings); }

    return { clients, posts, settings };
}

const store = initStore();

/* Convenience helpers */
const getClients = () => storage.get(STORAGE_KEYS.clients) || [];
const getPosts   = () => storage.get(STORAGE_KEYS.posts)   || [];
const getSettings= () => storage.get(STORAGE_KEYS.settings) || DEFAULT_SETTINGS;

const getClient = (id) => getClients().find(c => c.id === Number(id));
const getClientPosts = (id) => getPosts()
    .filter(p => p.clientId === Number(id) && p.published !== false)
    .sort((a, b) => (Date.parse(b.createdAt || b.date || '') || 0) - (Date.parse(a.createdAt || a.date || '') || 0));

/* ---------- APP / VIEW STATE ---------- */
let appState = {
    view: 'portfolio',     // 'portfolio' | 'profile'
    currentClientId: null,
    searchQuery: '',
    activeCategory: 'All',
    activeTab: 'posts'
};

/* ---------- DOM HELPERS ---------- */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* ---------- URL ROUTING ----------
   /                -> portfolio
   /?id=1           -> client profile
*/
function getUrlClientId() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    return id ? Number(id) : null;
}

function setUrl(view, clientId) {
    const url = new URL(window.location);
    if (view === 'profile' && clientId) {
        url.searchParams.set('id', clientId);
    } else {
        url.searchParams.delete('id');
    }
    window.history.pushState({}, '', url);
}

window.addEventListener('popstate', () => {
    routeFromUrl();
});

window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEYS.clients || event.key === STORAGE_KEYS.posts) {
        routeFromUrl();
    }
});

function routeFromUrl() {
    const id = getUrlClientId();
    const view = id ? 'profile' : 'portfolio';
    if (view === 'profile' && getClient(id)) {
        showProfile(id);
    } else {
        showPortfolio();
        if (id) setUrl('portfolio'); // invalid id -> go home
    }
}

function goTo(clientId) {
    setUrl('profile', clientId);
    showProfile(clientId);
    window.scrollTo({ top: 0, behavior: 'instant' });
}

function goHome() {
    setUrl('portfolio');
    showPortfolio();
    window.scrollTo({ top: 0, behavior: 'instant' });
}

/* =====================================================
   VIEW SWITCHING (portfolio <-> profile)
   The profile UI is the EXISTING design — only its
   data sources are now dynamic per client.
   ===================================================== */
function showPortfolio() {
    appState.view = 'portfolio';
    $('#portfolioView').hidden = false;
    $('#profileView').hidden = true;
    document.body.classList.remove('view-profile');
    document.body.classList.add('view-portfolio');
    renderPortfolio();
}

function showProfile(clientId) {
    const client = getClient(clientId);
    if (!client) { goHome(); return; }
    appState.view = 'profile';
    appState.currentClientId = clientId;
    $('#portfolioView').hidden = true;
    $('#profileView').hidden = false;
    document.body.classList.remove('view-portfolio');
    document.body.classList.add('view-profile');
    renderProfile();
    renderClientPosts();
    renderStories();
    renderOffers();
    renderServices();
    renderRequirements();
    renderAbout();
    bindProfileEvents();
}

/* =====================================================
   PORTFOLIO VIEW
   ===================================================== */
const CATEGORIES = ['All', 'Interior Design', 'Construction', 'Technology', 'Real Estate', 'Engineering', 'Other'];

function getFilteredClients() {
    const q = (appState.searchQuery || '').trim().toLowerCase();
    const cat = appState.activeCategory;
    return getClients().filter(c => {
        if (cat !== 'All' && c.category !== cat) return false;
        if (!q) return true;
        return (
            (c.name || '').toLowerCase().includes(q) ||
            (c.category || '').toLowerCase().includes(q) ||
            (c.location || '').toLowerCase().includes(q) ||
            (c.description || '').toLowerCase().includes(q)
        );
    });
}

function getPostCount(clientId) {
    return getPosts().filter(p => p.clientId === Number(clientId)).length;
}

function getCategoryColor(category) {
    const map = {
        'Interior Design': 'blue',
        'Construction': 'orange',
        'Technology': 'purple',
        'Real Estate': 'green',
        'Engineering': 'orange',
        'Other': 'purple'
    };
    return map[category] || 'blue';
}

function renderPortfolio() {
    // Hero stats
    const allClients = getClients();
    const allPosts = getPosts();
    $('#statTotalClients').textContent = allClients.length;
    $('#statTotalPosts').textContent   = allPosts.length;
        const month = new Date().toISOString().slice(0, 7);
    const postsThisMonth = allPosts.filter(p => (p.date || '').startsWith(month) || (p.createdAt || '').startsWith(month)).length;
    $('#statPostsThisMonth').textContent = postsThisMonth;
    $('#statActiveClients').textContent = allClients.filter(c => c.active !== false).length;

    // Category filter buttons
    const filtersHost = $('#categoryFilters');
    filtersHost.innerHTML = CATEGORIES.map(cat => `
        <button class="filter-chip ${cat === appState.activeCategory ? 'active' : ''}" data-category="${cat}">${cat}</button>
    `).join('');

    $$('.filter-chip', filtersHost).forEach(btn => {
        btn.addEventListener('click', () => {
            appState.activeCategory = btn.dataset.category;
            renderClientGrid();
            // Update active class without full re-render
            $$('.filter-chip', filtersHost).forEach(b => b.classList.toggle('active', b === btn));
        });
    });

    renderClientGrid();
}

function renderClientGrid() {
    const grid = $('#clientGrid');
    const empty = $('#emptyState');
    const results = getFilteredClients();
    $('#resultCount').textContent = `${results.length} ${results.length === 1 ? 'client' : 'clients'}`;

    if (results.length === 0) {
        grid.innerHTML = '';
        empty.style.display = 'block';
        return;
    }
    empty.style.display = 'none';

    grid.innerHTML = results.map(c => {
        const color = getCategoryColor(c.category);
        const postCount = getPostCount(c.id);
        return `
        <article class="client-card" data-client-id="${c.id}">
            <div class="client-card-banner banner-${color}">
                <span class="client-category-pill">${c.category}</span>
                <img class="client-logo" src="${c.logo}" alt="${c.name} logo" loading="lazy">
            </div>
            <div class="client-card-body">
                <h3 class="client-name">${c.name}</h3>
                <p class="client-location"><i class="fa-solid fa-location-dot"></i> ${c.location}</p>
                <p class="client-desc">${c.description}</p>
                <div class="client-card-footer">
                    <span class="client-post-count"><i class="fa-regular fa-newspaper"></i> ${postCount} ${postCount === 1 ? 'post' : 'posts'}</span>
                    <button class="view-profile-btn" data-client-id="${c.id}">
                        View Profile <i class="fa-solid fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        </article>`;
    }).join('');

    // Bind clicks
    $$('.client-card', grid).forEach(card => {
        card.addEventListener('click', (e) => {
            const id = Number(card.dataset.clientId);
            goTo(id);
        });
    });
}

/* =====================================================
   PROFILE VIEW — reuses existing render logic but
   pulls from the current client.
   ===================================================== */
function getCurrentClient() {
    return getClient(appState.currentClientId);
}

function renderProfile() {
    const c = getCurrentClient();
    if (!c) return;
    $('#profileName').textContent     = c.name;
    $('#profileLocation').textContent = c.location;
    $('#profilePhoto').src            = c.photo || c.logo;
    $('#profileTagline').textContent  = c.tagline || '';
    $('#statYears').textContent       = c.yearsExp || '—';
    $('#statProjects').textContent    = c.projects || '—';
    $('#statClients').textContent     = c.clients  || '—';
    document.title = `${c.name} — Profile`;
}

function renderClientPosts() {
    const c = getCurrentClient();
    if (!c) return;
    const posts = getClientPosts(c.id);
    // First 3 in the home view, full list in "view all"
    renderUpdates($('#updatesList'), posts.slice(0, 3));
}

function renderStories() {
    const c = getCurrentClient();
    if (!c) return;
    const stories = getClientPosts(c.id).filter(p => p.type === 'story');
    const panel = $('#panel-stories');
    if (stories.length === 0) {
        panel.innerHTML = `<div class="empty-mini"><i class="fa-regular fa-images"></i><p>No stories yet.</p></div>`;
        return;
    }
    panel.innerHTML = `<div class="stories-grid">${stories.map(s => `
        <div class="story-item">
            <div class="story-ring">
                <img class="story-thumb" src="${s.image}" alt="${s.title || s.label || 'Story'}" loading="lazy">
            </div>
            <div class="story-label">${s.title || s.label || ''}</div>
        </div>
    `).join('')}</div>`;
}

function renderOffers() {
    const c = getCurrentClient();
    if (!c) return;
    const offers = getClientPosts(c.id).filter(p => p.type === 'offer');
    const panel = $('#panel-offers');
    if (offers.length === 0) {
        panel.innerHTML = `<div class="empty-mini"><i class="fa-solid fa-tags"></i><p>No active offers.</p></div>`;
        return;
    }
    panel.innerHTML = offers.map(o => `
        <div class="offer-card">
            <span class="offer-badge">${o.badge || 'OFFER'}</span>
            <h4 class="offer-title">${o.title}</h4>
            <p class="offer-desc">${o.description || ''}</p>
            <div class="offer-validity"><i class="fa-regular fa-clock"></i> ${o.validity || ''}</div>
        </div>
    `).join('');
}

function renderServices() {
    const c = getCurrentClient();
    if (!c) return;
    const services = SEED_SERVICES[c.id] || SEED_SERVICES[1];
    $('#serviceList').innerHTML = services.map(s => `
        <article class="service-card">
            <div class="service-icon"><i class="fa-solid ${s.icon}"></i></div>
            <div class="service-content">
                <h4 class="service-name">${s.name}</h4>
                <p class="service-desc">${s.description}</p>
                <button class="service-action" data-service="${s.name}">
                    View Details <i class="fa-solid fa-arrow-right" style="font-size:10px"></i>
                </button>
            </div>
        </article>
    `).join('');

    $$('.service-action').forEach(btn => {
        btn.addEventListener('click', () => {
            showToast(`Details for "${btn.dataset.service}" coming soon`);
        });
    });
}

function renderRequirements() {
    const c = getCurrentClient();
    if (!c) return;
    const requirements = SEED_REQUIREMENTS[c.id] || [];
    if (requirements.length === 0) {
        $('#requirementList').innerHTML = `<div class="empty-mini"><i class="fa-regular fa-handshake"></i><p>No open requirements.</p></div>`;
        return;
    }
    $('#requirementList').innerHTML = requirements.map(r => `
        <article class="requirement-card">
            <h4 class="requirement-title">${r.title}</h4>
            <p class="requirement-desc">${r.description}</p>
            <div class="requirement-footer">
                <span><i class="fa-regular fa-calendar"></i> ${r.date}</span>
                <button class="requirement-contact">Contact</button>
            </div>
        </article>
    `).join('');

    $$('.requirement-contact').forEach(btn => {
        btn.addEventListener('click', () => showToast('Opening contact form...'));
    });
}
function renderAbout() {
    const c = getCurrentClient();
    if (!c) return;
    $('#aboutContent').innerHTML = `
        <div class="about-hero">
            <div class="about-logo">${(c.name || '?').charAt(0)}</div>
            <h3 class="about-name">${c.name}</h3>
            <p class="about-tag">${c.tagline || ''}</p>
        </div>
        <div class="about-section">
            <h4><i class="fa-solid fa-circle-info"></i> About</h4>
            <p>${c.aboutDescription || c.description || ''}</p>
        </div>
        <div class="about-section">
            <h4><i class="fa-solid fa-bullseye"></i> Our Mission</h4>
            <p>${c.mission || '—'}</p>
        </div>
        <div class="about-section">
            <h4><i class="fa-solid fa-address-book"></i> Get In Touch</h4>
            <div class="about-contact-item"><i class="fa-solid fa-location-dot"></i><span>${c.location}</span></div>
            <div class="about-contact-item"><i class="fa-regular fa-calendar"></i><span>${c.founded || ''}</span></div>
            <div class="about-contact-item"><i class="fa-solid fa-phone"></i><span>${c.phone || ''}</span></div>
            <div class="about-contact-item"><i class="fa-solid fa-envelope"></i><span>${c.email || ''}</span></div>
            ${c.website ? `<div class="about-contact-item"><i class="fa-solid fa-globe"></i><span>${c.website}</span></div>` : ''}
        </div>
    `;

    // Update connect links
    const wa = $('.connect-whatsapp');
    if (wa && c.whatsapp) wa.href = `https://wa.me/${c.whatsapp.replace(/[^\d]/g, '')}`;
    const ph = $('.connect-phone');
    if (ph && c.phone) ph.href = `tel:${c.phone.replace(/\s/g, '')}`;
    const em = $('.connect-email');
    if (em && c.email) em.href = `mailto:${c.email}`;
    const ws = $('.connect-website');
    if (ws && c.website) ws.href = c.website;
}

/* Updates list rendering (reused) */
function renderUpdates(container, list) {
    if (!container) return;
    if (list.length === 0) {
        container.innerHTML = `<div class="empty-mini"><i class="fa-regular fa-newspaper"></i><p>No updates yet.</p></div>`;
        return;
    }
    container.innerHTML = list.map(u => `
        <button class="update-card" data-update-id="${u.id}">
            <img class="update-thumb" src="${u.image}" alt="${u.title}" loading="lazy">
            <div class="update-content">
                <div class="update-title">${u.title}</div>
                <div class="update-desc">${u.description || ''}</div>
                <div class="update-date">
                    <i class="fa-regular fa-calendar"></i>
                    ${u.date}
                </div>
            </div>
        </button>
    `).join('');

    $$('.update-card', container).forEach(card => {
        card.addEventListener('click', () => {
            const id = Number(card.dataset.updateId);
            openUpdateDetail(id);
        });
    });
}

function openUpdateDetail(id) {
    const u = getPosts().find(x => x.id === id);
    if (!u) return;
    $('#updateImage').src = u.image;
    $('#updateImage').alt = u.title;
    $('#updateTitle').textContent = u.title;
    $('#updateDate').textContent = u.date;
    $('#updateDescription').textContent = u.description;
    openModal('updateModal');
}

/* ---------- MODAL HELPERS ---------- */
let lastFocused = null;
function openModal(id) {
    lastFocused = document.activeElement;
    const overlay = $(`#${id}`);
    if (!overlay) return;
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
        const focusable = overlay.querySelector('button, input, [tabindex]');
        if (focusable) focusable.focus();
    }, 50);
}
function closeModal(id) {
    const overlay = $(`#${id}`);
    if (!overlay) return;
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
}

/* ---------- TOAST ---------- */
let toastTimer;
function showToast(msg) {
    const t = $('#toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
}

/* ---------- TAB SWITCHING ---------- */
function switchTab(tabName) {
    appState.activeTab = tabName;
    $$('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tabName));
    $$('.tab-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === tabName));
}

/* =====================================================
   PROFILE EVENTS (only re-bound when entering a profile)
   ===================================================== */
function bindProfileEvents() {
    // Posts/Stories/Offers modal
    $('#viewAllBtn').onclick = () => {
        const posts = getClientPosts(appState.currentClientId);
        renderUpdates($('#viewAllList'), posts);
        openModal('viewAllModal');
    };

    // Action cards
    $$('.action-card').forEach(card => {
        card.onclick = () => {
            const action = card.dataset.action;
            switch (action) {
                case 'posts':  openModal('postsModal'); break;
                case 'provide': openModal('provideModal'); break;
                case 'need':   openModal('needModal'); break;
                case 'about':  openModal('aboutModal'); break;
            }
        };
    });
}

/* =====================================================
   GLOBAL EVENTS
   ===================================================== */
function bindGlobalEvents() {
    // Search bar
    const searchInput = $('#searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            appState.searchQuery = e.target.value;
            renderClientGrid();
        });
    }

    // Back to home button
    const backBtn = $('#backToHome');
    if (backBtn) backBtn.addEventListener('click', goHome);

    // Generic modal close buttons
    $$('[data-close]').forEach(btn => {
        btn.addEventListener('click', () => closeModal(btn.dataset.close));
    });

    // Click outside modal closes
    $$('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal(overlay.id);
        });
    });

    // ESC closes any open modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            $$('.modal-overlay.active').forEach(o => closeModal(o.id));
        }
    });

    // Tabs
    $$('.tab').forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });
}

/* =====================================================
   INIT
   ===================================================== */
function init() {
    bindGlobalEvents();
    routeFromUrl();
}

document.addEventListener('DOMContentLoaded', init);
