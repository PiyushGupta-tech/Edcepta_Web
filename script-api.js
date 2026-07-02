// ============================================
// OFFLINE API HANDLING (Replaces Backend API)
// ============================================

const STORAGE_KEYS = {
    USERS: 'edcepta_users',
    CURRENT_USER: 'edcepta_current_user',
    AUTH_TOKEN: 'edcepta_auth_token',
    ORDERS: 'edcepta_orders',
};

const LEGACY_STORAGE_KEYS = {
    USERS: 'gurukul_users',
    ORDERS: 'gurukul_orders',
    CURRENT_USER: 'currentUser',
    AUTH_TOKEN: 'authToken',
};

const EDCEPTA_DEMO_USERS = [
    {
        _id: 'user_admin_educepta',
        name: 'EDCEPTA Admin',
        email: 'admin@educepta.in',
        password: 'password123',
        role: 'admin',
        enrolledCourses: [],
        wishlist: []
    },
    {
        _id: 'user_student_educepta',
        name: 'EDCEPTA Student',
        email: 'student@educepta.in',
        password: 'password123',
        role: 'student',
        enrolledCourses: [],
        wishlist: []
    }
];

function migrateLegacyEdceptaStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
        const legacyUsers =
            localStorage.getItem(LEGACY_STORAGE_KEYS.USERS) ||
            localStorage.getItem('users');
        if (legacyUsers) {
            localStorage.setItem(STORAGE_KEYS.USERS, legacyUsers);
        }
    }

    if (!localStorage.getItem(STORAGE_KEYS.ORDERS) && localStorage.getItem(LEGACY_STORAGE_KEYS.ORDERS)) {
        localStorage.setItem(STORAGE_KEYS.ORDERS, localStorage.getItem(LEGACY_STORAGE_KEYS.ORDERS));
    }

    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
        const legacySession =
            localStorage.getItem(LEGACY_STORAGE_KEYS.CURRENT_USER) ||
            localStorage.getItem('gurukul_current_user');
        if (legacySession) {
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, legacySession);
        }
    }

    if (!localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)) {
        const legacyToken =
            localStorage.getItem(LEGACY_STORAGE_KEYS.AUTH_TOKEN) ||
            localStorage.getItem('gurukul_auth_token');
        if (legacyToken) {
            localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, legacyToken);
        }
    }

    const emailMap = {
        'admin@gurukul.com': 'admin@educepta.in',
        'student@gurukul.com': 'student@educepta.in',
    };
    const nameMap = {
        'admin@gurukul.com': 'EDCEPTA Admin',
        'student@gurukul.com': 'EDCEPTA Student',
    };

    let users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    let usersChanged = false;
    users.forEach(function (u) {
        const oldEmail = u.email;
        if (emailMap[oldEmail]) {
            u.email = emailMap[oldEmail];
            u.name = nameMap[oldEmail] || u.name;
            usersChanged = true;
        }
    });
    if (usersChanged) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }

    const sessionRaw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (sessionRaw) {
        try {
            const sessionUser = JSON.parse(sessionRaw);
            const oldSessionEmail = sessionUser.email;
            if (emailMap[oldSessionEmail]) {
                sessionUser.email = emailMap[oldSessionEmail];
                sessionUser.name = nameMap[oldSessionEmail] || sessionUser.name;
                localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(sessionUser));
            }
        } catch (e) { /* ignore */ }
    }
}

function ensureEdceptaDemoUsers() {
    let users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    let changed = false;

    if (users.length === 0) {
        users = EDCEPTA_DEMO_USERS.map(function (u) { return Object.assign({}, u); });
        changed = true;
    } else {
        EDCEPTA_DEMO_USERS.forEach(function (demo) {
            const existing = users.find(function (u) { return u.email === demo.email; });
            if (!existing) {
                users.push(Object.assign({}, demo));
                changed = true;
            } else {
                if (existing.password !== demo.password) {
                    existing.password = demo.password;
                    changed = true;
                }
                if (existing.name === 'Admin User' || existing.name === 'Student User') {
                    existing.name = demo.name;
                    changed = true;
                }
            }
        });
    }

    if (changed) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
}

// Initialize Mock Data if empty
function initializeMockData() {
    console.log('Initializing EDCEPTA Education (offline mode)...');
    migrateLegacyEdceptaStorage();
    ensureEdceptaDemoUsers();
    console.log('✓ Demo logins: student@educepta.in / admin@educepta.in (password: password123)');
}

