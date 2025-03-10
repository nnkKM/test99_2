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

// デフォルトの年数をセット
map.on('load', () => {
    updateMapStyle_pop("2020");
    updateMapStyle_popchange("2019");

// 初期状態で特定のレイヤーを非表示に設定
map.setLayoutProperty('popchange-fill-layer', 'visibility', 'none'); 
map.setLayoutProperty('popchange-outline-layer', 'visibility', 'none');

});


/*******************************************************************
 * 属性表示
 * *************************************************************** */

map.on('click', (e) => {
    const features = map.queryRenderedFeatures(e.point);

    if (features.length) {
        const properties = features[0].properties;
        displayFeatureProperties(properties, e.point);
    }
});

function displayFeatureProperties(properties, point) {
    const propertiesDisplay = document.getElementById('properties-display');

    // 属性情報をHTMLに変換
    let propertiesHtml = '<table>';
    for (const key in properties) {
        propertiesHtml += `<tr><td><strong>${key}</strong>:</td><td>${properties[key]}</td></tr>`;
    }
    propertiesHtml += '</table>';

    propertiesDisplay.innerHTML = propertiesHtml;
    propertiesDisplay.style.display = 'block';
    propertiesDisplay.style.left = `${point.x + 10}px`;
    propertiesDisplay.style.top = `${point.y + 10}px`;
}

// 属性情報を非表示にする関数
function hideFeatureProperties() {
    const propertiesDisplay = document.getElementById('properties-display');
    propertiesDisplay.style.display = 'none';
}


// 属性情報表示用のスタイルを追加
const style = document.createElement('style');
style.innerHTML = `
    #properties-display {
        position: absolute;
        background: white;
        padding: 5px;
        border: 1px solid black;
        display: none;
        z-index: 1000;
        max-width: 200px;
        max-height: 200px;
        overflow-y: auto;
        font-size: 10px;
    }
    #properties-display table {
        width: 100%;
        border-collapse: collapse;
    }
    #properties-display td {
        padding: 2px 5px;
        word-break: break-all;
    }
    #properties-display tr:nth-child(even) {
        background-color: #f2f2f2;
    }
`;
document.head.appendChild(style);

// 属性情報表示用の要素を追加
const propertiesDisplay = document.createElement('div');
propertiesDisplay.id = 'properties-display';
document.body.appendChild(propertiesDisplay);

// 右クリックイベントを追加して属性情報を非表示にする
map.on('contextmenu', (e) => {
    hideFeatureProperties();
});


/*******************************************************************
 * レイヤON/OFF
 * *************************************************************** */
// 人口データ以外のレイヤ設定はjsonのレイヤIDをここに加える
const layerIds = [
    'osm-layer',
    'PublicTransport-points-layer'
];


// 人口データのレイヤはここで切替
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

