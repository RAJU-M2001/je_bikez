function scrollToWorks() {
    document.getElementById("works").scrollIntoView({ behavior: "smooth" })
}

function openBooking() {
    document.getElementById("bookingDialog").style.display = "flex"
}

function closeBooking() {
    document.getElementById("bookingDialog").style.display = "none"
}

function openAbout() {
    document.getElementById("aboutDialog").style.display = "flex"
}

function closeAbout() {
    document.getElementById("aboutDialog").style.display = "none"
}


// BOOK SLOT API CONNECTION

document.getElementById("bookingForm").addEventListener("submit", async function (e) {

    e.preventDefault()

    const name = document.getElementById("name").value
    const phone = document.getElementById("phone").value
    const bike = document.getElementById("bike").value
    const date = document.getElementById("date").value

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

    alert(data.message)

    document.getElementById("bookingForm").reset()

    closeBooking()

})