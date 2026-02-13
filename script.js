// Initialize Firebase (Ensure your config is above this)
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

const projectListContainer = document.getElementById('project-list');

database.ref('projects').on('value', (snapshot) => {
    projectListContainer.innerHTML = ''; // Clear the list
    
    snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();
        
        // Dynamic Card Creation
        const cardHTML = `
            <div class="project-card">
                <div class="project-icon">
                    <img src="${data.logoUrl}" alt="icon" onerror="this.src='https://via.placeholder.com/60?text=NA'">
                </div>
                <div class="project-info">
                    <h3>${data.projectName}</h3>
                    <div class="author">
                        <img src="${data.profilePicUrl}" class="avatar-img" onerror="this.style.display='none'">
                        <p>${data.userName}</p>
                    </div>
                </div>
            </div>
        `;
        projectListContainer.innerHTML += cardHTML;
    });
});
