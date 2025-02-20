/*******************************************************************
 * マップ制御
 * *************************************************************** */
const protocol = new pmtiles.Protocol();
maplibregl.addProtocol('pmtiles', protocol.tile);

const map = new maplibregl.Map({
    container: 'map',
    style: 'style.json',
    center: [100.53, 13.75],
    zoom: 8
});

map.addControl(new maplibregl.NavigationControl());

/*******************************************************************
 * レイヤON/OFF
 * *************************************************************** */

const layerIds = [
    'osm-layer',
    'PublicTransport-points-layer'
];

document.querySelector('#pgr-all-fill-layer-chk').addEventListener('change', () => {
    const isChecked = document.getElementById('pgr-all-fill-layer-chk').checked;
    const fillLayerIds = ['pgr-fill-layer', 'pgr-outline-layer'];
    fillLayerIds.forEach(id => {
        if (isChecked) {
            map.setLayoutProperty(id, 'visibility', 'visible');
        } else {
            map.setLayoutProperty(id, 'visibility', 'none');
        }
    });
});

document.querySelector('#toggle-layers-btn').addEventListener('click', () => {
    const layersContainer = document.getElementById('layers-container');
    if (layersContainer.style.display === 'none' || layersContainer.style.display === '') {
        layersContainer.style.display = 'block';
    } else {
        layersContainer.style.display = 'none';
    }
});

const toggleLayer = (id) => {
    const isChecked = document.getElementById(`${id}-chk`).checked;
    if (isChecked) {
        map.setLayoutProperty(id, 'visibility', 'visible');
    } else {
        map.setLayoutProperty(id, 'visibility', 'none');
    }
}

layerIds.forEach(lyrId => {
    document.querySelector(`#${lyrId}-chk`).addEventListener('change', () => {
        toggleLayer(lyrId);
    });
});

/*******************************************************************
 * 年度ごとの表示切替
 * *************************************************************** */
// スタイルを動的に更新する関数

// var aSmallpop = [16801, 2401, 343, 49, 7];

// function updateMapStyle(year) {
//     if (map.getLayer('pgr-fill-layer')) {
//       map.setPaintProperty('pgr-fill-layer', 'fill-color', [
//         "step",
//         ["zoom"],
//         [
//           "case",
//           ["<=", ["get", year], 16807], "#ffffff",
//           ["<=", ["get", year], 33614], "#ffe3e3",
//           ["<=", ["get", year], 67228], "#ffc6c6",
//           ["<=", ["get", year], 134456], "#ffaaaa",
//           ["<=", ["get", year], 268912], "#ff8e8e",
//           ["<=", ["get", year], 537824], "#ff7171",
//           ["<=", ["get", year], 1075648], "#ff5555",
//           ["<=", ["get", year], 2151296], "#ff3939",
//           ["<=", ["get", year], 4302592], "#ff1c1c",
//           "#ff0000"
//         ],
//         4.1, [
//           "case",
//           ["<=", ["get", year], 2401], "#ffffff",
//           ["<=", ["get", year], 4802], "#ffe3e3",
//           ["<=", ["get", year], 9604], "#ffc6c6",
//           ["<=", ["get", year], 19208], "#ffaaaa",
//           ["<=", ["get", year], 38416], "#ff8e8e",
//           ["<=", ["get", year], 76832], "#ff7171",
//           ["<=", ["get", year], 153664], "#ff5555",
//           ["<=", ["get", year], 307328], "#ff3939",
//           ["<=", ["get", year], 614656], "#ff1c1c",
//           "#ff0000"
//         ],
//         8, [
//           "case",
//           ["<=", ["get", year], 343], "#ffffff",
//           ["<=", ["get", year], 686], "#ffe3e3",
//           ["<=", ["get", year], 1372], "#ffc6c6",
//           ["<=", ["get", year], 2744], "#ffaaaa",
//           ["<=", ["get", year], 5488], "#ff8e8e",
//           ["<=", ["get", year], 10976], "#ff7171",
//           ["<=", ["get", year], 21952], "#ff5555",
//           ["<=", ["get", year], 43904], "#ff3939",
//           ["<=", ["get", year], 87808], "#ff1c1c",
//           "#ff0000"
//         ]
//       ]);
//     }


/*******************************************************************
 * ズームレベル表示
 * *************************************************************** */

const updateZoomLevel = () => {
    const zoom = map.getZoom().toFixed(2);
    document.getElementById('zoom-level').innerText = `Zoom: ${zoom}`;
}

map.on('zoom', updateZoomLevel);
updateZoomLevel();

/*******************************************************************
 * メモ機能
 * *************************************************************** */
