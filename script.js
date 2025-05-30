let map, centerCoords;
let userMarker = null;
let routeLayer = null;

const address = "Kornhausacker 10, 95030 Hof";

const zones = [
  { radius: 4.5, price: 21, time: "10 min", name: "Zone 1", color: "green" },
  { radius: 14, price: 31.5, time: "15 min", name: "Zone 2", color: "blue" },
  { radius: 24, price: 41.5, time: "20 min", name: "Zone 3", color: "orange" },
  { radius: 34, price: 49.5, time: "30 min", name: "Zone 4", color: "purple" },
  { radius: 44, price: 60.9, time: "40 min", name: "Zone 5", color: "red" },
  { radius: 54, price: 60.9, time: "50 min", name: "Zone 6", color: "#FFFF" },
  { radius: 64, price: 60.9, time: "60 min", name: "Zone 7", color: "#FFFF" },
  { radius: 74, price: 60.9, time: "70 min", name: "Zone 8", color: "#FFFF" },
  { radius: 84, price: 60.9, time: "80 min", name: "Zone 9", color: "#FFFF" },
  { radius: 94, price: 60.9, time: "90 min", name: "Zone 10", color: "#FFFF" },
  { radius: 104, price: 60.9, time: "100 min", name: "Zone 11", color: "#FFFF" },
  { radius: 114, price: 60.9, time: "110 min", name: "Zone 12", color: "#FFFF" },
  { radius: 124, price: 60.9, time: "120 min", name: "Zone 13", color: "#FFFF" }
];

const suppliers = [
  { name: "Kompostanlage Feilitzsch", coords: [50.374900, 11.928028], category: "kompost" },
  { name: "Kompostplatz Rehau/Wurlitz", coords: [50.25872667259882, 12.00456360809713], category: "kompost" },
  { name: "Kompostplatz Oberkotzau", coords: [50.26991953857275, 11.967141427594045], category: "kompost" },
  { name: "Kompostanlage Konradsreuth", coords: [50.28308424855206, 11.865517892062451], category: "kompost" },
  { name: "Kompostplatz Epplas", coords: [50.31205850660188, 11.808035878230756], category: "kompost" },
  { name: "Kompostplatz Wacholderbusch", coords: [50.3427448739316, 11.775990786090679], category: "kompost" },
  { name: "Kompostierplatz der Stadt Helmbrechts", coords: [50.24017903374207, 11.746155914408092], category: "kompost" },
  { name: "Kompostplatz Steinselb 14, 95100 Selb", coords: [50.172798, 12.058217], category: "kompost" },
  { name: "Kompostplatz 95709 Tröstau", coords: [50.055672046082805, 11.926061012454742], category: "kompost" },
  { name: "Kompostplatz 95659 Arzberg", coords: [50.08928934273383, 12.185042315652119], category: "kompost" },
  { name: "Kompostplatz Lorenzreuth", coords: [50.03792008189825, 12.094835344875504], category: "kompost" },
  { name: "Kompostplatz 96317 Kronach", coords: [50.03792008189825, 12.094835344875504], category: "kompost" },
  { name: "Mitarbeiter Ivan", coords: [50.35, 11.85], category: "worker" },
  { name: "Mitarbeiter Olga", coords: [50.25, 11.95], category: "worker" }
];

async function initMap() {
  const coords = await geocodeAddress(address);
  centerCoords = coords;

  map = L.map('map').setView(coords, 11);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  L.marker(coords).addTo(map).bindPopup("Unser Lager").openPopup();

  drawRingZones([coords[1], coords[0]]);
}

