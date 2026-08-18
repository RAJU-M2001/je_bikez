const bikeModels = {
    BMW: ["S1000RR", "M1000RR", "G310R"],
    Yamaha: ["R15", "MT-15", "R3", "MT-09"],
    Kawasaki: ["Ninja 300", "Ninja 400", "Ninja 650", "ZX-6R", "ZX-10R"],
    KTM: ["Duke 200", "Duke 390", "RC 390", "1290 Super Duke"],
    Honda: ["CBR650R", "CBR1000RR-R", "CB350", "Hornet 2.0"],
    "Royal Enfield": ["Classic 350", "Hunter 350", "Meteor 350", "Interceptor 650"],
    TVS: ["Apache RTR 160", "Apache RTR 200", "RR 310"],
    Bajaj: ["Pulsar NS200", "Pulsar RS200", "Dominar 400"],
    Suzuki: ["Gixxer", "Gixxer SF", "Hayabusa"]
};

const bikeVariants = {
    S1000RR: ["Standard", "M Sport"],
    M1000RR: ["Standard", "Competition"],
    G310R: ["Standard"],
    R15: ["V4", "V4 M"],
    "MT-15": ["Standard", "Deluxe"],
    R3: ["Standard"],
    "MT-09": ["Standard", "SP"],
    "Ninja 300": ["Standard"],
    "Ninja 400": ["Standard"],
    "Ninja 650": ["Standard", "SE"],
    "ZX-6R": ["Standard"],
    "ZX-10R": ["Standard"],
    "Duke 200": ["Standard"],
    "Duke 390": ["Standard", "GP Edition"],
    "RC 390": ["Standard"],
    "1290 Super Duke": ["R", "GT"],
    CBR650R: ["Standard"],
    "CBR1000RR-R": ["Fireblade", "SP"],
    CB350: ["Standard", "RS"],
    "Hornet 2.0": ["Standard"],
    "Classic 350": ["Standard", "Chrome"],
    "Hunter 350": ["Retro", "Metro"],
    "Meteor 350": ["Fireball", "Stellar"],
    "Interceptor 650": ["Standard", "Black Ray"],
    "Apache RTR 160": ["2V", "4V"],
    "Apache RTR 200": ["4V"],
    "RR 310": ["Standard", "BTO"],
    "Pulsar NS200": ["Standard"],
    "Pulsar RS200": ["Standard"],
    "Dominar 400": ["Standard"],
    Gixxer: ["Standard"],
    "Gixxer SF": ["Standard"],
    Hayabusa: ["Standard"]
};

document.addEventListener("DOMContentLoaded", () => {

    const manufacturer = document.getElementById("manufacturer");
    const model = document.getElementById("model");
    const variant = document.getElementById("variant");
    const year = document.getElementById("year");
    const cc = document.getElementById("cc");
    const serviceType = document.getElementById("serviceType");

    manufacturer.addEventListener("change", function () {

        model.innerHTML = '<option value="">Select Model</option>';
        variant.innerHTML = '<option value="">Select Variant</option>';

        variant.disabled = true;
        year.disabled = true;
        cc.disabled = true;
        serviceType.disabled = true;

        const models = bikeModels[this.value] || [];

        if (models.length === 0) {
            model.disabled = true;
            return;
        }

        models.forEach(item => {
            const option = document.createElement("option");
            option.value = item;
            option.textContent = item;
            model.appendChild(option);
        });

        model.disabled = false;
    });

    model.addEventListener("change", function () {

        variant.innerHTML = '<option value="">Select Variant</option>';

        year.disabled = true;
        cc.disabled = true;
        serviceType.disabled = true;

        const variants = bikeVariants[this.value] || [];

        if (!this.value) {
            variant.disabled = true;
            return;
        }

        variants.forEach(item => {
            const option = document.createElement("option");
            option.value = item;
            option.textContent = item;
            variant.appendChild(option);
        });

        variant.disabled = false;
    });

    variant.addEventListener("change", function () {
        year.disabled = !this.value;
        cc.disabled = true;
        serviceType.disabled = true;
    });

    year.addEventListener("change", function () {
        cc.disabled = !this.value;
        serviceType.disabled = true;
    });

    cc.addEventListener("change", function () {
        serviceType.disabled = !this.value;
    });

});