// --------------------------------------------
// AUTHENTICATION FUNCTIONS
// --------------------------------------------

function getCurrentUser() {
    const userStr =
        localStorage.getItem(STORAGE_KEYS.CURRENT_USER) ||
        localStorage.getItem(LEGACY_STORAGE_KEYS.CURRENT_USER);
    return userStr ? JSON.parse(userStr) : null;
}

function isUserLoggedIn() {
    return !!(
        localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) ||
        localStorage.getItem(LEGACY_STORAGE_KEYS.AUTH_TOKEN)
    );
}

function isUserAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'admin';
}

function getAuthToken() {
    return (
        localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) ||
        localStorage.getItem(LEGACY_STORAGE_KEYS.AUTH_TOKEN)
    );
}

function getAllUsers() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
}

async function registerUser(name, email, password, role = 'student') {
    await new Promise(r => setTimeout(r, 500)); // Simulate delay
    
    const users = getAllUsers();
    
    if (users.find(u => u.email === email)) {
        return { success: false, error: 'User already exists' };
    }
    
    const newUser = {
        _id: 'user_' + Date.now(),
        name,
        email,
        password, 
        role,
        enrolledCourses: [],
        wishlist: []
    };
    
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    
    // Auto-login
    const token = 'mock-token-' + Date.now();
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    // Keep legacy keys in sync to avoid old-script redirect loops
    localStorage.setItem(LEGACY_STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));
    localStorage.setItem(LEGACY_STORAGE_KEYS.AUTH_TOKEN, token);
    
    return { success: true, data: { user: newUser, token: 'mock-token' } };
}

async function loginUser(email, password) {
    await new Promise(r => setTimeout(r, 500));

    const normalizedEmail = String(email || '').trim().toLowerCase();
    const users = getAllUsers();
    // Simple password check (insecure but fine for mock)
    const user = users.find(
        u => String(u.email || '').trim().toLowerCase() === normalizedEmail && u.password === password
    );
    
    if (!user) {
        return { success: false, error: 'Invalid credentials' };
    }
    
    const token = 'mock-token-' + Date.now();
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    // Keep legacy keys in sync to avoid old-script redirect loops
    localStorage.setItem(LEGACY_STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    localStorage.setItem(LEGACY_STORAGE_KEYS.AUTH_TOKEN, token);
    
    return { success: true, data: { user, token: 'mock-token' } };
}

function logoutUser() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(LEGACY_STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(LEGACY_STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem('selectedCourse');
    localStorage.removeItem('cart');
    localStorage.removeItem('checkoutItems');
    window.location.href = '/login';
}

async function fetchUserProfile() {
    return getCurrentUser();
}

// --------------------------------------------
// COURSE FUNCTIONS
// --------------------------------------------

// Global pagination state (matches original API structure)
var courses = []; // Changed to var to ensure global scope attachment if needed
let currentPage = 1;
const coursesPerPage = 10;

// Relies on MOCK_COURSES from data/courses_data.js
// Make sure that file is loaded BEFORE this script in HTML
async function fetchCourses(category = 'all', page = 1, searchQuery = '', perPage = null) {
    if (typeof MOCK_COURSES === 'undefined') {
        console.error('MOCK_COURSES not found. Ensure courses_data.js is included.');
        return { courses: [], totalPages: 0 };
    }

    // Filter
    let filtered = MOCK_COURSES;
    
    // Apply Category Filter
    if (category && category !== 'all') {
        filtered = filtered.filter(c => c.category === category);
    }

    // Apply Search Filter
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(c => 
            c.title.toLowerCase().includes(query) || 
            c.description.toLowerCase().includes(query)
        );
    }

    // Newest programs first (includes recently added catalog items)
    filtered = filtered.slice().sort((a, b) => Number(b._id) - Number(a._id));
    
    // Pagination: use perPage if provided (e.g. admin dashboard can pass a large number to get all)
    const limit = perPage != null ? perPage : coursesPerPage;
    const totalCourses = filtered.length;
    const totalPages = Math.ceil(totalCourses / limit) || 1;
    const start = (page - 1) * limit;
    const end = start + limit;
    
    const paginatedCourses = filtered.slice(start, end);
    courses = paginatedCourses; // Update global variable used by other functions
    
    console.log(`OFFLINE: Fetched ${paginatedCourses.length} courses (Page ${page}/${totalPages})`);
    
    return {
        courses: paginatedCourses,
        totalPages: totalPages,
        currentPage: page,
        totalCourses: totalCourses
    };
}

async function getCourseById(courseId) {
    if (typeof MOCK_COURSES === 'undefined') return null;
    return MOCK_COURSES.find(c => c._id === courseId);
}

// --------------------------------------------
// ORDER FUNCTIONS
// --------------------------------------------

async function createOrder(orderData) {
    await new Promise(r => setTimeout(r, 800));
    
    const currentUser = getCurrentUser();
    if (!currentUser) return { success: false, error: 'Not logged in' };
    
    // Create new order
    const orders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
    const newOrder = {
        _id: 'order_' + Date.now(),
        user: currentUser._id,
        items: orderData.items,
        totalAmount: orderData.totalAmount,
        status: 'completed',
        date: new Date().toISOString()
    };
    orders.push(newOrder);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    
    // Update USER Enrollments (in the 'users' database)
    const users = getAllUsers();
    const userIndex = users.findIndex(u => u._id === currentUser._id);
    
    if (userIndex !== -1) {
        // Enforce array
        const currentEnrollments = users[userIndex].enrolledCourses || [];
        // Extract course IDs being purchased
        const newCourseIds = orderData.items.map(item => item.course);
        
        // Merge and deduplicate
        const updatedEnrollments = [...new Set([...currentEnrollments, ...newCourseIds])];
        
        // Save to DB
        users[userIndex].enrolledCourses = updatedEnrollments;
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        
        // Save to Session
        currentUser.enrolledCourses = updatedEnrollments;
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
        
        return { success: true, data: { order: newOrder, user: currentUser } };
    }
    
    return { success: false, error: 'User record not found' };
}

async function getOrders() {
    const currentUser = getCurrentUser();
    if (!currentUser) return [];
    
    const result = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]')
        .filter(o => o.user === currentUser._id);
        
    return result;
}

