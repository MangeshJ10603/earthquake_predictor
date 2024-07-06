const mainMap = L.map("map").setView([0, 0], 2);
const hospitalMap = L.map("hospital-map").setView([0, 0], 2);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(mainMap);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(hospitalMap);

let earthquakeMarker;

document.querySelector("form").addEventListener("submit", function (event) {
    event.preventDefault();
    const latitude = parseFloat(document.getElementById("latitude").value);
    const longitude = parseFloat(document.getElementById("longitude").value);
    const date = document.getElementById("date").value;

    if (earthquakeMarker) {
        mainMap.removeLayer(earthquakeMarker);
    }

    fetch("/predict", {
        method: "POST",
        body: new URLSearchParams({ latitude, longitude, date }),
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
    })
        .then(response => response.json())
        .then(data => {
            const resultDiv = document.getElementById("prediction-result");

            if (data.magnitude >= 4) {
                resultDiv.innerHTML = `Predicted Magnitude: ${data.magnitude.toFixed(2)} - Earthquake Predicted`;

                earthquakeMarker = L.marker([latitude, longitude])
                    .addTo(mainMap)
                    .bindPopup(`Predicted Mag: ${data.magnitude.toFixed(2)}`)
                    .openPopup();

                showSafetyMeasures();
            } else {
                resultDiv.innerHTML = 'Earthquake not predicted';

                earthquakeMarker = L.marker([latitude, longitude])
                    .addTo(mainMap)
                    .bindPopup(`Latitude: ${latitude.toFixed(2)}, Longitude: ${longitude.toFixed(2)} - Earthquake not predicted`)
                    .openPopup();

                hideSafetyMeasures();
            }
        })
        .catch(error => {
            console.error("Error:", error);
        });
});

document.getElementById("show-hospitals-button").addEventListener("click", function () {
    const latitude = parseFloat(document.getElementById("latitude").value);
    const longitude = parseFloat(document.getElementById("longitude").value);

    hospitalMap.eachLayer(layer => {
        if (layer instanceof L.Marker) {
            hospitalMap.removeLayer(layer);
        }
    });

    fetch(`https://overpass-api.de/api/interpreter?data=[out:json][timeout:25];
        (node["amenity"="hospital"](around:2000,${latitude},${longitude}););out;`)
        .then(response => response.json())
        .then(hospitalData => {
            hospitalData.elements.forEach(element => {
                const hospitalLatLng = [element.lat, element.lon];
                L.marker(hospitalLatLng).addTo(hospitalMap)
                    .bindPopup(`Hospital: ${element.tags.name}`);
            });
        })
        .catch(error => {
            console.error("Error fetching hospital data:", error);
        });
});

const scrollToTopButton = document.getElementById('scroll-to-top-button');

window.onscroll = function () {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        scrollToTopButton.style.display = 'block';
    } else {
        scrollToTopButton.style.display = 'none';
    }
};

scrollToTopButton.addEventListener('click', function () {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
});

function showSafetyMeasures() {
    const safetyMeasures = [
        "Stay calm and take cover.",
        "Drop to the ground to prevent being knocked over.",
        "Take cover under a sturdy piece of furniture.",
        "Stay away from windows and glass.",
        "If you are outside, move to an open area away from buildings, trees, streetlights, and utility wires.",
        "If you are driving, pull over to a clear location, away from buildings and trees.",
        "If you are in bed, stay there and protect your head with a pillow.",
        "Do not use elevators.",
        "If indoors, stay there until the shaking stops and it is safe to move.",
        "After the earthquake, be prepared for aftershocks."
    ];

    const safetyMeasuresList = document.getElementById('safety-measures-list');
    safetyMeasuresList.innerHTML = '';
    safetyMeasures.forEach(measure => {
        const listItem = document.createElement('li');
        listItem.textContent = measure;
        safetyMeasuresList.appendChild(listItem);
    });

    document.getElementById('safety-measures').style.display = 'block';
}

function hideSafetyMeasures() {
    document.getElementById('safety-measures').style.display = 'none';
}
