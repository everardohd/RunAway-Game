function Monster(mesh, level, mapPosition) {

    var mesh = mesh;                // Mesh reference
    var level = level;              // Level tiles array (reference)
    var mapPosition = mapPosition;  // Current map position
    var direction = new Object();   // Direction vector    
    var directions = [              // All possible directions
        { x: 0, z: -1 },
        { x: 1, z: 0 },
        { x: 0, z: 1 },
        { x: -1, z: 0 }
    ];
    // Movement
    var speed = 80;
    var range = level.tileSize;
    var movement = new Animation(speed, range, true);

    // Rotation
    var yaw = 0;
    var newAngle = 0;

    // Jump
    var isJumping = false;
    var isFalling = false;

    function update(time) {
        // Animate each 2 seconds
        movement.animateMovement(
            mesh.position,
            direction,
            1,                      // Seconds
            changePosition          // Function run each n seconds
        );

        // Rotation
        yaw = lerp(yaw, newAngle, time * 10);
        rotateY();

        // Jump
        if (isJumping) {
            if (isFalling) {
                mesh.position.y -= time * speed;
                if (mesh.position.y >= -(level.tileSize / 2)) {
                    mesh.position.y = -level.tileSize / 2;
                    isJumping = false;
                    isFalling = false;
                }
            } else {
                mesh.position.y += time * speed;
                if (mesh.position.y >= -(level.tileSize / 3)) {
                    isFalling = true;
                }
            }
        }
    }

    function move(newPosition) {
        mesh.position.x = newPosition.x;
        mesh.position.z = newPosition.z;
    }

    function rotateY() {
        var radians = yaw.toRadians();
        mesh.rotation.y = radians;
    }

    function changePosition() {
        var max = 3;
        var randomDirections = directions.slice();

        if (searchPlayer())
            return false;

        while (true) {
            var index = getRandomInt(0, max);
            direction = randomDirections[index];
            var mapNextPosition = new Object();
            mapNextPosition.x = mapPosition.x + direction.x;
            mapNextPosition.z = mapPosition.z + direction.z;

            if (canMove(mapNextPosition)) {
                RotateToDirection();
                var color = level.pixels[mapPosition.x][mapPosition.z];
                changeColor(color, 0, 0, 0);
                mapPosition.x = mapNextPosition.x;
                mapPosition.z = mapNextPosition.z;
                color = level.pixels[mapPosition.x][mapPosition.z];
                changeColor(color, 255, 0, 0);
                return true;
            } else {
                randomDirections.splice(index, 1);
                max--;

                if (max < 0)
                    return false;
            }
        }
    }

    function RotateToDirection() {
        var index = directions.indexOf(direction);
        switch (index) {
            case 0:
                newAngle = 0;
                break;
            case 1:
                newAngle = 270;
                break;
            case 2:
                newAngle = 180;
                break;
            case 3:
                newAngle = 90;
                break;
        }
    }

    function searchPlayer() {
        for (var i = 0; i < 4; i++) {
            direction = directions[i];
            var color = pixels[mapPosition.x + direction.x][mapPosition.z + direction.z];
            var hexadecimal = rgbToHex(color.r, color.g, color.b);

            if (hexadecimal == cPlayer) {
                RotateToDirection();
                attack();
                return true;
            }
        }

        return false;
    }

    function canMove(mapNextPosition) {
        var color = level.pixels[mapNextPosition.x][mapNextPosition.z];
        var hexadecimal = rgbToHex(color.r, color.g, color.b);
        if (hexadecimal == cWall) return false;
        if (hexadecimal == cEnemy) return false;
        if (hexadecimal == cExit) return false;
        return true;
    }

    function attack() {
        var damage = getRandomInt(10, 25);
        character.receiveDamage(damage);
        isJumping = true;
        console.log(mesh.position.y);
    }

    return {
        position: mesh.position,
        mesh: mesh,
        update: update
    };
}