// --------------------------------------------
// WISHLIST FUNCTIONS
// --------------------------------------------

async function addToWishlist(courseId) {
    const currentUser = getCurrentUser();
    if (!currentUser) return { success: false, error: 'Not logged in' };
    
    const users = getAllUsers();
    const userIndex = users.findIndex(u => u._id === currentUser._id);
    
    if (userIndex !== -1) {
        const wishlist = users[userIndex].wishlist || [];
        if (!wishlist.includes(courseId)) {
            wishlist.push(courseId);
            users[userIndex].wishlist = wishlist;
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
            
            currentUser.wishlist = wishlist;
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
        }
        return { success: true, wishlist: currentUser.wishlist };
    }
    return { success: false };
}


async function removeFromWishlist(courseId) {
    const currentUser = getCurrentUser();
    if (!currentUser) return { success: false, error: 'Not logged in' };
    
    const users = getAllUsers();
    const userIndex = users.findIndex(u => u._id === currentUser._id);
    
    if (userIndex !== -1) {
        let wishlist = users[userIndex].wishlist || [];
        wishlist = wishlist.filter(id => id !== courseId);
        
        users[userIndex].wishlist = wishlist;
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        
        currentUser.wishlist = wishlist;
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
        
        return { success: true, wishlist: currentUser.wishlist };
    }
    return { success: false };
}

// ============================================
// FRONTEND DISPLAY FUNCTIONS
// ============================================

