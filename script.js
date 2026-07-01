// Authentication Helper Functions
function getCurrentUser() {
    const raw =
        localStorage.getItem('edcepta_current_user') ||
        localStorage.getItem('currentUser');
    return raw ? JSON.parse(raw) : null;
}

function isUserLoggedIn() {
    return getCurrentUser() !== null;
}

function isUserAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'admin';
}

// Course Data
const courses = [
    {
        id: 1,
        title: "Generative AI & Machine Learning Engineer",
        category: "ai-ml",
        duration: "12 Weeks",
        students: "4K",
        price: 89500,
        description: "Master the fundamentals and advanced concepts of AI and ML with hands-on projects and real-world applications.",
        image: "https://plus.unsplash.com/premium_photo-1726672903451-187695204aaf?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
        id: 2,
        title: "Full Stack Web Development",
        category: "web-development",
        duration: "8 Weeks",
        students: "3.5K",
        price: 20000,
        description: "Learn to build complete web applications using modern technologies like React, Node.js, and MongoDB.",
        image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop"
    },
    {
        id: 3,
        title: "Data Science With Python",
        category: "data-science",
        duration: "10 Weeks",
        students: "5K",
        price: 70000,
        description: "Comprehensive data science course covering statistics, data visualization, and machine learning algorithms.",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop"
    },
    {
        id: 4,
        title: "Cloud & AWS DevOps Engineer",
        category: "cloud",
        duration: "9 Weeks",
        students: "2.8K",
        price: 20000,
        description: "Learn to deploy, manage, and scale applications on AWS cloud with CI/CD pipelines.",
        image: "https://images.unsplash.com/vector-1742999621152-286e6c68c770?q=80&w=1160&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
        id: 5,
        title: "AI Agent Development",
        category: "ai-ml",
        duration: "6 Weeks",
        students: "2K",
        price: 55000,
        description: "Build intelligent AI agents using LLMs and autonomous systems for real-world problems.",
        image: "https://plus.unsplash.com/premium_vector-1725757196726-2d35ab7d4477?q=80&w=1160&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
        id: 6,
        title: "React Advanced Concepts",
        category: "web-development",
        duration: "6 Weeks",
        students: "3K",
        price: 40000,
        description: "Deep dive into advanced React patterns, hooks, context API, and performance optimization.",
        image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
        id: 7,
        title: "Data Engineering with Spark",
        category: "data-science",
        duration: "8 Weeks",
        students: "1.5K",
        price: 65000,
        description: "Learn to build scalable data pipelines using Apache Spark, Hadoop, and distributed systems.",
        image: "https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=600&h=400&fit=crop"
    },
    {
        id: 8,
        title: "Kubernetes & Docker",
        category: "cloud",
        duration: "7 Weeks",
        students: "2.2K",
        price: 40000,
        description: "Master containerization and orchestration with Docker and Kubernetes for microservices.",
        image: "https://images.unsplash.com/photo-1646627927863-19874c27316b?q=80&w=1828&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
        id: 9,
        title: "Natural Language Processing",
        category: "ai-ml",
        duration: "8 Weeks",
        students: "1.8K",
        price: 20000,
        description: "Explore NLP techniques, transformers, and build chatbots and text processing applications.",
        image: "https://plus.unsplash.com/premium_photo-1733317429945-a3688f50430b?q=80&w=1915&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
        id: 10,
        title: "Next.js Full Stack",
        category: "web-development",
        duration: "7 Weeks",
        students: "2.5K",
        price: 20000,
        description: "Build modern full-stack applications with Next.js, handling both frontend and backend seamlessly.",
        image: "https://images.unsplash.com/photo-1643116774075-acc00caa9a7b?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
        id: 11,
        title: "Analytics & Business Intelligence",
        category: "data-science",
        duration: "6 Weeks",
        students: "2.3K",
        price: 45000,
        description: "Learn to create powerful dashboards and insights using Tableau, Power BI, and SQL.",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1630&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
        id: 12,
        title: "Azure Cloud Solutions",
        category: "cloud",
        duration: "8 Weeks",
        students: "1.9K",
        price: 59999,
        description: "Become an Azure Solutions Architect and deploy enterprise-scale applications on Microsoft Azure.",
        image: "https://images.unsplash.com/photo-1662052955282-da15376f3919?q=80&w=1724&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    }
];

const categories = [
    { name: "Web Development", icon: "🌐" },
    { name: "Data Science", icon: "📊" },
    { name: "Cloud & DevOps", icon: "☁️" },
    { name: "AI & ML", icon: "🤖" },
    { name: "Mobile Dev", icon: "📱" },
    { name: "Cybersecurity", icon: "🔒" }
];

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    displayCourses('all');
    setupEventListeners();
});

