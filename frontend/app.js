document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM fully loaded and parsed");

  // Debug: Log all elements with IDs
  document.querySelectorAll("[id]").forEach((element) => {
    console.log(`Found element with id: ${element.id}`);
  });

  // Set the base URL for the API
  const BASE_URL = "http://localhost:8080/api";
  let currentUser = null;
  let currentReceiptsUsername = null;

  // Utility functions
  function showPage(pageId) {
    console.log(`Attempting to show page: ${pageId}`);

    if (!currentUser && pageId !== "login-page" && pageId !== "signup-page") {
      console.log("User not logged in, redirecting to login page");
      showError("Please log in to view this page.");
      pageId = "login-page";
    }

    const pages = document.querySelectorAll(".content > div");
    pages.forEach((page) => {
      if (page) {
        page.classList.add("hidden");
      }
    });

    const pageToShow = document.getElementById(pageId);
    if (pageToShow) {
      pageToShow.classList.remove("hidden");
      console.log(`Showed page: ${pageId}`);
    } else {
      console.error(`Page not found: ${pageId}`);
      showError(`Page not found: ${pageId}`);
    }

    updateNavbarActiveState(pageId);
    loadPageContent(pageId);
  }

  function updateNavbarActiveState(pageId) {
    const navbarSelector =
      currentUser && currentUser.username === "admin"
        ? "#admin-navbar"
        : "#user-navbar";
    const navbar = document.querySelector(navbarSelector);

    if (navbar) {
      const links = navbar.querySelectorAll("a");
      links.forEach((link) => {
        link.classList.remove("active");
        if (link.getAttribute("data-page") === pageId.replace("-page", "")) {
          link.classList.add("active");
        }
      });
    } else {
      console.error(`Navbar not found: ${navbarSelector}`);
    }
  }

  function updateNavbarVisibility(isLoggedIn) {
    const userNavbar = document.getElementById("user-navbar");
    const adminNavbar = document.getElementById("admin-navbar");

    if (!userNavbar || !adminNavbar) {
      console.error("Navbar elements not found");
      return;
    }

    if (isLoggedIn) {
      if (currentUser.username === "admin") {
        adminNavbar.classList.remove("hidden");
        userNavbar.classList.add("hidden");
      } else {
        userNavbar.classList.remove("hidden");
        adminNavbar.classList.add("hidden");
      }
    } else {
      userNavbar.classList.add("hidden");
      adminNavbar.classList.add("hidden");
    }
  }

  function setupNavbarListeners() {
    console.log("Setting up navbar listeners");
    document
      .querySelectorAll("#user-navbar a, #admin-navbar a")
      .forEach((link) => {
        link.addEventListener("click", function (e) {
          e.preventDefault();
          console.log("Navbar link clicked:", this.id || this.textContent);

          if (this.id === "logout") {
            logout();
          } else {
            const pageId = this.getAttribute("data-page");
            if (pageId) {
              showPage(pageId + "-page");
            } else {
              console.error(
                "No data-page attribute found for link:",
                this.outerHTML
              );
            }
          }
        });
      });
  }

  function renderReceiptsTable(pendingReceipts, username) {
    const tbody = document.querySelector("#admin-receipts-table tbody");
    if (!tbody) {
      console.error("Admin receipts table body not found");
      return;
    }

    tbody.innerHTML = "";
    pendingReceipts.forEach((receipt) => {
      const row = tbody.insertRow();
      row.insertCell(0).textContent = receipt.transactionId;
      row.insertCell(1).textContent = formatDate(receipt.timestamp);
      row.insertCell(2).textContent = formatAmount(receipt.amount);
      const actionCell = row.insertCell(3);
      const approveButton = document.createElement("button");
      approveButton.textContent = "Approve";
      approveButton.addEventListener("click", () =>
        approveReceipt(receipt.id, username)
      );
      actionCell.appendChild(approveButton);
    });
  }

  function updatePageTitle(username) {
    const titleElement = document.getElementById("selected-user-admin");
    if (titleElement) {
      titleElement.textContent = username
        ? `Requested Receipts for ${username}`
        : "All Pending Receipts";
    } else {
      console.error("Title element not found");
    }
  }

  // Update loadPageContent function
  function loadPageContent(pageId) {
    if (currentUser) {
      switch (pageId) {
        case "dashboard-page":
          loadDashboard();
          break;
        case "all-transactions-page":
          loadHistory();
          break;
        case "download-page":
          loadDownloadPage();
          break;
        case "requested-receipts-page":
          loadRequestedReceiptsPage();
          break;
        case "users-page":
          loadUsers();
          break;
        case "admin-receipts-page":
          // Don't call loadPendingReceipts here
          break;
        default:
          console.log(`No specific content to load for page: ${pageId}`);
      }
    }
  }

  function showError(message, elementId = null) {
    console.log(`Error: ${message}`);
    const errorElement = document.createElement("div");
    errorElement.className = "error";
    errorElement.textContent = message;

    if (elementId) {
      const inputElement = document.getElementById(elementId);
      if (inputElement) {
        inputElement.classList.add("input-error");
        inputElement.parentNode.insertBefore(
          errorElement,
          inputElement.nextSibling
        );
        return;
      }
    }

    // If no specific element is found or provided, add to the active page
    const activePage = document.querySelector(".content > div:not(.hidden)");

    if (activePage) {
      activePage.insertBefore(errorElement, activePage.firstChild);
      // Remove the error message after 5 seconds
      setTimeout(() => {
        activePage.removeChild(errorElement);
        if (elementId) {
          const inputElement = document.getElementById(elementId);
          if (inputElement) {
            inputElement.classList.remove("input-error");
          }
        }
      }, 5000);
    } else {
      console.error("No active page found to display error message");
      alert(message);
    }
  }

  function showSuccess(message) {
    console.log(`Success: ${message}`);
    const successElement = document.createElement("div");
    successElement.className = "success";
    successElement.textContent = message;

    // Find the active page
    const activePage = document.querySelector(".content > div:not(.hidden)");

    if (activePage) {
      // Insert the success message at the top of the active page
      activePage.insertBefore(successElement, activePage.firstChild);
      // Remove the success message after 3 seconds
      setTimeout(() => {
        activePage.removeChild(successElement);
      }, 3000);
    } else {
      console.error("No active page found to display success message");
      alert(message);
    }
  }

  function clearErrors() {
    document.querySelectorAll(".error").forEach((error) => error.remove());
    document
      .querySelectorAll(".input-error")
      .forEach((input) => input.classList.remove("input-error"));
  }

  function showLoading() {
    const spinner = document.getElementById("loading-spinner");
    if (spinner) {
      spinner.classList.remove("hidden");
    } else {
      console.error("Loading spinner element not found");
    }
  }

  function hideLoading() {
    const spinner = document.getElementById("loading-spinner");
    if (spinner) {
      spinner.classList.add("hidden");
    } else {
      console.error("Loading spinner element not found");
    }
  }

  function formatDate(timestamp) {
    return new Date(timestamp).toLocaleDateString();
  }

  function formatAmount(amount) {
    return `${amount} Ksh`;
  }

  function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) {
      console.error(`Form not found: ${formId}`);
      return false;
    }

    const inputs = form.querySelectorAll("input[required]");
    let isValid = true;

    clearErrors();

    inputs.forEach((input) => {
      if (input.value.trim() === "") {
        showError("This field is required", input.id);
        isValid = false;
      } else if (input.type === "email" && !isValidEmail(input.value)) {
        showError("Please enter a valid email address", input.id);
        isValid = false;
      }
    });

    return isValid;
  }

  // API functions
  async function login(username, password) {
    try {
      showLoading();
      const response = await fetch(`${BASE_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error("Invalid username or password");
      }

      currentUser = { username };
      const userNameElement = document.getElementById("user-name");
      if (userNameElement) {
        userNameElement.textContent = username;
      } else {
        console.error("User name element not found");
      }
      updateNavbarVisibility(true);

      if (username === "admin") {
        showPage("users-page");
      } else {
        showPage("dashboard-page");
      }
    } catch (error) {
      console.error("Login error:", error);
      showError(error.message, "password");
    } finally {
      hideLoading();
    }
  }

  async function signup(username, email, password) {
    try {
      clearErrors();

      if (username.toLowerCase() === "admin") {
        showError(
          "The username 'admin' is reserved. Please choose a different username.",
          "new-username"
        );
        return;
      }

      if (!isValidEmail(email)) {
        showError("Please enter a valid email address.", "new-email");
        return;
      }

      showLoading();
      const response = await fetch(`${BASE_URL}/users/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Signup failed. Please try again."
        );
      }

      showSuccess("Signup successful. Please log in.");
      showPage("login-page");
    } catch (error) {
      console.error("Signup error:", error);
      showError(error.message, "new-password");
    } finally {
      hideLoading();
    }
  }

  async function loadTransactions() {
    if (!currentUser) {
      console.error("No current user");
      return [];
    }

    try {
      const response = await fetch(
        `${BASE_URL}/transactions/user/${currentUser.username}`
      );
      if (!response.ok) {
        throw new Error("Failed to load transactions");
      }
      return await response.json();
    } catch (error) {
      console.error("Error loading transactions:", error);
      showError(error.message);
      return [];
    }
  }

  async function requestReceipt(transactionId) {
    if (!currentUser) {
      console.error("No current user");
      return;
    }

    try {
      showLoading();
      const response = await fetch(
        `${BASE_URL}/receipts/add/${currentUser.username}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transactionId, status: false }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to request receipt");
      }

      showSuccess("Receipt request submitted successfully!");
      loadHistory();
    } catch (error) {
      console.error("Error requesting receipt:", error);
      showError(error.message);
    } finally {
      hideLoading();
    }
  }

  async function fetchRequestedReceipts(status) {
    if (!currentUser) {
      console.error("No current user");
      return [];
    }

    try {
      const response = await fetch(
        `${BASE_URL}/receipts/user/${currentUser.username}`
      );
      if (!response.ok) {
        throw new Error(`Failed to load receipts with status ${status}`);
      }
      const data = await response.json();
      return data.filter((receipt) => receipt.status === status);
    } catch (error) {
      console.error("Error fetching requested receipts:", error);
      showError(error.message);
      return [];
    }
  }

  async function loadDashboard() {
    try {
      const transactions = await loadTransactions();
      const recentTransactions = transactions.slice(0, 3);
      const tbody = document.querySelector("#recent-transactions tbody");
      if (!tbody) {
        console.error("Recent transactions table body not found");
        return;
      }
      tbody.innerHTML = "";

      recentTransactions.forEach((transaction) => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = transaction.id;
        row.insertCell(1).textContent = formatDate(transaction.timestamp);
        row.insertCell(2).textContent = formatAmount(transaction.amount);
      });
    } catch (error) {
      console.error("Error loading dashboard:", error);
      showError("Failed to load dashboard data");
    }
  }

  async function loadHistory() {
    if (!currentUser) {
      console.error("No current user");
      return;
    }

    try {
      showLoading();
      const transactions = await loadTransactions();
      const tbody = document.querySelector("#all-transactions tbody");
      if (!tbody) {
        console.error("All transactions table body not found");
        return;
      }
      tbody.innerHTML = "";

      transactions.forEach((transaction) => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = transaction.id;
        row.insertCell(1).textContent = formatDate(transaction.timestamp);
        row.insertCell(2).textContent = formatAmount(transaction.amount);
        const actionCell = row.insertCell(3);
        const requestButton = document.createElement("button");
        requestButton.textContent = "Request Receipt";
        requestButton.addEventListener("click", () =>
          requestReceipt(transaction.id)
        );
        actionCell.appendChild(requestButton);
      });

      console.log(`Loaded ${transactions.length} transactions`);
    } catch (error) {
      console.error("Error loading transaction history:", error);
      showError("Failed to load transaction history: " + error.message);
    } finally {
      hideLoading();
    }
  }

  async function loadDownloadPage() {
    if (!currentUser) {
      console.error("No current user");
      return;
    }

    try {
      showLoading();
      const approvedReceipts = await fetchRequestedReceipts(true);
      const tbody = document.querySelector("#available-receipts tbody");
      if (!tbody) {
        console.error("Available receipts table body not found");
        return;
      }
      tbody.innerHTML = "";

      approvedReceipts.forEach((receipt) => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = receipt.transactionId;
        row.insertCell(1).textContent = formatDate(receipt.timestamp);
        row.insertCell(2).textContent = formatAmount(receipt.amount);
        const actionCell = row.insertCell(3);
        const downloadButton = document.createElement("button");
        downloadButton.textContent = "Download Receipt";
        downloadButton.addEventListener("click", () =>
          downloadReceipt(receipt.id)
        );
        actionCell.appendChild(downloadButton);
      });

      console.log(`Loaded ${approvedReceipts.length} approved receipts`);
    } catch (error) {
      console.error("Error loading download page:", error);
      showError("Failed to load approved receipts: " + error.message);
    } finally {
      hideLoading();
    }
  }

  async function loadRequestedReceiptsPage() {
    if (!currentUser) {
      console.error("No current user");
      return;
    }

    try {
      showLoading();
      const pendingReceipts = await fetchRequestedReceipts(false);
      const tbody = document.querySelector("#pending-receipts tbody");
      if (!tbody) {
        console.error("Pending receipts table body not found");
        return;
      }
      tbody.innerHTML = "";

      pendingReceipts.forEach((receipt) => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = receipt.transactionId;
        row.insertCell(1).textContent = formatDate(receipt.timestamp);
        row.insertCell(2).textContent = formatAmount(receipt.amount);
        row.insertCell(3).textContent = "Pending Approval";
      });

      console.log(`Loaded ${pendingReceipts.length} pending receipts`);
    } catch (error) {
      console.error("Error loading requested receipts page:", error);
      showError("Failed to load pending receipts: " + error.message);
    } finally {
      hideLoading();
    }
  }

  // Admin-specific functions
  async function loadUsers() {
    try {
      showLoading();
      const response = await fetch(`${BASE_URL}/users/all`);
      if (!response.ok) {
        throw new Error("Failed to load users");
      }
      const users = await response.json();
      const tbody = document.querySelector("#users-table tbody");
      if (!tbody) {
        console.error("Users table body not found");
        return;
      }
      tbody.innerHTML = "";
      users.forEach((user) => {
        if (user.username !== "admin") {
          const row = tbody.insertRow();
          row.insertCell(0).textContent = user.username;

          const actionCell = row.insertCell(1);
          const viewTransactionsButton = document.createElement("button");
          const viewReceiptsButton = document.createElement("button");
          const addTransactionButton = document.createElement("button");
          viewTransactionsButton.textContent = "See Transactions";
          viewReceiptsButton.textContent = "See Requested Receipts";
          addTransactionButton.textContent = "Add Transaction";
          viewTransactionsButton.addEventListener("click", () =>
            loadUserTransactions(user.username)
          );
          viewReceiptsButton.addEventListener("click", () => {
            console.log("View Receipts clicked for user:", user.username);
            loadPendingReceipts(user.username);
          });
          addTransactionButton.addEventListener("click", () => {
            showAddTransactionPopup(user.username);
          });
          actionCell.appendChild(viewTransactionsButton);
          actionCell.appendChild(viewReceiptsButton);
          actionCell.appendChild(addTransactionButton);
        }
      });
    } catch (error) {
      console.error("Error loading users:", error);
      showError(error.message);
    } finally {
      hideLoading();
    }
  }

  async function loadUserTransactions(username) {
    try {
      showLoading();
      const response = await fetch(`${BASE_URL}/transactions/user/${username}`);

      if (!response.ok) {
        throw new Error("Failed to load user transactions");
      }
      const transactions = await response.json();

      const tbody = document.querySelector(
        "#admin-user-transactions-table tbody"
      );
      if (!tbody) {
        console.error("Admin user transactions table body not found");
        return;
      }
      tbody.innerHTML = "";

      transactions.forEach((transaction) => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = transaction.id;
        row.insertCell(1).textContent = formatDate(transaction.timestamp);
        row.insertCell(2).textContent = formatAmount(transaction.amount);

        // Add delete button
        const deleteCell = row.insertCell(3);
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () =>
          deleteTransaction(transaction.id, username)
        );
        deleteCell.appendChild(deleteButton);
      });

      const selectedUserElement = document.getElementById("selected-user");
      if (selectedUserElement) {
        selectedUserElement.textContent = `Transactions for ${username}`;
      } else {
        console.error("Selected user element not found");
      }

      showPage("admin-user-transactions-page");
    } catch (error) {
      console.error("Error loading user transactions:", error);
      showError(error.message);
    } finally {
      hideLoading();
    }
  }

  async function deleteTransaction(transactionId, username) {
    try {
      showLoading();
      const response = await fetch(
        `${BASE_URL}/transactions/delete/${transactionId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete transaction");
      }

      const result = await response.json();

      if (result.status === "success") {
        showSuccess(result.message);
        // Reload the user's transactions to reflect the change
        await loadUserTransactions(username);
      } else {
        showError(result.message);
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
      showError(error.message);
    } finally {
      hideLoading();
    }
  }

  async function loadPendingReceipts(username) {
    console.log("loadPendingReceipts called with username:", username);
    try {
      showLoading();

      if (username) {
        currentReceiptsUsername = username;
      } else if (!currentReceiptsUsername) {
        throw new Error("No username provided to loadPendingReceipts");
      }

      username = currentReceiptsUsername;

      const response = await fetch(`${BASE_URL}/receipts/user/${username}`);

      if (!response.ok) {
        throw new Error("Failed to load pending receipts");
      }

      const pendingReceipts = await response.json();

      const filteredReceipts = pendingReceipts.filter(
        (receipt) => receipt.status === false
      );

      renderReceiptsTable(filteredReceipts, username);
      updatePageTitle(username);
      showPage("admin-receipts-page");
    } catch (error) {
      console.error("Error loading pending receipts:", error);
      showError(error.message);
    } finally {
      hideLoading();
    }
  }

  async function approveReceipt(receiptId, username) {
    try {
      showLoading();
      const response = await fetch(
        `${BASE_URL}/receipts/approve/${receiptId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ receiptId }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to approve receipt");
      }
      showSuccess("Receipt approved successfully");
      loadPendingReceipts(username);
    } catch (error) {
      console.error("Error approving receipt:", error);
      showError(error.message);
    } finally {
      hideLoading();
    }
  }

  async function downloadReceipt(receiptId) {
    console.log(`Downloading receipt ${receiptId}`);
    try {
      showLoading();

      // Fetch the receipt data
      const response = await fetch(`${BASE_URL}/receipts/${receiptId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch receipt data");
      }
      const receiptData = await response.json();

      // Generate receipt content
      const receiptContent = generateReceiptContent(receiptData);

      // Create a Blob with the receipt content
      const blob = new Blob([receiptContent], { type: "text/plain" });

      // Create a temporary URL for the Blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary anchor element and trigger the download
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `receipt_${receiptId}.txt`;
      document.body.appendChild(a);
      a.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      console.log(`Receipt ${receiptId} downloaded successfully`);
    } catch (error) {
      console.error("Error downloading receipt:", error);
      showError(`Failed to download receipt: ${error.message}`);
    } finally {
      hideLoading();
    }
  }

  function generateReceiptContent(receiptData) {
    return `
  Receipt ID: ${receiptData.id}
  Transaction ID: ${receiptData.transactionId}
  Date: ${formatDate(receiptData.timestamp)}
  Amount: ${formatAmount(receiptData.amount)}
  Status: ${receiptData.status ? "Approved" : "Pending"}
  
  Thank you for your business!
    `.trim();
  }

  async function addTransaction(username) {
    const amountInput = document.getElementById("transaction-amount");
    const amount = parseFloat(amountInput.value);

    if (isNaN(amount) || amount <= 0) {
      showError("Please enter a valid amount greater than 0");
      return;
    }

    try {
      showLoading();
      const timestamp = new Date().toISOString();
      const response = await fetch(`${BASE_URL}/transactions/add/${username}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, amount, timestamp }),
      });

      if (!response.ok) {
        throw new Error("Failed to add transaction");
      }

      showSuccess("Transaction added successfully");
      document.getElementById("add-transaction-popup").classList.add("hidden");
      loadUsers(); // Refresh the user list

      // Clear the input field after successful submission
      amountInput.value = "";
    } catch (error) {
      console.error("Error adding transaction:", error);
      showError(error.message);
    } finally {
      hideLoading();
    }
  }

  function addEventListenerSafely(elementId, eventType, listener) {
    const element = document.getElementById(elementId);
    if (element) {
      // Remove any existing listeners of the same type
      element.removeEventListener(eventType, element[`on${eventType}`]);
      // Add the new listener
      element.addEventListener(eventType, listener);
      console.log(`Added ${eventType} listener to ${elementId}`);
    } else {
      console.error(`Element not found: ${elementId}`);
    }
  }

  addEventListenerSafely("login-form", "submit", function (e) {
    e.preventDefault();
    if (validateForm("login-form")) {
      const username = document.getElementById("username")?.value;
      const password = document.getElementById("password")?.value;
      if (username && password) {
        login(username, password);
      } else {
        console.error("Username or password input not found");
      }
    }
  });

  addEventListenerSafely("signup-form", "submit", function (e) {
    e.preventDefault();
    if (validateForm("signup-form")) {
      const username = document.getElementById("new-username")?.value;
      const email = document.getElementById("new-email")?.value;
      const password = document.getElementById("new-password")?.value;
      if (username && email && password) {
        signup(username, email, password);
      } else {
        console.error("New username, email, or password input not found");
      }
    }
  });

  addEventListenerSafely("show-signup", "click", function (e) {
    e.preventDefault();
    console.log("Show signup link clicked");
    showPage("signup-page");
  });

  addEventListenerSafely("show-login", "click", function (e) {
    e.preventDefault();
    console.log("Show login link clicked");
    showPage("login-page");
  });

  addEventListenerSafely("view-all-transactions", "click", function () {
    showPage("all-transactions-page");
  });

  addEventListenerSafely("back-to-users", "click", function () {
    console.log("Back to users clicked");
    showPage("users-page");
  });

  addEventListenerSafely("admin-back-to-users", "click", function () {
    console.log("Admin back to users clicked");
    showPage("users-page");
  });

  addEventListenerSafely("add-transaction-form", "submit", function (e) {
    e.preventDefault();
  });

  addEventListenerSafely("cancel-transaction", "click", function () {
    document.getElementById("add-transaction-popup").classList.add("hidden");
  });

  function removeExistingListeners() {
    document
      .querySelectorAll("#user-navbar a, #admin-navbar a")
      .forEach((link) => {
        const newLink = link.cloneNode(true);
        link.parentNode.replaceChild(newLink, link);
      });
  }

  function showAddTransactionPopup(username) {
    const popup = document.getElementById("add-transaction-popup");
    const form = document.getElementById("add-transaction-form");
    const userIdInput = document.getElementById("transaction-user-id");
    const cancelButton = document.getElementById("cancel-transaction");

    userIdInput.value = username;
    popup.classList.remove("hidden");

    // Remove any existing event listeners
    form.removeEventListener("submit", form.onsubmit);

    // Add a new event listener
    form.onsubmit = async (e) => {
      e.preventDefault();
      await addTransaction(username);
    };

    cancelButton.onclick = () => {
      popup.classList.add("hidden");
    };
  }

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function setupPasswordToggle() {
    const toggleButtons = document.querySelectorAll(".toggle-password");
    toggleButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const input = this.previousElementSibling;
        const type =
          input.getAttribute("type") === "password" ? "text" : "password";
        input.setAttribute("type", type);

        const img = this.querySelector("img");
        if (type === "password") {
          img.src = "eye-closed.png";
          img.alt = "Show password";
        } else {
          img.src = "eye-open.png";
          img.alt = "Hide password";
        }
      });
    });
  }

  function logout() {
    console.log("Logout function called");
    currentUser = null;
    currentReceiptsUsername = null;
    updateNavbarVisibility(false);
    showPage("login-page");
  }

  function init() {
    console.log("Initializing application");
    removeExistingListeners();
    setupNavbarListeners();
    setupPasswordToggle(); // Add this line
    showPage("login-page");
    updateNavbarVisibility(false);
  }

  init();
});
