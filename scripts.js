document.addEventListener('DOMContentLoaded', function() {

  // --- UTILITY FUNCTIONS ---
  function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed; bottom: 20px; right: 20px; padding: 15px 25px; border-radius: 5px;
      color: white; z-index: 10000; box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      background-color: ${type === 'success' ? '#4CAF50' : '#F44336'};
      animation: slideInRight 0.5s, fadeOut 0.5s 2.5s forwards;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  }

  // --- PROFILE & AUTHENTICATION ---
  const profileIcon = document.getElementById("profileIcon");
  const profileInitial = document.getElementById("profileInitial");
  const profileName = document.getElementById("profileName");
  const profileContainer = document.getElementById("profileContainer");
  const TAX_RATE = 0.15; // 15% tax

  /**
   * Updates the navbar to show the logged-in user's profile or the default icon.
   * This function is now safe to call on any page.
   */
  function updateProfileDisplay(user) {
    // FIX: Check if profile elements exist on the page before trying to use them.
    if (!profileIcon || !profileInitial || !profileName) {
      return;
    }

    if (user && user.name) {
      profileIcon.style.display = "none";
      profileInitial.style.display = "flex";
      profileInitial.textContent = user.name.charAt(0).toUpperCase();
      profileName.style.display = "inline";
      profileName.textContent = user.name;
    } else {
      profileIcon.style.display = "flex";
      profileInitial.style.display = "none";
      profileName.style.display = "none";
    }
  }

  /**
   * Checks if a user is logged in and updates the profile display if the elements exist.
   */
  function checkLoginStatus() {
    const currentUserTrn = sessionStorage.getItem('currentUserTrn');

    if (currentUserTrn) {
      const registrationData = JSON.parse(localStorage.getItem('RegistrationData')) || [];
      const userData = registrationData.find(user => user.trn === currentUserTrn);

      if (userData) {
        updateProfileDisplay(userData);
        return userData;
      }
    }
    updateProfileDisplay(null);
    return null;
  }

  // FIX: Only add the event listener if the profile container exists on the page.
  if (profileContainer) {
    profileContainer.addEventListener('click', () => {
      const isLoggedIn = profileName.style.display !== "none";
      if (isLoggedIn) {
        if (confirm("Are you sure you want to logout?")) {
          sessionStorage.removeItem('currentUserTrn');
          updateProfileDisplay(null);
          showNotification("Logged out successfully");
          if (window.location.pathname !== 'index.html') {
            window.location.href = 'index.html';
          }
        }
      } else {
        window.location.href = 'login.html';
      }
    });
  }

  // --- REGISTRATION (for register.html) ---
  const registrationForm = document.getElementById('registrationForm');
  if (registrationForm) {
    document.getElementById('registerBtn').addEventListener('click', () => {
      const firstName = document.getElementById('firstName').value.trim();
      const lastName = document.getElementById('lastName').value.trim();
      const dob = document.getElementById('dob').value;
      const gender = document.getElementById('gender').value;
      const phone = document.getElementById('phone').value.trim();
      const email = document.getElementById('email').value.trim();
      const trn = document.getElementById('trn').value.trim();
      const password = document.getElementById('password').value;
      const regError = document.getElementById('regError');
      
      if (!firstName || !lastName || !dob || !gender || !phone || !email || !trn || !password) {
        regError.textContent = "Please fill out all fields.";
        regError.style.display = 'block';
        return;
      }
      if (password.length < 8) {
        regError.textContent = "Password must be at least 8 characters.";
        regError.style.display = 'block';
        return;
      }
      
      let registrationData = JSON.parse(localStorage.getItem('RegistrationData')) || [];
      if (registrationData.some(user => user.trn === trn)) {
        regError.textContent = "An account with this TRN already exists.";
        regError.style.display = 'block';
        return;
      }
      
      const user = { name: `${firstName} ${lastName}`, firstName, lastName, dob, gender, phone, email, trn, password, invoices: [] };
      registrationData.push(user);
      localStorage.setItem("RegistrationData", JSON.stringify(registrationData));
      sessionStorage.setItem('currentUserTrn', trn);
      
      showNotification("Registration successful! Redirecting...");
      setTimeout(() => window.location.href = 'index.html', 1500);
    });
  }

  // --- LOGIN (for login.html) ---
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    let loginAttempts = 3;
    const loginError = document.getElementById('loginError');
    const loginSuccess = document.getElementById('loginSuccess');
    const attemptsRemaining = document.getElementById('attemptsRemaining');
    const loginBtn = loginForm.querySelector('button[type="submit"]');

    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const trn = document.getElementById('loginTrn').value.trim();
      const password = document.getElementById('loginPassword').value;
      const registrationData = JSON.parse(localStorage.getItem('RegistrationData')) || [];
      const user = registrationData.find(u => u.trn === trn);
      
      if (!user || user.password !== password) {
        loginError.textContent = user ? 'Invalid password.' : 'TRN not found.';
        loginError.style.display = 'block';
        loginSuccess.style.display = 'none';
        loginAttempts--;
        attemptsRemaining.textContent = `Attempts remaining: ${loginAttempts}`;
        if (loginAttempts <= 0) {
          showNotification('Account locked. Too many failed attempts.', 'error');
          loginBtn.disabled = true;
        }
        return;
      }
      
      loginSuccess.textContent = 'Login successful! Redirecting...';
      loginSuccess.style.display = 'block';
      loginError.style.display = 'none';
      sessionStorage.setItem('currentUserTrn', trn);
      
      setTimeout(() => window.location.href = 'index.html', 1500);
    });
  }
  
  // --- PASSWORD RESET (for login.html) ---
  const resetPasswordModal = document.getElementById('resetPasswordModal');
  const openResetPasswordBtn = document.getElementById('openResetPassword');
  if (openResetPasswordBtn) {
    openResetPasswordBtn.onclick = () => resetPasswordModal.style.display = 'flex';
  }
  if (resetPasswordModal) {
    resetPasswordModal.querySelector('.close').onclick = () => {
      resetPasswordModal.style.display = 'none';
      resetPasswordModal.querySelector('form').reset();
    };
    resetPasswordModal.querySelector('form').addEventListener('submit', function(e) {
      e.preventDefault();
      const trn = document.getElementById('resetTrn').value.trim();
      const newPass = document.getElementById('newPassword').value;
      const confirmPass = document.getElementById('confirmPassword').value;
      const resetError = document.getElementById('resetError');
      const resetSuccess = document.getElementById('resetSuccess');
      
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

      let registrationData = JSON.parse(localStorage.getItem('RegistrationData')) || [];
      const userIndex = registrationData.findIndex(u => u.trn === trn);
      if (userIndex === -1) {
        resetError.textContent = 'TRN not found.';
        resetError.style.display = 'block';
        return;
      }
      
      registrationData[userIndex].password = newPass;
      localStorage.setItem('RegistrationData', JSON.stringify(registrationData));
      resetSuccess.textContent = 'Password reset successfully!';
      resetSuccess.style.display = 'block';
      resetError.style.display = 'none';
      
      setTimeout(() => {
        resetPasswordModal.style.display = 'none';
        resetPasswordModal.querySelector('form').reset();
      }, 2000);
    });
  }

  // --- CART FUNCTIONALITY ---
  function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("dripcaseCart")) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    let badge = document.querySelector('.cart-badge');
    if (!badge && document.getElementById('cartIcon')) {
      badge = document.createElement('span');
      badge.className = 'cart-badge';
      document.getElementById('cartIcon').parentElement.appendChild(badge);
    }
    if (badge) {
      badge.textContent = totalItems;
      badge.style.display = totalItems > 0 ? 'flex' : 'none';
    }
  }

  // --- DROPDOWNS (for index.html) ---
  function showDropdown(targetId) {
    const target = document.getElementById(targetId);
    const isOpen = target.style.display === 'flex';
    document.querySelectorAll('.dropdown').forEach(d => d.style.display = 'none');
    if (!isOpen) target.style.display = 'flex';
  }
  document.getElementById("menuIcon")?.addEventListener('click', e => { e.stopPropagation(); showDropdown("menuDropdown"); });
  document.getElementById("searchIcon")?.addEventListener('click', e => { e.stopPropagation(); showDropdown("searchDropdown"); });
  document.addEventListener("click", () => document.querySelectorAll('.dropdown').forEach(d => d.style.display = 'none'));

  // --- SEARCH (for index.html) ---
  const searchInput = document.querySelector('#searchDropdown input');
  const searchResults = document.querySelector('.search-results');
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      const query = e.target.value.toLowerCase().trim();
      if (query.length < 2) { searchResults.innerHTML = ''; return; }
      
      const products = [];
      document.querySelectorAll('.product').forEach(productEl => {
        const name = productEl.querySelector('p').textContent.toLowerCase();
        if (name.includes(query)) {
          const img = productEl.querySelector('img').src;
          const price = productEl.querySelectorAll('p')[1].textContent;
          products.push({ name: productEl.querySelector('p').textContent, price, img });
        }
      });
      
      searchResults.innerHTML = products.length === 0 ? '<p>No products found</p>' :
        products.map(p => `
          <div class="search-result-item" data-name="${p.name}">
            <img src="${p.img}" alt="${p.name}">
            <div><div>${p.name}</div><div>${p.price}</div></div>
          </div>
        `).join('');
      
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

  // --- "ADD TO CART" BUTTONS (for index.html) ---
  document.querySelectorAll(".addToCartBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      const name = btn.dataset.name;
      const price = parseFloat(btn.dataset.price);
      let cart = JSON.parse(localStorage.getItem("dripcaseCart")) || [];
      const existing = cart.find(item => item.name === name);
      if (existing) {
        existing.quantity += 1;
        showNotification(`${name} quantity updated in cart`);
      } else {
        cart.push({ name, price, quantity: 1 });
        showNotification(`${name} added to cart`);
      }
      localStorage.setItem("dripcaseCart", JSON.stringify(cart));
      updateCartCount();
    });
  });

  // --- CART / CHECKOUT PAGE LOGIC (for cart.html) ---
  if (window.location.pathname.endsWith('cart.html')) {
    const cartTableBody = document.querySelector("#cartTable tbody");
    const cartSubtotalEl = document.getElementById('cartSubtotal');
    const cartTaxEl = document.getElementById('cartTax');
    const cartTotalEl = document.getElementById("cartTotal");
    const shippingForm = document.getElementById('shippingForm');
    const fullNameInput = document.getElementById('fullName');
    const trnInput = document.getElementById('trn');

    if (!cartTableBody || !cartSubtotalEl || !cartTaxEl || !cartTotalEl || !shippingForm || !fullNameInput || !trnInput) {
        console.error("Cart page is missing critical HTML elements. Script cannot run.");
        showNotification("A critical error occurred. The page may not have loaded correctly.", 'error');
        return;
    }

    const currentUser = checkLoginStatus();

    if (!currentUser) {
      showNotification('You must be logged in to proceed to checkout.', 'error');
      setTimeout(() => window.location.href = 'login.html', 1500);
      return;
    }

    fullNameInput.value = currentUser.name || '';
    trnInput.value = currentUser.trn || '';

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
    
    document.addEventListener('click', function(e) {
      if (e.target && e.target.classList.contains('removeBtn')) {
        let cart = JSON.parse(localStorage.getItem("dripcaseCart")) || [];
        const index = parseInt(e.target.dataset.index);
        if (index > -1) {
            cart.splice(index, 1);
            localStorage.setItem("dripcaseCart", JSON.stringify(cart));
            renderCartSummary();
            updateCartCount();
        }
      }
    });

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
           e.target.value = cart[index].quantity;
        }
      }
    });

    shippingForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const shippingInfo = {
        fullName: fullNameInput.value,
        address: document.getElementById('address').value,
        trn: trnInput.value,
      };
      
      generateInvoice(shippingInfo);
    });

    document.getElementById('cancelCheckoutBtn')?.addEventListener('click', () => {
      if (confirm('Are you sure you want to cancel? Your cart will not be saved.')) {
        window.location.href = 'index.html';
      }
    });

    renderCartSummary();
  }

  // --- INVOICE GENERATION ---
  function generateInvoice(shippingInfo) {
    const cart = JSON.parse(localStorage.getItem("dripcaseCart")) || [];
    if (cart.length === 0) {
      showNotification("Your cart is empty.", 'error');
      return;
    }

    let subtotal = 0;
    const itemsWithTotal = cart.map(item => {
      const total = item.price * item.quantity;
      subtotal += total;
      return { ...item, total };
    });

    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;

    let invoiceCounter = parseInt(localStorage.getItem('invoiceCounter') || '1');
    const invoiceNumber = `INV-${String(invoiceCounter).padStart(5, '0')}`;
    localStorage.setItem('invoiceCounter', invoiceCounter + 1);

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

    let allInvoices = JSON.parse(localStorage.getItem('AllInvoices')) || [];
    allInvoices.push(invoice);
    localStorage.setItem('AllInvoices', JSON.stringify(allInvoices));

    let registrationData = JSON.parse(localStorage.getItem('RegistrationData')) || [];
    const userIndex = registrationData.findIndex(u => u.trn === shippingInfo.trn);
    if (userIndex !== -1) {
      if (!registrationData[userIndex].invoices) {
        registrationData[userIndex].invoices = [];
      }
      registrationData[userIndex].invoices.push(invoice);
      localStorage.setItem('RegistrationData', JSON.stringify(registrationData));
    }

    localStorage.removeItem("dripcaseCart");
    updateCartCount();
    sessionStorage.setItem('currentInvoice', JSON.stringify(invoice));
    
    showNotification("Order confirmed! Generating invoice...");
    setTimeout(() => window.location.href = 'invoice.html', 1500);
  }

  // --- INVOICE PAGE LOGIC (for invoice.html) ---
  if (window.location.pathname.endsWith('invoice.html')) {
    const invoice = JSON.parse(sessionStorage.getItem('currentInvoice'));

    if (!invoice) {
      showNotification("No invoice found. Redirecting to home.", 'error');
      setTimeout(() => window.location.href = 'index.html', 1500);
      return;
    }

    document.getElementById('invoiceCompany').textContent = invoice.company;
    document.getElementById('invoiceNumber').textContent = invoice.invoiceNumber;
    document.getElementById('invoiceDate').textContent = invoice.date;
    document.getElementById('invoiceCustomerName').textContent = invoice.shippingInfo.fullName;
    document.getElementById('invoiceCustomerAddress').textContent = invoice.shippingInfo.address.replace(/\n/g, '<br>');
    document.getElementById('invoiceTrn').textContent = invoice.trn;

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

    document.getElementById('invoiceSubtotal').textContent = `$${invoice.subtotal.toFixed(2)}`;
    document.getElementById('invoiceTax').textContent = `$${invoice.tax.toFixed(2)}`;
    document.getElementById('invoiceTotal').textContent = `$${invoice.total.toFixed(2)}`;

    sessionStorage.removeItem('currentInvoice');
  }

  // --- SLIDESHOW (for index.html) ---
  const slides = document.querySelectorAll('.slide');
  if (slides.length > 0) {
    let index = 0;

    function showSlide(n) {
      slides.forEach((s, i) => s.classList.toggle('active', i === n));
    }

    function nextSlide() {
      index = (index + 1) % slides.length;
      showSlide(index);
    }

    function prevSlide() {
      index = (index - 1 + slides.length) % slides.length;
      showSlide(index);
    }

    showSlide(0); 
    document.querySelector('.next')?.addEventListener('click', nextSlide);
    document.querySelector('.prev')?.addEventListener('click', prevSlide);
    setInterval(nextSlide, 4000); 
  }

  // --- INITIALIZE ON PAGE LOAD ---
  checkLoginStatus();
  updateCartCount();
});