function Character() {

    var camera = new Camera(); // ThreeJS Camera + own methods
    /*
        camera.position                     // Character position
        camera.direction                    // Character lookAt
    */
    var health = 100;                   // Total health
    var isMoving = false;               // Movement flag
    var isRotating = false;             // Rotation flag
    var mapPosition = new Object();     // Position on pixel's tile
    var degrees = 0;                    // Rotation max degrees
    var rotateRight = true;             // Rotation direction flag
    var speed = 60;                     // Movement speed
    var distance = 0;                   // Distance to next tile
    var directionIndex = 0;             // Forward direction index
    var moveIndex = 0;                  // Next position direction index
    var isOnDamage = false;             // Damage flag
    var amount = 1.0;                   // Uniform value
    var amountOriginalValue = false;    // Amount original value flag
    var lastTimeDamage = 0.0;           // Damage shader duration
    var directions = [                  // All possible directions
        { x: 0, z: -1 },
        { x: 1, z: 0 },
        { x: 0, z: 1 },
        { x: -1, z: 0 }
    ];
    var mesh;                           // Mesh reference
    var level;                          // Level tiles array (reference)
    /*
        level.pixels                    // Map pixel colors
        level.tileSize                  // Map to World tile size
    */

    function init(pLevel, newPosition) {
        level = pLevel;
        mapPosition = newPosition;
        var worldPosition = getWorldPosition(mapPosition, level.tileSize);
        camera.init(worldPosition);
        distance = level.tileSize;
        var color = pixels[mapPosition.x][mapPosition.z];
        color.visible = true;
        FOW();
    }

    function update() {
        if (isOnDamage) {
            if (lastTimeDamage >= 0.5) {
                isOnDamage = false;
                lastTimeDamage = 0;
                amountOriginalValue = false;
            } else {
                amount += 5 * deltaTime;
                if (amount > 2) {
                    amount = 2;
                }
                pass1.uniforms.amount.value = amount;
                lastTimeDamage += deltaTime;
            }
        } else {
            if (!amountOriginalValue) {
                amount -= 5 * deltaTime;
                if (amount < 1) {
                    amount = 1.0;
                    amountOriginalValue = true;
                    pass1.uniforms.amount.value = amount;
                } else {
                    pass1.uniforms.amount.value = amount;
                }
            }
        }

        if (isMoving) moving();

        if (isRotating) {
            var force = (speed * 6) * deltaTime;
            degrees += force;

            if (rotateRight)
                camera.rotateY(force);
            else
                camera.rotateY(-force);

            if (degrees >= 90) {
                isRotating = false;
                degrees = 0;
                camera.roundRotation();
            }

            camera.update();
        }
    }

    function moveForward() {
        if (isMoving || isRotating) return false;
        moveIndex = directionIndex;
        move();
    }

    function moveRight() {
        if (isMoving || isRotating) return false;
        moveIndex = directionIndex + 1;
        if (moveIndex == 4) moveIndex = 0;
        move();
    }

    function moveBackward() {
        if (isMoving || isRotating) return false;
        moveIndex = directionIndex + 2;
        if (moveIndex == 4) moveIndex = 0;
        if (moveIndex == 5) moveIndex = 1;
        move();
    }

    function moveLeft() {
        if (isMoving || isRotating) return false;
        moveIndex = directionIndex - 1;
        if (moveIndex < 0) moveIndex = 3;
        move();
    }

    function move() {
        var direction = directions[moveIndex];
        var mapNextPosition = {
            x: mapPosition.x + direction.x,
            z: mapPosition.z + direction.z
        }

        if (canMove(mapNextPosition)) {
            var color = level.pixels[mapPosition.x][mapPosition.z];
            changeColor(color, 0, 0, 0);

            mapPosition = mapNextPosition;
            color = level.pixels[mapPosition.x][mapPosition.z];
            changeColor(color, 255, 255, 255);
            FOW();

            isMoving = true;
        } 
        // else {
        //     console.log("RED can't move");
        // }
    }

    function FOW() {
        // Up
        var color = pixels[mapPosition.x - 1][mapPosition.z - 1];
        color.visible = true;

        color = pixels[mapPosition.x][mapPosition.z - 1];
        color.visible = true;

        color = pixels[mapPosition.x + 1][mapPosition.z - 1];
        color.visible = true;

        // Down        
        color = pixels[mapPosition.x - 1][mapPosition.z + 1];
        color.visible = true;

        color = pixels[mapPosition.x][mapPosition.z + 1];
        color.visible = true;

        color = pixels[mapPosition.x + 1][mapPosition.z + 1];
        color.visible = true;

        // Left
        color = pixels[mapPosition.x - 1][mapPosition.z];
        color.visible = true;

        // Right
        color = pixels[mapPosition.x + 1][mapPosition.z];
        color.visible = true;
    }

    function moving() {
        var direction = directions[moveIndex];
        var forceX = direction.x * deltaTime * speed;
        var forceZ = direction.z * deltaTime * speed;

        var newPosition = {
            x: camera.position.x + forceX,
            z: camera.position.z + forceZ
        }

        distance -= (forceX == 0) ? Math.abs(forceZ) : Math.abs(forceX);

        if (distance <= 0) {
            isMoving = false;
            distance = level.tileSize;
            newPosition = {
                x: Math.round(camera.position.x / level.tileSize) * level.tileSize,
                z: Math.round(camera.position.z / level.tileSize) * level.tileSize
            }
        }

        camera.move(newPosition);
        camera.update();
    }

    function canMove(mapNextPosition) {
        var color = level.pixels[mapNextPosition.x][mapNextPosition.z];
        var hexadecimal = rgbToHex(color.r, color.g, color.b);
        if (hexadecimal == cWall) return false;
        if (hexadecimal == cEnemy) return false;
        if (hexadecimal == cExit) {
            gameOver = true;
            thePlayerWon = true;
            return false;
        }
        return true;
    }

    function rotate(rotationDirection) {
        if (isMoving || isRotating) return false;

        if (rotationDirection > 0) {
            directionIndex++;
            rotateRight = true;

            if (directionIndex > 3)
                directionIndex = 0;
        } else {
            directionIndex--;
            rotateRight = false;

            if (directionIndex < 0)
                directionIndex = 3;
        }

        isRotating = true;
    }

    function receiveDamage(monsterDamage) {
        health -= monsterDamage;
        lastTimeDamage = 0;
        isOnDamage = true;

        if (health < 0) {
            gameOver = true;
            thePlayerWon = false;
        }
        else
            healthHUD.style.width = health + "%";

        //console.log("health: " + character.health);
    }

    return {
        position: camera.position,
        camera: camera,
        health: health,

        // Methods
        init: init,
        update: update,
        rotate: rotate,
        moveForward: moveForward,
        moveBackward: moveBackward,
        moveLeft: moveLeft,
        moveRight: moveRight,
        receiveDamage: receiveDamage
    };
}