// Display Courses
async function displayCourses(filter = 'all', page = 1, shouldScroll = false, searchQuery = '') {
    const coursesGrid = document.getElementById('coursesGrid');
    
    if (shouldScroll) {
        const target = document.getElementById('courses') || coursesGrid;
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    if (!coursesGrid) {
        // console.error('✗ coursesGrid element not found!'); 
        // Silent fail on pages without course grid
        return;
    }
    
    coursesGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem;"><div class="spinner"></div><p style="color: var(--text-secondary); margin-top: 1rem;">Loading courses...</p></div>';
    
    // Fetch courses from API
    const data = await fetchCourses(filter, page, searchQuery);
    const coursesList = data.courses || [];
    const totalPages = data.totalPages || 1;
    currentPage = data.currentPage || 1;
    
    courses = coursesList;
    coursesGrid.innerHTML = '';

    if (coursesList.length === 0) {
        coursesGrid.innerHTML = '<p style="text-align: center; color: var(--text-secondary); grid-column: 1/-1;">No courses found</p>';
        updatePagination(0, 0, filter, searchQuery);
        return;
    }

    coursesList.forEach(course => {
        const courseCard = createCourseCard(course);
        coursesGrid.appendChild(courseCard);
    });
    
    updatePagination(totalPages, currentPage, filter, searchQuery);
}

function updatePagination(totalPages, currentPage, filter, searchQuery = '') {
    let paginationContainer = document.getElementById('pagination-container');
    if (!paginationContainer) {
        paginationContainer = document.createElement('div');
        paginationContainer.id = 'pagination-container';
        paginationContainer.className = 'pagination';
        const grid = document.getElementById('coursesGrid');
        if (grid && grid.parentNode) {
            grid.parentNode.insertBefore(paginationContainer, grid.nextSibling);
        }
    }
    
    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }

    paginationContainer.innerHTML = `
        <button ${currentPage <= 1 ? 'disabled' : ''} onclick="displayCourses('${filter}', ${currentPage - 1}, true, '${searchQuery}')">
             Previous
        </button>
        <span class="page-info">Page ${currentPage} of ${totalPages}</span>
        <button ${currentPage >= totalPages ? 'disabled' : ''} onclick="displayCourses('${filter}', ${currentPage + 1}, true, '${searchQuery}')">
             Next 
        </button>
    `;
}

// Create Course Card
function createCourseCard(course) {
    const card = document.createElement('div');
    card.className = 'course-card';
    card.style.cursor = 'pointer';
    card.innerHTML = `
        <div class="course-image" style="background-image: url('${course.image}'); background-size: cover; background-position: center;">
        </div>
        <div class="course-content">
            <span class="course-badge">${getCategoryLabel(course.category)}</span>
            <h3>${course.title}</h3>
            <div class="course-info">
                <p>⏱️ ${course.duration}</p>
                <p>👥 ${course.students} Students Enrolled</p>
            </div>
            <div class="course-footer">
                <span class="course-price">₹${course.price.toLocaleString()}</span>
                <div class="course-actions">
                    <button class="course-btn course-btn-cart" onclick="event.stopPropagation(); addToCart('${course._id}')">Add to Cart</button>
                    <button class="course-btn" onclick="event.stopPropagation(); buyNow('${course._id}')">Buy Now</button>
                </div>
            </div>
        </div>
    `;
    card.addEventListener('click', function() {
        window.location.href = `/course-details?id=${course._id}`;
    });
    return card;
}

// Display Categories
function displayCategories() {
    const categoriesGrid = document.getElementById('categoriesGrid');
    if (!categoriesGrid) return;
    
    const categories = [
        { name: "Web Development", icon: "🌐" },
        { name: "Data Science", icon: "📊" },
        { name: "Cloud & DevOps", icon: "☁️" },
        { name: "AI & ML", icon: "🤖" },
        { name: "Mobile Dev", icon: "📱" },
        { name: "Cybersecurity", icon: "🔒" }
    ];
    
    categoriesGrid.innerHTML = '';
    categories.forEach(category => {
        const categoryCard = document.createElement('div');
        categoryCard.className = 'category-card';
        categoryCard.innerHTML = `
            <div style="font-size: 2.5rem;">${category.icon}</div>
            <h3>${category.name}</h3>
        `;
        categoryCard.onclick = () => filterCourses(getCategoryFilter(category.name));
        categoriesGrid.appendChild(categoryCard);
    });
}

// Get Category Label
function getCategoryLabel(category) {
    const labelMap = {
        'web-development': 'Web Development',
        'data-science': 'Data Science',
        'cloud': 'Cloud & DevOps',
        'ai-ml': 'AI & ML',
        'music-creative': 'Music & Creative',
        'social-humanities': 'Social Sciences',
        'pure-sciences': 'Pure Sciences',
        'mathematics-logic': 'Mathematics',
        'liberal-arts': 'Liberal Arts',
        'mobile': 'Mobile Dev',
        'security': 'Cybersecurity'
    };
    return labelMap[category] || 'Course';
}

