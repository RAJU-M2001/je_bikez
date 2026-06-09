// PRELOADER LOGIC
window.addEventListener("load", function () {
    const preloader = document.getElementById("preloader");
    if (preloader) {
        setTimeout(() => {
            preloader.classList.add("loaded");
            setTimeout(() => {
                preloader.remove(); // Unmounts the loading screen entirely
            }, 850); // Matches the 0.8s CSS transition for the curtain opening
        }, 1500); // Gives time for the awesome LED line to hit 100%
    }
});


document.addEventListener("DOMContentLoaded", function () {

    // THEME SWITCH LOGIC
    const themeCheckboxes = document.querySelectorAll('.theme-toggle-checkbox');

    function setTheme(theme) {
        if (theme === 'light') {
            document.documentElement.classList.add('light-mode');
            document.body.classList.add('light-mode');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.classList.remove('light-mode');
            document.body.classList.remove('light-mode');
            localStorage.setItem('theme', 'dark');
        }
    }

    // Initialize theme based on saved preference and sync checkboxes
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    themeCheckboxes.forEach(cb => { cb.checked = (savedTheme === 'light'); });

    // Listen for changes on any theme checkbox
    themeCheckboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            const newTheme = cb.checked ? 'light' : 'dark';
            setTheme(newTheme);
            // Sync all checkboxes to the same state
            themeCheckboxes.forEach(other => { other.checked = cb.checked; });
        });
    });

    // MOBILE MENU TOGGLE
    window.toggleMobileMenu = function () {
        const menu = document.getElementById('navMenu');
        const overlay = document.getElementById('menuOverlay');
        menu.classList.toggle('open');
        overlay.classList.toggle('open');

        // Prevent body scroll when menu is open
        if (menu.classList.contains('open')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }

    // SCROLL TO WORKS
    window.scrollToWorks = function () {
        document.getElementById("works").scrollIntoView({ behavior: "smooth" })
    }

    // SCROLL TO SALES
    window.scrollToSales = function () {
        document.getElementById("sales").scrollIntoView({ behavior: "smooth" })
    }

    // FILTER SALES BIKES
    window.filterSales = function (category) {
        const buttons = document.querySelectorAll('.filter-btn');
        const cards = document.querySelectorAll('.sale-card');

        // Update active button state
        buttons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('onclick').includes(`'${category}'`)) {
                btn.classList.add('active');
            }
        });

        // Filter cards
        cards.forEach(card => {
            if (category === 'all' || card.getAttribute('data-category') === category) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // MODAL STATE MANAGEMENT
    const dialogs = ['aboutDialog', 'bookingDialog', 'successDialog', 'errorDialog'];

    function setScrollLock(lock) {
        if (lock) {
            document.documentElement.classList.add('no-scroll');
            document.body.classList.add('no-scroll');
        } else {
            document.documentElement.classList.remove('no-scroll');
            document.body.classList.remove('no-scroll');
        }
    }

    function closeAllDialogs() {
        dialogs.forEach(id => {
            const dialog = document.getElementById(id);
            if (dialog) {
                dialog.style.display = "none";
                dialog.setAttribute('aria-hidden', 'true');
            }
        });
        const phoneWarning = document.getElementById("phoneWarning");
        if (phoneWarning) phoneWarning.style.display = "none";
        setScrollLock(false);
    }

    // SET MINIMUM DATE TO TODAY
    const dateInput = document.getElementById("date");
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }

    // OPEN BOOKING POPUP
    window.openBooking = function () {
        closeAllDialogs();
        const dialog = document.getElementById("bookingDialog");
        if (dialog) {
            dialog.style.display = "flex";
            dialog.setAttribute('aria-hidden', 'false');
            setScrollLock(true);
        }
    }

    // CLOSE BOOKING POPUP
    window.closeBooking = function () {
        document.getElementById("bookingDialog").style.display = "none";
        document.getElementById("bookingDialog").setAttribute('aria-hidden', 'true');
        document.getElementById("bookingForm").reset();
        document.getElementById("phoneWarning").style.display = "none";
        setScrollLock(false);
    }

    // OPEN ABOUT POPUP
    window.openAbout = function () {
        closeAllDialogs();
        const dialog = document.getElementById("aboutDialog");
        if (dialog) {
            dialog.style.display = "flex";
            dialog.setAttribute('aria-hidden', 'false');
            setScrollLock(true);
        }
    }

    // CLOSE ABOUT POPUP
    window.closeAbout = function () {
        document.getElementById("aboutDialog").style.display = "none";
        document.getElementById("aboutDialog").setAttribute('aria-hidden', 'true');
        setScrollLock(false);
    }

    // SMART FEATURE: CLOSE MODALS ON ESCAPE KEY AND OUTSIDE CLICK
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
            closeAllDialogs();
        }
    });

    dialogs.forEach(id => {
        const dialog = document.getElementById(id);
        if (dialog) {
            dialog.addEventListener("click", function (e) {
                // If the click is strictly on the wrapper (the background), close it
                if (e.target === dialog) {
                    closeAllDialogs();
                }
            });
        }
    });

    // BOOK SLOT API CONNECTION
    const bookingForm = document.getElementById("bookingForm")

    if (bookingForm) bookingForm.addEventListener("submit", async function (e) {

        e.preventDefault()

        const submitBtn = document.getElementById("submitBtn");
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Booking... <span class="spinner"></span>';

        // Additional smart validation to ensure valid phone number
        const phone = document.getElementById("phone").value;
        const phoneWarning = document.getElementById("phoneWarning");

        if (phone.length < 10) {
            phoneWarning.style.display = "block";
            submitBtn.disabled = false;
            submitBtn.innerHTML = "Book Now";
            return;
        } else {
            phoneWarning.style.display = "none";
        }

        const name = document.getElementById("name").value
        const bike = document.getElementById("bike").value
        const date = document.getElementById("date").value

        try {

            const response = await fetch(`${API_BASE_URL}/api/book-slot`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: name,
                    phone: phone,
                    bike: bike,
                    date: date
                })
            })

            const data = await response.json()

            if (response.ok) {

                closeAllDialogs(); // Smart feature: clean slate
                document.getElementById("successMsg").innerText = data.message || "Your slot has been booked successfully.";
                document.getElementById("successDialog").style.display = "flex";
                document.getElementById("successDialog").setAttribute('aria-hidden', 'false');
                setScrollLock(true);
                setTimeout(() => closeAllDialogs(), 8000);

                bookingForm.reset()

            } else {

                closeAllDialogs();
                document.getElementById("errorMsg").innerText = "Error: " + (data.error || "Failed to book slot.");
                document.getElementById("errorDialog").style.display = "flex";
                document.getElementById("errorDialog").setAttribute('aria-hidden', 'false');
                setScrollLock(true);
                setTimeout(() => closeAllDialogs(), 8000);

            }

        } catch (error) {

            console.error("API Error:", error)
            closeAllDialogs();
            document.getElementById("errorMsg").innerText = "Server error. Please try again later.";
            document.getElementById("errorDialog").style.display = "flex";
            document.getElementById("errorDialog").setAttribute('aria-hidden', 'false');
            setScrollLock(true);
            setTimeout(() => closeAllDialogs(), 8000);

        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = "Book Now";
        }

    })

    // NEW MODAL LOGIC FOR LOGIN & BOOKING
    let isLoggedIn = false;

    const loginSignupBtn = document.getElementById("loginSignupBtn");
    const bookServiceBtnHero = document.getElementById("bookServiceBtnHero");
    const loginDialog = document.getElementById("loginDialog");
    const signupDialog = document.getElementById("signupDialog");
    const addBikeDialog = document.getElementById("addBikeDialog");
    const statusDialog = document.getElementById("statusDialog");
    const trackingDialog = document.getElementById("trackingDialog");
    const goToSignup = document.getElementById("goToSignup");
    const goToLogin = document.getElementById("goToLogin");
    const loginBtnAction = document.getElementById("loginBtnAction");
    const signupBtnAction = document.getElementById("signupBtnAction");
    const confirmBookingBtn = document.getElementById("confirmBookingBtn");
    const cancelAddBike = document.getElementById("cancelAddBike");
    const closeStatusDialogBtn = document.getElementById("closeStatusDialogBtn");
    const closeLoginDialog = document.getElementById("closeLoginDialog");
    const closeSignupDialog = document.getElementById("closeSignupDialog");
    // const API_BASE_URL = "https://api.je-bikez.com";
    // const API_BASE_URL = "http://127.0.0.1:10000";
    const API_BASE_URL = "https://bike-modification-api.onrender.com";

    function hideAllModals() {
        if (loginDialog) loginDialog.classList.remove("show");
        if (signupDialog) signupDialog.classList.remove("show");
        if (addBikeDialog) addBikeDialog.classList.remove("show");
        if (statusDialog) statusDialog.classList.remove("show");
        if (trackingDialog) trackingDialog.classList.remove("show");
        // Ensure any dialog with .dialog class is also hidden via style for fallback
        const allDialogs = document.querySelectorAll('.dialog');
        allDialogs.forEach(d => { d.style.display = 'none'; d.setAttribute('aria-hidden', 'true'); });
        setScrollLock(false);
    }

    function showModal(dialog) {
        hideAllModals();
        if (dialog) {
            dialog.classList.add("show");
            dialog.style.display = 'flex';
            dialog.setAttribute('aria-hidden', 'false');
            setScrollLock(true);
        }
    }

    if (loginSignupBtn) {
        loginSignupBtn.addEventListener("click", () => {
            showModal(loginDialog);
        });
    }

    // Close buttons
    if (closeLoginDialog) {
        closeLoginDialog.addEventListener("click", () => hideAllModals());
    }
    if (closeSignupDialog) {
        closeSignupDialog.addEventListener("click", () => hideAllModals());
    }

    // Switch between login and signup
    if (goToSignup) {
        goToSignup.addEventListener("click", (e) => {
            e.preventDefault();
            showModal(signupDialog);
        });
    }

    if (goToLogin) {
        goToLogin.addEventListener("click", (e) => {
            e.preventDefault();
            showModal(loginDialog);
        });
    }

    // Close dialog when clicking the backdrop (outside the dialog-box)
    document.querySelectorAll('.dialog').forEach(dialog => {
        dialog.addEventListener("click", (e) => {
            if (e.target === dialog) {
                hideAllModals();
            }
        });
    });

    // PASSWORD VISIBILITY TOGGLES
    const loginEye = document.getElementById("loginEye");
    if (loginEye) {
        loginEye.addEventListener("click", () => {
            const pwdInput = document.getElementById("loginPwd");
            if (pwdInput.type === "password") {
                pwdInput.type = "text";
                loginEye.classList.replace("fa-eye", "fa-eye-slash");
            } else {
                pwdInput.type = "password";
                loginEye.classList.replace("fa-eye-slash", "fa-eye");
            }
        });
    }

    const signupEye = document.getElementById("signupEye");
    if (signupEye) {
        signupEye.addEventListener("click", () => {
            const pwdInput = document.getElementById("signupPwd");
            if (pwdInput.type === "password") {
                pwdInput.type = "text";
                signupEye.classList.replace("fa-eye", "fa-eye-slash");
            } else {
                pwdInput.type = "password";
                signupEye.classList.replace("fa-eye-slash", "fa-eye");
            }
        });
    }

    // HELPER TO SHOW DIALOG ALERTS
    function showDialogAlert(elementId, message, type) {
        const alertEl = document.getElementById(elementId);
        if (alertEl) {
            alertEl.style.display = "block";
            alertEl.innerText = message;
            if (type === "success") {
                alertEl.style.backgroundColor = "rgba(0, 255, 0, 0.1)";
                alertEl.style.color = "#0f0";
                alertEl.style.border = "1px solid #0f0";
            } else {
                alertEl.style.backgroundColor = "rgba(255, 0, 0, 0.1)";
                alertEl.style.color = "#f00";
                alertEl.style.border = "1px solid #f00";
            }
            setTimeout(() => {
                alertEl.style.display = "none";
            }, 5000);
        }
    }

    if (loginBtnAction) {
        loginBtnAction.addEventListener("click", async () => {
            const email = document.getElementById("loginEmail").value;
            const password = document.getElementById("loginPwd").value;

            if (!email || !password) {
                showDialogAlert("loginAlert", "Please enter email and password.", "error");
                return;
            }

            loginBtnAction.disabled = true;
            loginBtnAction.innerText = "Logging in...";

            try {
                const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();
                if (response.ok) {
                    isLoggedIn = true;
                    loginSignupBtn.innerText = "My Account";
                    showDialogAlert("loginAlert", data.message || "Logged in successfully!", "success");
                    setTimeout(() => hideAllModals(), 1500);
                } else {
                    showDialogAlert("loginAlert", data.error || "Login failed", "error");
                }
            } catch (error) {
                console.error("Login error:", error);
                showDialogAlert("loginAlert", "Server error. Please try again later.", "error");
            } finally {
                loginBtnAction.disabled = false;
                loginBtnAction.innerText = "Login";
            }
        });
    }

    if (signupBtnAction) {
        signupBtnAction.addEventListener("click", async () => {
            const name = document.getElementById("signupName").value;
            const phone = document.getElementById("signupPhone").value;
            const email = document.getElementById("signupEmail").value;
            const password = document.getElementById("signupPwd").value;

            if (!name || !phone || !email || !password) {
                showDialogAlert("signupAlert", "Please fill all fields.", "error");
                return;
            }

            signupBtnAction.disabled = true;
            signupBtnAction.innerText = "Signing up...";

            try {
                const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, phone, email, password })
                });

                const data = await response.json();
                if (response.ok) {
                    showDialogAlert("signupAlert", data.message || "Signup successful!", "success");
                    setTimeout(() => {
                        hideAllModals();
                        showModal(loginDialog);
                    }, 1500);
                } else {
                    showDialogAlert("signupAlert", "Error: " + data.error, "error");
                }
            } catch (error) {
                console.error("Signup error:", error);
                showDialogAlert("signupAlert", "Server error. Please try again later.", "error");
            } finally {
                signupBtnAction.disabled = false;
                signupBtnAction.innerText = "Sign Up";
            }
        });
    }

    if (bookServiceBtnHero) {
        bookServiceBtnHero.addEventListener("click", () => {
            if (!isLoggedIn) {
                alert("Please login first to book a service!");
                hideAllModals();
                loginDialog.classList.add("show");
            } else {
                hideAllModals();
                addBikeDialog.classList.add("show");
            }
        });
    }

    if (cancelAddBike) {
        cancelAddBike.addEventListener("click", (e) => {
            e.preventDefault();
            hideAllModals();
        });
    }

    if (confirmBookingBtn) {
        confirmBookingBtn.addEventListener("click", () => {
            hideAllModals();
            statusDialog.classList.add("show");
            const todaySpan = document.getElementById("bookedDateSpan");
            if (todaySpan) {
                const date = new Date();
                todaySpan.innerText = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
            }
        });
    }

    if (closeStatusDialogBtn) {
        closeStatusDialogBtn.addEventListener("click", () => {
            hideAllModals();
        });
    }

})