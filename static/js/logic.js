// Store our API endpoint as queryUrl.
let queryUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson'

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
  // Once we get a response, send the data.features object to the createFeatures function.
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {
    // Define a function that we want to run once for each feature in the features array.
    // Give each feature a popup that describes the place and time of the earthquake.
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p>
        <p>Magnitude: ${feature.properties.mag}</p>
        <p>Depth: ${feature.geometry.coordinates[2]}</p>`);
    }

    function pointToLayer(feature, latlng) {
        // Adjust the marker size based on earthquake magnitude.
        const magnitude = feature.properties.mag;
        const depth = feature.geometry.coordinates[2];

        let color;  //Create some stages for the depth color
        if (depth < 10) {
        color = "#FFCBD1"; // Green for shallow earthquakes
        } else if (depth < 20) {
        color = "#F94449"; // Yellow for moderate-depth earthquakes
        } else if (depth < 30) {
            color = "#DE0A26"; // Yellow for moderate-depth earthquakes
        } else if (depth < 40) {
            color = "#C30010"; // Yellow for moderate-depth earthquakes
        } else if (depth < 50) {
            color = "#420D09"; // Yellow for moderate-depth earthquakes
        } else {
        color = "#800000"; // Red for deep earthquakes
        }

        const markerOptions = {
            radius: magnitude * 5, // You can adjust the factor as needed
            fillColor: color,
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        };
    return L.circleMarker(latlng, markerOptions);
    }
  
    // Create a GeoJSON layer that contains the features array on the earthquakeData object.
    // Run the onEachFeature function once for each piece of data in the array.
    let earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: pointToLayer
    });

    // Send our earthquakes layer to the createMap function/
    createMap(earthquakes);
}

function createMap(earthquakes) {

    // Create the base layers.
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })

    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    // Create a baseMaps object.
    let baseMaps = {
        "Street Map": street,
        "Topographic Map": topo
    };

    // Create an overlay object to hold our overlay.
    let overlayMaps = {
        Earthquakes: earthquakes
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load.
    let myMap = L.map("map", {
        center: [
        37.09, -95.71
        ],
        zoom: 5,
        layers: [street, earthquakes]
    });

    // Create a legend control.
    let legend = L.control({ position: 'bottomright' });

    // Define the legend content.
    legend.onAdd = function (map) {
    let div = L.DomUtil.create('div', 'info legend');
    let grades = [0, 10, 20, 30, 40, 50];
    let labels = [];
    let colors = ["#FFCBD1", "#F94449", "#DE0A26", "#C30010", "#420D09", "#800000"]; // Corresponding colors to depth ranges

    // Add a title to the legend.
    div.innerHTML += '<h4>Earthquake Depth Legend</h4>';

    // Loop through depth ranges and generate a label with a colored square for each.
    for (let i = 0; i < grades.length; i++) {
        div.innerHTML +=
          '<i style="background:' + colors[i] + '; width: 20px; height: 20px; display: inline-block;"></i> ' +
          grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
      }

    return div;
    };

    // Add the legend to the map.
    legend.addTo(myMap);

    // Create a layer control.
    // Pass it our baseMaps and overlayMaps.
    // Add the layer control to the map.
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

}