// Get Category Filter
function getCategoryFilter(categoryName) {
    const filterMap = {
        'Web Development': 'web-development',
        'Data Science': 'data-science',
        'Cloud & DevOps': 'cloud',
        'AI & ML': 'ai-ml',
        'Mobile Dev': 'mobile',
        'Cybersecurity': 'security'
    };
    return filterMap[categoryName] || 'all';
}

// Filter Courses
async function filterCourses(category) {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => btn.classList.remove('active'));
    
    if (category === 'all') {
        filterBtns[0]?.classList.add('active');
    } else {
        filterBtns.forEach(btn => {
            if (btn.dataset.filter === category) {
                btn.classList.add('active');
            }
        });
    }

    await displayCourses(category);
}

// Setup Event Listeners
function setupEventListeners() {
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            filterCourses(this.dataset.filter);
        });
    });

    // Hamburger menu
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }

    // Close menu when link is clicked
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function() {
            navLinks?.classList.remove('active');
        });
    });

    // Newsletter form
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Thank you for subscribing!');
            this.reset();
        });
    }

    // Explore Courses button
    const exploreBtn = document.querySelector('.btn-primary');
    if (exploreBtn) {
        exploreBtn.addEventListener('click', function() {
            const coursesSection = document.getElementById('courses');
            if (coursesSection) {
                coursesSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // Modal close button
    const closeBtn = document.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    window.addEventListener('click', function(e) {
        const modal = document.getElementById('courseModal');
        if (modal && e.target === modal) {
            closeModal();
        }
    });
}

// Modal Functions
function openModal(courseId) {
    const course = MOCK_COURSES.find(c => c._id === courseId);
    if (!course) return;

    const modal = document.getElementById('courseModal');
    if (!modal) return;

    const titleEl = document.getElementById('modalTitle');
    const descEl = document.getElementById('modalDescription');
    const durationEl = document.getElementById('modalDuration');
    const studentsEl = document.getElementById('modalStudents');
    const priceEl = document.getElementById('modalPrice');

    if (titleEl) titleEl.textContent = course.title;
    if (descEl) descEl.textContent = course.description;
    if (durationEl) durationEl.textContent = course.duration;
    if (studentsEl) studentsEl.textContent = course.students;
    if (priceEl) priceEl.textContent = course.price;

    modal.style.display = 'block';

    const enrollBtn = document.getElementById('enrollBtn');
    if (enrollBtn) {
        enrollBtn.onclick = function() {
            alert(`You have enrolled in ${course.title}!`);
            closeModal();
        };
    }
}

function closeModal() {
    const modal = document.getElementById('courseModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Toast notification (replaces alert for add-to-cart)
function showToast(message, type) {
    type = type || 'success';
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span class="toast-icon">${type === 'success' ? '✓' : 'ℹ'}</span><span class="toast-message">${message}</span>`;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('toast-show'));
    setTimeout(() => {
        toast.classList.remove('toast-show');
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

// Add to Cart - add course to cart and go to checkout/cart page
async function addToCart(courseId) {
    const course = await getCourseById(courseId);
    if (!course) return;
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id === course._id);
    if (!existingItem) {
        cart.push({ id: course._id, title: course.title, price: course.price, quantity: 1 });
        localStorage.setItem('cart', JSON.stringify(cart));
        showToast(`${course.title} added to cart!`, 'success');
    } else {
        showToast('This course is already in your cart.', 'info');
    }
    setTimeout(() => { window.location.href = '/checkout'; }, 600);
}

// Buy Now Function - Allow guest checkout: add to cart and redirect to checkout (login can be required on Place Order)
async function buyNow(courseId) {
    const course = await getCourseById(courseId);
    if (!course) return;
    
    localStorage.setItem('selectedCourse', JSON.stringify({
        id: course._id,
        title: course.title,
        price: course.price
    }));
    window.location.href = '/checkout';
}

// Main logic to initialize pages
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    
    // Check if on index page or page with course grid
    if(document.getElementById('coursesGrid')) {
        displayCourses();
        displayCategories();
    }
    
    // Setup Search Logic
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value;
                displayCourses('all', 1, true, query);
            }
        });
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            if (searchInput) {
                const query = searchInput.value;
                displayCourses('all', 1, true, query);
            }
        });
    }
});

// Initialize on load
initializeMockData();
console.log('✓ OFFLINE API LOADED: Backend is bypassed (Full LocalStorage Implementation).');