// Display Courses
function displayCourses(filter = 'all') {
    const coursesGrid = document.getElementById('coursesGrid');
    coursesGrid.innerHTML = '';

    const filteredCourses = filter === 'all' 
        ? courses 
        : courses.filter(course => course.category === filter);

    filteredCourses.forEach(course => {
        const courseCard = createCourseCard(course);
        coursesGrid.appendChild(courseCard);
    });
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
                <button class="course-btn" onclick="event.stopPropagation(); buyNow(${course.id})">Buy Now</button>
            </div>
        </div>
    `;
    // Navigate to course details on card click
    card.addEventListener('click', function() {
        window.location.href = `/course-details?id=${course.id}`;
    });
    return card;
}

// Display Categories
function displayCategories() {
    const categoriesGrid = document.getElementById('categoriesGrid');
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

// Get Category Emoji
function getCategoryEmoji(category) {
    const emojiMap = {
        'web-development': '🌐',
        'data-science': '📊',
        'cloud': '☁️',
        'ai-ml': '🤖'
    };
    return emojiMap[category] || '📚';
}

// Get Category Label
function getCategoryLabel(category) {
    const labelMap = {
        'web-development': 'Web Development',
        'data-science': 'Data Science',
        'cloud': 'Cloud & DevOps',
        'ai-ml': 'AI & ML'
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

// Get Course ID from category
function getCourseIdFromCategory(category) {
    const courseIdMap = {
        'web-development': 'web-development',
        'data-science': 'data-science',
        'cloud': 'cloud',
        'ai-ml': 'ai-ml'
    };
    return courseIdMap[category] || 'web-development';
}

// Filter Courses
function filterCourses(category) {
    // Update active filter button
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => btn.classList.remove('active'));
    
    if (category === 'all') {
        filterBtns[0].classList.add('active');
    } else {
        filterBtns.forEach(btn => {
            if (btn.dataset.filter === category) {
                btn.classList.add('active');
            }
        });
    }

    displayCourses(category);
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
    
    hamburger.addEventListener('click', function() {
        navLinks.classList.toggle('active');
    });

    // Close menu when link is clicked
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function() {
            navLinks.classList.remove('active');
        });
    });

    // Newsletter form
    document.getElementById('newsletterForm').addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Thank you for subscribing!');
        this.reset();
    });

    // Explore Courses button
    document.querySelector('.btn-primary').addEventListener('click', function() {
        document.getElementById('courses').scrollIntoView({ behavior: 'smooth' });
    });

    // Modal close button
    document.querySelector('.close').addEventListener('click', closeModal);
    window.addEventListener('click', function(e) {
        const modal = document.getElementById('courseModal');
        if (e.target == modal) {
            closeModal();
        }
    });
}

// Modal Functions
function openModal(courseId) {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    document.getElementById('modalTitle').textContent = course.title;
    document.getElementById('modalDescription').textContent = course.description;
    document.getElementById('modalDuration').textContent = course.duration;
    document.getElementById('modalStudents').textContent = course.students;
    document.getElementById('modalPrice').textContent = course.price;

    document.getElementById('courseModal').style.display = 'block';

    // Update enroll button
    document.getElementById('enrollBtn').addEventListener('click', function() {
        alert(`You have enrolled in ${course.title}!`);
        closeModal();
    });
}

function closeModal() {
    document.getElementById('courseModal').style.display = 'none';
}

// Buy Now Function - Allow guest checkout: redirect to cart/checkout (login required on Place Order)
function buyNow(courseId) {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;
    
    localStorage.setItem('selectedCourse', JSON.stringify({
        id: course.id,
        title: course.title,
        price: course.price
    }));
    window.location.href = '/checkout';
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});
