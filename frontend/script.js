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

    bookingForm.addEventListener("submit", async function (e) {

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

            const response = await fetch("/book-slot", {
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

})