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

    const projectList = document.getElementById('project-list');
    const slider = document.getElementById('recent-slider');
    
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

    database.ref('projects').on('value', (snapshot) => {
        // Safety check: only run if elements exist
        if (!projectList || !slider) return;

        projectList.innerHTML = ''; 
        slider.innerHTML = '';
        
        const projects = [];
        snapshot.forEach((child) => { projects.push(child.val()); });

        const reversed = [...projects].reverse();

        // Populate Slider (Top 5 Recent)
        slider.innerHTML = reversed.slice(0, 5).map(data => `
                <div class="slider-item">
                    <img src="${data.logoUrl}" onerror="this.src='https://via.placeholder.com/100'">
                </div>`).join('');

        // Populate Main List
        projectList.innerHTML = projects.map(data => `
                <div class="project-card">
                    <div class="project-icon">
                        <img src="${data.logoUrl}" onerror="this.src='https://via.placeholder.com/60'">
                    </div>
                    <div class="project-info">
                        <h3>${data.projectName || 'Untitled'}</h3>
                        <p>${data.userName || 'Unknown User'}</p>
                    </div>
                </div>`).join('');
    });
});
