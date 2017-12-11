// ThreeJS Components
var scene, renderer;
var mesh;
var texture;
var geometry;
var material;
var composer;
var renderPass;
var pass1;

// Main character
var character;

// Level box positions
var pixels = null;
var tileSize = 20;
var minimapCtx = null;
var minimapImageData = null;

// Models
var zombie = null;
var fantasma = null;
var monsters = [];
var wallModel = null;
var wallDoorModel = null;
var promises = [];
var characterModel = null;

// Delta time
var deltaTime = 0;
var lastUpdateTime = 0;

// Stats
var stats = null;

// Flags
var isPause = false;
var isOnGame = false;
var allAssetsLoaded = false;
var gameOver = false;
var thePlayerWon = false;
var playGame = false;
var currentLevel = 0;
var isOnLevelSelection = false;

// Player info
var player = new Object();

// Colors
var cWall = "#808080";
var cEnemy = "#ff0000";
var cPlayer = "#ffffff";
var cExit = "#ffff00";

//Threejs setup
function initScene() {
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.classList.add("hidden");
    document.body.appendChild(renderer.domElement);

    // Stats
    stats = new Stats();
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    stats.dom.id = "stats"
    stats.dom.classList.add("hidden");
    document.body.appendChild(stats.dom);

    var ingame = document.querySelectorAll(".ingame");
    for (var i = 0; i < ingame.length; i++) {
        ingame[i].classList.remove("hidden");
    }

    loadAssets();
}

function drawScene(time) {
    time *= 0.001;
    deltaTime = time - lastUpdateTime;
    lastUpdateTime = time;

    stats.begin();                                  // Stats begin
    if (!isPause && !gameOver) {
        character.update();
        monstersUpdate(deltaTime);
        document.getElementById("HUD").style.display = "block";
    } else if (gameOver) {
        document.getElementById("HUD").style.display = "none";

        if (!isOnLevelSelection) {
            document.getElementById("gameover").style.display = "block";
            if (thePlayerWon) {
                ChangeLevelImage();
                document.getElementById("win").style.display = "block";
                document.getElementById("lose").style.display = "none";
            } else {
                healthHUD.style.display = "none";
                document.getElementById("win").style.display = "none";
                document.getElementById("lose").style.display = "block";
            }
        }
    }
    composer.render();
    drawMinimap();
    stats.end();                                    // Stats end

    requestAnimationFrame(drawScene);
}

function ChangeLevelImage() {
    elems = document.querySelectorAll(".img_levels");
    length = elems.length;
    for (var i = 0; i < length; i++) {
        if (elems[i].dataset.index == currentLevel) {
            elems[i].src = "img/levels/level_" + currentLevel + "_d.png";
        }
    }
}

function PlayGame(levelNumber) {
    console.log("level name:");
    console.log(levelNumber);
    currentLevel = levelNumber;

    if (allAssetsLoaded) {
        isOnGame = true;
        video.pause();
        videoContainer.style.display = "none";
        levelSelection.classList.add("hidden");
        HUD.classList.remove("hidden");
        renderer.domElement.classList.remove("hidden");
        loadLevel(levelNumber);
    } else {
        playGame = true;
    }
}

function monstersUpdate(time) {
    var length = monsters.length;
    for (var i = 0; i < length; i++) {
        monsters[i].update(time);
    }
}

function drawMinimap() {
    var length = minimapImageData.data.length;
    var pixelsLength = pixels.length;
    var counter = 0;
    var j = 0;

    for (var i = 0; i < length; i += 4) {
        var alpha = 255;

        if (counter == pixelsLength) {
            counter = 0;
            j++;
        }

        var color = pixels[counter][j];
        if (!color.visible) alpha = 0;

        minimapImageData.data[i] = color.r;
        minimapImageData.data[i + 1] = color.g;
        minimapImageData.data[i + 2] = color.b;
        minimapImageData.data[i + 3] = alpha;

        counter++;
    }

    minimapCtx.putImageData(minimapImageData, 0, 0);
}