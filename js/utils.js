Number.prototype.toDegrees = function () {
    return this * (180 / Math.PI);
}

Number.prototype.toRadians = function () {
    return this * (Math.PI / 180);
}

function getWorldPosition(mapPosition, tileSize) {
    var worldPosition = {
        x: mapPosition.x * tileSize,
        z: mapPosition.z * tileSize
    };
    return worldPosition;
}

function getMapPosition(worldPosition, tileSize) {
    var mapPosition = {
        x: worldPosition.x / tileSize,
        z: worldPosition.z / tileSize
    };
    return mapPosition;
}

function request(method, url, data) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status < 400) {
                resolve(xhr.response);
            } else {
                reject({ status: this.status, statusText: xhr.statusText });
            }
        };
        xhr.onerror = function () {
            reject({ status: this.status, statusText: xhr.statusText });
        };
        if (data != undefined)
            xhr.send(data);
        else
            xhr.send();
    });
}

function loadModel(modelPath, texturePath) {
    return new Promise(function (resolve, reject) {
        new THREE.TextureLoader().load('img/textures/' + texturePath,
            function (texture) {
                new THREE.JSONLoader().load('models/' + modelPath,
                    function (geometry, materials) {
                        var material = new THREE.MeshLambertMaterial({ map: texture });
                        var model = new THREE.Mesh(geometry, material);
                        resolve(model);
                    },
                    function onProgress() { },
                    function onError() { reject("Error loading model"); }
                );
            },
            function onProgress() { },
            function onError(error) { reject("Error loading texture"); }
        );
    });
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function changeColor(object, r, g, b) {
    object.r = r;
    object.g = g;
    object.b = b;
}

function lerp(min, max, fraction) {
    return (max - min) * fraction + min;
}