const draw = new MapboxDraw({
    displayControlsDefault: false,
    controls: {
        point: true,
        line_string: true,
        polygon: true,
        trash: true
    }
});

map.addControl(draw);

let selectedFeatureId;

document.getElementById('save-note-btn').addEventListener('click', () => {
    const noteText = document.getElementById('note-text').value;
    if (selectedFeatureId) {
        draw.setFeatureProperty(selectedFeatureId, 'note', noteText);

        console.log(`Feature ID: ${selectedFeatureId}, Note: ${noteText}`);

        document.getElementById('note-form').style.display = 'none';
        alert('メモが保存されました');
    }
});

map.on('draw.create', function (e) {
    const feature = e.features[0];
    if (feature.geometry.type === 'Point') {
        selectedFeatureId = feature.id;
        console.log(`Created Feature ID: ${selectedFeatureId}`);
        document.getElementById('note-form').style.display = 'block';
    }
});

map.on('draw.update', function (e) {
    const feature = e.features[0];
    if (feature.geometry.type === 'Point') {
        selectedFeatureId = feature.id;
        console.log(`Updated Feature ID: ${selectedFeatureId}`);
        document.getElementById('note-form').style.display = 'block';
    }
});


map.on('click', (e) => {
    // console.log(`クリック位置: 緯度 ${e.lngLat.lat}, 経度 ${e.lngLat.lng}`);
    // console.log(`クリック位置 (ピクセル): X ${e.point.x}, Y ${e.point.y}`);

    const features = draw.getAll().features.filter(feature => feature.geometry.type === 'Point');
    if (features.length > 0) {
        const nearestFeature = features.reduce((nearest, feature) => {
            const distance = turf.distance(
                turf.point(feature.geometry.coordinates),
                turf.point([e.lngLat.lng, e.lngLat.lat])
            );
            return distance < nearest.distance ? { feature, distance } : nearest;
        }, { 
            feature: null, distance: Infinity 
        });

        if (nearestFeature.feature) {
            const note = nearestFeature.feature.properties.note || '  ';
            console.log(`Clicked Feature ID: ${nearestFeature.feature.id}, Note: ${note}`);

            const coords = nearestFeature.feature.geometry.coordinates;
            const point = map.project(coords); // ポイントフィーチャーの位置に表示

            document.getElementById('note-content').innerText = note;
            const noteDisplay = document.getElementById('note-display');
            noteDisplay.style.display = 'block';
            noteDisplay.style.position = 'absolute';
            noteDisplay.style.left = `${point.x + 10}px`; // ポイントフィーチャーの少し右に表示
            noteDisplay.style.top = `${point.y - 10}px`; // ポイントフィーチャーの少し上に表示
        } else {
            console.log('No point feature found at clicked point');
            document.getElementById('note-display').style.display = 'none';
        }
    } else {
        console.log('No feature found at clicked point');
        document.getElementById('note-display').style.display = 'none';
    }
});

// メモボックスの表示位置を更新するための関数
function updateNoteDisplayPosition(lngLat) {
    const noteDisplay = document.getElementById('note-display');
    const point = map.project(lngLat);
    noteDisplay.style.left = `${point.x + 10}px`; // ポイントフィーチャーの少し右に表示
    noteDisplay.style.top = `${point.y - 10}px`; // ポイントフィーチャーの少し上に表示
}

let noteLngLat = null; // メモボックスの地理座標を保存する変数

map.on('zoom', () => {
    if (noteLngLat) {
        updateNoteDisplayPosition(noteLngLat);
    }
});

map.on('move', () => {
    if (noteLngLat) {
        updateNoteDisplayPosition(noteLngLat);
    }
});

// 例: ポイントクリック時にメモボックスを表示し、位置を保存する
map.on('click', handleMapClick);
map.on('touchend', handleMapClick);

function handleMapClick(e) {
    const features = draw.getAll().features.filter(feature => feature.geometry.type === 'Point');
    if (features.length > 0) {
        const nearestFeature = features.reduce((nearest, feature) => {
            const distance = turf.distance(
                turf.point(feature.geometry.coordinates),
                turf.point([e.lngLat.lng, e.lngLat.lat])
            );
            return distance < nearest.distance ? { feature, distance } : nearest;
        }, { feature: null, distance: Infinity });

        if (nearestFeature.feature) {
            noteLngLat = nearestFeature.feature.geometry.coordinates;
            updateNoteDisplayPosition(noteLngLat);
            const note = nearestFeature.feature.properties.note || ' ';
            document.getElementById('note-content').innerText = note;
            document.getElementById('note-display').style.display = 'block';
        } else {
            document.getElementById('note-display').style.display = 'none';
        }
    } else {
        document.getElementById('note-display').style.display = 'none';
    }
}