document.querySelector('#popchange-all-fill-layer-chk').addEventListener('change', () => {
    const isChecked = document.getElementById('popchange-all-fill-layer-chk').checked;
    const fillLayerIds = ['popchange-fill-layer', 'popchange-outline-layer'];
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

/////////////////   スライダーバーの設定　　//////////////////
// 現在の年を保存する変数
let currentYear = 2001;

// スライドバーの要素を取得
const yearSliderPop = document.getElementById('year-slider-pop');
const yearValuePop = document.getElementById('year-value-pop');
const yearSliderpopchange = document.getElementById('year-slider-popchange');
const yearValuepopchange = document.getElementById('year-value-popchange');


// スライドバーが変更されたときのイベント
yearSliderPop.addEventListener('input', (event) => {
    const selectedYear = event.target.value;
    yearValuePop.textContent = selectedYear;    // 今何年選んでいるかの表示
    updateMapStyle_pop(selectedYear);           // 色の設定の関数を実行
});

yearSliderpopchange.addEventListener('input', (event) => {
    const selectedYear = event.target.value;
    yearValuepopchange.textContent = selectedYear;
    updateMapStyle_popchange(selectedYear);
});



/////////////////   色の設定　　//////////////////
// 数字 = aSmallpop * (n ^ k) (k=1, 2, 3...)
var aSmallpop = [7**5, 7**4, 7**3, 7**2, 7];  // 最初の数
var n = 2;                                  // 何をかけるか

// 色を設定する関数、yearの値によって色が変わる
function updateMapStyle_pop(year) {
    if (map.getLayer('population-fill-layer')) {
        map.setPaintProperty('population-fill-layer', 'fill-color', [
            "step",
            ["zoom"],
            [
                "case",
                ["<=", ["get", year], aSmallpop[0]]     , "rgb(255, 255, 255)",
                ["<=", ["get", year], aSmallpop[0]*n]   , "rgb(255, 227, 227)",
                ["<=", ["get", year], aSmallpop[0]*n**2], "rgb(255, 198, 198)",
                ["<=", ["get", year], aSmallpop[0]*n**3], "rgb(255, 170, 170)",
                ["<=", ["get", year], aSmallpop[0]*n**4], "rgb(255, 142, 142)",
                ["<=", ["get", year], aSmallpop[0]*n**5], "rgb(255, 113, 113)",
                ["<=", ["get", year], aSmallpop[0]*n**6], "rgb(255, 85, 85)",
                ["<=", ["get", year], aSmallpop[0]*n**7], "rgb(255, 57, 57)",
                ["<=", ["get", year], aSmallpop[0]*n**8], "rgb(255, 28, 28)",
                "rgb(255, 0, 0)"
            ],
            5, [
                "case",
                ["<=", ["get", year], aSmallpop[1]]     , "rgb(255, 255, 255)",
                ["<=", ["get", year], aSmallpop[1]*n]   , "rgb(255, 227, 227)",
                ["<=", ["get", year], aSmallpop[1]*n**2], "rgb(255, 198, 198)",
                ["<=", ["get", year], aSmallpop[1]*n**3], "rgb(255, 170, 170)",
                ["<=", ["get", year], aSmallpop[1]*n**4], "rgb(255, 142, 142)",
                ["<=", ["get", year], aSmallpop[1]*n**5], "rgb(255, 113, 113)",
                ["<=", ["get", year], aSmallpop[1]*n**6], "rgb(255, 85, 85)",
                ["<=", ["get", year], aSmallpop[1]*n**7], "rgb(255, 57, 57)",
                ["<=", ["get", year], aSmallpop[1]*n**8], "rgb(255, 28, 28)",
                "rgb(255, 0, 0)"
            ],
            8, [
                "case",
                ["<=", ["get", year], aSmallpop[2]]     , "rgb(255, 255, 255)",
                ["<=", ["get", year], aSmallpop[2]*n]   , "rgb(255, 227, 227)",
                ["<=", ["get", year], aSmallpop[2]*n**2], "rgb(255, 198, 198)",
                ["<=", ["get", year], aSmallpop[2]*n**3], "rgb(255, 170, 170)",
                ["<=", ["get", year], aSmallpop[2]*n**4], "rgb(255, 142, 142)",
                ["<=", ["get", year], aSmallpop[2]*n**5], "rgb(255, 113, 113)",
                ["<=", ["get", year], aSmallpop[2]*n**6], "rgb(255, 85, 85)",
                ["<=", ["get", year], aSmallpop[2]*n**7], "rgb(255, 57, 57)",
                ["<=", ["get", year], aSmallpop[2]*n**8], "rgb(255, 28, 28)",
                "rgb(255, 0, 0)"
            ],
            10, [
                "case",
                ["<=", ["get", year], aSmallpop[3]]     , "rgb(255, 255, 255)",
                ["<=", ["get", year], aSmallpop[3]*n]   , "rgb(255, 227, 227)",
                ["<=", ["get", year], aSmallpop[3]*n**2], "rgb(255, 198, 198)",
                ["<=", ["get", year], aSmallpop[3]*n**3], "rgb(255, 170, 170)",
                ["<=", ["get", year], aSmallpop[3]*n**4], "rgb(255, 142, 142)",
                ["<=", ["get", year], aSmallpop[3]*n**5], "rgb(255, 113, 113)",
                ["<=", ["get", year], aSmallpop[3]*n**6], "rgb(255, 85, 85)",
                ["<=", ["get", year], aSmallpop[3]*n**7], "rgb(255, 57, 57)",
                ["<=", ["get", year], aSmallpop[3]*n**8], "rgb(255, 28, 28)",
                "rgb(255, 0, 0)"
            ],
            12, [
                "case",
                ["<=", ["get", year], aSmallpop[4]]     , "rgb(255, 255, 255)",
                ["<=", ["get", year], aSmallpop[4]*n]   , "rgb(255, 227, 227)",
                ["<=", ["get", year], aSmallpop[4]*n**2], "rgb(255, 198, 198)",
                ["<=", ["get", year], aSmallpop[4]*n**3], "rgb(255, 170, 170)",
                ["<=", ["get", year], aSmallpop[4]*n**4], "rgb(255, 142, 142)",
                ["<=", ["get", year], aSmallpop[4]*n**5], "rgb(255, 113, 113)",
                ["<=", ["get", year], aSmallpop[4]*n**6], "rgb(255, 85, 85)",
                ["<=", ["get", year], aSmallpop[4]*n**7], "rgb(255, 57, 57)",
                ["<=", ["get", year], aSmallpop[4]*n**8], "rgb(255, 28, 28)",
                "rgb(255, 0, 0)"
            ]
        ]);
    }
}

                   // 色を設定する関数、yearの値によって色が変わる
                   function updateMapStyle_popchange(year) {
                       if (map.getLayer('popchange-fill-layer')) {
                           map.setPaintProperty('popchange-fill-layer', 'fill-color', color_popchange(year));  // 具体的な色の指定はcolor_popchangeでしている
                       }
                   }
//
//
//                  // ズーム係数を計算する関数
//                   const calculateZoomCoefficient = () => {
//                       var zoom = map.getZoom().toFixed(2);
//                       var zoomcoef = 1;
//                       if (zoom < 5) {
//                           zoomcoef = zoomcoef * 7 ** 4;
//                       } else if (zoom < 8) {
//                           zoomcoef = zoomcoef * 7 ** 3;
//                       } else if (zoom < 10) {
//                           zoomcoef = zoomcoef * 7 ** 2;
//                       } else if (zoom < 12) {
//                           zoomcoef = zoomcoef * 7;
//                       } else {
//                           zoomcoef = zoomcoef * 1;
//                       }
//                       return zoomcoef;
//                   }
//                   
//                   
//                   // 色の指定をしている関数、上の関数でyにはyearの値を入れる
//                   const color_popchange = (y) => {
//                       var zoomcoef = calculateZoomCoefficient();
//                       console.log('Zoom Coefficient in function:', zoomcoef);
//                   
//                        // 色のパターンを設定
//                        return [
//                            "step",
//                            ["-", ["get", String(2020)], ["get", String(y)]], // 2020年との人口の値の差   
//                                                "rgb(0, 0, 255)",
//                                 -50 * zoomcoef,"rgb(51, 102, 255)",
//                                 -40 * zoomcoef,"rgb(102, 153, 255)",
//                                 -30 * zoomcoef,"rgb(153, 204, 255)",
//                                 -20 * zoomcoef,"rgb(204, 229, 255)",
//                                 -10 * zoomcoef,"rgb(255, 255, 255)",
//                                  10 * zoomcoef,"rgb(255, 204, 204)",
//                                  20 * zoomcoef,"rgb(255, 153, 153)",
//                                  30 * zoomcoef,"rgb(255, 102, 102)",
//                                  40 * zoomcoef,"rgb(255, 51, 51)",
//                                  50 * zoomcoef,"rgb(255, 0, 0)" 
//                        ];
//                    }
//                    
//                 map.on('zoomend', function() {
//                     const zoom = map.getZoom().toFixed(2);
//                     console.log('Zoom Level after change:', zoom);
//                     const zoomcoef = calculateZoomCoefficient();
//                     console.log('Zoom Coefficient:', zoomcoef);
//                     const selectedYear = document.getElementById('year-slider-popchange').value;
//                     updateMapStyle_popchange(selectedYear);
//                 });
//                  
//                  
//    console.log(zoomcoef);
//    // 色のパターンを設定
//    return [
//    　// 人口が1未満の時は灰色（消すとやっぱりなぜかエラー出る）
//        "interpolate-hcl",  // グラデーションを自動で付けるものらしい
//        ["linear"],  // グラデーションを自動で付けるものらしい
//        ["-", ["get", String(2020)], ["get", String(y)]], // 2020年との人口の値の差   
//        -10000000 / zoomcoef, "rgb(0, 0, 255)",
//        -1000000 / zoomcoef, "rgb(60, 60, 255)",
//        -100000 / zoomcoef, "rgb(120, 120, 255)",
//        -10000 / zoomcoef,"rgb(180, 180, 255)",
//        0, "rgb(255, 255, 255)",
//        10000 / zoomcoef, "rgb(255, 180, 180)",
//        100000 / zoomcoef, "rgb(255, 120, 120)",
//        1000000 / zoomcoef, "rgb(255, 60, 60)",
//        10000000 / zoomcoef, "rgb(255, 0, 0)",
//        100000000 / zoomcoef, "rgb(200, 0, 80)"
//    ]
//  }





/////////////////   色の設定　　//////////////////
// 数字 = m * bstep * k (k=....-3,-2,-1,1, 2, 3...)
var m =  [7**5, 7**4, 7**3, 7**2, 7];         // 何をかけるか
var bstep =  1;                     //　ベースステップ

     const color_popchange = (y) => {
       return [
           "step",
           ["zoom"],
           [
               "step",
               ["-", ["get", String(2020)], ["get", String(y)]],
                     "rgb(0, 0, 255)", 
             -5* bstep * m[0],"rgb(51, 102, 255)", 
             -4* bstep * m[0],"rgb(102, 153, 255)",
             -3* bstep * m[0],"rgb(153, 204, 255)",
             -2* bstep * m[0],"rgb(204, 229, 255)",
             -1* bstep * m[0],"rgb(255, 255, 255)",
              1* bstep * m[0],"rgb(255, 204, 204)",
              2* bstep * m[0],"rgb(255, 153, 153)",
              3* bstep * m[0],"rgb(255, 102, 102)",
              4* bstep * m[0],"rgb(255, 51, 51)",
              5* bstep * m[0],"rgb(255, 0, 0)"
           ],
           5,[
               "step",
               ["-", ["get", String(2020)], ["get", String(y)]],
                     "rgb(0, 0, 255)", 
             -5* bstep * m[1],"rgb(51, 102, 255)", 
             -4* bstep * m[1],"rgb(102, 153, 255)",
             -3* bstep * m[1],"rgb(153, 204, 255)",
             -2* bstep * m[1],"rgb(204, 229, 255)",
             -1* bstep * m[1],"rgb(255, 255, 255)",
              1* bstep * m[1],"rgb(255, 204, 204)",
              2* bstep * m[1],"rgb(255, 153, 153)",
              3* bstep * m[1],"rgb(255, 102, 102)",
              4* bstep * m[1],"rgb(255, 51, 51)",
              5* bstep * m[1],"rgb(255, 0, 0)"
           ],
           8,[
               "step",
               ["-", ["get", String(2020)], ["get", String(y)]],
                     "rgb(0, 0, 255)", 
             -5* bstep * m[2],"rgb(51, 102, 255)", 
             -4* bstep * m[2],"rgb(102, 153, 255)",
             -3* bstep * m[2],"rgb(153, 204, 255)",
             -2* bstep * m[2],"rgb(204, 229, 255)",
             -1* bstep * m[2],"rgb(255, 255, 255)",
              1* bstep * m[2],"rgb(255, 204, 204)",
              2* bstep * m[2],"rgb(255, 153, 153)",
              3* bstep * m[2],"rgb(255, 102, 102)",
              4* bstep * m[2],"rgb(255, 51, 51)",
              5* bstep * m[2],"rgb(255, 0, 0)"
           ],
           10, [
               "step",
               ["-", ["get", String(2020)], ["get", String(y)]],
                    "rgb(0, 0, 255)", 
             -5* bstep * m[3],"rgb(51, 102, 255)", 
             -4* bstep * m[3],"rgb(102, 153, 255)",
             -3* bstep * m[3],"rgb(153, 204, 255)",
             -2* bstep * m[3],"rgb(204, 229, 255)",
             -1* bstep * m[3],"rgb(255, 255, 255)",
              1* bstep * m[3],"rgb(255, 204, 204)",
              2* bstep * m[3],"rgb(255, 153, 153)",
              3* bstep * m[3],"rgb(255, 102, 102)",
              4* bstep * m[3],"rgb(255, 51, 51)",  
              5* bstep * m[3],"rgb(255, 0, 0)" 
           ],
           12, [
               "step",
               ["-", ["get", String(2020)], ["get", String(y)]],
                   "rgb(0, 0, 255)",
              -5* bstep * m[4],"rgb(51, 102, 255)",
              -4* bstep * m[4],"rgb(102, 153, 255)",
              -3* bstep * m[4],"rgb(153, 204, 255)",
              -2* bstep * m[4],"rgb(204, 229, 255)",
              -1* bstep * m[4],"rgb(255, 255, 255)",
               1* bstep * m[4],"rgb(255, 204, 204)",
               2* bstep * m[4],"rgb(255, 153, 153)",
               3* bstep * m[4],"rgb(255, 102, 102)",
               4* bstep * m[4],"rgb(255, 51, 51)",
               5* bstep * m[4],"rgb(255, 0, 0)" 
           ]
       ];
   }
//
//  
// 参考：藤村さん作成色作成関数
// const opacity = (y) => {
//   return ["min", 1.0, ["/", ["log10", ["+", 1, ["get", String(y)]]], 5.0]]
// }
// const color_pgr = (y) => {
//   return ["case",
//     ["any", ["<", ["get", String(y)], 500], ["<", ["get", String(y - 1)], 500]],
//     "#888888",
//     [
//       "interpolate-hcl",
//       ["linear"],
//       ["-", ["ln", ["get", String(y)]], ["ln", ["get", String(y - 1)]]],
//       -0.2, "rgb(39,42,149)",
//       -0.15, "rgb(39,42,197)",
//       -0.1, "rgb(39,42,246)",
//       -0.05,"rgb(141,144,249)",
//       0, "rgb(243,246,255)",
//       0.05, "rgb(243,246,117)",
//       0.1, "rgb(230,151,92)",
//       0.15, "rgb(226,83,79)",
//       0.2, "rgb(226,83,153)",
//       0.25, "rgb(226,83,249)"
//     ]
//   ]
// }



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
 * スケール表示
 * *************************************************************** */
const scale = new maplibregl.ScaleControl({
    maxWidth: 80,
    unit: 'metric'
});
map.addControl(scale, 'bottom-right');



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
