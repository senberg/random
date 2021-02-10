import {
	Euler,
	EventDispatcher,
	Vector3
} from "../../../build/three.module.js";

var Controls = function ( camera, domElement ) {

	if (domElement === undefined) {
		console.warn( 'THREE.Controls: The second parameter "domElement" is now mandatory.' );
		domElement = document.body;
	}
    else if (domElement !== document) {
        domElement.setAttribute( 'tabindex', - 1 );
    }

	this.domElement = domElement;
	this.isLocked = false;

	// Set to constrain the pitch of the camera
	// Range is 0 to Math.PI radians
	this.minPolarAngle = Math.PI / 4; // radians
	this.maxPolarAngle = Math.PI / 4 * 3; // radians
	this.movementSpeed = 4.0;
	this.diagonalMovementSpeed = Math.sqrt(this.movementSpeed ** 2 / 2);

	//
	// internals
	//

	const scope = this;

	const changeEvent = { type: 'change' };
	const lockEvent = { type: 'lock' };
	const unlockEvent = { type: 'unlock' };

	const cameraDirection = new Euler( 0, 0, 0, 'YXZ' );
	const vec = new Vector3();

	let moveForwardPressed = false;
	let moveBackwardPressed = false;
	let moveLeftPressed = false;
	let moveRightPressed = false;

	function onMouseMove( event ) {
		if ( scope.isLocked === false ) return;

		var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

		cameraDirection.setFromQuaternion( camera.quaternion );

		cameraDirection.y -= movementX * 0.002;
		cameraDirection.x -= movementY * 0.002;

		cameraDirection.x = Math.max( Math.PI / 2 - scope.maxPolarAngle, Math.min( Math.PI / 2 - scope.minPolarAngle, cameraDirection.x ) );

		camera.quaternion.setFromEuler( cameraDirection );

		scope.dispatchEvent( changeEvent );
	}

	function onPointerlockChange() {
		if ( scope.domElement.ownerDocument.pointerLockElement === scope.domElement ) {
			scope.dispatchEvent( lockEvent );
			scope.isLocked = true;
		} else {
			scope.dispatchEvent( unlockEvent );
			scope.isLocked = false;
		}
	}

	this.connect = function () {
		scope.domElement.ownerDocument.addEventListener( 'mousemove', onMouseMove, false );
		scope.domElement.ownerDocument.addEventListener( 'pointerlockchange', onPointerlockChange, false );
	};

	this.disconnect = function () {
		scope.domElement.ownerDocument.removeEventListener( 'mousemove', onMouseMove, false );
		scope.domElement.ownerDocument.removeEventListener( 'pointerlockchange', onPointerlockChange, false );
	};

    function onKeyDown(event) {
        switch (event.keyCode) {
            case 38: /*up*/
            case 87: /*W*/
                moveForwardPressed = true;
                break;
            case 37: /*left*/
            case 65: /*A*/
                moveLeftPressed = true;
                break;
            case 40: /*down*/
            case 83: /*S*/
                moveBackwardPressed = true;
                break;
            case 39: /*right*/
            case 68: /*D*/
                moveRightPressed = true;
                break;
        }
    };

    function onKeyUp(event) {
        switch (event.keyCode) {
            case 38: /*up*/
            case 87: /*W*/
                moveForwardPressed = false;
                    break;
            case 37: /*left*/
            case 65: /*A*/
                moveLeftPressed = false;
                break;
            case 40: /*down*/
            case 83: /*S*/
                moveBackwardPressed = false;
                break;
            case 39: /*right*/
            case 68: /*D*/
                moveRightPressed = false;
                break;
        }
    };

	window.addEventListener( 'keydown', onKeyDown, false );
	window.addEventListener( 'keyup', onKeyUp, false );

	this.dispose = function () {
		this.disconnect();
		window.removeEventListener( 'keydown', onKeyDown, false );
		window.removeEventListener( 'keyup', onKeyUp, false );
	};

	this.moveForward = function ( distance ) {
		vec.setFromMatrixColumn( camera.matrix, 0 );
		vec.crossVectors( camera.up, vec );
		camera.position.addScaledVector( vec, distance );
	};

	this.moveRight = function ( distance ) {
		vec.setFromMatrixColumn( camera.matrix, 0 );
		camera.position.addScaledVector( vec, distance );
	};

	this.lock = function () {
		this.domElement.requestPointerLock();
	};

	this.unlock = function () {
		scope.domElement.ownerDocument.exitPointerLock();
	};

	this.update = function (delta) {
        if ( this.enabled === false ){
            return;
        }

        const diagonalMovement = (moveForwardPressed || moveBackwardPressed) && (moveLeftPressed || moveRightPressed);
        const actualMoveSpeed = delta * (diagonalMovement ? this.diagonalMovementSpeed : this.movementSpeed);

        if ( moveForwardPressed ) this.moveForward(actualMoveSpeed);
        if ( moveBackwardPressed ) this.moveForward(-actualMoveSpeed);
        if ( moveLeftPressed ) this.moveRight(-actualMoveSpeed);
        if ( moveRightPressed ) this.moveRight(actualMoveSpeed);
	};

	this.connect();
};

Controls.prototype = Object.create( EventDispatcher.prototype );
Controls.prototype.constructor = Controls;

export { Controls };
