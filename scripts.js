/* 
School: University of Technology
Day /Time: Wednesday 10:00am-11:50am
Teacher: C.Anuli
Final Group Project- This is a Phone case Store
 
 Group Members and Id : Roheem Brown 2301100
                        Dante Morris 2407185
                        Shaeed Cheverria 2206577
                        Michalia Williams 2405331 
*/

// ===================================================================
// SCRIPT INITIALIZATION
// ===================================================================
// This is the main entry point for the entire DripCase application.
// We wrap everything in a 'DOMContentLoaded' event listener to ensure
// the entire HTML page has been loaded and parsed before we try to
// manipulate any of its elements (like getting an element by ID).
// This prevents errors where a script tries to find an element that doesn't exist yet.
document.addEventListener('DOMContentLoaded', function() {

  // --- VARIABLE DECLARATIONS (moved to the top) ---
  // Question: Why are all these variables declared at the top?
  // Answer: Declaring all DOM element references and constants at the top
  // makes the code cleaner, more organized, and prevents errors from
  // trying to use a variable before it has been declared (hoisting).
  const profileIcon = document.getElementById("profileIcon");
  const profileInitial = document.getElementById("profileInitial");
  const profileName = document.getElementById("profileName");
  const profileContainer = document.getElementById("profileContainer");
  const TAX_RATE = 0.15; // A constant for calculating tax, easy to change in one place.

  // Get references to forms and key interactive elements if they exist on the current page.
  const registrationForm = document.getElementById('registrationForm');
  const loginForm = document.getElementById('loginForm');
  const resetPasswordModal = document.getElementById('resetPasswordModal');
  const openResetPasswordBtn = document.getElementById('openResetPassword');
  const searchInput = document.querySelector('#searchDropdown input');
  const searchResults = document.querySelector('.search-results');
  const slides = document.querySelectorAll('.slide');

  // --- INITIALIZATION ---
  // Question: What happens as soon as the page loads?
  // Answer: These three functions are called immediately to set up the
  // initial state of the application for every user, on every page.
  ensureAdminExists(); // Makes sure a default admin account is always available.
  checkLoginStatus();   // Checks if a user is logged in and updates the navbar UI.
  updateCartCount();    // Updates the cart item count badge in the navbar.

  // --- UTILITY FUNCTIONS ---
  // Question: What is the purpose of this section?
  // Answer: This section contains reusable helper functions that serve
  // the entire application, like showing notifications or calculating age.
  function showNotification(message, type = 'success') {
    // Creates a temporary pop-up notification to give the user feedback.
    const notification = document.createElement('div');
    notification.className = `notification ${type}`; // Use 'success' or 'error' class.
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed; bottom: 20px; right: 20px; padding: 15px 25px; border-radius: 5px;
      color: white; z-index: 10000; box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      background-color: ${type === 'success' ? '#4CAF50' : '#F44336'};
      animation: slideInRight 0.5s, fadeOut 0.5s 2.5s forwards;
    `;
    document.body.appendChild(notification);
    // Automatically remove the notification from the page after 3 seconds.
    setTimeout(() => notification.remove(), 3000);
  }

  // --- ADMIN USER MANAGEMENT ---
  // Question: What does this section do?
  // Answer: This function ensures a default administrator account always exists
  // in the system. It's a crucial setup function for site management.
  // It also "repairs" the admin account if it exists but is missing the isAdmin flag.
  function ensureAdminExists() {
    let registrationData = JSON.parse(localStorage.getItem('RegistrationData')) || [];
    const adminTrn = '000-000-000';
    let adminUser = registrationData.find(user => user.trn === adminTrn);

    if (!adminUser) {
      // If no admin user is found, create one with default credentials.
      adminUser = {
        name: 'Site Administrator',
        trn: adminTrn,
        password: 'admin123',
        isAdmin: true
      };
      registrationData.push(adminUser);
      console.log('Admin user created.');
    } else if (!adminUser.isAdmin) {
      // If an admin user exists but is not flagged as admin, fix it.
      adminUser.isAdmin = true;
      adminUser.password = 'admin123'; // Also ensure password is correct.
      console.log('Existing admin user repaired.');
    }

    // Save the (potentially) updated data back to localStorage.
    localStorage.setItem('RegistrationData', JSON.stringify(registrationData));
  }

  // --- PROFILE & AUTHENTICATION ---
  // Question: What is the purpose of this section?
  // Answer: This section manages the user's authentication state. It checks
  // if a user is logged in, updates the profile icon in the navbar to
  // show their initial, and handles the click event for logging out.
  function updateProfileDisplay(user) {
    // First, check if the profile elements exist on the page before trying to use them.
    if (!profileIcon || !profileInitial || !profileName || !profileContainer) {
      return;
    }

    // If a user is already logged in (from a previous session), remove any existing dashboard link.
    const existingLink = profileContainer.querySelector('.dashboard-link');
    if (existingLink) {
      existingLink.remove();
    }

    if (user && user.name) {
      // If a user object is passed in, update the UI to show the logged-in state.
      profileIcon.style.display = "none"; // Hide the default icon.
      profileInitial.style.display = "flex"; // Show the circle with the initial.
      profileInitial.textContent = user.name.charAt(0).toUpperCase();
      profileName.style.display = "inline"; // Show the user's name.
      profileName.textContent = user.name;

      // If the logged-in user is an admin, add a link to the dashboard.
      if (user.isAdmin) {
        const dashboardLink = document.createElement('a');
        dashboardLink.href = 'dashboard.html';
        dashboardLink.className = 'dashboard-link';
        dashboardLink.textContent = 'Admin Dashboard';
        dashboardLink.style.cssText = 'margin-left: 15px; font-size: 14px; color: #007bff;';
        profileContainer.appendChild(dashboardLink);
      }
    } else {
      // If no user is logged in, revert to the default logged-out state.
      profileIcon.style.display = "flex";
      profileInitial.style.display = "none";
      profileName.style.display = "none";
    }
  }

  // Question: What does this function do?
  // Answer: This function checks the browser's sessionStorage for a 'currentUserTrn'
  // key. If it exists, it finds the corresponding user in localStorage and
  // updates the UI. It returns the user's data if found, otherwise null.
  function checkLoginStatus() {
    const currentUserTrn = sessionStorage.getItem('currentUserTrn');
    if (currentUserTrn) {
      const registrationData = JSON.parse(localStorage.getItem('RegistrationData')) || [];
      const userData = registrationData.find(user => user.trn === currentUserTrn);
      if (userData) {
        updateProfileDisplay(userData); // Update the navbar with user info.
        return userData;
      }
    }
    updateProfileDisplay(null); // No user found, ensure the logged-out UI.
    return null;
  }

  // Question: What is this event listener for?
  // Answer: This makes the entire profile area in the navbar clickable.
  // If the user is logged in, it prompts for logout. If logged out, it redirects to the login page.
  if (profileContainer) {
    profileContainer.addEventListener('click', () => {
      // Check login status by checking if the user's name is visible.
      const isLoggedIn = profileName.style.display !== "none";
      if (isLoggedIn) {
        // If logged in, confirm and then log out.
        if (confirm("Are you sure you want to logout?")) {
          sessionStorage.removeItem('currentUserTrn'); // Clear the session.
          updateProfileDisplay(null); // Update the UI to the logged-out state.
          showNotification("Logged out successfully");
          // If not on the home page, redirect there after logout.
          if (window.location.pathname !== 'index.html') {
            window.location.href = 'index.html';
          }
        }
      } else {
        // If logged out, go to the login page.
        window.location.href = 'login.html';
      }
    });
  }

  // --- REGISTRATION (for register.html) ---
  // Question: What is the purpose of this section?
  // Answer: This entire block of code only runs if the registration form
  // element is found on the page. It handles the logic for a new user
  // creating an account, including validation and saving the data.
  if (registrationForm) {
    // Listen for a click on the "Register" button.
    document.getElementById('registerBtn').addEventListener('click', () => {
      // Get all the values from the form fields and trim whitespace.
      const firstName = document.getElementById('firstName').value.trim();
      const lastName = document.getElementById('lastName').value.trim();
      const dob = document.getElementById('dob').value;
      const gender = document.getElementById('gender').value;
      const phone = document.getElementById('phone').value.trim();
      const email = document.getElementById('email').value.trim();
      const trn = document.getElementById('trn').value.trim();
      const password = document.getElementById('password').value;
      const regError = document.getElementById('regError');
      
      // --- FORM VALIDATION ---
      if (!firstName || !lastName || !dob || !gender || !phone || !email || !trn || !password) {
        regError.textContent = "Please fill out all fields.";
        regError.style.display = 'block';
        return; // Stop the function here.
      }
      if (password.length < 8) {
        regError.textContent = "Password must be at least 8 characters.";
        regError.style.display = 'block';
        return;
      }
      
      // Check if the TRN is already registered by another user.
      let registrationData = JSON.parse(localStorage.getItem('RegistrationData')) || [];
      if (registrationData.some(user => user.trn === trn)) {
        regError.textContent = "An account with this TRN already exists.";
        regError.style.display = 'block';
        return;
      }
      
      // --- SAVE USER DATA ---
      // If validation passes, create a user object.
      const user = { name: `${firstName} ${lastName}`, firstName, lastName, dob, gender, phone, email, trn, password, invoices: [] };
      registrationData.push(user);
      localStorage.setItem("RegistrationData", JSON.stringify(registrationData));
      
      // Log the user in immediately after registration.
      sessionStorage.setItem('currentUserTrn', trn);
      
      // Provide feedback and redirect.
      showNotification("Registration successful! Redirecting...");
      setTimeout(() => window.location.href = 'index.html', 1500);
    });
  }

  // --- LOGIN (for login.html) ---
  // Question: What is the purpose of this section?
  // Answer: This block handles user authentication. It validates the TRN and
  // password against the stored data and includes security measures like login attempt limits.
  if (loginForm) {
    let loginAttempts = 3; // Initialize the counter for failed attempts.
    const loginError = document.getElementById('loginError');
    const loginSuccess = document.getElementById('loginSuccess');
    const attemptsRemaining = document.getElementById('attemptsRemaining');
    const loginBtn = loginForm.querySelector('button[type="submit"]');

    // Listen for the form's submission event.
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault(); // Prevent the default browser form submission behavior.
      const trn = document.getElementById('loginTrn').value.trim();
      const password = document.getElementById('loginPassword').value;
      const registrationData = JSON.parse(localStorage.getItem('RegistrationData')) || [];
      const user = registrationData.find(u => u.trn === trn);
      
      // --- FAILED LOGIN LOGIC ---
      if (!user || user.password !== password) {
        loginError.textContent = user ? 'Invalid password.' : 'TRN not found.';
        loginError.style.display = 'block';
        loginSuccess.style.display = 'none';
        loginAttempts--; // Decrement the attempt counter.
        attemptsRemaining.textContent = `Attempts remaining: ${loginAttempts}`;
        if (loginAttempts <= 0) {
          showNotification('Account locked. Too many failed attempts.', 'error');
          loginBtn.disabled = true; // Disable the button after 3 failed attempts.
        }
        return;
      }
      
      // --- SUCCESSFUL LOGIN LOGIC ---
      loginSuccess.textContent = 'Login successful! Redirecting...';
      loginSuccess.style.display = 'block';
      loginError.style.display = 'none';
      sessionStorage.setItem('currentUserTrn', trn); // Store the session.
      
    
// Check if the logged-in user is an admin
    if (user.isAdmin) {
  // If admin, redirect to the dashboard
  setTimeout(() => window.location.href = 'dashboard.html', 1500);
} else {
  // If a regular user, redirect to the home page
  setTimeout(() => window.location.href = 'index.html', 1500);
}
    });
  }
  
  // --- PASSWORD RESET (for login.html) ---
  // Question: What is the purpose of this section?
  // Answer: This section manages the password reset functionality. It controls
  // the modal window's visibility and handles the form submission to update a user's password.
  if (resetPasswordModal && openResetPasswordBtn) {
    // Show the modal when the "Reset Password" link is clicked.
    openResetPasswordBtn.onclick = () => resetPasswordModal.style.display = 'flex';
    // Hide the modal and reset the form when the 'x' is clicked.
    resetPasswordModal.querySelector('.close').onclick = () => {
      resetPasswordModal.style.display = 'none';
      resetPasswordModal.querySelector('form').reset();
    };
    // Handle the submission of the password reset form inside the modal.
    resetPasswordModal.querySelector('form').addEventListener('submit', function(e) {
      e.preventDefault();
      const trn = document.getElementById('resetTrn').value.trim();
      const newPass = document.getElementById('newPassword').value;
      const confirmPass = document.getElementById('confirmPassword').value;
      const resetError = document.getElementById('resetError');
      const resetSuccess = document.getElementById('resetSuccess');
      
      // Validate that the new password and confirmation match.
      if (newPass !== confirmPass) {
        resetError.textContent = 'Passwords do not match.';
        resetError.style.display = 'block';
        return;
      }
      if (newPass.length < 8) {
        resetError.textContent = 'Password must be at least 8 characters.';
        resetError.style.display = 'block';
        return;
      }

      // Find the user by their TRN.
      let registrationData = JSON.parse(localStorage.getItem('RegistrationData')) || [];
      const userIndex = registrationData.findIndex(u => u.trn === trn);
      if (userIndex === -1) {
        resetError.textContent = 'TRN not found.';
        resetError.style.display = 'block';
        return;
      }
      
      // --- UPDATE PASSWORD ---
      // If the user is found, update their password in the array.
      registrationData[userIndex].password = newPass;
      localStorage.setItem('RegistrationData', JSON.stringify(registrationData));
      resetSuccess.textContent = 'Password reset successfully!';
      resetSuccess.style.display = 'block';
      resetError.style.display = 'none';
      
      // Hide the modal after a short delay.
      setTimeout(() => {
        resetPasswordModal.style.display = 'none';
        resetPasswordModal.querySelector('form').reset();
      }, 2000);
    });
  }

  // --- CART FUNCTIONALITY ---
  // Question: What is the purpose of this section?
  // Answer: This section contains all functions related to the shopping cart,
  // such as updating the item count in the navbar and handling "Add to Cart" clicks.
  function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("dripcaseCart")) || [];
    // Use reduce to sum up the quantities of all items in the cart.
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    let badge = document.querySelector('.cart-badge');
    // If the badge doesn't exist yet, create it and append it to the cart icon.
    if (!badge && document.getElementById('cartIcon')) {
      badge = document.createElement('span');
      badge.className = 'cart-badge';
      document.getElementById('cartIcon').parentElement.appendChild(badge);
    }
    if (badge) {
      badge.textContent = totalItems;
      // Only show the badge if there are items in the cart.
      badge.style.display = totalItems > 0 ? 'flex' : 'none';
    }
  }

  // --- "ADD TO CART" BUTTONS (for index.html) ---
  // Question: What does this section do?
  // Answer: This finds every "Add to Cart" button on the page and attaches a
  // click listener to it. This allows users to add products to their cart.
  document.querySelectorAll(".addToCartBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      // Get the product name and price from the button's data attributes.
      const name = btn.dataset.name;
      const price = parseFloat(btn.dataset.price);
      let cart = JSON.parse(localStorage.getItem("dripcaseCart")) || [];
      const existing = cart.find(item => item.name === name);
      if (existing) {
        // If the item is already in the cart, just increment its quantity.
        existing.quantity += 1;
        showNotification(`${name} quantity updated in cart`);
      } else {
        // Otherwise, add the new item to the cart with a quantity of 1.
        cart.push({ name, price, quantity: 1 });
        showNotification(`${name} added to cart`);
      }
      // Save the updated cart back to localStorage and update the badge count.
      localStorage.setItem("dripcaseCart", JSON.stringify(cart));
      updateCartCount();
    });
  });

  // --- DROPDOWNS (for index.html) ---
  // Question: What is the purpose of this section?
  // Answer: This section controls the interactive menu and search dropdowns
  // in the navbar, managing their visibility and click behavior.
  function showDropdown(targetId) {
    const target = document.getElementById(targetId);
    const isOpen = target.style.display === 'flex';
    // Hide all dropdowns first.
    document.querySelectorAll('.dropdown').forEach(d => d.style.display = 'none');
    // If the target dropdown was not already open, open it.
    if (!isOpen) target.style.display = 'flex';
  }
  // Attach click listeners to the menu and search icons to toggle their respective dropdowns.
  document.getElementById("menuIcon")?.addEventListener('click', e => { e.stopPropagation(); showDropdown("menuDropdown"); });
  document.getElementById("searchIcon")?.addEventListener('click', e => { e.stopPropagation(); showDropdown("searchDropdown"); });
  // Add a click listener to the whole document to close all dropdowns when clicking elsewhere.
  document.addEventListener("click", () => document.querySelectorAll('.dropdown').forEach(d => d.style.display = 'none'));

  // --- SEARCH (for index.html) ---
  // Question: What is the purpose of this section?
  // Answer: This provides the live search functionality. It filters products
  // on the page as the user types in the search dropdown and displays the results.
  if (searchInput && searchResults) {
    searchInput.addEventListener('input', e => {
      const query = e.target.value.toLowerCase().trim();
      if (query.length < 2) { searchResults.innerHTML = ''; return; }
      
      // Read products directly from the DOM for this implementation.
      const products = [];
      document.querySelectorAll('.product').forEach(productEl => {
        const name = productEl.querySelector('p').textContent.toLowerCase();
        if (name.includes(query)) {
          const img = productEl.querySelector('img').src;
          const price = productEl.querySelectorAll('p')[1].textContent;
          products.push({ name: productEl.querySelector('p').textContent, price, img });
        }
      });
      
      // Display the search results.
      searchResults.innerHTML = products.length === 0 ? '<p>No products found</p>' :
        products.map(p => `
          <div class="search-result-item" data-name="${p.name}">
            <img src="${p.img}" alt="${p.name}">
            <div><div>${p.name}</div><div>${p.price}</div></div>
          </div>
        `).join('');
      
      // Add click listeners to the search results to scroll to the product on the page.
      searchResults.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
          document.getElementById('searchDropdown').style.display = 'none';
          searchInput.value = '';
          document.querySelectorAll('.product').forEach(p => {
            if (p.querySelector('p').textContent === item.dataset.name) {
              p.scrollIntoView({ behavior: 'smooth', block: 'center' });
              p.style.transition = 'background-color 0.5s';
              p.style.backgroundColor = '#ffffcc';
              setTimeout(() => p.style.backgroundColor = '', 2000);
            }
          });
        });
      });
    });
  }

  // --- CART / CHECKOUT PAGE LOGIC (for cart.html) ---
  // Question: What is the purpose of this section?
  // Answer: This block contains all the logic specific to the cart and checkout page.
  // It renders the cart, handles item removal/quantity changes, and processes the checkout.
  if (window.location.pathname.endsWith('cart.html')) {
    const cartTableBody = document.querySelector("#cartTable tbody");
    const cartSubtotalEl = document.getElementById('cartSubtotal');
    const cartTaxEl = document.getElementById('cartTax');
    const cartTotalEl = document.getElementById("cartTotal");
    const shippingForm = document.getElementById('shippingForm');
    const fullNameInput = document.getElementById('fullName');
    const trnInput = document.getElementById('trn');

    // A safety check to ensure all required elements exist before running the script.
    if (!cartTableBody || !cartSubtotalEl || !cartTaxEl || !cartTotalEl || !shippingForm || !fullNameInput || !trnInput) {
        console.error("Cart page is missing critical HTML elements. Script cannot run.");
        showNotification("A critical error occurred. The page may not have loaded correctly.", 'error');
        return;
    }

    // Force the user to be logged in to access the checkout page.
    const currentUser = checkLoginStatus();
    if (!currentUser) {
      showNotification('You must be logged in to proceed to checkout.', 'error');
      setTimeout(() => window.location.href = 'login.html', 1500);
      return;
    }

    // Pre-fill the shipping form with the logged-in user's data.
    fullNameInput.value = currentUser.name || '';
    trnInput.value = currentUser.trn || '';

    // This function redraws the entire cart table.
    function renderCartSummary() {
      const cart = JSON.parse(localStorage.getItem("dripcaseCart")) || [];
      cartTableBody.innerHTML = "";
      
      if (cart.length === 0) {
        cartTableBody.innerHTML = '<tr><td colspan="5">Your cart is empty.</td></tr>';
        cartSubtotalEl.textContent = '$0.00';
        cartTaxEl.textContent = '$0.00';
        cartTotalEl.textContent = '$0.00';
        shippingForm.querySelector('button[type="submit"]').disabled = true;
        return;
      }

      let subtotal = 0;
      cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${item.name}</td>
          <td>$${item.price.toFixed(2)}</td>
          <td><input type="number" min="1" value="${item.quantity}" data-index="${index}" class="qtyInput"/></td>
          <td>$${itemTotal.toFixed(2)}</td>
          <td><button class="removeBtn" data-index="${index}">Remove</button></td>
        `;
        cartTableBody.appendChild(row);
      });
      
      const tax = subtotal * TAX_RATE;
      const total = subtotal + tax;

      cartSubtotalEl.textContent = `$${subtotal.toFixed(2)}`;
      cartTaxEl.textContent = `$${tax.toFixed(2)}`;
      cartTotalEl.textContent = `$${total.toFixed(2)}`;
      
      shippingForm.querySelector('button[type="submit"]').disabled = false;
    }
    
    // Use event delegation to handle clicks on dynamically created "Remove" buttons.
    document.addEventListener('click', function(e) {
      if (e.target && e.target.classList.contains('removeBtn')) {
        let cart = JSON.parse(localStorage.getItem("dripcaseCart")) || [];
        const index = parseInt(e.target.dataset.index);
        if (index > -1) {
            cart.splice(index, 1); // Remove the item from the array.
            localStorage.setItem("dripcaseCart", JSON.stringify(cart));
            renderCartSummary(); // Re-render the table.
            updateCartCount(); // Update the navbar badge.
        }
      }
    });

    // Use event delegation to handle changes in dynamically created quantity inputs.
    document.addEventListener('change', function(e) {
      if (e.target && e.target.classList.contains('qtyInput')) {
        let cart = JSON.parse(localStorage.getItem("dripcaseCart")) || [];
        const index = parseInt(e.target.dataset.index);
        const value = parseInt(e.target.value);
        
        if (index > -1 && value > 0) {
          cart[index].quantity = value;
          localStorage.setItem("dripcaseCart", JSON.stringify(cart));
          renderCartSummary();
          updateCartCount();
        } else {
          // If the input is invalid, revert it to the last known good value.
           e.target.value = cart[index].quantity;
        }
      }
    });

    // Handle the submission of the shipping form to generate an invoice.
    shippingForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const shippingInfo = {
        fullName: fullNameInput.value,
        address: document.getElementById('address').value,
        trn: trnInput.value,
      };
      generateInvoice(shippingInfo);
    });

    // Handle the "Cancel" button click.
    document.getElementById('cancelCheckoutBtn')?.addEventListener('click', () => {
      if (confirm('Are you sure you want to cancel? Your cart will not be saved.')) {
        window.location.href = 'index.html';
      }
    });

    // Initial render of the cart when the page loads.
    renderCartSummary();
  }

  // --- INVOICE GENERATION ---
  // Question: What is the purpose of this function?
  // Answer: This function creates a detailed invoice object, saves it to localStorage
  // (both globally and for the specific user), clears the cart, and redirects
  // the user to the invoice page to see the final receipt.
  function generateInvoice(shippingInfo) {
    const cart = JSON.parse(localStorage.getItem("dripcaseCart")) || [];
    if (cart.length === 0) {
      showNotification("Your cart is empty.", 'error');
      return;
    }

    let subtotal = 0;
    // Add a 'total' property to each item in the cart.
    const itemsWithTotal = cart.map(item => {
      const total = item.price * item.quantity;
      subtotal += total;
      return { ...item, total };
    });

    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;

    // Create a unique, incrementing invoice number.
    let invoiceCounter = parseInt(localStorage.getItem('invoiceCounter') || '1');
    const invoiceNumber = `INV-${String(invoiceCounter).padStart(5, '0')}`;
    localStorage.setItem('invoiceCounter', invoiceCounter + 1);

    // Assemble the final invoice object.
    const invoice = {
      invoiceNumber,
      date: new Date().toLocaleDateString(),
      company: "DripCase",
      shippingInfo,
      trn: shippingInfo.trn,
      items: itemsWithTotal,
      subtotal,
      tax,
      total
    };

    // Save the invoice to the global list of all invoices.
    let allInvoices = JSON.parse(localStorage.getItem('AllInvoices')) || [];
    allInvoices.push(invoice);
    localStorage.setItem('AllInvoices', JSON.stringify(allInvoices));

    // Save the invoice to the specific user's record.
    let registrationData = JSON.parse(localStorage.getItem('RegistrationData')) || [];
    const userIndex = registrationData.findIndex(u => u.trn === shippingInfo.trn);
    if (userIndex !== -1) {
      if (!registrationData[userIndex].invoices) {
        registrationData[userIndex].invoices = [];
      }
      registrationData[userIndex].invoices.push(invoice);
      localStorage.setItem('RegistrationData', JSON.stringify(registrationData));
    }

    // Clear the cart and update the UI.
    localStorage.removeItem("dripcaseCart");
    updateCartCount();
    // Store the invoice in sessionStorage so the next page can access it.
    sessionStorage.setItem('currentInvoice', JSON.stringify(invoice));
    
    showNotification("Order confirmed! Generating invoice...");
    setTimeout(() => window.location.href = 'invoice.html', 1500);
  }

  // --- INVOICE PAGE LOGIC (for invoice.html) ---
  // Question: What is the purpose of this section?
  // Answer: This block runs only on the invoice page. It retrieves the
  // invoice data from sessionStorage and populates the HTML template to display
  // a read-only receipt to the user.
  if (window.location.pathname.endsWith('invoice.html')) {
    const invoice = JSON.parse(sessionStorage.getItem('currentInvoice'));

    // A security check to prevent direct access to the invoice page.
    if (!invoice) {
      showNotification("No invoice found. Redirecting to home.", 'error');
      setTimeout(() => window.location.href = 'index.html', 1500);
      return;
    }

    // Populate the page with the invoice data.
    document.getElementById('invoiceCompany').textContent = invoice.company;
    document.getElementById('invoiceNumber').textContent = invoice.invoiceNumber;
    document.getElementById('invoiceDate').textContent = invoice.date;
    document.getElementById('invoiceCustomerName').textContent = invoice.shippingInfo.fullName;
    document.getElementById('invoiceCustomerAddress').textContent = invoice.shippingInfo.address.replace(/\n/g, '<br>');
    document.getElementById('invoiceTrn').textContent = invoice.trn;

    // Dynamically create the table rows for each item in the invoice.
    const invoiceItemsTableBody = document.querySelector('#invoiceItemsTable tbody');
    invoice.items.forEach(item => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>$${item.price.toFixed(2)}</td>
        <td>$${item.total.toFixed(2)}</td>
      `;
      invoiceItemsTableBody.appendChild(row);
    });

    // Populate the total costs.
    document.getElementById('invoiceSubtotal').textContent = `$${invoice.subtotal.toFixed(2)}`;
    document.getElementById('invoiceTax').textContent = `$${invoice.tax.toFixed(2)}`;
    document.getElementById('invoiceTotal').textContent = `$${invoice.total.toFixed(2)}`;

    // Clean up the session storage so the invoice can't be viewed again.
    sessionStorage.removeItem('currentInvoice');
  }

  // --- SLIDESHOW (for index.html) ---
  // Question: What is the purpose of this section?
  // Answer: This block controls the main image carousel on the homepage,
  // handling both automatic progression and manual user navigation.
  if (slides.length > 0) {
    let index = 0;
    function showSlide(n) { slides.forEach((s, i) => s.classList.toggle('active', i === n)); }
    function nextSlide() { index = (index + 1) % slides.length; showSlide(index); }
    function prevSlide() { index = (index - 1 + slides.length) % slides.length; showSlide(index); }
    showSlide(0); // Show the first slide initially.
    // Attach listeners to the manual navigation buttons.
    document.querySelector('.next')?.addEventListener('click', nextSlide);
    document.querySelector('.prev')?.addEventListener('click', prevSlide);
    // Set an interval to automatically advance the slides every 4 seconds.
    setInterval(nextSlide, 4000); 
  }

  // --- ADMIN DASHBOARD PAGE LOGIC (for dashboard.html) ---
  // Question: What is the purpose of this section?
  // Answer: This block contains all the logic for the admin dashboard. It
  // verifies admin access and provides functions to analyze users and view invoices.
  if (window.location.pathname.endsWith('dashboard.html')) {
    const currentUser = checkLoginStatus();

    // A strict security check to ensure only admins can view this page.
    if (!currentUser || !currentUser.isAdmin) {
      showNotification('You do not have permission to view this page.', 'error');
      setTimeout(() => window.location.href = 'index.html', 1500);
      return;
    }
    
    // Base64 encoded 1x1 pixel images for the bar charts.
    const BAR_COLORS = {
      male: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      female: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      other: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      age: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8//8/AwMDAwMDAwMDAAAAAL2NDP7H7Y5oAAAAASUVORK5CYII='
    };

    // Helper function to calculate age from a date of birth string.
    function calculateAge(birthday) {
      const ageDifMs = Date.now() - birthday.getTime();
      const ageDate = new Date(ageDifMs);
      return Math.abs(ageDate.getUTCFullYear() - 1970);
    }

    // Attach the ShowUserFrequency function to the global window object so it can be called from the HTML's onclick.
    window.ShowUserFrequency = function() {
      const registrationData = JSON.parse(localStorage.getItem('RegistrationData')) || [];
      const genderCounts = { Male: 0, Female: 0, Other: 0 };
      const ageCounts = { '18-25': 0, '26-35': 0, '36-50': 0, '50+': 0 };

      // Loop through all users to populate the count objects.
      registrationData.forEach(user => {
        if (user.gender) genderCounts[user.gender] = (genderCounts[user.gender] || 0) + 1;
        if (user.dob) {
          const age = calculateAge(new Date(user.dob));
          if (age >= 18 && age <= 25) ageCounts['18-25']++;
          else if (age >= 26 && age <= 35) ageCounts['26-35']++;
          else if (age >= 36 && age <= 50) ageCounts['36-50']++;
          else if (age > 50) ageCounts['50+']++;
        }
      });

      // Generate and inject the HTML for the gender chart.
      const genderChartHTML = `
        <ul class="bar-chart">${Object.entries(genderCounts).map(([gender, count]) => `
          <li><span class="label">${gender}:</span><div class="bar-container"><img src="${BAR_COLORS[gender.toLowerCase()]}" class="bar" style="width: ${count * 20}px;" alt="${gender} bar"></div><span class="count">${count}</span></li>`).join('')}
        </ul>`;
      document.getElementById('genderChartContainer').innerHTML = genderChartHTML;

      // Generate and inject the HTML for the age chart.
      const ageChartHTML = `
        <ul class="bar-chart">${Object.entries(ageCounts).map(([group, count]) => `
          <li><span class="label">${group}:</span><div class="bar-container"><img src="${BAR_COLORS.age}" class="bar" style="width: ${count * 20}px;" alt="${group} bar"></div><span class="count">${count}</span></li>`).join('')}
        </ul>`;
      document.getElementById('ageChartContainer').innerHTML = ageChartHTML;
    };

    // Function to search and display all invoices for a given TRN.
    window.ShowInvoices = function() {
      const searchTrn = document.getElementById('searchAllTrn').value.trim();
      const allInvoices = JSON.parse(localStorage.getItem('AllInvoices')) || [];
      const container = document.getElementById('allInvoicesContainer');
      if (!searchTrn) { container.innerHTML = '<p class="error-message">Please enter a TRN to search.</p>'; return; }
      const filteredInvoices = allInvoices.filter(inv => inv.trn === searchTrn);
      console.log(`Found ${filteredInvoices.length} invoices for TRN: ${searchTrn}`, filteredInvoices);
      if (filteredInvoices.length === 0) { container.innerHTML = `<p>No invoices found for TRN: ${searchTrn}</p>`; return; }
      // Build and inject the HTML for the results table.
      let tableHTML = `<table><thead><tr><th>Invoice #</th><th>Date</th><th>Name</th><th>Total</th></tr></thead><tbody>`;
      filteredInvoices.forEach(inv => {
        tableHTML += `<tr><td>${inv.invoiceNumber}</td><td>${inv.date}</td><td>${inv.shippingInfo.fullName}</td><td>$${inv.total.toFixed(2)}</td></tr>`;
      });
      tableHTML += '</tbody></table>';
      container.innerHTML = tableHTML;
    };

    // Function to get and display all invoices for a specific user from their profile.
    window.GetUserInvoices = function() {
      const searchTrn = document.getElementById('searchUserTrn').value.trim();
      const registrationData = JSON.parse(localStorage.getItem('RegistrationData')) || [];
      const container = document.getElementById('userInvoicesContainer');
      if (!searchTrn) { container.innerHTML = '<p class="error-message">Please enter a TRN to search.</p>'; return; }
      const user = registrationData.find(u => u.trn === searchTrn);
      if (!user) { container.innerHTML = `<p>No user found with TRN: ${searchTrn}</p>`; return; }
      const userInvoices = user.invoices || [];
      if (userInvoices.length === 0) { container.innerHTML = `<p>User ${user.name} has no past invoices.</p>`; return; }
      // Build and inject the HTML for the user's invoice history.
      let tableHTML = `<h4>Invoices for ${user.name} (${searchTrn})</h4><table><thead><tr><th>Invoice #</th><th>Date</th><th>Total</th></tr></thead><tbody>`;
      userInvoices.forEach(inv => {
        tableHTML += `<tr><td>${inv.invoiceNumber}</td><td>${inv.date}</td><td>$${inv.total.toFixed(2)}</td></tr>`;
      });
      tableHTML += '</tbody></table>';
      container.innerHTML = tableHTML;
    };
  }
});