function drawRingZones(centerLonLat) {
  let previousRadius = 0;

  zones.forEach((zone, index) => {
    const outer = turf.circle(centerLonLat, zone.radius, { steps: 64, units: 'kilometers' });
    const inner = turf.circle(centerLonLat, previousRadius, { steps: 64, units: 'kilometers' });

    let ring = outer;
    if (index > 0) {
      try {
        ring = turf.difference(outer, inner);
      } catch (e) {
        console.error("Error in turf.difference:", e);
        ring = outer;
      }
    }

    const layer = L.geoJSON(ring, {
      style: {
        color: zone.color,
        fillColor: zone.color,
        fillOpacity: 0.3,
        weight: 1
      }
    }).addTo(map);

    layer.on("click", function (e) {
      L.popup()
        .setLatLng(e.latlng)
        .setContent(`<strong>${zone.name}</strong><br>Preis: ${zone.price} €<br>Zeit: ${zone.time}`)
        .openOn(map);
    });

    previousRadius = zone.radius;
  });
}

async function geocodeAddress(address) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
  const response = await fetch(url);
  const data = await response.json();
  if (data.length > 0) {
    return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  } else {
    alert("Adresse nicht gefunden");
    return [0, 0];
  }
}

function clearRouteAndMarker() {
  if (userMarker) {
    map.removeLayer(userMarker);
    userMarker = null;
  }
  if (routeLayer) {
    map.removeLayer(routeLayer);
    routeLayer = null;
  }
  document.getElementById("routeInfo").innerText = "";
}

async function searchOnlyPoint() {
  const inputAddress = document.getElementById("addressInput").value;
  if (!inputAddress) return;
  const coords = await geocodeAddress(inputAddress);
  clearRouteAndMarker();
  userMarker = L.marker(coords).addTo(map).bindPopup("Gefunden").openPopup();
  map.setView(coords, 13);
}

async function findNearestSupplier() {
  const inputAddress = document.getElementById("addressInput").value;
  const selectedCategory = document.getElementById("categorySelect").value;
  if (!inputAddress || selectedCategory === "all") return;

  const userCoords = await geocodeAddress(inputAddress);
  clearRouteAndMarker();
  userMarker = L.marker(userCoords).addTo(map).bindPopup("Sie").openPopup();
  map.setView(userCoords, 12);

  const from = turf.point([userCoords[1], userCoords[0]]);
  let nearest = null;
  let minDistance = Infinity;

  suppliers.forEach(supplier => {
    if (supplier.category !== selectedCategory) return;
    const to = turf.point([supplier.coords[1], supplier.coords[0]]);
    const dist = turf.distance(from, to);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = supplier;
    }
  });

  if (nearest) {
    drawRoute(userCoords, nearest.coords, `Nächster: ${nearest.name}`);
  }
}

async function routeBetweenTwoPoints() {
  const fromInput = document.getElementById("fromAddress").value;
  const toInput = document.getElementById("toAddress").value;
  if (!toInput) return;

  const fromCoords = fromInput
    ? await geocodeAddress(fromInput)
    : centerCoords;
  const toCoords = await geocodeAddress(toInput);

  clearRouteAndMarker();
  L.marker(fromCoords).addTo(map).bindPopup("Start").openPopup();
  L.marker(toCoords).addTo(map).bindPopup("Ziel");

  drawRoute(fromCoords, toCoords);
}

async function drawRoute(fromCoords, toCoords, label = "") {
  const url = `https://router.project-osrm.org/route/v1/driving/${fromCoords[1]},${fromCoords[0]};${toCoords[1]},${toCoords[0]}?overview=full&geometries=geojson`;
  const response = await fetch(url);
  const data = await response.json();

  if (!data.routes || data.routes.length === 0) {
    alert("Route nicht gefunden");
    return;
  }

  const route = data.routes[0].geometry;
  const distance = data.routes[0].distance / 1000;
  const duration = data.routes[0].duration / 60;

  routeLayer = L.geoJSON(route, {
    style: { color: "blue", weight: 4 }
  }).addTo(map);
  map.fitBounds(routeLayer.getBounds());

  document.getElementById("routeInfo").innerText =
    `${label ? label + "\n" : ""}Entfernung: ${distance.toFixed(1)} km | Dauer: ${duration.toFixed(0)} min`;
}

initMap();
