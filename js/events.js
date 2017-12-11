// HTML Elements
var video = document.getElementById("bgVideo");
var videoContainer = document.querySelector(".fullscreen-bg");
var levelSelection = document.getElementById("level_selection");
var pause = document.getElementById("in-game-play");
var HUD = document.getElementById("HUD");
var healthHUD = document.getElementById("health_img");
var modal = document.getElementById('myModal');
var config = document.getElementById("config");
var mute = document.getElementById("mute");
var sound = document.getElementById("sound-box");
var muteBox = document.getElementById("mute-box");
var soundBox = document.getElementById("sound-box");
var volume = document.getElementById("volume");
var close = document.getElementById("close");
var backgroundAudio = document.getElementById("background-music");
var statsCheck = document.getElementById("statscheck");
var minimapCheck = document.getElementById("minimapcheck");
var howToPlay = document.getElementById("how_to_play");
var instructions = document.getElementById("instructions");
var next = document.getElementById("next");
var levels = document.getElementById("levels");

// Events
video.oncanplay = function () {
    videoContainer.style.display = "block";
};

window.addEventListener("keydown", function (event) {

    if (!isOnGame || gameOver)
        return false;

    var key = event.keyCode;
    // console.log(key);

    if (isPause) {
        if (key == 13) {
            pause.style.display = "none";
            isPause = false;
            return false;
        }
        else {
            return false;
        }
    }

    switch (key) {
        case 87: // 'w'
            character.moveForward();
            break;
        case 83: // 's'
            character.moveBackward();
            break;
        case 65: // 'a'
            character.moveLeft();
            break;
        case 68: // 'd'
            character.moveRight();
            break;
        case 38: // up arrow
            character.moveForward();
            break;
        case 40: // down arrow
            character.moveBackward();
            break;
        // rotate(n) // n > 0 ? rotateRight : rotateLeft
        case 37: // left arrow
            character.rotate(-1);
            break;
        case 39: // right arrow
            character.rotate(1);
            break;
        case 13: // enter
            pause.style.display = "block";
            isPause = true;
            break;
    }
});

window.addEventListener('resize', function () {
    if (isOnGame) {
        character.camera.resize();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
}, false);

window.addEventListener('load', function () {

    initScene();

    //config.style.display = "block";
    backgroundAudio.volume = 0.5;

    
    howToPlay.addEventListener('click', function (e) {
        instructions.style.display = "block";
    });

    document.querySelector("#play_play").addEventListener("click", function () {
        var name = document.querySelector(".play_box input").value;
        player.name = name;
        player.isLogged = false;
        document.querySelector("#main_menu").style.display = "none";
        document.querySelector("h1").style.display = "block";
        levelSelection.classList.remove("hidden");
        var nameHTML = document.querySelector("#nameHTML");
        nameHTML.innerHTML = "Let's play " + player.name;
    });

    mute.addEventListener('click', function (e) {
        muteBox.style.display = "none";
        soundBox.style.display = "block";
        backgroundAudio.play();
    });

    sound.addEventListener('click', function (e) {
        muteBox.style.display = "block";
        soundBox.style.display = "none";
        backgroundAudio.pause();
        backgroundAudio.currentTime = 0;
    });

    pause.addEventListener('click', function (e) {
        if (isPause) {
            pause.style.display = "none";
            isPause = false;
        } else {
            pause.style.display = "block";
            isPause = true;
        }
    });

    statsCheck.addEventListener('click', function (e) {
        var statsDOM = document.getElementById('stats');

        if (statsCheck.checked) {
            statsDOM.classList.remove("hidden");
        } else {
            statsDOM.classList.add("hidden");
        }
    });

    minimapCheck.addEventListener('click', function (e) {
        var minimapDOM = document.getElementById('minimapa');

        if (minimapCheck.checked) {
            minimapDOM.classList.remove("hidden");
        } else {
            minimapDOM.classList.add("hidden");
        }
    });

    next.addEventListener('click', function (e) {
        if (currentLevel < 6)
            currentLevel++;

        isOnLevelSelection = true;
        document.querySelector("#gameover").style.display = "none";
        var minimap = document.querySelector("#minimapa");
        minimap.parentNode.removeChild(minimap);
        loadLevel(currentLevel);
    });

    levels.addEventListener('click', function (e) {
        isOnLevelSelection = true;
        document.querySelector("#gameover").style.display = "none";
        document.querySelector("h1").style.display = "block";
        levelSelection.classList.remove("hidden");
        var minimap = document.querySelector("#minimapa");
        minimap.parentNode.removeChild(minimap);
    });

    config.addEventListener('click', function (e) {
        modal.style.display = "block";
        isPause = true;
    });

    function valueChange() {
        backgroundAudio.volume = volume.value / 100;
    }

    volume.addEventListener('input', function (e) {
        valueChange();
    });
    volume.addEventListener('input', function (e) {
        valueChange();
    });

    close.addEventListener('click', function (e) {
        modal.style.display = "none";
        isPause = false;
    });
});

window.addEventListener('click', function () {
    if (event.target == modal) {
        modal.style.display = "none";
        pause.style.display = "none";
        isPause = false;
    }
});