// Wrap in DOMContentLoaded to ensure HTML is ready
document.addEventListener('DOMContentLoaded', () => {
    // Check if config is loaded
    if (typeof firebaseConfig === 'undefined') {
        console.error("firebaseConfig not found. Please add <script src='config.js'></script> to your HTML.");
        return;
    }
    
    // Initialize Firebase
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const database = firebase.database();
    const auth = firebase.auth();

    const projectList = document.getElementById('project-list');
    const slider = document.getElementById('recent-slider');
    const searchInput = document.getElementById('projectSearch');
    let allProjects = [];

    // Helper function to render the project list
    function renderList(items) {
        projectList.innerHTML = items.map(data => `
                <div class="project-card" data-id="${data.id}">
                    <div class="project-icon">
                        <img src="${data.logoUrl}" onerror="this.src='https://via.placeholder.com/60'">
                    </div>
                    <div class="project-info">
                        <h3>${data.projectName || 'Untitled'}</h3>
                        <p>${data.userName || 'Unknown User'}</p>
                    </div>
                </div>`).join('');
    }

    // Search Event Listener
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = allProjects.filter(p => 
                (p.projectName || '').toLowerCase().includes(term) ||
                (p.userName || '').toLowerCase().includes(term)
            );
            renderList(filtered);
        });
    }
    
    // Menu Logic
    const menuBtn = document.querySelector('.menu-btn');
    const sideMenu = document.getElementById('side-menu');
    const menuOverlay = document.getElementById('menu-overlay');
    const closeBtn = document.querySelector('.close-btn');

    function toggleMenu() {
        sideMenu.classList.toggle('open');
        menuOverlay.classList.toggle('open');
    }

    if (menuBtn) menuBtn.addEventListener('click', toggleMenu);
    if (closeBtn) closeBtn.addEventListener('click', toggleMenu);
    if (menuOverlay) menuOverlay.addEventListener('click', toggleMenu);

    // Back Button Logic (for details page)
    const backBtn = document.getElementById('detail-back');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.history.back();
        });
    }

    // Handle clicks on projects (Event Delegation)
    document.addEventListener('click', (e) => {
        const card = e.target.closest('.project-card, .slider-item');
        if (card && card.dataset.id) {
            // Redirect to details page with ID
            window.location.href = `details.html?id=${card.dataset.id}`;
        }
    });

    // Check if we are on the details page
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');
    const detailTitle = document.getElementById('detail-title');

    if (projectId && detailTitle) {
        database.ref('projects/' + projectId).once('value').then((snapshot) => {
            const project = snapshot.val();
            if (project) {
                document.getElementById('detail-img').src = project.logoUrl || 'https://via.placeholder.com/100';
                document.getElementById('detail-title').innerText = project.projectName || 'Untitled';
                document.getElementById('detail-user').innerText = project.userName || 'Unknown User';
                document.getElementById('detail-desc').innerText = project.projectDescription || 'No description provided.';

                const screenshotsContainer = document.getElementById('detail-screenshots');
                if (screenshotsContainer && project.screenshotUrls) {
                    const urls = Object.values(project.screenshotUrls);
                    screenshotsContainer.innerHTML = urls.map(url => `<img src="${url}" onerror="this.style.display='none'">`).join('');
                }

                const downloadBtn = document.getElementById('detail-download-btn');
                if (downloadBtn) {
                    downloadBtn.onclick = () => {
                        if (project.swbUrl) window.open(project.swbUrl, '_blank');
                        else alert('Download link not available');
                    };
                }
            }
        });
    }

    database.ref('projects').on('value', (snapshot) => {
        // Safety check: only run if elements exist
        if (!projectList || !slider) return;

        slider.innerHTML = '';
        
        allProjects = [];
        snapshot.forEach((child) => { 
            const project = child.val();
            project.id = child.key; // Store the ID
            allProjects.push(project); 
        });

        const reversed = [...allProjects].reverse();

        // Populate Slider (Top 5 Recent)
        slider.innerHTML = reversed.slice(0, 5).map(data => `
                <div class="slider-item" data-id="${data.id}">
                    <img src="${data.logoUrl}" onerror="this.src='https://via.placeholder.com/100'">
                </div>`).join('');

        // Populate Main List
        renderList(allProjects);
    });

    // Login Logic
    const loginModal = document.getElementById('login-modal');
    const loginBtn = document.getElementById('google-login-btn');
    const closeLoginBtn = document.getElementById('close-login-btn');

    // Check Auth State
    auth.onAuthStateChanged((user) => {
        if (user) {
            // User is signed in, hide modal
            if (loginModal) loginModal.style.display = 'none';
            
            // Update Profile in Menu
            const profilePic = document.getElementById('user-profile-pic');
            const userName = document.getElementById('user-name');
            if (profilePic) profilePic.src = user.photoURL || 'https://via.placeholder.com/80';
            if (userName) userName.innerText = user.displayName || 'User';

            // Show Profile Pic in Header
            if (menuBtn) {
                menuBtn.innerHTML = `<img src="${user.photoURL || 'https://via.placeholder.com/40'}" style="width: 35px; height: 35px; border-radius: 50%; object-fit: cover;">`;
            }
        } else {
            // No user is signed in, show modal
            if (loginModal) loginModal.style.display = 'flex';
            
            const profilePic = document.getElementById('user-profile-pic');
            const userName = document.getElementById('user-name');
            if (profilePic) profilePic.src = 'https://via.placeholder.com/80';
            if (userName) userName.innerText = 'Guest';

            // Reset Header to Hamburger
            if (menuBtn) {
                menuBtn.innerHTML = '☰';
            }
        }
    });

    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            const provider = new firebase.auth.GoogleAuthProvider();
            auth.signInWithPopup(provider).catch((error) => alert(error.message));
        });
    }

    if (closeLoginBtn) {
        closeLoginBtn.addEventListener('click', () => {
            if (loginModal) loginModal.style.display = 'none';
        });
    }
});
