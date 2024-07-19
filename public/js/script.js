const socket = io();

if (navigator.geolocation) {
    const watchPositionOptions = {
        enableHighAccuracy: true,
        timeout: 20000, // Further increased timeout to 20 seconds
        maximumAge: 0
    };

    const handlePositionSuccess = (position) => {
        const { latitude, longitude } = position.coords;
        console.log(`Position obtained: (${latitude}, ${longitude})`);
        socket.emit("send-location", { latitude, longitude });
    };

    const handlePositionError = (error) => {
        console.error('Error getting location:', error);
        if (error.code === error.TIMEOUT) {
            console.warn('Location request timed out. Retrying...');
            retryLocationRequest();
        } else {
            console.error(`Error code: ${error.code}, Message: ${error.message}`);
        }
    };

    const retryLocationRequest = () => {
        setTimeout(() => {
            console.log('Retrying location request...');
            navigator.geolocation.watchPosition(handlePositionSuccess, handlePositionError, watchPositionOptions);
        }, 5000); // Retry after 5 seconds
    };

    navigator.geolocation.watchPosition(handlePositionSuccess, handlePositionError, watchPositionOptions);
} else {
    console.error('Geolocation is not supported by this browser.');
}

const map=L.map("map").setView([0, 0], 16); // Initialize the map with a default view

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{
    attribution:"OpenStreetMap"
}).addTo(map)

const markers={};

socket.on("recieve-location",(data)=>{
    const {id,latitude,longitude}=data;
    map.setView([latitude,longitude]);

    if(markers[id]){
        markers[id].setLatLng([latitude,longitude])
    }
    else{
        markers[id]=L.marker([latitude,longitude]).addTo(map);
    }
})

socket.on("user-disconnected",(id)=>{
    if(markers[id]){
        map.removeLayer(markers[id]);
        delete markers[id];
    }
})