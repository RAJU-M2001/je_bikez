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

                alert(data.message)

                bookingForm.reset()

                closeBooking()

            } else {

                alert("Error: " + data.error)

            }

        } catch (error) {

            console.error("API Error:", error)

            alert("Server error. Please try again later.")

        }

    })

})