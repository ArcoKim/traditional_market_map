const mapContainer = document.getElementById('map');
const mapOption = { 
    center: new kakao.maps.LatLng(36.5668174446949, 127.97864943098769),
    level: 12
};

const map = new kakao.maps.Map(mapContainer, mapOption);

const fetching = async (path) => {
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

const getMarketInfo = async (name, latitude, longitude) => { 
    const market = await fetching(`/market?latitude=${latitude}&longitude=${longitude}`)
    document.getElementById('market_name').textContent = name;
    for(let [key, value] of Object.entries(market)) {
        if(value === 1) {
            value = 'O'
        } else if(value === 0) {
            value = 'X'
        } else if(!value) {
            value = '정보 없음'
        }
        document.getElementById(key).textContent = value;
    }
    document.getElementById('info').style.display = 'block';
}

const initializeMarkers = async () => {
    const positions = await fetching('/position');

    if (positions) {
        positions.forEach(position => {
            const marker = new kakao.maps.Marker({
                map: map,
                position: new kakao.maps.LatLng(position['latitude'], position['longitude']),
                title: position['name']
            });

            kakao.maps.event.addListener(marker, 'click', () => {
                getMarketInfo(position['name'], position['latitude'], position['longitude'])
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

        const imageSrc = "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png"; 
        const imageSize = new kakao.maps.Size(24, 35);
        const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize); 

        const marker = new kakao.maps.Marker({  
            map: map, 
            position: locPosition,
            image: markerImage
        }); 
        const infowindow = new kakao.maps.InfoWindow({
            content : "현재 위치",
            removable : true
        });

        infowindow.open(map, marker);
    });
}

document.getElementById('market_close').addEventListener('click', () => {
    document.getElementById('info').style.display = 'none';
});

document.getElementById('search').addEventListener('click', () => {
    document.getElementById('search_div').style.display = 'block';
});

document.getElementById('search_close').addEventListener('click', () => {
    document.getElementById('search_div').style.display = 'none';
});

const handleSubmit = event => {
    event.preventDefault();

    const myForm = event.target;
    const formData = new FormData(myForm);

    fetch("/search", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData).toString()
    })
        .then(() => console.log("Form successfully submitted"))
        .catch(error => alert(error));
    };

document.querySelector("form").addEventListener("submit", handleSubmit);