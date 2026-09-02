// ============================================================
// PRELOADER LOGIC
// ============================================================

window.addEventListener("load", function () {

    const preloader =
        document.getElementById("preloader");

    if (preloader) {

        setTimeout(() => {

            preloader.classList.add("loaded");

            setTimeout(() => {

                preloader.remove();

            }, 850);

        }, 1500);
    }
});


// ============================================================
// MAIN APPLICATION
// ============================================================

document.addEventListener("DOMContentLoaded", function () {


    // ========================================================
    // API CONFIGURATION
    // ========================================================

    // LOCAL
    // const API_BASE_URL =
    //     "http://127.0.0.1:10000";

    // PRODUCTION
    // const API_BASE_URL = "https://api.je-bikez.com";

    // RENDER
    const API_BASE_URL =
        "https://bike-modification-api.onrender.com";


    // ========================================================
    // THEME SETTINGS FROM ENV
    // ========================================================

    async function fetchThemeConfig() {

        // 1. Check local storage first to prevent flickering
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "light") {
            document.documentElement.classList.add("light-mode");
            document.body.classList.add("light-mode");
        } else {
            document.documentElement.classList.remove("light-mode");
            document.body.classList.remove("light-mode");
        }

        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/api/config`
                );

            if (!response.ok) {
                return;
            }

            const data =
                await response.json();

            // 2. Update local storage with the API result
            localStorage.setItem("theme", data.theme);

            if (data.theme === "light") {

                document.documentElement.classList.add(
                    "light-mode"
                );

                document.body.classList.add(
                    "light-mode"
                );

            } else {

                document.documentElement.classList.remove(
                    "light-mode"
                );

                document.body.classList.remove(
                    "light-mode"
                );
            }

        } catch (error) {

            console.error(
                "Error fetching theme config:",
                error
            );
        }
    }

    fetchThemeConfig();


    // ========================================================
    // MOBILE MENU
    // ========================================================

    window.toggleMobileMenu = function () {

        const menu =
            document.getElementById("navMenu");

        const overlay =
            document.getElementById("menuOverlay");

        if (!menu || !overlay) {
            return;
        }

        menu.classList.toggle("open");
        overlay.classList.toggle("open");

        if (menu.classList.contains("open")) {

            document.body.style.overflow =
                "hidden";

        } else {

            document.body.style.overflow =
                "";
        }
    };


    // ========================================================
    // SCROLL TO WORKS
    // ========================================================

    window.scrollToWorks = function () {

        const works =
            document.getElementById("works");

        if (works) {

            works.scrollIntoView({
                behavior: "smooth"
            });
        }
    };


    // ========================================================
    // SCROLL TO SALES
    // ========================================================

    window.scrollToSales = function () {

        const sales =
            document.getElementById("sales");

        if (sales) {

            sales.scrollIntoView({
                behavior: "smooth"
            });
        }
    };


    // ========================================================
    // FILTER SALES BIKES
    // ========================================================

    window.filterSales = function (category) {

        const buttons =
            document.querySelectorAll(
                ".filter-btn"
            );

        const cards =
            document.querySelectorAll(
                ".sale-card"
            );


        buttons.forEach(btn => {

            btn.classList.remove("active");

            const onclickValue =
                btn.getAttribute("onclick") || "";

            if (
                onclickValue.includes(
                    `'${category}'`
                ) ||
                onclickValue.includes(
                    `"${category}"`
                )
            ) {

                btn.classList.add("active");
            }

        });


        cards.forEach(card => {

            const cardCategory =
                card.getAttribute(
                    "data-category"
                );

            if (
                category === "all" ||
                cardCategory === category
            ) {

                card.style.display =
                    "block";

            } else {

                card.style.display =
                    "none";
            }

        });
    };


    // ========================================================
    // GENERAL DIALOG MANAGEMENT
    // ========================================================

    const dialogs = [

        "aboutDialog",
        "bookingDialog",
        "successDialog",
        "errorDialog"

    ];


    function setScrollLock(lock) {

        if (lock) {

            document.documentElement.classList.add(
                "no-scroll"
            );

            document.body.classList.add(
                "no-scroll"
            );

        } else {

            document.documentElement.classList.remove(
                "no-scroll"
            );

            document.body.classList.remove(
                "no-scroll"
            );
        }
    }


    function closeAllDialogs() {

        dialogs.forEach(id => {

            const dialog =
                document.getElementById(id);

            if (dialog) {

                dialog.style.display =
                    "none";

                dialog.setAttribute(
                    "aria-hidden",
                    "true"
                );
            }

        });


        const phoneWarning =
            document.getElementById(
                "phoneWarning"
            );

        if (phoneWarning) {

            phoneWarning.style.display =
                "none";
        }

        setScrollLock(false);
    }


    // ========================================================
    // SET MINIMUM DATE
    // ========================================================

    const dateInput =
        document.getElementById("date");

    if (dateInput) {

        const today =
            new Date()
                .toISOString()
                .split("T")[0];

        dateInput.setAttribute(
            "min",
            today
        );
    }


    // ========================================================
    // OPEN BOOKING POPUP
    // ========================================================

    window.openBooking = function () {

        closeAllDialogs();

        const dialog =
            document.getElementById(
                "bookingDialog"
            );

        if (dialog) {

            dialog.style.display =
                "flex";

            dialog.setAttribute(
                "aria-hidden",
                "false"
            );

            setScrollLock(true);
        }
    };


    // ========================================================
    // CLOSE BOOKING POPUP
    // ========================================================

    window.closeBooking = function () {

        const dialog =
            document.getElementById(
                "bookingDialog"
            );

        const form =
            document.getElementById(
                "bookingForm"
            );

        const warning =
            document.getElementById(
                "phoneWarning"
            );


        if (dialog) {

            dialog.style.display =
                "none";

            dialog.setAttribute(
                "aria-hidden",
                "true"
            );
        }


        if (form) {

            form.reset();
        }


        if (warning) {

            warning.style.display =
                "none";
        }


        setScrollLock(false);
    };


    // ========================================================
    // OPEN ABOUT POPUP
    // ========================================================

    window.openAbout = function () {

        closeAllDialogs();

        const dialog =
            document.getElementById(
                "aboutDialog"
            );

        if (dialog) {

            dialog.style.display =
                "flex";

            dialog.setAttribute(
                "aria-hidden",
                "false"
            );

            setScrollLock(true);
        }
    };


    // ========================================================
    // CLOSE ABOUT POPUP
    // ========================================================

    window.closeAbout = function () {

        const dialog =
            document.getElementById(
                "aboutDialog"
            );

        if (dialog) {

            dialog.style.display =
                "none";

            dialog.setAttribute(
                "aria-hidden",
                "true"
            );
        }

        setScrollLock(false);
    };


    // ========================================================
    // BOOK SLOT API
    // ========================================================

    const bookingForm =
        document.getElementById(
            "bookingForm"
        );


    if (bookingForm) {

        bookingForm.addEventListener(
            "submit",
            async function (e) {

                e.preventDefault();


                const submitBtn =
                    document.getElementById(
                        "submitBtn"
                    );

                const phone =
                    document.getElementById(
                        "phone"
                    );

                const phoneWarning =
                    document.getElementById(
                        "phoneWarning"
                    );


                if (submitBtn) {

                    submitBtn.disabled =
                        true;

                    submitBtn.innerHTML =
                        'Booking... <span class="spinner"></span>';
                }


                const phoneValue =
                    phone
                        ? phone.value.trim()
                        : "";


                if (phoneValue.length < 10) {

                    if (phoneWarning) {

                        phoneWarning.style.display =
                            "block";
                    }

                    if (submitBtn) {

                        submitBtn.disabled =
                            false;

                        submitBtn.innerHTML =
                            "Book Now";
                    }

                    return;
                }


                if (phoneWarning) {

                    phoneWarning.style.display =
                        "none";
                }


                const name =
                    document
                        .getElementById(
                            "name"
                        )
                        ?.value
                        .trim() || "";


                const bike =
                    document
                        .getElementById(
                            "bike"
                        )
                        ?.value
                        .trim() || "";


                const date =
                    document
                        .getElementById(
                            "date"
                        )
                        ?.value || "";


                try {

                    const response =
                        await fetch(
                            `${API_BASE_URL}/api/book-slot`,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body: JSON.stringify({
                                    name: name,
                                    phone: phoneValue,
                                    bike: bike,
                                    date: date
                                })
                            }
                        );


                    const data =
                        await response.json();


                    if (response.ok) {

                        closeAllDialogs();


                        const successMsg =
                            document.getElementById(
                                "successMsg"
                            );

                        const successDialog =
                            document.getElementById(
                                "successDialog"
                            );


                        if (successMsg) {

                            successMsg.innerText =
                                data.message ||
                                "Your slot has been booked successfully.";
                        }


                        if (successDialog) {

                            successDialog.style.display =
                                "flex";

                            successDialog.setAttribute(
                                "aria-hidden",
                                "false"
                            );

                            setScrollLock(true);
                        }


                        setTimeout(() => {

                            closeAllDialogs();

                        }, 8000);


                        bookingForm.reset();


                    } else {

                        closeAllDialogs();


                        const errorMsg =
                            document.getElementById(
                                "errorMsg"
                            );

                        const errorDialog =
                            document.getElementById(
                                "errorDialog"
                            );


                        if (errorMsg) {

                            errorMsg.innerText =
                                "Error: " +
                                (
                                    data.error ||
                                    "Failed to book slot."
                                );
                        }


                        if (errorDialog) {

                            errorDialog.style.display =
                                "flex";

                            errorDialog.setAttribute(
                                "aria-hidden",
                                "false"
                            );

                            setScrollLock(true);
                        }


                        setTimeout(() => {

                            closeAllDialogs();

                        }, 8000);
                    }


                } catch (error) {

                    console.error(
                        "Booking API Error:",
                        error
                    );


                    closeAllDialogs();


                    const errorMsg =
                        document.getElementById(
                            "errorMsg"
                        );

                    const errorDialog =
                        document.getElementById(
                            "errorDialog"
                        );


                    if (errorMsg) {

                        errorMsg.innerText =
                            "Server error. Please try again later.";
                    }


                    if (errorDialog) {

                        errorDialog.style.display =
                            "flex";

                        errorDialog.setAttribute(
                            "aria-hidden",
                            "false"
                        );

                        setScrollLock(true);
                    }


                    setTimeout(() => {

                        closeAllDialogs();

                    }, 8000);

                } finally {

                    if (submitBtn) {

                        submitBtn.disabled =
                            false;

                        submitBtn.innerHTML =
                            "Book Now";
                    }
                }

            }
        );
    }


    // ========================================================
    // AUTHENTICATION STATE
    // ========================================================

    let isLoggedIn =
        localStorage.getItem(
            "isLoggedIn"
        ) === "true";


    let currentUserId =
        localStorage.getItem(
            "currentUserId"
        );


    let currentUserProfilePic =
        localStorage.getItem(
            "currentUserProfilePic"
        );


    let currentUserName =
        localStorage.getItem(
            "currentUserName"
        );


    let currentUserEmail =
        localStorage.getItem(
            "currentUserEmail"
        );


    // ========================================================
    // FETCH & STORE USER PROFILE HELPER
    // ========================================================

    function fetchAndStoreUserProfile(userId) {
        if (!userId) return;
        fetch(`${API_BASE_URL}/api/user/${userId}`)
            .then(r => r.json())
            .then(profileData => {
                const user = profileData.user;
                if (!user) return;
                localStorage.setItem("user_object", JSON.stringify(user));
                localStorage.setItem("currentUserPhone", user.phone || "");
                if (user.profile_picture) {
                    currentUserProfilePic = user.profile_picture;
                    localStorage.setItem("currentUserProfilePic", currentUserProfilePic);
                    updateNavbarAuthUI();
                }
            })
            .catch(() => { });
    }
    // NAVBAR ELEMENTS
    // ========================================================

    const loginSignupBtn =
        document.getElementById(
            "loginSignupBtn"
        );


    const profileContainer =
        document.getElementById(
            "profileContainer"
        );


    const profileAvatarBtn =
        document.getElementById(
            "profileAvatarBtn"
        );


    const navProfileAvatar =
        document.getElementById(
            "navProfileAvatar"
        );


    const profileDropdown =
        document.getElementById(
            "profileDropdown"
        );


    const editProfileBtn =
        document.getElementById(
            "editProfileBtn"
        );


    const logoutBtn =
        document.getElementById(
            "logoutBtn"
        );


    const profileMenuContainer =
        document.getElementById(
            "profileMenuContainer"
        );


    // ========================================================
    // AUTH / MODAL ELEMENTS
    // ========================================================

    const bookServiceBtnHero =
        document.getElementById(
            "bookServiceBtnHero"
        );


    const loginDialog =
        document.getElementById(
            "loginDialog"
        );


    const signupDialog =
        document.getElementById(
            "signupDialog"
        );


    const addBikeDialog =
        document.getElementById(
            "addBikeDialog"
        );


    const statusDialog =
        document.getElementById(
            "statusDialog"
        );


    const trackingDialog =
        document.getElementById(
            "trackingDialog"
        );


    const goToSignup =
        document.getElementById(
            "goToSignup"
        );


    const goToLogin =
        document.getElementById(
            "goToLogin"
        );


    const loginBtnAction =
        document.getElementById(
            "loginBtnAction"
        );


    const signupBtnAction =
        document.getElementById(
            "signupBtnAction"
        );


    const confirmBookingBtn =
        document.getElementById(
            "confirmBookingBtn"
        );


    const cancelAddBike =
        document.getElementById(
            "cancelAddBike"
        );


    const closeStatusDialogBtn =
        document.getElementById(
            "closeStatusDialogBtn"
        );


    const closeLoginDialog =
        document.getElementById(
            "closeLoginDialog"
        );


    const closeSignupDialog =
        document.getElementById(
            "closeSignupDialog"
        );


    // ========================================================
    // PROFILE MODAL ELEMENTS
    // ========================================================

    const profileDialog =
        document.getElementById(
            "profileDialog"
        );


    const deleteConfirmDialog =
        document.getElementById(
            "deleteConfirmDialog"
        );


    const closeProfileDialog =
        document.getElementById(
            "closeProfileDialog"
        );


    const closeTrackingDialog =
        document.getElementById(
            "closeTrackingDialog"
        );


    const closeAddBikeDialog =
        document.getElementById(
            "closeAddBikeDialog"
        );


    const profileImageInput =
        document.getElementById(
            "profileImageInput"
        );


    const profileImagePreview =
        document.getElementById(
            "profileImagePreview"
        );


    const saveProfileBtn =
        document.getElementById(
            "saveProfileBtn"
        );


    const deleteAccountBtn =
        document.getElementById(
            "deleteAccountBtn"
        );


    const cancelDeleteBtn =
        document.getElementById(
            "cancelDeleteBtn"
        );


    const confirmDeleteBtn =
        document.getElementById(
            "confirmDeleteBtn"
        );


    // ========================================================
    // LOGOUT CONFIRMATION ELEMENTS
    // ========================================================

    const logoutConfirmDialog =
        document.getElementById(
            "logoutConfirmDialog"
        );


    const cancelLogoutTop =
        document.getElementById(
            "cancelLogoutTop"
        );


    const cancelLogoutBtn =
        document.getElementById(
            "cancelLogoutBtn"
        );


    const confirmLogoutBtn =
        document.getElementById(
            "confirmLogoutBtn"
        );


    // ========================================================
    // HIDE ALL MODALS
    // ========================================================

    function hideAllModals() {

        const modalElements = [

            loginDialog,
            signupDialog,
            addBikeDialog,
            statusDialog,
            trackingDialog,
            profileDialog,
            deleteConfirmDialog,
            logoutConfirmDialog

        ];


        modalElements.forEach(dialog => {

            if (dialog) {

                dialog.classList.remove(
                    "show"
                );

                dialog.style.display =
                    "none";

                dialog.setAttribute(
                    "aria-hidden",
                    "true"
                );
            }

        });


        document
            .querySelectorAll(".dialog")
            .forEach(dialog => {

                dialog.classList.remove(
                    "show"
                );

                dialog.style.display =
                    "none";

                dialog.setAttribute(
                    "aria-hidden",
                    "true"
                );

            });


        closeProfileDropdown();

        setScrollLock(false);
    }


    // ========================================================
    // SHOW MODAL
    // ========================================================

    function showModal(dialog) {

        hideAllModals();

        if (!dialog) {
            return;
        }


        dialog.classList.add(
            "show"
        );


        dialog.style.display =
            "flex";


        dialog.setAttribute(
            "aria-hidden",
            "false"
        );


        setScrollLock(true);
    }


    // ========================================================
    // PROFILE AVATAR
    // ========================================================

    function setAvatar(
        element,
        imageUrl = null
    ) {

        if (!element) {
            return;
        }


        // Remove old content
        element.innerHTML = "";


        if (
            imageUrl &&
            typeof imageUrl === "string" &&
            imageUrl.trim() !== ""
        ) {

            const img =
                document.createElement(
                    "img"
                );


            img.src =
                imageUrl.trim();


            img.alt =
                "Profile";


            img.style.width =
                "100%";


            img.style.height =
                "100%";


            img.style.borderRadius =
                "50%";


            img.style.objectFit =
                "cover";


            img.style.display =
                "block";


            img.onerror = function () {

                element.innerHTML =
                    '<i class="fas fa-user"></i>';

            };


            element.appendChild(img);


        } else {

            element.innerHTML =
                '<i class="fas fa-user"></i>';
        }
    }


    // ========================================================
    // UPDATE NAVBAR PROFILE AVATAR
    // ========================================================

    function updateNavbarProfile() {

        if (!navProfileAvatar) {
            return;
        }


        setAvatar(
            navProfileAvatar,
            isLoggedIn
                ? currentUserProfilePic
                : null
        );
    }


    // ========================================================
    // UPDATE NAVBAR AUTHENTICATION UI
    //
    // LOGGED OUT:
    //     Login / Signup → SHOW
    //     Profile        → HIDE
    //
    // LOGGED IN:
    //     Login / Signup → HIDE
    //     Profile        → SHOW
    // ========================================================

    function updateNavbarAuthUI() {

        if (
            !loginSignupBtn ||
            !profileContainer
        ) {
            return;
        }


        // ====================================================
        // LOGGED IN
        // ====================================================

        if (isLoggedIn) {

            loginSignupBtn.style.display =
                "none";


            profileContainer.style.display =
                "block";


            updateNavbarProfile();


            return;
        }


        // ====================================================
        // LOGGED OUT
        // ====================================================

        loginSignupBtn.style.display =
            "flex";


        profileContainer.style.display =
            "none";


        closeProfileDropdown();

        updateNavbarProfile();
    }


    // ========================================================
    // UPDATE PROFILE MODAL AVATAR
    // ========================================================

    function updateProfileDialogAvatar() {

        if (!profileImagePreview) {
            return;
        }


        /*
         * Supports:
         *
         * <img id="profileImagePreview">
         *
         * and
         *
         * <div id="profileImagePreview">
         */


        if (
            profileImagePreview.tagName ===
            "IMG"
        ) {

            profileImagePreview.src =
                currentUserProfilePic ||
                "https://res.cloudinary.com/dzyrruoda/image/upload/v1773771899/fav-icon_korsio.png";


            profileImagePreview.alt =
                "Profile";


        } else {

            setAvatar(
                profileImagePreview,
                currentUserProfilePic
            );
        }
    }


    // ========================================================
    // CLOSE PROFILE DROPDOWN
    // ========================================================

    function closeProfileDropdown() {

        if (profileDropdown) {

            profileDropdown.style.display =
                "none";
        }


        if (profileAvatarBtn) {

            profileAvatarBtn.setAttribute(
                "aria-expanded",
                "false"
            );
        }
    }


    // ========================================================
    // OPEN PROFILE DROPDOWN
    // ========================================================

    function openProfileDropdown() {

        // Profile dropdown should only
        // exist for logged-in users.

        if (
            !profileDropdown ||
            !isLoggedIn
        ) {
            return;
        }


        profileDropdown.style.display =
            "block";


        if (profileAvatarBtn) {

            profileAvatarBtn.setAttribute(
                "aria-expanded",
                "true"
            );
        }
    }


    // ========================================================
    // INITIAL NAVBAR STATE
    // ========================================================

    updateNavbarAuthUI();


    // ========================================================
    // LOGIN / SIGNUP BUTTON
    //
    // ONLY USED WHEN USER IS LOGGED OUT
    // ========================================================

    if (loginSignupBtn) {

        loginSignupBtn.addEventListener(
            "click",
            function (e) {

                e.preventDefault();

                e.stopPropagation();


                // Safety check
                if (isLoggedIn) {
                    return;
                }


                closeProfileDropdown();

                showModal(loginDialog);

            }
        );
    }


    // ========================================================
    // PROFILE AVATAR BUTTON
    //
    // ONLY USED WHEN USER IS LOGGED IN
    // ========================================================

    if (profileAvatarBtn) {

        profileAvatarBtn.addEventListener(
            "click",
            function (e) {

                e.preventDefault();

                e.stopPropagation();


                // Safety check
                if (!isLoggedIn) {
                    return;
                }


                if (!profileDropdown) {
                    return;
                }


                const isVisible =
                    profileDropdown.style.display ===
                    "block";


                if (isVisible) {

                    closeProfileDropdown();

                } else {

                    openProfileDropdown();
                }

            }
        );
    }


    // ========================================================
    // CLOSE DROPDOWN WHEN CLICKING OUTSIDE
    // ========================================================

    document.addEventListener(
        "click",
        function (e) {

            if (
                profileMenuContainer &&
                !profileMenuContainer.contains(
                    e.target
                )
            ) {

                closeProfileDropdown();
            }
        }
    );


    // ========================================================
    // EDIT PROFILE
    // ========================================================

    if (editProfileBtn) {

        editProfileBtn.addEventListener(
            "click",
            function (e) {

                e.preventDefault();

                e.stopPropagation();


                closeProfileDropdown();


                // Safety check
                if (!isLoggedIn) {

                    showModal(loginDialog);

                    return;
                }


                const profileNameInput =
                    document.getElementById(
                        "profileName"
                    );


                const profileEmailInput =
                    document.getElementById(
                        "profileEmail"
                    );


                if (profileNameInput) {

                    profileNameInput.value =
                        currentUserName || "";
                }


                if (profileEmailInput) {

                    profileEmailInput.value =
                        currentUserEmail || "";
                }


                if (profileImageInput) {

                    profileImageInput.value =
                        "";
                }


                updateProfileDialogAvatar();


                showModal(profileDialog);

            }
        );
    }


    // ========================================================
    // OPEN LOGOUT CONFIRMATION
    // ========================================================

    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            function (e) {

                e.preventDefault();

                e.stopPropagation();


                // Close profile dropdown
                closeProfileDropdown();


                // Make sure user is logged in
                if (!isLoggedIn) {
                    return;
                }


                // Open custom logout dialog
                showModal(
                    logoutConfirmDialog
                );

            }
        );
    }


    // ========================================================
    // CANCEL LOGOUT - TOP CLOSE BUTTON
    // ========================================================

    if (cancelLogoutTop) {

        cancelLogoutTop.addEventListener(
            "click",
            function (e) {

                e.preventDefault();

                hideAllModals();

            }
        );
    }


    // ========================================================
    // CANCEL LOGOUT - STAY LOGGED IN
    // ========================================================

    if (cancelLogoutBtn) {

        cancelLogoutBtn.addEventListener(
            "click",
            function (e) {

                e.preventDefault();

                hideAllModals();

            }
        );
    }


    // ========================================================
    // CONFIRM LOGOUT
    // ========================================================

    if (confirmLogoutBtn) {

        confirmLogoutBtn.addEventListener(
            "click",
            function (e) {

                e.preventDefault();


                // Prevent double click
                if (
                    confirmLogoutBtn.disabled
                ) {
                    return;
                }


                confirmLogoutBtn.disabled =
                    true;


                confirmLogoutBtn.innerHTML =
                    '<i class="fas fa-spinner fa-spin"></i> Logging out...';


                // --------------------------------------------
                // CLOSE PROFILE DROPDOWN
                // --------------------------------------------

                closeProfileDropdown();


                // --------------------------------------------
                // RESET AUTH STATE
                // --------------------------------------------

                isLoggedIn = false;

                currentUserId = null;

                currentUserName = null;

                currentUserEmail = null;

                currentUserProfilePic = null;


                // --------------------------------------------
                // REMOVE AUTH DATA
                // --------------------------------------------

                localStorage.removeItem(
                    "isLoggedIn"
                );

                localStorage.removeItem(
                    "currentUserId"
                );

                localStorage.removeItem(
                    "currentUserName"
                );

                localStorage.removeItem(
                    "currentUserEmail"
                );

                localStorage.removeItem(
                    "currentUserProfilePic"
                );

                localStorage.removeItem(
                    "currentUserPhone"
                );

                localStorage.removeItem(
                    "user_object"
                );


                // --------------------------------------------
                // IMPORTANT
                // UPDATE COMPLETE NAVBAR STATE
                // --------------------------------------------

                updateNavbarAuthUI();


                // --------------------------------------------
                // CLOSE ALL MODALS
                // --------------------------------------------

                hideAllModals();


                // --------------------------------------------
                // RESTORE BUTTON
                // --------------------------------------------

                confirmLogoutBtn.disabled =
                    false;


                confirmLogoutBtn.innerHTML =
                    '<span>Yes, Logout</span><i class="fas fa-sign-out-alt"></i>';


                // --------------------------------------------
                // SUCCESS MESSAGE
                // --------------------------------------------

                setTimeout(() => {

                    alert(
                        "You have been logged out successfully."
                    );

                }, 100);

            }
        );
    }


    // ========================================================
    // CLOSE BUTTONS
    // ========================================================

    if (closeLoginDialog) {

        closeLoginDialog.addEventListener(
            "click",
            () => hideAllModals()
        );
    }


    if (closeSignupDialog) {

        closeSignupDialog.addEventListener(
            "click",
            () => hideAllModals()
        );
    }


    if (closeProfileDialog) {

        closeProfileDialog.addEventListener(
            "click",
            () => hideAllModals()
        );
    }


    if (closeTrackingDialog) {

        closeTrackingDialog.addEventListener(
            "click",
            () => hideAllModals()
        );
    }


    if (closeAddBikeDialog) {

        closeAddBikeDialog.addEventListener(
            "click",
            () => hideAllModals()
        );
    }


    if (closeStatusDialogBtn) {

        closeStatusDialogBtn.addEventListener(
            "click",
            () => hideAllModals()
        );
    }


    // ========================================================
    // LOGIN -> SIGNUP
    // ========================================================

    if (goToSignup) {

        goToSignup.addEventListener(
            "click",
            function (e) {

                e.preventDefault();

                showModal(signupDialog);

            }
        );
    }


    // ========================================================
    // SIGNUP -> LOGIN
    // ========================================================

    if (goToLogin) {

        goToLogin.addEventListener(
            "click",
            function (e) {

                e.preventDefault();

                showModal(loginDialog);

            }
        );
    }


    // ========================================================
    // CLOSE MODALS ON BACKDROP CLICK
    // ========================================================

    document
        .querySelectorAll(".dialog")
        .forEach(dialog => {

            dialog.addEventListener(
                "click",
                function (e) {

                    if (
                        e.target === dialog
                    ) {

                        hideAllModals();
                    }
                }
            );

        });


    // ========================================================
    // ESCAPE KEY
    // ========================================================

    document.addEventListener(
        "keydown",
        function (e) {

            if (e.key === "Escape") {

                closeProfileDropdown();

                hideAllModals();
            }
        }
    );


    // ========================================================
    // PASSWORD VISIBILITY - LOGIN
    // ========================================================

    const loginEye =
        document.getElementById(
            "loginEye"
        );


    if (loginEye) {

        loginEye.addEventListener(
            "click",
            function () {

                const pwdInput =
                    document.getElementById(
                        "loginPwd"
                    );


                if (!pwdInput) {
                    return;
                }


                if (
                    pwdInput.type ===
                    "password"
                ) {

                    pwdInput.type =
                        "text";


                    loginEye.classList.replace(
                        "fa-eye",
                        "fa-eye-slash"
                    );

                } else {

                    pwdInput.type =
                        "password";


                    loginEye.classList.replace(
                        "fa-eye-slash",
                        "fa-eye"
                    );
                }
            }
        );
    }


    // ========================================================
    // PASSWORD VISIBILITY - SIGNUP
    // ========================================================

    const signupEye =
        document.getElementById(
            "signupEye"
        );


    if (signupEye) {

        signupEye.addEventListener(
            "click",
            function () {

                const pwdInput =
                    document.getElementById(
                        "signupPwd"
                    );


                if (!pwdInput) {
                    return;
                }


                if (
                    pwdInput.type ===
                    "password"
                ) {

                    pwdInput.type =
                        "text";


                    signupEye.classList.replace(
                        "fa-eye",
                        "fa-eye-slash"
                    );

                } else {

                    pwdInput.type =
                        "password";


                    signupEye.classList.replace(
                        "fa-eye-slash",
                        "fa-eye"
                    );
                }
            }
        );
    }


    // ========================================================
    // DIALOG ALERT HELPER
    // ========================================================

    function showDialogAlert(
        elementId,
        message,
        type
    ) {

        const alertEl =
            document.getElementById(
                elementId
            );


        if (!alertEl) {
            return;
        }


        alertEl.style.display =
            "block";


        alertEl.innerText =
            message;


        if (type === "success") {

            alertEl.style.backgroundColor =
                "rgba(0, 255, 0, 0.1)";

            alertEl.style.color =
                "#0f0";

            alertEl.style.border =
                "1px solid #0f0";

        } else {

            alertEl.style.backgroundColor =
                "rgba(255, 0, 0, 0.1)";

            alertEl.style.color =
                "#f00";

            alertEl.style.border =
                "1px solid #f00";
        }


        setTimeout(() => {

            alertEl.style.display =
                "none";

        }, 5000);
    }


    // ========================================================
    // LOGIN
    // ========================================================

    if (loginBtnAction) {

        loginBtnAction.addEventListener(
            "click",
            async function () {

                const email =
                    document
                        .getElementById(
                            "loginEmail"
                        )
                        ?.value
                        .trim() || "";


                const password =
                    document
                        .getElementById(
                            "loginPwd"
                        )
                        ?.value || "";


                if (!email || !password) {

                    showDialogAlert(
                        "loginAlert",
                        "Please enter email and password.",
                        "error"
                    );

                    return;
                }


                loginBtnAction.disabled =
                    true;


                loginBtnAction.innerText =
                    "Logging in...";


                try {

                    const response =
                        await fetch(
                            `${API_BASE_URL}/api/auth/login`,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body: JSON.stringify({
                                    email: email,
                                    password: password
                                })
                            }
                        );


                    const data =
                        await response.json();


                    if (response.ok) {

                        // ------------------------------------
                        // UPDATE AUTH STATE
                        // ------------------------------------

                        isLoggedIn = true;


                        currentUserId =
                            data.user?.id ||
                            null;


                        currentUserName =
                            data.user?.name ||
                            "";


                        currentUserEmail =
                            data.user?.email ||
                            "";


                        currentUserProfilePic =
                            data.user?.profile_picture ||
                            "";


                        // ------------------------------------
                        // SAVE AUTH STATE
                        // ------------------------------------

                        localStorage.setItem(
                            "isLoggedIn",
                            "true"
                        );


                        localStorage.setItem(
                            "currentUserId",
                            currentUserId || ""
                        );


                        localStorage.setItem(
                            "currentUserName",
                            currentUserName
                        );


                        localStorage.setItem(
                            "currentUserEmail",
                            currentUserEmail
                        );


                        localStorage.setItem(
                            "currentUserProfilePic",
                            currentUserProfilePic
                        );


                        // Fetch full profile to store user_object + phone
                        fetchAndStoreUserProfile(currentUserId);


                        // ------------------------------------
                        // UPDATE COMPLETE NAVBAR
                        // ------------------------------------

                        updateNavbarAuthUI();


                        showDialogAlert(
                            "loginAlert",
                            data.message ||
                            "Logged in successfully!",
                            "success"
                        );


                        // ------------------------------------
                        // CLOSE LOGIN
                        // ------------------------------------

                        setTimeout(() => {

                            hideAllModals();


                            // Open profile menu
                            // after successful login

                            openProfileDropdown();

                        }, 1200);


                    } else {

                        showDialogAlert(
                            "loginAlert",
                            data.error ||
                            "Login failed.",
                            "error"
                        );
                    }


                } catch (error) {

                    console.error(
                        "Login error:",
                        error
                    );


                    showDialogAlert(
                        "loginAlert",
                        "Server error. Please try again later.",
                        "error"
                    );


                } finally {

                    loginBtnAction.disabled =
                        false;


                    loginBtnAction.innerText =
                        "Login";
                }

            }
        );
    }


    // ========================================================
    // SIGNUP
    // ========================================================

    if (signupBtnAction) {

        signupBtnAction.addEventListener(
            "click",
            async function () {

                const name =
                    document
                        .getElementById(
                            "signupName"
                        )
                        ?.value
                        .trim() || "";


                const phone =
                    document
                        .getElementById(
                            "signupPhone"
                        )
                        ?.value
                        .trim() || "";


                const email =
                    document
                        .getElementById(
                            "signupEmail"
                        )
                        ?.value
                        .trim() || "";


                const password =
                    document
                        .getElementById(
                            "signupPwd"
                        )
                        ?.value || "";


                if (
                    !name ||
                    !phone ||
                    !email ||
                    !password
                ) {

                    showDialogAlert(
                        "signupAlert",
                        "Please fill all fields.",
                        "error"
                    );

                    return;
                }


                signupBtnAction.disabled =
                    true;


                signupBtnAction.innerText =
                    "Signing up...";


                try {

                    const response =
                        await fetch(
                            `${API_BASE_URL}/api/auth/signup`,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body: JSON.stringify({
                                    name: name,
                                    phone: phone,
                                    email: email,
                                    password: password
                                })
                            }
                        );


                    const data =
                        await response.json();


                    if (response.ok) {

                        // ------------------------------------
                        // UPDATE AUTH STATE
                        // ------------------------------------

                        isLoggedIn = true;


                        currentUserId =
                            data.user_id ||
                            null;


                        currentUserName =
                            name;


                        currentUserEmail =
                            email;


                        currentUserProfilePic =
                            "";


                        // ------------------------------------
                        // SAVE AUTH STATE
                        // ------------------------------------

                        localStorage.setItem(
                            "isLoggedIn",
                            "true"
                        );


                        localStorage.setItem(
                            "currentUserId",
                            currentUserId || ""
                        );


                        localStorage.setItem(
                            "currentUserName",
                            currentUserName
                        );


                        localStorage.setItem(
                            "currentUserEmail",
                            currentUserEmail
                        );


                        localStorage.setItem(
                            "currentUserProfilePic",
                            ""
                        );


                        // Fetch full profile to store user_object + phone
                        fetchAndStoreUserProfile(currentUserId);

                        updateNavbarAuthUI();


                        showDialogAlert(
                            "signupAlert",
                            data.message ||
                            "Signup successful!",
                            "success"
                        );


                        setTimeout(() => {

                            hideAllModals();


                            // Open profile menu
                            // after successful signup

                            openProfileDropdown();

                        }, 1200);


                    } else {

                        showDialogAlert(
                            "signupAlert",
                            "Error: " +
                            (
                                data.error ||
                                "Signup failed."
                            ),
                            "error"
                        );
                    }


                } catch (error) {

                    console.error(
                        "Signup error:",
                        error
                    );


                    showDialogAlert(
                        "signupAlert",
                        "Server error. Please try again later.",
                        "error"
                    );


                } finally {

                    signupBtnAction.disabled =
                        false;


                    signupBtnAction.innerText =
                        "Sign Up";
                }

            }
        );
    }


    // ========================================================
    // BOOK SERVICE HERO BUTTON
    // ========================================================

    if (bookServiceBtnHero) {

        bookServiceBtnHero.addEventListener(
            "click",
            function () {

                if (!isLoggedIn) {

                    showModal(
                        loginDialog
                    );

                } else {

                    showModal(
                        addBikeDialog
                    );
                }

            }
        );
    }


    // ========================================================
    // CANCEL ADD BIKE
    // ========================================================

    if (cancelAddBike) {

        cancelAddBike.addEventListener(
            "click",
            function (e) {

                e.preventDefault();

                hideAllModals();

            }
        );
    }


    // ========================================================
    // CONFIRM BOOKING
    // ========================================================

    if (confirmBookingBtn) {

        confirmBookingBtn.addEventListener(
            "click",
            function () {

                hideAllModals();


                if (statusDialog) {

                    statusDialog.classList.add(
                        "show"
                    );


                    statusDialog.style.display =
                        "flex";


                    statusDialog.setAttribute(
                        "aria-hidden",
                        "false"
                    );


                    setScrollLock(true);
                }


                const todaySpan =
                    document.getElementById(
                        "bookedDateSpan"
                    );


                if (todaySpan) {

                    const date =
                        new Date();


                    todaySpan.innerText =
                        date.toLocaleDateString(
                            "en-GB",
                            {
                                day: "numeric",
                                month: "short",
                                year: "numeric"
                            }
                        );
                }

            }
        );
    }


    // ========================================================
    // PROFILE IMAGE PREVIEW
    // ========================================================

    if (profileImageInput) {

        profileImageInput.addEventListener(
            "change",
            function () {

                const file =
                    this.files?.[0];


                if (!file) {
                    return;
                }


                // Validate image
                if (
                    !file.type.startsWith(
                        "image/"
                    )
                ) {

                    showDialogAlert(
                        "profileAlert",
                        "Please select a valid image file.",
                        "error"
                    );


                    this.value =
                        "";


                    return;
                }


                const reader =
                    new FileReader();


                reader.onload =
                    function (e) {

                        if (
                            !profileImagePreview
                        ) {
                            return;
                        }


                        if (
                            profileImagePreview.tagName ===
                            "IMG"
                        ) {

                            profileImagePreview.src =
                                e.target.result;

                        } else {

                            profileImagePreview.innerHTML =
                                `<img src="${e.target.result}"
                                      alt="Profile preview"
                                      style="width:100%;
                                             height:100%;
                                             border-radius:50%;
                                             object-fit:cover;
                                             display:block;">`;
                        }
                    };


                reader.readAsDataURL(
                    file
                );
            }
        );
    }


    // ========================================================
    // SAVE PROFILE
    // ========================================================

    if (saveProfileBtn) {

        saveProfileBtn.addEventListener(
            "click",
            async function () {

                const profileNameInput =
                    document.getElementById(
                        "profileName"
                    );


                const name =
                    profileNameInput
                        ?.value
                        .trim() || "";


                const file =
                    profileImageInput
                        ?.files?.[0];


                if (!name) {

                    showDialogAlert(
                        "profileAlert",
                        "Name cannot be empty.",
                        "error"
                    );


                    return;
                }


                if (!currentUserId) {

                    showDialogAlert(
                        "profileAlert",
                        "User session not found. Please login again.",
                        "error"
                    );


                    return;
                }


                saveProfileBtn.disabled =
                    true;


                saveProfileBtn.innerText =
                    "Saving...";


                const formData =
                    new FormData();


                formData.append(
                    "name",
                    name
                );


                if (file) {

                    formData.append(
                        "image",
                        file
                    );
                }


                try {

                    const response =
                        await fetch(
                            `${API_BASE_URL}/api/user/${currentUserId}`,
                            {
                                method: "PATCH",
                                body: formData
                            }
                        );


                    const data =
                        await response.json();


                    if (response.ok) {

                        // ------------------------------------
                        // UPDATE LOCAL STATE
                        // ------------------------------------

                        currentUserName =
                            data.user?.name ||
                            name;


                        currentUserProfilePic =
                            data.user?.profile_picture ||
                            currentUserProfilePic ||
                            "";


                        // ------------------------------------
                        // UPDATE LOCAL STORAGE
                        // ------------------------------------

                        localStorage.setItem(
                            "currentUserName",
                            currentUserName
                        );


                        localStorage.setItem(
                            "currentUserProfilePic",
                            currentUserProfilePic
                        );


                        // ------------------------------------
                        // UPDATE UI IMMEDIATELY
                        // ------------------------------------

                        updateNavbarAuthUI();

                        updateProfileDialogAvatar();


                        showDialogAlert(
                            "profileAlert",
                            data.message ||
                            "Profile updated successfully!",
                            "success"
                        );


                    } else {

                        showDialogAlert(
                            "profileAlert",
                            data.error ||
                            "Failed to update profile.",
                            "error"
                        );
                    }


                } catch (error) {

                    console.error(
                        "Update profile error:",
                        error
                    );


                    showDialogAlert(
                        "profileAlert",
                        "Server error. Please try again later.",
                        "error"
                    );


                } finally {

                    saveProfileBtn.disabled =
                        false;


                    saveProfileBtn.innerText =
                        "Save Changes";
                }

            }
        );
    }


    // ========================================================
    // DELETE ACCOUNT
    // ========================================================

    if (deleteAccountBtn) {

        deleteAccountBtn.addEventListener(
            "click",
            function () {

                if (!isLoggedIn) {

                    showModal(
                        loginDialog
                    );

                    return;
                }


                showModal(
                    deleteConfirmDialog
                );
            }
        );
    }


    // ========================================================
    // CANCEL DELETE
    // ========================================================

    if (cancelDeleteBtn) {

        cancelDeleteBtn.addEventListener(
            "click",
            function () {

                showModal(
                    profileDialog
                );
            }
        );
    }


    // ========================================================
    // CONFIRM DELETE ACCOUNT
    // ========================================================

    if (confirmDeleteBtn) {

        confirmDeleteBtn.addEventListener(
            "click",
            async function () {

                if (!currentUserId) {

                    alert(
                        "User session not found."
                    );


                    return;
                }


                confirmDeleteBtn.disabled =
                    true;


                confirmDeleteBtn.innerText =
                    "Deleting...";


                try {

                    const response =
                        await fetch(
                            `${API_BASE_URL}/api/user/${currentUserId}`,
                            {
                                method: "DELETE"
                            }
                        );


                    const data =
                        await response.json();


                    if (response.ok) {

                        // ------------------------------------
                        // RESET AUTH STATE
                        // ------------------------------------

                        isLoggedIn = false;

                        currentUserId = null;

                        currentUserName = null;

                        currentUserEmail = null;

                        currentUserProfilePic =
                            null;


                        // ------------------------------------
                        // REMOVE AUTH DATA
                        // ------------------------------------

                        localStorage.removeItem(
                            "isLoggedIn"
                        );


                        localStorage.removeItem(
                            "currentUserId"
                        );


                        localStorage.removeItem(
                            "currentUserName"
                        );


                        localStorage.removeItem(
                            "currentUserEmail"
                        );


                        localStorage.removeItem(
                            "currentUserProfilePic"
                        );


                        // ------------------------------------
                        // UPDATE COMPLETE NAVBAR
                        // ------------------------------------

                        updateNavbarAuthUI();


                        closeProfileDropdown();

                        hideAllModals();


                        alert(
                            data.message ||
                            "Account deleted successfully."
                        );


                    } else {

                        alert(
                            "Error: " +
                            (
                                data.error ||
                                "Failed to delete account."
                            )
                        );
                    }


                } catch (error) {

                    console.error(
                        "Delete account error:",
                        error
                    );


                    alert(
                        "Server error. Please try again later."
                    );


                } finally {

                    confirmDeleteBtn.disabled =
                        false;


                    confirmDeleteBtn.innerText =
                        "Yes, Delete";
                }

            }
        );
    }


    // ========================================================
    // FINAL INITIALIZATION
    // ========================================================

    updateNavbarAuthUI();

    // On page load/refresh, re-fetch full profile if already logged in
    if (isLoggedIn && currentUserId) {
        fetchAndStoreUserProfile(currentUserId);
    }

    // ========================================================
    // BOOK A SLOT LOGIC

    // ========================================================
    const bookSlotDialog = document.getElementById("bookSlotDialog");
    const closeBookSlotDialog = document.getElementById("closeBookSlotDialog");
    const bookSlotForm = document.getElementById("bookSlotForm");
    const slotContactError = document.getElementById("slotContactError");

    window.openBookSlotDialog = function () {
        const slotName = document.getElementById("slotName");
        const slotEmail = document.getElementById("slotEmail");
        const slotPhone = document.getElementById("slotPhone");

        if (isLoggedIn) {
            if (currentUserName && slotName) slotName.value = currentUserName;
            if (currentUserEmail && slotEmail) slotEmail.value = currentUserEmail;

            // Auto-fill phone if it exists in local storage
            const savedPhone = localStorage.getItem("currentUserPhone");
            if (savedPhone && slotPhone) slotPhone.value = savedPhone;
        }

        showModal(bookSlotDialog);
    };

    if (closeBookSlotDialog) {
        closeBookSlotDialog.addEventListener("click", () => {
            hideAllModals();
            if (bookSlotForm) bookSlotForm.reset();
            if (slotContactError) slotContactError.style.display = "none";
        });
    }

    if (bookSlotForm) {
        bookSlotForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const name = document.getElementById("slotName").value.trim();
            const phone = document.getElementById("slotPhone").value.trim();
            const email = document.getElementById("slotEmail").value.trim();
            const bike = document.getElementById("slotBike").value.trim();

            if (!phone && !email) {
                slotContactError.style.display = "block";
                return;
            }
            slotContactError.style.display = "none";

            const submitBtn = document.getElementById("slotSubmitBtn");
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = 'Booking... <span class="spinner"></span>';
            submitBtn.disabled = true;

            try {
                const response = await fetch(`${API_BASE_URL}/api/modification-slot`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, phone, email, bike })
                });

                const data = await response.json();

                if (response.ok) {
                    hideAllModals();
                    bookSlotForm.reset();

                    const successModal = document.getElementById("modificationSuccessDialog");
                    if (successModal) {
                        showModal(successModal);
                        setTimeout(() => {
                            hideAllModals();
                        }, 5000);
                    }
                } else {
                    const errorMsg = data.error || "Failed to book slot";
                    slotContactError.innerText = "Error: " + errorMsg;
                    slotContactError.style.display = "block";
                }
            } catch (err) {
                console.error(err);
                slotContactError.innerText = "Server error. Please try again.";
                slotContactError.style.display = "block";
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }

});