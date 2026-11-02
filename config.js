const CONFIG = {
    // API_BASE_URL: 'http://localhost:5001/api'
    // Change the URL above to your deployed backend URL when ready
    API_BASE_URL: 'https://gurukul-production-165a.up.railway.app/api',
    // Prefer local file for production: save logo as images/edcepta-logo.png
    LOGO_URL: 'images/edcepta-logo.png',
    // UrbanRupee hosted checkout enabled
    PAYMENTS_ENABLED: true,
    // Prefer Node routes locally; PHP routes on production (educepta.in)
    PAYMENT_API: {
        initiateCandidates: [
            '/api/utility/initiate',
            '/api/utility-initiate.php'
        ],
        checkStatusCandidates: [
            '/api/utility/checkstatus',
            '/api/utility-checkstatus.php'
        ]
    }
};
