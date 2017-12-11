function Animation(speed, range, timer) {

    var lastTimeChange = 0.0;           // Time passed since the animation began
    var waitSeconds = waitSeconds;      // Update after this seconds
    var speed = speed;                  // Movement speed
    var range = range;                  // Original range
    var distance = range;               // Remaining distance
    var isMoving = false;               // Move flag
    var timer = timer;                  // Has timer?
    var degrees = 0;                    // Rotation degrees

    function animateMovement(position, direction, waitSeconds, fun) {

        if (isMoving) {
            return moving(position, direction);
        } else {
            var timeHasPassed = (lastTimeChange >= waitSeconds);

            if (timeHasPassed) {
                if (fun()) isMoving = true;
                lastTimeChange = 0;
            }
            else {
                lastTimeChange += deltaTime;
                return false;
            }
        }
    }

    function moving(position, direction) {
        var forceX = direction.x * deltaTime * speed;
        var forceZ = direction.z * deltaTime * speed;

        var newPosition = {
            x: position.x + forceX,
            z: position.z + forceZ
        }

        distance -= Math.abs(forceZ) + Math.abs(forceX);

        if (distance <= 0) {
            isMoving = false;
            distance = range;
            newPosition = {
                x: Math.round(position.x / distance) * distance,
                z: Math.round(position.z / distance) * distance
            }
        }

        position.x = newPosition.x;
        position.z = newPosition.z;
    }

    return {
        animateMovement: animateMovement
    };
};    