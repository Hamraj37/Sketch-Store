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

database.ref('projects').on('value', (snapshot) => {
    const slider = document.getElementById('recent-slider');
    const projectList = document.getElementById('project-list');
    
    slider.innerHTML = '';
    projectList.innerHTML = '';

    const projects = [];
    snapshot.forEach((child) => {
        projects.push(child.val());
    });

    // Firebase pushes are chronological; reversing gives you the newest first
    const reversedProjects = [...projects].reverse();

    // 1. Populate the Horizontal Slider with the 5 most recent
    reversedProjects.slice(0, 5).forEach((data) => {
        slider.innerHTML += `
            <div class="slider-item">
                <img src="${data.logoUrl}" onerror="this.src='https://via.placeholder.com/100?text=Logo'">
                <h3 style="margin:5px 0;">${data.projectName}</h3>
                <span style="font-size:12px; color:#666;">By ${data.userName}</span>
            </div>
        `;
    });

    // 2. Populate the Vertical All Projects list
    projects.forEach((data) => {
        projectList.innerHTML += `
            <div class="project-card">
                <div class="project-icon">
                    <img src="${data.logoUrl}" style="width:60px; height:60px; border-radius:12px; object-fit:cover;" onerror="this.src='https://via.placeholder.com/60'">
                </div>
                <div class="project-info">
                    <h3 style="margin:0;">${data.projectName}</h3>
                    <div style="display:flex; align-items:center; gap:8px; margin-top:5px;">
                        <img src="${data.profilePicUrl}" style="width:20px; height:20px; border-radius:50%;" onerror="this.style.display='none'">
                        <span style="font-size:14px; color:#555;">${data.userName}</span>
                    </div>
                </div>
            </div>
        `;
    });
});
