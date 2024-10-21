const mapContainer = document.getElementById('map');
const mapOption = { 
    center: new kakao.maps.LatLng(36.5668174446949, 127.97864943098769),
    level: 12
};

const map = new kakao.maps.Map(mapContainer, mapOption);

async function fetching(path) {
    try {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const ret = await response.json();
        return ret;
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
}

async function initializeMarkers() {
    const positions = await fetching('/position');

    if (positions) {
        positions.forEach(position => {
            const marker = new kakao.maps.Marker({
                map: map,
                position: new kakao.maps.LatLng(position['latitude'], position['longitude']),
                title: position['name']
            });

            kakao.maps.event.addListener(marker, 'click', async () => { 
                const market = await fetching(`/market?latitude=${position['latitude']}&longitude=${position['longitude']}`)
                document.getElementById('market_name').textContent = position['name'];
                for(let [key, value] of Object.entries(market)) {
                    if(value === 1) {
                        value = '보유함'
                    } else if(value === 0) {
                        value = '보유하지 않음'
                    } else if(!value) {
                        value = '정보 없음'
                    }
                    document.getElementById(key).textContent = value;
                }
                document.getElementById('info').style.display = 'block';
            });
        });
    }
}

initializeMarkers();

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

document.getElementById('close').addEventListener('click', () => {
    document.getElementById('info').style.display = 'none';
});