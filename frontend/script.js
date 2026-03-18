document.addEventListener("DOMContentLoaded", function () {

    // SCROLL TO WORKS
    window.scrollToWorks = function () {
        document.getElementById("works").scrollIntoView({ behavior: "smooth" })
    }

    // OPEN BOOKING POPUP
    window.openBooking = function () {
        document.getElementById("bookingDialog").style.display = "flex"
    }

    // CLOSE BOOKING POPUP
    window.closeBooking = function () {
        document.getElementById("bookingDialog").style.display = "none"
        document.getElementById("bookingForm").reset()
    }

    // OPEN ABOUT POPUP
    window.openAbout = function () {
        document.getElementById("aboutDialog").style.display = "flex"
    }

    // CLOSE ABOUT POPUP
    window.closeAbout = function () {
        document.getElementById("aboutDialog").style.display = "none"
    }


    // BOOK SLOT API CONNECTION

    const bookingForm = document.getElementById("bookingForm")

    bookingForm.addEventListener("submit", async function (e) {

        e.preventDefault()

        const name = document.getElementById("name").value
        const phone = document.getElementById("phone").value
        const bike = document.getElementById("bike").value
        const date = document.getElementById("date").value

        try {

            const response = await fetch("https://bike-modification-api.onrender.com/book-slot", {

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

                document.getElementById("successMsg").innerText = data.message || "Your slot has been booked successfully.";
                document.getElementById("successDialog").style.display = "flex";
                setTimeout(() => document.getElementById("successDialog").style.display = "none", 10000);

                bookingForm.reset()

                closeBooking()

            } else {

                document.getElementById("errorMsg").innerText = "Error: " + (data.error || "Failed to book slot.");
                document.getElementById("errorDialog").style.display = "flex";
                setTimeout(() => document.getElementById("errorDialog").style.display = "none", 10000);

            }

        } catch (error) {

            console.error("API Error:", error)

            document.getElementById("errorMsg").innerText = "Server error. Please try again later.";
            document.getElementById("errorDialog").style.display = "flex";
            setTimeout(() => document.getElementById("errorDialog").style.display = "none", 10000);

        }

    })

})