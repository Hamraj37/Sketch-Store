// Initialize Firebase (Ensure your config is loaded before this)
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

const projectList = document.getElementById('project-list');

database.ref('projects').on('value', (snapshot) => {
    projectList.innerHTML = ''; 
    
    if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            
            // Map Firebase data to HTML
            const cardHTML = `
                <div class="project-card">
                    <div class="project-icon">
                        <img src="${data.logoUrl}" alt="logo" onerror="this.src='https://via.placeholder.com/60?text=NA'">
                    </div>
                    <div class="project-info">
                        <h3 style="margin:0;">${data.projectName}</h3>
                        <div class="author">
                            <img src="${data.profilePicUrl}" class="avatar-img" onerror="this.style.display='none'">
                            <p style="margin:0; font-size:14px; color:#555;">${data.userName}</p>
                        </div>
                    </div>
                </div>
            `;
            projectList.innerHTML += cardHTML;
        });
    } else {
        projectList.innerHTML = '<p>No data found.</p>';
    }
});
