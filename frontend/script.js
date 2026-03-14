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