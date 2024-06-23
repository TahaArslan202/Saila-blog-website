
const form = document.querySelector('.dashboard-form')
const nameError = document.querySelector('#blogname')
const descriptionError = document.querySelector('#blogdescription')
const imageError = document.querySelector('#blogimage')

form.addEventListener("submit", async (e) => {
   e.preventDefault();

   nameError.textContent = "";
   descriptionError.textContent = "";
   imageError.textContent = "";
   nameError.style.display = "none";
   descriptionError.style.display = "none";
   imageError.style.display = "none";

   try {
        const formData = new FormData(form);
        const res = await fetch("/blogs", {
            method: "POST",
            body: formData
      });

      const data = await res.json();


      if (data) {

         if (data.name) {
            nameError.textContent = data.name
            nameError.style.display = "block"
            const button = document.getElementById('submitButton');
            button.disabled = false; 
            button.innerText = 'Save';
         }

         if (data.description) {
            descriptionError.textContent = data.description
            descriptionError.style.display = "block"
            const button = document.getElementById('submitButton');
            button.disabled = false; 
            button.innerText = 'Save';
         }

         if (data.image) {
            imageError.textContent = data.image
            imageError.style.display = "block"
            const button = document.getElementById('submitButton');
            button.disabled = false; 
            button.innerText = 'Save';
         }

      } 

      if(data.user){
        location.assign("/users/dashboard")
      }
      
   } 
   
   catch (err) {
      console.log("ERR::", err)
   }
});

const formprofile = document.querySelector('.updateprofiledashboard-form')
const emailError = document.querySelector('#profileemail')
const passwordError = document.querySelector('#profilepassword')
const usernameError = document.querySelector('#profileusername')

formprofile.addEventListener("submit", async (e) => {
   e.preventDefault();

   emailError.textContent = "";
   passwordError.textContent = "";
   usernameError.textContent = "";
   emailError.style.display = "none";
   passwordError.style.display = "none";
   usernameError.style.display = "none";

   try {
         const formData = new FormData(formprofile);
         const res = await fetch("/users/dashboard/profileupdate", {
            method: "POST",
            body: formData
         });
      const data = await res.json();

      if (data) {

         if (data.email) {
            emailError.textContent = data.email
            emailError.style.display = "block"
            const button = document.getElementById('profileButton');
            button.disabled = false; 
            button.innerText = 'Save';
         }

         if (data.password) {
            passwordError.textContent = data.password
            passwordError.style.display = "block"
            const button = document.getElementById('profileButton');
            button.disabled = false; 
            button.innerText = 'Save';
         }

         if (data.username) {
            usernameError.textContent = data.username
            usernameError.style.display = "block"
            const button = document.getElementById('profileButton');
            button.disabled = false; 
            button.innerText = 'Save';
         }

      } 

      if(data.user){
        location.assign("/users/dashboard")
      }
      
   } 
   
   catch (err) {
      console.log("ERR::", err)
   }
});

function disableButton() {
const button = document.getElementById('submitButton');
button.disabled = true; 
button.innerText = 'Saving...';
}

function profiledisableButton() {
   const button = document.getElementById('profileButton');
   button.disabled = true; 
   button.innerText = 'Saving...';
}

function blogdisableButton() {
   const button = document.getElementById('blogUpdateButton');
   button.disabled = true; 
   button.innerText = 'Saving...';
}

let i = null;
function idshow(id) {
    i = id;
}

function updateFormAction() {
   var form = document.querySelector('.updatedashboard-form');
   form.action = "/blogs/"+ i +"/?_method=PUT"; 
}










function resetStyles() {
   const links = document.querySelectorAll('nav a');
   links.forEach(link => {
     link.style.color = "#818181";
     link.style.fontWeight = "normal";
   });
 }


 function hideSections() {
   const elementsToHide = ['user_blogs', 'userAbout', 'dashboard', 'user_follower', 'user_followed', 'updatedashboard', 'userComment', 'updateprofiledashboard'];
 
   elementsToHide.forEach(elementId => {
     const element = document.getElementById(elementId);
     if (element) {
       element.style.display = 'none';
     }
   });
 }

 function blogShow(event) {
   event.preventDefault();
   resetStyles();
   hideSections();
   
   document.getElementById('user_blogs').style.display = 'grid';
   document.getElementById('user_blogs').classList.remove('hidden');
   
   document.getElementById('bloglink').style.color = "#1d1d1d";
   document.getElementById('bloglink').style.fontWeight = "600";
 }

 function aboutShow(event) {
   event.preventDefault();
   hideSections();
   resetStyles();
   
   document.getElementById('userAbout').style.display = 'block';
   document.getElementById('userAbout').classList.remove('hidden');
   
   document.getElementById('aboutlink').style.color = "#1d1d1d";
   document.getElementById('aboutlink').style.fontWeight = "600";
 }

 function uploadShow(event) {
   event.preventDefault();
   hideSections();
   resetStyles();
   
   document.getElementById('dashboard').style.display = 'flex';
   document.getElementById('dashboard').classList.remove('hidden');
   
   document.getElementById('uploadlink').style.color = "#1d1d1d";
   document.getElementById('uploadlink').style.fontWeight = "600";
 }

 function followerShow(event) {
   event.preventDefault();
   hideSections();
   resetStyles();
   
   document.getElementById('user_follower').style.display = 'grid';
   document.getElementById('user_follower').classList.remove('hidden');
   
   document.getElementById('followerlink').style.color = "#1d1d1d";
   document.getElementById('followerlink').style.fontWeight = "600";
 }

 function followedShow(event) {
   event.preventDefault();
   hideSections();
   resetStyles();
   
   document.getElementById('user_followed').style.display = 'grid';
   document.getElementById('user_followed').classList.remove('hidden');
   
   document.getElementById('followedlink').style.color = "#1d1d1d";
   document.getElementById('followedlink').style.fontWeight = "600";
 }

 function commentsShow(event) {
   event.preventDefault();
   hideSections();
   resetStyles();
   
   document.getElementById('userComment').style.display = 'grid';
   document.getElementById('userComment').classList.remove('hidden');
   
   document.getElementById('commentslink').style.color = "#1d1d1d";
   document.getElementById('commentslink').style.fontWeight = "600";
 }

 function updateShow(event) {
   event.preventDefault();
   hideSections();
   resetStyles();
   
   document.getElementById('updateprofiledashboard').style.display = 'flex';
   document.getElementById('updateprofiledashboard').classList.remove('hidden');
   
   document.getElementById('updatelink').style.color = "#1d1d1d";
   document.getElementById('updatelink').style.fontWeight = "600";
 }

 function updateBlogShow(event) {
   event.preventDefault();
   hideSections();
   resetStyles();
   
   document.getElementById('updatedashboard').style.display = 'flex';
   document.getElementById('updatedashboard').classList.remove('hidden');
   
   document.getElementById('bloglink').style.color = "#1d1d1d";
   document.getElementById('bloglink').style.fontWeight = "600";
 }