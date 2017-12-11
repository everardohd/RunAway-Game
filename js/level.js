function loadLevel(levelNumber) {
    var canvas = document.createElement('canvas');
    var minimapCanvas = document.createElement('canvas');
    minimapCtx = minimapCanvas.getContext("2d");
    minimapCtx.mozImageSmoothingEnabled = false;
    minimapCtx.webkitImageSmoothingEnabled = false;
    minimapCtx.msImageSmoothingEnabled = false;
    minimapCtx.imageSmoothingEnabled = false;

    var ctx = canvas.getContext("2d");
    var img = new Image();
    img.onload = function () {
        minimapImageData = minimapCtx.createImageData(img.width, img.height);
        minimapCanvas.id = "minimapa";
        minimapCanvas.width = img.width;
        minimapCanvas.height = img.height;
        document.body.appendChild(minimapCanvas);
        healthHUD.style.display = "block";
        healthHUD.style.width = "100%";
        createLevel(ctx, img);
    };
    img.src = "img/levels/level" + levelNumber + ".bmp";
}

function createLevel(ctx, img) {
    scene = new THREE.Scene();
    // Lights
    var ambientLight = new THREE.AmbientLight(new THREE.Color(1, 1, 1), 1.0);
    scene.add(ambientLight);

    var directionalLight = new THREE.DirectionalLight(new THREE.Color(1, 1, 0), 0.1);
    directionalLight.position.set(0, 0, 1);
    scene.add(directionalLight);

    monsters = [];
    pixels = new Array();

    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;

    ctx.drawImage(img, 0, 0);
    var height = img.height;
    var width = img.width;
    var imgData = ctx.getImageData(0, 0, height, width);

    for (var x = 0; x < width; x++) {
        pixels[x] = new Array();
    }

    for (var z = 0; z < height; z++) {
        for (var x = 0; x < width; x++) {
            var data = ctx.getImageData(x, z, 1, 1).data;
            pixels[x][z] = {
                r: data[0],
                g: data[1],
                b: data[2],
                a: data[3],
                visible: false
            }
        }
    }

    for (var z = 0; z < height; z++) {
        for (var x = 0; x < width; x++) {

            createCube({ x: x, y: 1, z: z });   // roof
            createCube({ x: x, y: -1, z: z });  // floor

            var color = pixels[x][z];
            var hexadecimal = rgbToHex(color.r, color.g, color.b);

            if (hexadecimal != cWall && hexadecimal != cExit)
                searchWalls({ x: x, y: 0, z: z });

            switch (hexadecimal) {
                case cPlayer:
                    initCharacter({ x: x, y: 0, z: z });
                    break;
                case cEnemy:
                    spawnMonster({ x: x, y: 0, z: z });
                    break;
            }
        }
    }


    // Composer
    composer = new THREE.EffectComposer(renderer);

    // PASSES
    var renderPass = new THREE.RenderPass(scene, character.camera);
    composer.addPass(renderPass);

    pass1 = new THREE.ShaderPass(THREE.DamageShader);
    composer.addPass(pass1);
    pass1.renderToScreen = true;

    // Config
    config.style.display = "block";

    // Display canvas
    renderer.domElement.classList.remove("hidden");
    drawScene(0);

    // Reset flags    
    gameOver = false;
    isPause = false;
    thePlayerWon = false;
    isOnLevelSelection = false;
}

function searchWalls(pos) {
    var directions = [
        { x: 0, z: -1 },    // up
        { x: 1, z: 0 },     // right
        { x: 0, z: 1 },     // down
        { x: -1, z: 0 }     // left
    ];

    for (var i = 0; i < 4; i++) {
        var direction = directions[i];
        var color = pixels[pos.x + direction.x][pos.z + direction.z];
        var hexadecimal = rgbToHex(color.r, color.g, color.b);

        // Cambiar por un switch

        switch (hexadecimal) {
            case cWall:
                createWall({ x: pos.x + direction.x, y: 0, z: pos.z + direction.z }, i);
                break;
            case cExit:
                createWall({ x: pos.x + direction.x, y: 0, z: pos.z + direction.z }, i, wallDoorModel);    // agregar modelo de la puerta
                break;
        }
    }
}

