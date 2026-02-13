database.ref('projects').on('value', (snapshot) => {
    const projectList = document.getElementById('project-list');
    projectList.innerHTML = ''; 

    snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();
        
        // Use exact keys from your Firebase: logoUrl, projectName, profilePicUrl
        const cardHTML = `
            <div class="project-card">
                <div class="project-icon">
                    <img src="${data.logoUrl}" style="width:60px;height:60px;border-radius:12px;object-fit:cover;" onerror="this.src='https://via.placeholder.com/60'">
                </div>
                <div class="project-info">
                    <h3 style="margin:0;">${data.projectName}</h3>
                    <div style="display:flex;align-items:center;gap:8px;margin-top:5px;">
                        <img src="${data.profilePicUrl}" style="width:20px;height:20px;border-radius:50%;" onerror="this.style.display='none'">
                        <span style="font-size:14px;color:#666;">${data.userName}</span>
                    </div>
                </div>
            </div>
        `;
        projectList.innerHTML += cardHTML;
    });
});
