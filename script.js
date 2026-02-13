// 1. Your provided Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBmYKT5JOfH4NiAzzNWL1u_P3bkbbv6dWo",
  authDomain: "sketchware-pro-fe44e.firebaseapp.com",
  databaseURL: "https://sketchware-pro-fe44e-default-rtdb.firebaseio.com",
  projectId: "sketchware-pro-fe44e",
  storageBucket: "sketchware-pro-fe44e.firebasestorage.app",
  messagingSenderId: "140625293690",
  appId: "1:140625293690:web:d5055f3da9e59b609da6c3",
  measurementId: "G-01HG0WPLRK"
};

// 2. Initialize Firebase correctly to fix the ReferenceError
firebase.initializeApp(firebaseConfig);
const database = firebase.database(); // This defines the "database" variable

const projectList = document.getElementById('project-list');
const slider = document.getElementById('recent-slider');

// 3. Listen for data in the "projects" node
database.ref('projects').on('value', (snapshot) => {
    projectList.innerHTML = ''; 
    slider.innerHTML = '';
    
    const projects = [];
    snapshot.forEach((childSnapshot) => {
        projects.push(childSnapshot.val());
    });

    // Reverse for recent slider (Top 5)
    const reversed = [...projects].reverse();

    // Populate Slider
    reversed.slice(0, 5).forEach((data) => {
        slider.innerHTML += `
            <div class="slider-item">
                <img src="${data.logoUrl}" onerror="this.src='https://via.placeholder.com/100'">
                <h3>${data.projectName}</h3>
                <span>By ${data.userName}</span>
            </div>
        `;
    });

    // Populate All Projects List
    projects.forEach((data) => {
        const cardHTML = `
            <div class="project-card">
                <div class="project-icon">
                    <img src="${data.logoUrl}" onerror="this.src='https://via.placeholder.com/60'">
                </div>
                <div class="project-info">
                    <h3>${data.projectName}</h3>
                    <div class="author">
                        <img src="${data.profilePicUrl}" class="avatar-img" onerror="this.style.display='none'">
                        <span>${data.userName}</span>
                    </div>
                </div>
            </div>
        `;
        projectList.innerHTML += cardHTML;
    });
});
