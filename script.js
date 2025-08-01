let map, centerCoords;
let userMarker = null;
let routeLayer = null;

const address = "Waldstraße 5, 95032 Hof";

const zones = [
  { radius: 4.5, price: 21, time: "10 min", name: "Zone 1", bauSZ: "39,66 €/Stk", bauKK: "46,33 €/Stk", color: "green" },
  { radius: 14, price: 31.5, time: "15 min", name: "Zone 2", bauSZ: "59,50 €/Stk", bauKK: "69,50 €/Stk", color: "blue" },
  { radius: 24, price: 41.5, time: "20 min", name: "Zone 3", bauSZ: "79,33 €/Stk", bauKK: "92,66 €/Stk", color: "orange" },
  { radius: 34, price: 49.5, time: "30 min", name: "Zone 4", bauSZ: "119,00 €/Stk", bauKK: "139,00 €/Stk", color: "purple" },
  { radius: 44, price: 60.9, time: "40 min", name: "Zone 5", bauSZ: "158,66 €/Stk", bauKK: "185,33 €/Stk", color: "red" },
  { radius: 54, price: 60.9, time: "50 min", name: "Zone 6", bauSZ: "198,32 €/Stk", bauKK: "231,66 €/Stk", color: "#FFFF" },
  { radius: 64, price: 60.9, time: "60 min", name: "Zone 7", bauSZ: "238,00 €/Stk", bauKK: "278,00 €/Stk", color: "#FFFF" },
  { radius: 74, price: 60.9, time: "70 min", name: "Zone 8", bauSZ: "277,65 €/Stk", bauKK: "324,32 €/Stk", color: "#FFFF" },
  { radius: 84, price: 60.9, time: "80 min", name: "Zone 9", bauSZ: "317,31 €/Stk", bauKK: "370,66 €/Stk", color: "#FFFF" },
  { radius: 94, price: 60.9, time: "90 min", name: "Zone 10", bauSZ: "356,80 €/Stk", bauKK: "416,99 €/Stk", color: "#FFFF" },
  { radius: 104, price: 60.9, time: "100 min", name: "Zone 11", bauSZ: "395,08 €/Stk", bauKK: "461,48 €/Stk", color: "#FFFF" },
  { radius: 114, price: 60.9, time: "110 min", name: "Zone 12", bauSZ: "435,54 €/Stk", bauKK: "508,74 €/Stk", color: "#FFFF" },
  { radius: 124, price: 60.9, time: "120 min", name: "Zone 13", bauSZ: "476,00 €/Stk", bauKK: "556,00 €/Stk", color: "#FFFF"}
];

const suppliers = [
 { name: "Kompostanlage Feilitzsch", coords: [50.374943, 11.928075], category: "kompost" },

  { name: "Kompostplatz Rehau/Wurlitz", coords: [50.254611, 12.005889], category: "kompost" },

  { name: "Kompostplatz Oberkotzau", coords: [50.264758, 11.967372], category: "kompost" },

  { name: "Kompostanlage Konradsreuth", coords: [50.279375, 11.864807], category: "kompost" },

  { name: "Kompostplatz Epplas", coords: [50.308854, 11.808464], category: "kompost" },

  { name: "Kompostplatz Wacholderbusch", coords: [50.337026, 11.778064], category: "kompost" },

  { name: "Kompostplatz Steinselb 14, 95100 Selb", coords: [50.172841, 12.058109], category: "kompost" },

  { name: "Kompostplatz Vordorf (etwas außerhab)", coords: [50.042496, 11.923006], category: "kompost" },

  { name: "Kompostplatz Vordorf (in dem Ort)", coords: [50.048232, 11.919693], category: "kompost" },

  { name: "Kompostplatz 95659 Arzberg", coords: [50.074340, 12.181042], category: "kompost" },

  { name: "Kompostplatz Marktredwitz/Lorenzreuth", coords: [50.022971, 12.095975], category: "kompost" },

  { name: "Kompostplatz Münchberg-Solg", coords: [50.169170, 11.732705], category: "kompost" },

  { name: "Kompostplatz Naila", coords: [50.321480, 11.683966], category: "kompost" },

  { name: "Kompostplatz Schwarzenbach a.d.Saale", coords: [50.221471, 11.974884], category: "kompost" },

  { name: "Kompostwerk Schönau", coords: [50.659697, 12.568081], category: "kompost" },

  { name: "Kompostieranlage Rüsdorf (Lichtenstein)", coords: [50.777049, 12.637631], category: "kompost" },

  { name: "Kompostieranlage 09217 Burgstädt", coords: [50.945985, 12.793613], category: "kompost" },

  { name: "Kompostieranlage Hartmannsdorf", coords: [50.873543, 12.794233], category: "kompost" },

  { name: "Kompostplatz 96268 Mitwitz", coords: [50.235460, 11.208181], category: "kompost" },

  { name: "Kompostplatz Kulmbach", coords: [50.130584, 11.545471], category: "kompost" },

  { name: "Kompostplatz Wunsiedel/Wintersberg", coords: [50.042063, 12.052693], category: "kompost" },

  { name: "Grüngut-Kompostierungsanlage des Landkreises Kulmbach", coords: [50.130691, 11.545523], category: "kompost" },



  { name: "Kornhausacker 10", coords: [50.32386060640727, 11.891493203783135], category: "KH" }
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
        .setContent(`<strong>${zone.name}</strong><br>Preis: ${zone.price} €<br>Zeit: ${zone.time}<br>BauSZ: ${zone.bauSZ}<br>BauKK: ${zone.bauKK}`)
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

 const infoBtn = document.getElementById("info-button");
  const modal = document.getElementById("info-modal");
  const closeBtn = document.querySelector(".close-button");

  infoBtn.addEventListener("click", () => {
    modal.style.display = "block";
  });

  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target == modal) {
      modal.style.display = "none";
    }
  });
  
initMap();
