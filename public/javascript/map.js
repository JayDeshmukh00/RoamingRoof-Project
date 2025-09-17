mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v12', // style URL
    center: mapData.geometry.coordinates, // CHANGED
    zoom: 9 // starting zoom
});

 
const marker = new mapboxgl.Marker({color: "red"})
    .setLngLat(mapData.geometry.coordinates) // CHANGED
    .setPopup(new mapboxgl.Popup({offset: 25})
    .setHTML(`<h4>${mapData.location}</h4><p>Exact Location provided after booking</p>`)) // CHANGED
    .addTo(map);