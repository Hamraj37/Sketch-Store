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
    const logoutBtn = document.getElementById('logout-btn');
    const uploadBtn = document.getElementById('menu-upload-btn');
    const viewToggleBtn = document.getElementById('view-toggle-btn');
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
    
    // View Toggle Logic
    if (viewToggleBtn) {
        // Load saved preference
        if (localStorage.getItem('viewMode') === 'grid') {
            projectList.classList.add('grid-view');
            viewToggleBtn.textContent = 'view_list';
        }

        viewToggleBtn.addEventListener('click', () => {
            projectList.classList.toggle('grid-view');
            // Toggle Icon between Grid (⊞) and List (≣)
            const isGrid = projectList.classList.contains('grid-view');
            viewToggleBtn.textContent = isGrid ? 'view_list' : 'grid_view';
            localStorage.setItem('viewMode', isGrid ? 'grid' : 'list');
        });
    }

    // Menu Logic
    const menuBtn = document.querySelector('.menu-btn');
    const sideMenu = document.getElementById('side-menu');
    const menuOverlay = document.getElementById('menu-overlay');
    const closeBtn = document.querySelector('.close-btn');

    function toggleMenu() {
        if (sideMenu) sideMenu.classList.toggle('open');
        if (menuOverlay) menuOverlay.classList.toggle('open');
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
                document.getElementById('publisher-pic').src = project.profilePicUrl || 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
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

        // Comments Logic
        const commentsList = document.getElementById('comments-list');
        const commentInput = document.getElementById('comment-input');
        const sendCommentBtn = document.getElementById('send-comment-btn');

        if (commentsList) {
            // Load Comments
            database.ref(`projects/${projectId}/comments`).on('value', (snapshot) => {
                commentsList.innerHTML = '';
                if (snapshot.exists()) {
                    const comments = [];
                    snapshot.forEach(child => {
                        const comment = child.val();
                        comment.id = child.key;
                        comments.push(comment);
                    });
                    
                    const currentUser = auth.currentUser;

                    commentsList.innerHTML = comments.map(c => {
                        const isOwner = currentUser && c.userId === currentUser.uid;
                        const actions = isOwner ? `
                            <div class="comment-actions">
                                <span class="material-icons action-btn edit-btn" data-id="${c.id}">edit</span>
                                <span class="material-icons action-btn delete-btn" data-id="${c.id}">delete</span>
                            </div>` : '';
                        return `
                        <div class="comment-item" id="comment-${c.id}">
                            <img src="${c.photoURL || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}" class="comment-avatar" onerror="this.src='https://cdn-icons-png.flaticon.com/512/149/149071.png'">
                            <div class="comment-body">
                                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                                    <span class="comment-user">${c.userName || 'User'}</span>
                                    ${actions}
                                </div>
                                <p class="comment-text">${c.text}</p>
                            </div>
                        </div>
                    `}).join('');
                    // Scroll to bottom
                    commentsList.scrollTop = commentsList.scrollHeight;
                } else {
                    commentsList.innerHTML = '<p style="color:#888; text-align:center; font-size: 14px;">No comments yet. Be the first!</p>';
                }
            });

            // Edit and Delete Logic
            commentsList.addEventListener('click', (e) => {
                const target = e.target;
                const id = target.dataset.id;
                if (!id) return;

                if (target.classList.contains('delete-btn')) {
                    if (confirm('Delete this comment?')) {
                        database.ref(`projects/${projectId}/comments/${id}`).remove();
                    }
                } else if (target.classList.contains('edit-btn')) {
                    const commentItem = document.getElementById(`comment-${id}`);
                    const textElem = commentItem.querySelector('.comment-text');
                    const currentText = textElem.innerText;
                    
                    const newText = prompt('Edit your comment:', currentText);
                    if (newText !== null && newText.trim() !== '') {
                        database.ref(`projects/${projectId}/comments/${id}`).update({ text: newText });
                    }
                }
            });

            // Send Comment
            if (sendCommentBtn && commentInput) {
                sendCommentBtn.addEventListener('click', () => {
                    const text = commentInput.value.trim();
                    const user = auth.currentUser;
                    
                    if (!user) {
                        alert("Please go to the Home page and login to comment.");
                        return;
                    }
                    
                    if (text) {
                        const newComment = {
                            text: text,
                            userId: user.uid,
                            userName: user.displayName || 'User',
                            photoURL: user.photoURL,
                            timestamp: firebase.database.ServerValue.TIMESTAMP
                        };
                        database.ref(`projects/${projectId}/comments`).push(newComment);
                        commentInput.value = '';
                    }
                });
            }
        }
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
        const profileSection = document.querySelector('.user-profile-section');

        if (user) {
            // User is signed in, hide modal
            if (loginModal) loginModal.style.display = 'none';
            
            // Show profile and logout
            if (profileSection) profileSection.style.display = 'flex';
            if (logoutBtn) logoutBtn.style.display = 'block';
            if (uploadBtn) uploadBtn.style.display = 'block';

            // Update Profile in Menu
            const profilePic = document.getElementById('user-profile-pic');
            const userName = document.getElementById('user-name');
            if (profilePic) profilePic.src = user.photoURL || 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
            if (userName) userName.innerText = user.displayName || 'User';

            // Show Profile Pic in Header
            if (menuBtn) {
                menuBtn.innerHTML = `<img src="${user.photoURL || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}" style="width: 35px; height: 35px; border-radius: 50%; object-fit: cover;">`;
            }
        } else {
            // No user is signed in, show modal
            if (loginModal) loginModal.style.display = 'flex';
            
            // Hide profile and logout
            if (profileSection) profileSection.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (uploadBtn) uploadBtn.style.display = 'none';

            const profilePic = document.getElementById('user-profile-pic');
            const userName = document.getElementById('user-name');
            if (profilePic) profilePic.src = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
            if (userName) userName.innerText = 'Guest';

            // Reset Header to Hamburger
            if (menuBtn) {
                menuBtn.innerHTML = '<span class="material-icons">menu</span>';
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

    // Logout Logic
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleMenu(); // Close menu immediately
            auth.signOut().catch((error) => console.error("Logout error:", error));
        });
    }
});
