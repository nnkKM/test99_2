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

// 最初に2020年をセット
map.on('load', () => {
    updateMapStyle_pop("2020");
    updateMapStyle_pgr("2020");
    updateMapStyle_pgr2("2020");
});


/*******************************************************************
 * レイヤON/OFF
 * *************************************************************** */

const layerIds = [
    'osm-layer',
    'PublicTransport-points-layer'
];

document.querySelector('#population-all-fill-layer-chk').addEventListener('change', () => {
    const isChecked = document.getElementById('population-all-fill-layer-chk').checked;
    const fillLayerIds = ['population-fill-layer', 'population-outline-layer'];
    fillLayerIds.forEach(id => {
        if (isChecked) {
            map.setLayoutProperty(id, 'visibility', 'visible');
        } else {
            map.setLayoutProperty(id, 'visibility', 'none');
        }
    });
});

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

document.querySelector('#pgr2-all-fill-layer-chk').addEventListener('change', () => {
    const isChecked = document.getElementById('pgr2-all-fill-layer-chk').checked;
    const fillLayerIds = ['pgr2-fill-layer', 'pgr2-outline-layer'];
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


// 現在の年を保存する変数
let currentYear = 2001;

// スライドバーの要素を取得
const yearSlider = document.getElementById('year-slider');
const yearValue = document.getElementById('year-value');

// スライドバーが変更されたときのイベントリスナーを追加
yearSlider.addEventListener('input', (event) => {
    const selectedYear = event.target.value;
    yearValue.textContent = selectedYear;
    updateMapStyle_pop(selectedYear);
    updateMapStyle_pgr(selectedYear);
    updateMapStyle_pgr2(selectedYear);
});

// 数字 = aSmallpop * (n ^ k) (k=1, 2, 3...)
var aSmallpop = [16801, 2401, 343, 49, 7];  // 最初の数
var n = 2;                                  // 何をかけるか
// // 色を生成する関数
// function generateColors(base, multiplier, steps, year) {
//     let colors = [];
//     for (let i = 0; i < steps; i++) {
//         let value = base * Math.pow(multiplier, i);
//         let color = `rgb(${255 - (i * 28)}, ${255 - (i * 28)}, ${255 - (i * 28)})`;
//         colors.push([["<=", ["get", year], value], color]);
//     }
//     colors.push("rgb(255, 0, 0)");  // 最後の色
//     return colors;
// }

// // スタイルを動的に更新する関数
// function updateMapStyle_pop(year) {
//     if (map.getLayer('population-fill-layer')) {
//         let expressions = [3, 4.1, 8, 10, 12].map((zoom, index) => {
//             return [zoom, ["case", ...generateColors(aSmallpop[index], n, 9, year).flat()]];
//         });

//         map.setPaintProperty('population-fill-layer', 'fill-color', [
//             "step",
//             ["zoom"],
//             ...expressions.flat()
//         ]);
//     }
// }
// スタイルを動的に更新する関数
function updateMapStyle_pop(year) {
    if (map.getLayer('population-fill-layer')) {
        map.setPaintProperty('population-fill-layer', 'fill-color', [
            "step",
            ["zoom"],
            [
                "case",
                ["<=", ["get", year],   aSmallpop[0]], "rgb(255, 255, 255)",
                ["<=", ["get", year],   aSmallpop[0]*n], "rgb(255, 227, 227)",
                ["<=", ["get", year],   aSmallpop[0]*n*n], "rgb(255, 198, 198)",
                ["<=", ["get", year],  aSmallpop[0]*n*n*n], "rgb(255, 170, 170)",
                ["<=", ["get", year],  aSmallpop[0]*n*n*n*n], "rgb(255, 142, 142)",
                ["<=", ["get", year],  aSmallpop[0]*n*n*n*n*n], "rgb(255, 113, 113)",
                ["<=", ["get", year], aSmallpop[0]*n*n*n*n*n*n], "rgb(255, 85, 85)",
                ["<=", ["get", year], aSmallpop[0]*n*n*n*n*n*n*n], "rgb(255, 57, 57)",
                ["<=", ["get", year], aSmallpop[0]*n*n*n*n*n*n*n*n], "rgb(255, 28, 28)",
                "rgb(255, 0, 0)"
            ],
            4.1, [
                "case",
                ["<=", ["get", year],   aSmallpop[1]], "rgb(255, 255, 255)",
                ["<=", ["get", year],   aSmallpop[1]*n], "rgb(255, 227, 227)",
                ["<=", ["get", year],   aSmallpop[1]*n*n], "rgb(255, 198, 198)",
                ["<=", ["get", year],  aSmallpop[1]*n*n*n], "rgb(255, 170, 170)",
                ["<=", ["get", year],  aSmallpop[1]*n*n*n*n], "rgb(255, 142, 142)",
                ["<=", ["get", year],  aSmallpop[1]*n*n*n*n*n], "rgb(255, 113, 113)",
                ["<=", ["get", year], aSmallpop[1]*n*n*n*n*n*n], "rgb(255, 85, 85)",
                ["<=", ["get", year], aSmallpop[1]*n*n*n*n*n*n*n], "rgb(255, 57, 57)",
                ["<=", ["get", year], aSmallpop[1]*n*n*n*n*n*n*n*n], "rgb(255, 28, 28)",
                "rgb(255, 0, 0)"
            ],
            8, [
                "case",
                ["<=", ["get", year],   aSmallpop[2]], "rgb(255, 255, 255)",
                ["<=", ["get", year],   aSmallpop[2]*n], "rgb(255, 227, 227)",
                ["<=", ["get", year],   aSmallpop[2]*n*n], "rgb(255, 198, 198)",
                ["<=", ["get", year],  aSmallpop[2]*n*n*n], "rgb(255, 170, 170)",
                ["<=", ["get", year],  aSmallpop[2]*n*n*n*n], "rgb(255, 142, 142)",
                ["<=", ["get", year],  aSmallpop[2]*n*n*n*n*n], "rgb(255, 113, 113)",
                ["<=", ["get", year], aSmallpop[2]*n*n*n*n*n*n], "rgb(255, 85, 85)",
                ["<=", ["get", year], aSmallpop[2]*n*n*n*n*n*n*n], "rgb(255, 57, 57)",
                ["<=", ["get", year], aSmallpop[2]*n*n*n*n*n*n*n*n], "rgb(255, 28, 28)",
                "rgb(255, 0, 0)"
            ],
            10, [
                "case",
                ["<=", ["get", year],   aSmallpop[3]], "rgb(255, 255, 255)",
                ["<=", ["get", year],   aSmallpop[3]*n], "rgb(255, 227, 227)",
                ["<=", ["get", year],   aSmallpop[3]*n*n], "rgb(255, 198, 198)",
                ["<=", ["get", year],  aSmallpop[3]*n*n*n], "rgb(255, 170, 170)",
                ["<=", ["get", year],  aSmallpop[3]*n*n*n*n], "rgb(255, 142, 142)",
                ["<=", ["get", year],  aSmallpop[3]*n*n*n*n*n], "rgb(255, 113, 113)",
                ["<=", ["get", year], aSmallpop[3]*n*n*n*n*n*n], "rgb(255, 85, 85)",
                ["<=", ["get", year], aSmallpop[3]*n*n*n*n*n*n*n], "rgb(255, 57, 57)",
                ["<=", ["get", year], aSmallpop[3]*n*n*n*n*n*n*n*n], "rgb(255, 28, 28)",
                "rgb(255, 0, 0)"
            ],
            12, [
                "case",
                ["<=", ["get", year],   aSmallpop[4]], "rgb(255, 255, 255)",
                ["<=", ["get", year],   aSmallpop[4]*n], "rgb(255, 227, 227)",
                ["<=", ["get", year],   aSmallpop[4]*n*n], "rgb(255, 198, 198)",
                ["<=", ["get", year],  aSmallpop[4]*n*n*n], "rgb(255, 170, 170)",
                ["<=", ["get", year],  aSmallpop[4]*n*n*n*n], "rgb(255, 142, 142)",
                ["<=", ["get", year],  aSmallpop[4]*n*n*n*n*n], "rgb(255, 113, 113)",
                ["<=", ["get", year], aSmallpop[4]*n*n*n*n*n*n], "rgb(255, 85, 85)",
                ["<=", ["get", year], aSmallpop[4]*n*n*n*n*n*n*n], "rgb(255, 57, 57)",
                ["<=", ["get", year], aSmallpop[4]*n*n*n*n*n*n*n*n], "rgb(255, 28, 28)",
                "rgb(255, 0, 0)"
            ]
        ]);
    }
}

function updateMapStyle_pgr(year) {
    if (map.getLayer('pgr-fill-layer')) {
        map.setPaintProperty('pgr-fill-layer', 'fill-color', color_pgr(year));
    }
}
function updateMapStyle_pgr2(year) {
    if (map.getLayer('pgr2-fill-layer')) {
        map.setPaintProperty('pgr2-fill-layer', 'fill-color', color_pgr2(year));
    }
}


// 参考：藤村さん作成色作成関数
// const opacity = (y) => {
//   return ["min", 1.0, ["/", ["log10", ["+", 1, ["get", String(y)]]], 5.0]]
// }
const color_pgr = (y) => {
  return ["case",
    ["any", ["<", ["get", String(y)], 500], ["<", ["get", String(y - 1)], 500]],
    "#888888",
    [
      "interpolate-hcl",
      ["linear"],
      ["-", ["ln", ["get", String(y)]], ["ln", ["get", String(y - 1)]]],
      -0.2, "rgb(39,42,149)",
      -0.15, "rgb(39,42,197)",
      -0.1, "rgb(39,42,246)",
      -0.05,"rgb(141,144,249)",
      0, "rgb(243,246,255)",
      0.05, "rgb(243,246,117)",
      0.1, "rgb(230,151,92)",
      0.15, "rgb(226,83,79)",
      0.2, "rgb(226,83,153)",
      0.25, "rgb(226,83,249)"
    ]
  ]
}

const color_pgr2 = (y) => {
    return ["case",
      ["any", ["<", ["get", String(2020)], 500], ["<", ["get", String(y)], 500]],
      "#888888",
      [
        "interpolate-hcl",
        ["linear"],
        ["-", ["ln", ["get", String(2020)]], ["ln", ["get", String(y)]]],
        -0.2, "rgb(39,42,149)",
        -0.15, "rgb(39,42,197)",
        -0.1, "rgb(39,42,246)",
        -0.05,"rgb(141,144,249)",
        0, "rgb(243,246,255)",
        0.05, "rgb(243,246,117)",
        0.1, "rgb(230,151,92)",
        0.15, "rgb(226,83,79)",
        0.2, "rgb(226,83,153)",
        0.25, "rgb(226,83,249)"
      ]
    ]
  }
  


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
    console.log(`クリック位置: 緯度 ${e.lngLat.lat}, 経度 ${e.lngLat.lng}`);
    console.log(`クリック位置 (ピクセル): X ${e.point.x}, Y ${e.point.y}`);

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