function createWall(pos, direction, model) {

    if (model != undefined)
        mesh = model.clone();
    else
        mesh = wallModel.clone();

    switch (direction) {
        case 0:
            mesh.position.x = (pos.x * tileSize);
            mesh.position.y = (pos.y * tileSize) - tileSize / 2;
            mesh.position.z = (pos.z * tileSize) + tileSize / 2;
            scene.add(mesh);
            break;
        case 1:
            mesh.rotation.y = -Math.PI / 2;
            mesh.position.x = (pos.x * tileSize) - tileSize / 2;
            mesh.position.y = (pos.y * tileSize) - tileSize / 2;
            mesh.position.z = (pos.z * tileSize);
            scene.add(mesh);
            break;
        case 2:
            mesh.rotation.y = Math.PI;
            mesh.position.x = (pos.x * tileSize);
            mesh.position.y = (pos.y * tileSize) - tileSize / 2;
            mesh.position.z = (pos.z * tileSize) - tileSize / 2;
            scene.add(mesh);
            break;
        case 3:
            mesh.rotation.y = Math.PI / 2;
            mesh.position.x = (pos.x * tileSize) + tileSize / 2;
            mesh.position.y = (pos.y * tileSize) - tileSize / 2;
            mesh.position.z = (pos.z * tileSize);
            scene.add(mesh);
            break;
    }
}

function createCube(pos) {
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = pos.x * tileSize;
    mesh.position.y = (pos.y * tileSize);
    mesh.position.z = pos.z * tileSize;
    scene.add(mesh);
}

function spawnMonster(pos) {
    var randomNumber = Math.round(Math.random());
    if (randomNumber)
        mesh = fantasma.clone();
    else
        mesh = zombie.clone();

    mesh.position.x = (pos.x * tileSize);
    mesh.position.y = (pos.y * tileSize) - tileSize / 2;
    mesh.position.z = (pos.z * tileSize);
    scene.add(mesh);

    var level = new Object();
    level.pixels = pixels;
    level.tileSize = tileSize;

    var monster = new Monster(mesh, level, { x: pos.x, z: pos.z });
    monsters.push(monster);

    var light = new THREE.PointLight(0xff0000, 1, tileSize * 2);
    light.position.set(
        pos.x * tileSize,
        tileSize * 0.30,
        pos.z * tileSize);

    scene.add(light);
}

function initCharacter(pos) {
    var level = new Object();
    level.pixels = pixels;
    level.tileSize = tileSize;

    character = new Character();
    character.init(level, { x: pos.x, z: pos.z });
}

function loadAssets() {

    texture = new THREE.TextureLoader().load('img/textures/RoofTexture3.png', function (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.offset.set(0, 0);
        texture.repeat.set(2, 2);
    });
    geometry = new THREE.BoxBufferGeometry(tileSize, tileSize, tileSize);
    material = new THREE.MeshLambertMaterial({ map: texture });

    // Cargar modelos
    promises.push(
        loadModel("Pared.json", "WallTexture.png")
            .then(function (model) {
                model.scale.x = 2;
                model.scale.y = 2;
                model.scale.z = 2;
                wallModel = model;
            }, function (response) {
                console.log(response);
            })
    );

    promises.push(
        loadModel("Pared_Door.json", "WallDoorTexture.png")
            .then(function (model) {
                model.scale.x = 2;
                model.scale.y = 2;
                model.scale.z = 2;
                wallDoorModel = model;
            }, function (response) {
                console.log(response);
            })
    );

    promises.push(
        loadModel("Monstruo.json", "MonsterTexture4.png")
            .then(function (model) {
                model.scale.x = 1.8;
                model.scale.y = 1.8;
                model.scale.z = 1.8;
                zombie = model;
            }, function (response) {
                console.log(response);
            })
    );

    promises.push(
        loadModel("Fantasma.json", "FantasmaTexture.png")
            .then(function (model) {
                model.scale.x = 3;
                model.scale.y = 3;
                model.scale.z = 3;
                fantasma = model;
            }, function (response) {
                console.log(response);
            })
    );

    // Una vez que ya se cargaron todos los modelos    
    Promise.all(promises).then(function () {
        console.log("Todo salió bien");

        if (playGame) {
            isOnGame = true;
            video.pause();
            videoContainer.style.display = "none";
            levelSelection.classList.add("hidden");
            HUD.classList.remove("hidden");
            renderer.domElement.classList.remove("hidden");
            loadLevel(currentLevel);
        } else {
            allAssetsLoaded = true;
        }
    }, function (reason) {
        console.log(reason);
    });
}