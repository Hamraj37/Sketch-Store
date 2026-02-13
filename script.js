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

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

const projectList = document.getElementById('project-list');

database.ref('projects').on('value', (snapshot) => {
    projectList.innerHTML = ''; 
    if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            // Use exact keys from your Firebase: logoUrl, projectName, profilePicUrl
            const cardHTML = `
                <div class="project-card">
                    <div class="project-icon">
                        <img src="${data.logoUrl}" onerror="this.src='https://via.placeholder.com/60'">
                    </div>
                    <div class="project-info">
                        <h3>${data.projectName}</h3>
                        <div class="author">
                            <img src="${data.profilePicUrl}" class="avatar" onerror="this.style.display='none'">
                            <span>${data.userName}</span>
                        </div>
                    </div>
                </div>
            `;
            projectList.innerHTML += cardHTML;
        });
    }
});
