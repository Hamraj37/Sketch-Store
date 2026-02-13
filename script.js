// Your specific Firebase Config
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

// Start Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Get the container
const projectList = document.getElementById('project-list');

// Read data from "projects" node
database.ref('projects').on('value', (snapshot) => {
    projectList.innerHTML = ''; 

    snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();
        
        // Creating the card using your database keys: logoUrl, projectName, userName
        const cardHTML = `
            <div class="project-card" onclick="window.open('${data.swbUrl}', '_blank')">
                <div class="project-icon">
                    <img src="${data.logoUrl}" onerror="this.src='https://via.placeholder.com/60'">
                </div>
                <div class="project-details">
                    <h3>${data.projectName}</h3>
                    <div class="author-info">
                        <img src="${data.profilePicUrl}" class="user-avatar" onerror="this.style.display='none'">
                        <span>${data.userName}</span>
                    </div>
                </div>
            </div>
        `;
        projectList.innerHTML += cardHTML;
    });
});
