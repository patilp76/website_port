<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="theme-color" content="#f4f5f7">
    <title>ClientHub — Multi-Client Business Platform</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="app-shell">

        <!-- =====================================================
             PLATFORM HEADER (visible on every view)
             ===================================================== -->
        <header class="platform-header">
            <div class="platform-header-inner">
                <a href="./" class="brand" id="brandLink" aria-label="ClientHub home">
                    <div class="brand-mark"><i class="fa-solid fa-bolt"></i></div>
                    <div class="brand-text">
                        <strong>ClientHub</strong>
                        <span>Business Platform</span>
                    </div>
                </a>
                <nav class="platform-nav" aria-label="Main navigation">
                    <a href="./" class="nav-link" data-nav="home"><i class="fa-solid fa-house"></i> <span>Home</span></a>
                    <a href="admin.html" class="nav-link"><i class="fa-solid fa-gauge"></i> <span>Admin</span></a>
                </nav>
            </div>
        </header>

        <!-- =====================================================
             VIEW 1: PORTFOLIO (main home page)
             ===================================================== -->
        <main class="view view-portfolio" id="portfolioView">
            <section class="hero">
                <div class="hero-inner">
                    <span class="hero-eyebrow"><i class="fa-solid fa-sparkles"></i> Multi-Client Directory</span>
                    <h1 class="hero-title">Discover <span class="hero-accent">businesses</span> across Maharashtra.</h1>
                    <p class="hero-subtitle">Browse curated client profiles, see their latest posts, and connect directly — all in one place.</p>

                    <div class="search-wrap">
                        <i class="fa-solid fa-magnifying-glass search-icon"></i>
                        <input type="search" id="searchInput" placeholder="Search by name, category, or city..." autocomplete="off">
                    </div>

                    <div class="hero-stats">
                        <div class="hero-stat"><strong id="statTotalClients">0</strong><span>Clients</span></div>
                        <div class="hero-stat"><strong id="statActiveClients">0</strong><span>Active</span></div>
                        <div class="hero-stat"><strong id="statTotalPosts">0</strong><span>Posts</span></div>
                        <div class="hero-stat"><strong id="statPostsThisMonth">0</strong><span>This Month</span></div>
                    </div>
                </div>
            </section>

            <section class="directory">
                <div class="directory-toolbar">
                    <h2>Browse Clients</h2>
                    <span id="resultCount" class="result-count">0 clients</span>
                </div>
                <div class="category-filters" id="categoryFilters" role="tablist" aria-label="Category filter"></div>
                <div class="client-grid" id="clientGrid"></div>
                <div class="empty-state" id="emptyState" hidden>
                    <i class="fa-solid fa-folder-open"></i>
                    <h3>No clients found</h3>
                    <p>Try a different search term or category.</p>
                </div>
            </section>
        </main>

        <!-- =====================================================
             VIEW 2: CLIENT PROFILE (existing UI, dynamic data)
             ===================================================== -->
        <main class="view view-profile" id="profileView" hidden>
            <button class="back-btn" id="backToHome" aria-label="Back to directory">
                <i class="fa-solid fa-arrow-left"></i> <span>All Clients</span>
            </button>

            <div class="app-card" id="appCard">
                <!-- ===== PROFILE HEADER ===== -->
                <header class="profile-section">
                    <div class="profile-hero">
                        <div class="profile-photo-wrap">
                            <img src="https://i.pravatar.cc/200?img=12" alt="Profile photo" class="profile-photo" id="profilePhoto">
                        </div>
                        <div class="profile-info">
                            <h1 class="profile-name" id="profileName">Client Name</h1>
                            <p class="profile-location">
                                <i class="fa-solid fa-location-dot"></i>
                                <span id="profileLocation">Location</span>
                            </p>
                            <p class="profile-tagline" id="profileTagline">Tagline</p>
                            <div class="profile-stats">
                                <div class="stat"><strong id="statYears">—</strong><span>Years Exp.</span></div>
                                <div class="stat"><strong id="statProjects">—</strong><span>Projects</span></div>
                                <div class="stat"><strong id="statClients">—</strong><span>Clients</span></div>
                            </div>
                        </div>
                    </div>
                </header>

                <!-- ===== LANDSCAPE BODY: LEFT (categories+contact) | RIGHT (updates) ===== -->
                <div class="landscape-body">
                    <div class="landscape-left">
                        <!-- ===== FOUR ACTION CATEGORIES ===== -->
                        <section class="actions-section" aria-label="Primary categories">
                            <button class="action-card action-blue" data-action="posts">
                                <div class="action-icon"><i class="fa-solid fa-newspaper"></i></div>
                                <div class="action-label">
                                    <span class="lbl-main">Posts</span>
                                    <span class="lbl-sub">Stories & Offers</span>
                                </div>
                            </button>
                            <button class="action-card action-green" data-action="provide">
                                <div class="action-icon"><i class="fa-solid fa-box"></i></div>
                                <div class="action-label">
                                    <span class="lbl-main">We Provide</span>
                                    <span class="lbl-sub">Our services</span>
                                </div>
                            </button>
                            <button class="action-card action-orange" data-action="need">
                                <div class="action-icon"><i class="fa-solid fa-handshake"></i></div>
                                <div class="action-label">
                                    <span class="lbl-main">We Need</span>
                                    <span class="lbl-sub">Open requirements</span>
                                </div>
                            </button>
                            <button class="action-card action-purple" data-action="about">
                                <div class="action-icon"><i class="fa-solid fa-circle-info"></i></div>
                                <div class="action-label">
                                    <span class="lbl-main">About Us</span>
                                    <span class="lbl-sub">Our story</span>
                                </div>
                            </button>
                        </section>

                        <!-- ===== CONNECT WITH US ===== -->
                        <section class="connect-section" aria-label="Connect with us">
                            <h2 class="connect-title">Connect with us</h2>
                            <div class="connect-icons">
                                <a href="https://wa.me/" target="_blank" rel="noopener" class="connect-icon connect-whatsapp" aria-label="WhatsApp">
                                    <i class="fa-brands fa-whatsapp"></i>
                                </a>
                                <a href="tel:+910000000000" class="connect-icon connect-phone" aria-label="Phone">
                                    <i class="fa-solid fa-phone"></i>
                                </a>
                                <a href="mailto:example@example.com" class="connect-icon connect-email" aria-label="Email">
                                    <i class="fa-solid fa-envelope"></i>
                                </a>
                                <a href="#" class="connect-icon connect-website" aria-label="Website">
                                    <i class="fa-solid fa-globe"></i>
                                </a>
                            </div>
                        </section>
                    </div>

                    <div class="landscape-right">
                        <!-- ===== RECENT UPDATES ===== -->
                        <section class="updates-section" aria-label="Recent updates">
                            <div class="section-header">
                                <h2>Recent Updates</h2>
                                <button class="view-all" id="viewAllBtn">View All <i class="fa-solid fa-chevron-right"></i></button>
                            </div>
                            <div class="updates-list" id="updatesList">
                                <!-- Populated by JavaScript -->
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </main>

    </div>

    <!-- =====================================================
         MODALS (shared by profile view)
         ===================================================== -->
    <div class="modal-overlay" id="updateModal" aria-hidden="true">
        <div class="modal modal-detail" role="dialog" aria-modal="true" aria-labelledby="updateTitle">
            <button class="modal-close modal-close-float" data-close="updateModal" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>
            <img class="modal-image" id="updateImage" src="" alt="">
            <div class="modal-body">
                <h3 id="updateTitle"></h3>
                <p class="modal-date"><i class="fa-regular fa-calendar"></i> <span id="updateDate"></span></p>
                <p class="modal-text" id="updateDescription"></p>
            </div>
        </div>
    </div>

    <div class="modal-overlay" id="viewAllModal" aria-hidden="true">
        <div class="modal modal-list" role="dialog" aria-modal="true" aria-labelledby="viewAllTitle">
            <div class="modal-header">
                <h3 id="viewAllTitle">All Updates</h3>
                <button class="modal-close" data-close="viewAllModal" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="modal-body">
                <div class="updates-list updates-list-modal" id="viewAllList"></div>
            </div>
        </div>
    </div>

    <div class="modal-overlay" id="postsModal" aria-hidden="true">
        <div class="modal modal-tabs" role="dialog" aria-modal="true" aria-labelledby="postsTitle">
            <div class="modal-header">
                <h3 id="postsTitle">Posts & Stories</h3>
                <button class="modal-close" data-close="postsModal" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="tabs" role="tablist">
                <button class="tab active" data-tab="posts" role="tab">Posts</button>
                <button class="tab" data-tab="stories" role="tab">Stories</button>
                <button class="tab" data-tab="offers" role="tab">Offers</button>
            </div>
            <div class="modal-body">
                <div class="tab-panel active" data-panel="posts" id="panel-posts"></div>
                <div class="tab-panel" data-panel="stories" id="panel-stories"></div>
                <div class="tab-panel" data-panel="offers" id="panel-offers"></div>
            </div>
        </div>
    </div>

    <div class="modal-overlay" id="provideModal" aria-hidden="true">
        <div class="modal modal-list" role="dialog" aria-modal="true" aria-labelledby="provideTitle">
            <div class="modal-header">
                <h3 id="provideTitle">We Provide</h3>
                <button class="modal-close" data-close="provideModal" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="modal-body">
                <div class="service-list" id="serviceList"></div>
            </div>
        </div>
    </div>

    <div class="modal-overlay" id="needModal" aria-hidden="true">
        <div class="modal modal-list" role="dialog" aria-modal="true" aria-labelledby="needTitle">
            <div class="modal-header">
                <h3 id="needTitle">We Need</h3>
                <button class="modal-close" data-close="needModal" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="modal-body">
                <div class="requirement-list" id="requirementList"></div>
            </div>
        </div>
    </div>

    <div class="modal-overlay" id="aboutModal" aria-hidden="true">
        <div class="modal modal-list" role="dialog" aria-modal="true" aria-labelledby="aboutTitle">
            <div class="modal-header">
                <h3 id="aboutTitle">About Us</h3>
                <button class="modal-close" data-close="aboutModal" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="modal-body">
                <div class="about-content" id="aboutContent"></div>
            </div>
        </div>
    </div>

    <div class="toast" id="toast" role="status" aria-live="polite"></div>

    <script src="script.js"></script>
</body>
</html>