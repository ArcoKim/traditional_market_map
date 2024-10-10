const mapContainer = document.getElementById('map');
const mapOption = { 
    center: new kakao.maps.LatLng(36.5668174446949, 127.97864943098769),
    level: 12
};

const map = new kakao.maps.Map(mapContainer, mapOption);

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {        
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const locPosition = new kakao.maps.LatLng(lat, lon);

        map.setCenter(locPosition);
        map.setLevel(9);

        const marker = new kakao.maps.Marker({  
            map: map, 
            position: locPosition
        }); 
        const infowindow = new kakao.maps.InfoWindow({
            content : "현재 위치",
            removable : true
        });

        infowindow.open(map, marker);
    });
}