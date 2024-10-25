const mapContainer = document.getElementById('map');
const mapOption = { 
    center: new kakao.maps.LatLng(36.5668174446949, 127.97864943098769),
    level: 12
};

const map = new kakao.maps.Map(mapContainer, mapOption);

const fetching = async (path, option = {}) => {
    try {
        const response = await fetch(path, option);
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

            kakao.maps.event.addListener(marker, 'click', async () => {
                await getMarketInfo(position['name'], position['latitude'], position['longitude']);
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

document.getElementById('search_btn').addEventListener('click', () => {
    document.getElementById('result').style.display = 'block';
});

document.getElementById('result_close').addEventListener('click', () => {
    document.getElementById('result').style.display = 'none';
});

document.querySelector("form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const myForm = event.target;
    const formData = new FormData(myForm);
    const contents = document.getElementById('contents');
    contents.innerHTML = '';

    const data = await fetching("/search", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData).toString()
    });

    if(data.length > 0) {
        data.forEach(item => {
            const name = item.name;
            const address = item.address;
            const latitude = item.latitude;
            const longitude = item.longitude;

            const div = document.createElement('div');
            div.className = 'pad';
            div.addEventListener("click", async () => {
                await getMarketInfo(name, latitude, longitude);
                const locPosition = new kakao.maps.LatLng(latitude, longitude);
                map.setCenter(locPosition);
                map.setLevel(1);
            });

            const h3 = document.createElement('h3');
            h3.textContent = name;
            div.appendChild(h3);

            const p = document.createElement('p');
            p.textContent = address;
            div.appendChild(p);

            contents.appendChild(div);
        });
    } else {
        const p = document.createElement('p');
        p.textContent = "검색 결과가 없습니다.";
        p.id = "no_result";
        contents.appendChild(p);
    }
});