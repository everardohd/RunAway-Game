function Camera() {
    THREE.PerspectiveCamera.call(this, 60, window.innerWidth / window.innerHeight, 1, 1000);

    // Euler angles
    this.pitch = 0;
    this.yaw = -90;
    this.roll = 0;

    this.direction = new THREE.Vector3();   // Vector direction
    this.rotationChange = false;            // Rotation change flag
    this.positionChange = false;            // Position change flag

    this.eye = new THREE.Vector3();         // Specifies the position of the eye point.    
    this.position = new THREE.Vector3();    // Specifies the position of the reference point (camera position)    
    this.up = new THREE.Vector3(0, 1, 0);   // Specifies the direction of the up vector.    
}

Camera.prototype = Object.create(THREE.PerspectiveCamera.prototype);

Camera.prototype.init = function (newPosition) {
    this.position.set(newPosition.x, 0, newPosition.z);
    this.rotationChange = true;
}

Camera.prototype.resize = function () {
    this.aspect = window.innerWidth / window.innerHeight;
    this.updateProjectionMatrix();
}

Camera.prototype.move = function (newPosition) {
    this.position.set(newPosition.x, 0, newPosition.z);
    this.positionChange = true;
}

Camera.prototype.roundRotation = function () {
    if (this.yaw % 90 != 0)
        this.yaw = Math.round(this.yaw / 90) * 90;
        
    this.rotationChange = true;
}

Camera.prototype.rotateY = function (yaw) {
    this.yaw += yaw;
    this.rotationChange = true;
}

Camera.prototype.update = function () {
    if (this.rotationChange) {
        var pitch = this.pitch.toRadians(); // pitch angle in radians 
        var yaw = this.yaw.toRadians();     // yaw angle in radians

        this.direction.x = Math.cos(pitch) * Math.cos(yaw);
        this.direction.y = Math.sin(pitch);
        this.direction.z = Math.cos(pitch) * Math.sin(yaw);
        this.direction.normalize();
    }

    if (this.rotationChange || this.positionChange) {
        this.eye = this.position.clone().add(this.direction);
        this.rotationChange = false;
        this.positionChange = false;
    }

    this.lookAt(this.eye); // eye = position + direction
}
