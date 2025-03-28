// This is a placeholder bundle file.
// In a production environment, this would be generated by Webpack
// For now, we'll use it to provide basic page navigation

document.addEventListener('DOMContentLoaded', function() {
  const root = document.getElementById('root');
  
  // Simple router function
  function renderPage() {
    const path = window.location.pathname;
    
    // Basic HTML templates for each page
    const pages = {
      '/': `
        <div>
          <h1>Welcome to Creative Crowd Challenge</h1>
          <p>Discover and participate in exciting creative competitions!</p>
          <div>
            <h2>Featured Competitions</h2>
            <div id="featured-competitions" style="display: flex; flex-wrap: wrap; gap: 20px;"></div>
          </div>
        </div>
      `,
      '/competitions': `
        <div>
          <h1>All Competitions</h1>
          <div id="competitions-list" style="display: flex; flex-wrap: wrap; gap: 20px;"></div>
        </div>
      `,
      '/login': `
        <div>
          <h1>Login</h1>
          <form id="login-form">
            <div style="margin-bottom: 15px;">
              <label for="email">Email:</label>
              <input type="email" id="email" name="email" required style="display: block; width: 100%; padding: 8px;">
            </div>
            <div style="margin-bottom: 15px;">
              <label for="password">Password:</label>
              <input type="password" id="password" name="password" required style="display: block; width: 100%; padding: 8px;">
            </div>
            <button type="submit" style="padding: 10px 20px; background-color: #3f51b5; color: white; border: none; cursor: pointer;">Login</button>
          </form>
        </div>
      `,
      '/register': `
        <div>
          <h1>Register</h1>
          <form id="register-form">
            <div style="margin-bottom: 15px;">
              <label for="name">Name:</label>
              <input type="text" id="name" name="name" required style="display: block; width: 100%; padding: 8px;">
            </div>
            <div style="margin-bottom: 15px;">
              <label for="email">Email:</label>
              <input type="email" id="email" name="email" required style="display: block; width: 100%; padding: 8px;">
            </div>
            <div style="margin-bottom: 15px;">
              <label for="password">Password:</label>
              <input type="password" id="password" name="password" required style="display: block; width: 100%; padding: 8px;">
            </div>
            <div style="margin-bottom: 15px;">
              <label for="confirm-password">Confirm Password:</label>
              <input type="password" id="confirm-password" name="confirmPassword" required style="display: block; width: 100%; padding: 8px;">
            </div>
            <button type="submit" style="padding: 10px 20px; background-color: #3f51b5; color: white; border: none; cursor: pointer;">Register</button>
          </form>
        </div>
      `,
      '/profile': `
        <div>
          <h1>Profile</h1>
          <div id="user-profile">
            <p>Please log in to view your profile.</p>
          </div>
        </div>
      `,
      '/submission': `
        <div>
          <h1>Submit Entry</h1>
          <p>Please log in to submit an entry.</p>
        </div>
      `
    };
    
    // Set default page if path is not recognized
    const content = pages[path] || pages['/'];
    root.innerHTML = content;
    
    // Add event listeners based on the current page
    if (path === '/login') {
      document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Login functionality will be implemented with backend integration.');
        window.location.href = '/';
      });
    } else if (path === '/register') {
      document.getElementById('register-form').addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Registration functionality will be implemented with backend integration.');
        window.location.href = '/';
      });
    } else if (path === '/' || path === '/competitions') {
      // Fetch competitions from the API
      fetchCompetitions();
    }
  }
  
  // Fetch and display competitions
  function fetchCompetitions() {
    fetch('/api/competitions')
      .then(response => response.json())
      .then(data => {
        if (window.location.pathname === '/') {
          // Display featured competitions on home page
          const featuredContainer = document.getElementById('featured-competitions');
          if (featuredContainer) {
            const featured = data.slice(0, 3); // Show first 3 as featured
            featured.forEach(competition => {
              featuredContainer.appendChild(createCompetitionCard(competition));
            });
          }
        } else if (window.location.pathname === '/competitions') {
          // Display all competitions on competitions page
          const competitionsContainer = document.getElementById('competitions-list');
          if (competitionsContainer) {
            data.forEach(competition => {
              competitionsContainer.appendChild(createCompetitionCard(competition));
            });
          }
        }
      })
      .catch(error => {
        console.error('Error fetching competitions:', error);
      });
  }
  
  // Create a competition card element
  function createCompetitionCard(competition) {
    const card = document.createElement('div');
    card.style.border = '1px solid #ddd';
    card.style.borderRadius = '8px';
    card.style.padding = '15px';
    card.style.width = '300px';
    card.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    
    const title = document.createElement('h3');
    title.textContent = competition.title;
    
    const description = document.createElement('p');
    description.textContent = competition.description.substring(0, 100) + '...';
    
    const category = document.createElement('p');
    category.textContent = `Category: ${competition.category}`;
    category.style.fontWeight = 'bold';
    
    const dates = document.createElement('p');
    dates.textContent = `${formatDate(competition.startDate)} - ${formatDate(competition.endDate)}`;
    
    const viewButton = document.createElement('button');
    viewButton.textContent = 'View Details';
    viewButton.style.padding = '8px 16px';
    viewButton.style.backgroundColor = '#3f51b5';
    viewButton.style.color = 'white';
    viewButton.style.border = 'none';
    viewButton.style.borderRadius = '4px';
    viewButton.style.cursor = 'pointer';
    viewButton.style.marginTop = '10px';
    
    viewButton.addEventListener('click', function() {
      // This would navigate to competition details in a full implementation
      alert(`Details for: ${competition.title}`);
    });
    
    card.appendChild(title);
    card.appendChild(category);
    card.appendChild(description);
    card.appendChild(dates);
    card.appendChild(viewButton);
    
    return card;
  }
  
  // Format date for display
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }
  
  // Initial render
  renderPage();
  
  // Handle navigation without page reload
  document.addEventListener('click', function(e) {
    if (e.target.tagName === 'A' && e.target.getAttribute('href').startsWith('/')) {
      e.preventDefault();
      const href = e.target.getAttribute('href');
      window.history.pushState({}, '', href);
      renderPage();
    }
  });
  
  // Handle browser back/forward navigation
  window.addEventListener('popstate', renderPage);
});