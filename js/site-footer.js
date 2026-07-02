/**
 * EDCEPTA site footer: explore links (dark) + About / Quick Links / Contact (light)
 */
(function () {
    const footerYear = new Date().getFullYear();
    const path = window.location.pathname.replace(/\/$/, '') || '/';
    const isHome =
        path === '' ||
        path === '/' ||
        path.endsWith('/index.html') ||
        path.endsWith('index.html');

    function href(hash) {
        if (!hash) return isHome ? '/' : '/';
        const h = hash.startsWith('#') ? hash : '#' + hash;
        return isHome ? h : '/' + h;
    }

    function exploreLink(text, filter) {
        const h = href('#courses');
        if (filter) {
            return (
                '<li><a href="' +
                h +
                '" class="footer-explore-link" data-filter="' +
                filter +
                '">' +
                text +
                '</a></li>'
            );
        }
        return '<li><a href="' + h + '">' + text + '</a></li>';
    }

    const explore =
        '<section class="footer-explore" aria-label="Explore skills and certifications">' +
        '<div class="container">' +
        '<h2 class="footer-explore-title">Explore top skills and certifications</h2>' +
        '<div class="footer-explore-grid">' +
        '<div class="footer-explore-col"><h3>In-demand Careers</h3><ul>' +
        exploreLink('Data Scientist', 'data-science') +
        exploreLink('Full Stack Web Developer', 'web-development') +
        exploreLink('Cloud Engineer', 'cloud') +
        exploreLink('Project Manager', 'social-humanities') +
        exploreLink('AI / ML Engineer', 'ai-ml') +
        '<li><a href="' +
        href('#careers') +
        '">All Career Accelerators</a></li></ul></div>' +
        '<div class="footer-explore-col"><h3>Web Development</h3><ul>' +
        exploreLink('Web Development', 'web-development') +
        exploreLink('React &amp; Next.js', 'web-development') +
        exploreLink('JavaScript &amp; TypeScript', 'web-development') +
        exploreLink('MERN Stack', 'web-development') +
        exploreLink('Mobile App Development', 'web-development') +
        '</ul></div>' +
        '<div class="footer-explore-col"><h3>IT Certifications</h3><ul>' +
        exploreLink('Amazon AWS &amp; Cloud', 'cloud') +
        exploreLink('Kubernetes &amp; Docker', 'cloud') +
        exploreLink('Azure Cloud Solutions', 'cloud') +
        exploreLink('Ethical Hacking &amp; Security', 'cloud') +
        exploreLink('Terraform &amp; DevOps', 'cloud') +
        '</ul></div>' +
        '<div class="footer-explore-col"><h3>Leadership</h3><ul>' +
        exploreLink('Leadership &amp; Public Speaking', 'liberal-arts') +
        exploreLink('Critical Thinking', 'liberal-arts') +
        exploreLink('Management Skills', 'social-humanities') +
        exploreLink('Ethics &amp; Philosophy', 'liberal-arts') +
        exploreLink('English Composition', 'liberal-arts') +
        '</ul></div>' +
        '<div class="footer-explore-col"><h3>Certifications by Skill</h3><ul>' +
        exploreLink('Cybersecurity', 'cloud') +
        exploreLink('Project Management', 'social-humanities') +
        exploreLink('Cloud Certification', 'cloud') +
        exploreLink('Data Analytics', 'data-science') +
        '<li><a href="' +
        href('#certifications') +
        '">See all Certifications</a></li></ul></div>' +
        '<div class="footer-explore-col"><h3>Data Science</h3><ul>' +
        exploreLink('Data Science', 'data-science') +
        exploreLink('Python for Data Analysis', 'data-science') +
        exploreLink('Machine Learning', 'ai-ml') +
        exploreLink('Generative AI &amp; LLMs', 'ai-ml') +
        exploreLink('Deep Learning', 'ai-ml') +
        '</ul></div>' +
        '<div class="footer-explore-col"><h3>Communication</h3><ul>' +
        exploreLink('Communication Skills', 'liberal-arts') +
        exploreLink('Public Speaking', 'liberal-arts') +
        exploreLink('Creative Writing', 'liberal-arts') +
        exploreLink('Media Literacy', 'liberal-arts') +
        exploreLink('UX/UI Design', 'music-creative') +
        '</ul></div>' +
        '<div class="footer-explore-col"><h3>Business Analytics</h3><ul>' +
        exploreLink('Analytics &amp; BI', 'data-science') +
        exploreLink('SQL &amp; Databases', 'data-science') +
        exploreLink('Data Analysis', 'data-science') +
        exploreLink('Quantitative Reasoning', 'mathematics-logic') +
        exploreLink('Economics &amp; Business', 'social-humanities') +
        '</ul></div>' +
        '</div></div></section>';

    const mainFooterHtml =
        '<div class="footer footer-main">' +
        '<div class="container">' +
        '<div class="footer-content">' +
        '<div class="footer-section animate-on-scroll" style="--i: 0">' +
        '<h3>About EDCEPTA EDUCATION</h3>' +
        '<p>We provide high-quality online education to help you advance your career in technology and innovation.</p>' +
        '</div>' +
        '<div class="footer-section animate-on-scroll" style="--i: 1">' +
        '<h3>Quick Links</h3>' +
        '<ul>' +
        '<li><a href="' + href('#home') + '">Home</a></li>' +
        '<li><a href="' + href('#courses') + '">Courses</a></li>' +
        '<li><a href="/about.html">About Us</a></li>' +
        '<li><a href="/why-edcepta.html">Why EDCEPTA</a></li>' +
        '<li><a href="' + href('#membership') + '">Membership</a></li>' +
        '<li><a href="/faq.html">FAQ</a></li>' +
        '<li><a href="/contact.html">Contact Us</a></li>' +
        '<li><a href="/privacy-policy.html">Privacy Policy</a></li>' +
        '<li><a href="/return-refund-policy.html">Return Policy</a></li>' +
        '<li><a href="/terms-conditions.html">Terms of Service</a></li>' +
        '</ul></div>' +
        '<div class="footer-section animate-on-scroll" style="--i: 2">' +
        '<h3>Contact</h3>' +
        '<p><strong>EDCEPTA EDUCATION PRIVATE LIMITED</strong></p>' +
        '<p>Support: <a href="mailto:support@educepta.in" class="footer-contact-email">support@educepta.in</a></p>' +
        '<p>UNIT T-3, B-812, NX ONE, TECHZONE IV, Greater Noida West, Noida, Gautambuddha Nagar, Uttar Pradesh - 201301</p>' +
        '<p>Phone: +91 8287693368</p>' +
        '</div></div>' +
        '<div class="footer-bottom animate-on-scroll">' +
        '<p>&copy; ' +
        footerYear +
        ' EDCEPTA EDUCATION PRIVATE LIMITED. All Rights Reserved.</p>' +
        '</div></div></div>';

    const mount = document.querySelector('footer.site-footer, footer#contact');
    if (!mount) return;

    mount.className = 'site-footer';
    mount.id = 'contact';
    mount.innerHTML = explore + mainFooterHtml;

    if (isHome) {
        mount.querySelectorAll('.footer-explore-link[data-filter]').forEach(function (link) {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                const filter = link.getAttribute('data-filter');
                const btn = document.querySelector('.filter-btn[data-filter="' + filter + '"]');
                if (btn) btn.click();
                const courses = document.getElementById('courses');
                if (courses) courses.scrollIntoView({ behavior: 'smooth' });
            });
        });
    }

    if (typeof IntersectionObserver !== 'undefined') {
        const observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) entry.target.classList.add('animate-in');
                });
            },
            { rootMargin: '0px 0px -40px 0px', threshold: 0.08 }
        );
        mount.querySelectorAll('.animate-on-scroll').forEach(function (el) {
            observer.observe(el);
        });
    }
})();
