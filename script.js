// Your provided configuration
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

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Reference to your projects in the database
const projectsRef = database.ref('projects'); 

// Fetch data and update UI
projectsRef.on('value', (snapshot) => {
    const projectList = document.getElementById('project-list');
    projectList.innerHTML = ''; // Clear current list

    snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();
        
        // Create the HTML for each project card
        const card = `
            <div class="project-card">
                <img src="${data.iconUrl || 'placeholder.png'}" style="width:60px; height:60px; border-radius:10px;">
                <div class="info">
                    <h3 style="margin:0;">${data.name}</h3>
                    <p style="margin:0; color:gray;">By ${data.author}</p>
                </div>
            </div>
        `;
        projectList.innerHTML += card;
    });
});

