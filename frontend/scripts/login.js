 document.getElementById('adminLoginForm').addEventListener('submit', function(e) {
     e.preventDefault();
     const username = document.getElementById('username').value;
     const password = document.getElementById('password').value;
     fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
     })
     .then(response => {
         if (!response.ok) {
            document.getElementById('errorMsg').textContent = 'Invalid username or password';
            document.getElementById('errorMsg').style.display = 'block';
            return Promise.reject();
         }
         return response.json();
     })
     .then(data => {
         if (data && data.token) {
             const token = data.token;
             localStorage.setItem("admin-token", token);
             window.location.href = 'admin.html';
         }
     })
     .catch(() => {
         // Optionally handle errors here
         document.getElementById('errorMsg').textContent = 'Login failed. Please try again.';
         document.getElementById('errorMsg').style.display = 'block';
     });
 });