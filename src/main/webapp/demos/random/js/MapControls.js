import {EventDispatcher, Quaternion, Spherical, Vector2, Vector3} from './three.module.js';

// This set of controls performs orbiting, dollying (zooming), and panning.
// This is very similar to OrbitControls, another set of touch behavior
//
//    Orbit - right mouse, or left mouse + ctrl/meta/shiftKey / touch: two-finger rotate
//    Zoom - middle mouse, or mousewheel / touch: two-finger spread or squish
//    Pan - left mouse, or arrow keys / touch: one-finger move
var MapControls = function ( object, domElement ) {
	this.object = object;
	this.domElement = domElement;

	// Set to false to disable this control
	this.enabled = true;

	// "target" sets the location of focus, where the object orbits around
	this.target = new Vector3(0, -25000000, 0);

	// How far you can dolly in and out ( PerspectiveCamera only )
	this.minDistance = 10000000;
	this.maxDistance = 200000000;

	// How far you can orbit vertically, upper and lower limits.
	// Range is 0 to Math.PI radians.
	this.minPolarAngle = 0; // radians
	this.maxPolarAngle = Math.PI / 2; // radians

	// How far you can orbit horizontally, upper and lower limits.
	// If set, the interval [ min, max ] must be a sub-interval of [ - 2 PI, 2 PI ], with ( max - min < 2 PI )
	this.minAzimuthAngle = - Infinity; // radians
	this.maxAzimuthAngle = Infinity; // radians

	// Set to true to enable damping (inertia)
	// If damping is enabled, you must call controls.update() in your animation loop
	this.enableDamping = false;
	this.dampingFactor = 0.1;

	// This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
	// Set to false to disable zooming
	this.enableZoom = true;
	this.zoomSpeed = 1.5;

	// Set to false to disable rotating
	this.enableRotate = true;
	this.rotateSpeed = 0.15;

	// Set to false to disable panning
	this.enablePan = true;
	this.panSpeed = 0.7;
	this.keyPanSpeed = 50.0;	// pixels moved per arrow key push
    this.minPan = new Vector3(-90000000, -60000000, 0);
    this.maxPan = new Vector3(90000000, 60000000, 0);

	// Set to true to automatically rotate around the target
	// If auto-rotate is enabled, you must call controls.update() in your animation loop
	this.autoRotate = false;
	this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

	// Set to false to disable use of the keys
	this.enableKeys = true;

	// for reset
	this.target0 = this.target.clone();
	this.position0 = this.object.position.clone();
	this.zoom0 = this.object.zoom;

	//
	// public methods
	//

	this.getPolarAngle = function () {
		return spherical.phi;
	};

	this.getAzimuthalAngle = function () {
		return spherical.theta;
	};

	this.saveState = function () {
		scope.target0.copy( scope.target );
		scope.position0.copy( scope.object.position );
		scope.zoom0 = scope.object.zoom;
	};

	this.reset = function () {
		scope.target.copy( scope.target0 );
		scope.object.position.copy( scope.position0 );
		scope.object.zoom = scope.zoom0;
		scope.object.updateProjectionMatrix();
		scope.dispatchEvent( changeEvent );
		scope.update();
		state = STATE.NONE;
	};

	// this method is exposed, but perhaps it would be better if we can make it private...
	this.update = function () {
		var offset = new Vector3();

		// so camera.up is the orbit axis
		var quat = new Quaternion().setFromUnitVectors( object.up, new Vector3( 0, 1, 0 ) );
		var quatInverse = quat.clone().inverse();
		var lastPosition = new Vector3();
		var lastQuaternion = new Quaternion();
		var twoPI = 2 * Math.PI;

		return function update() {
			var position = scope.object.position;
			offset.copy( position ).sub( scope.target );

			// rotate offset to "y-axis-is-up" space
			offset.applyQuaternion( quat );

			// angle from z-axis around y-axis
			spherical.setFromVector3( offset );

			if ( scope.autoRotate && state === STATE.NONE ) {
				rotateLeft( getAutoRotationAngle() );
			}

			if ( scope.enableDamping ) {
				spherical.theta += sphericalDelta.theta * scope.dampingFactor;
				spherical.phi += sphericalDelta.phi * scope.dampingFactor;
			} else {
				spherical.theta += sphericalDelta.theta;
				spherical.phi += sphericalDelta.phi;
			}

			// restrict theta to be between desired limits

			var min = scope.minAzimuthAngle;
			var max = scope.maxAzimuthAngle;

			if ( isFinite( min ) && isFinite( max ) ) {
				if ( min < - Math.PI ) min += twoPI; else if ( min > Math.PI ) min -= twoPI;
				if ( max < - Math.PI ) max += twoPI; else if ( max > Math.PI ) max -= twoPI;

				if ( min < max ) {
					spherical.theta = Math.max( min, Math.min( max, spherical.theta ) );
				} else {
					spherical.theta = ( spherical.theta > ( min + max ) / 2 ) ?
						Math.max( min, spherical.theta ) :
						Math.min( max, spherical.theta );
				}
			}

			// restrict phi to be between desired limits
			spherical.phi = Math.max( scope.minPolarAngle, Math.min( scope.maxPolarAngle, spherical.phi ) );
			spherical.makeSafe();
			spherical.radius *= scale;

			// restrict radius to be between desired limits
			spherical.radius = Math.max( scope.minDistance, Math.min( scope.maxDistance, spherical.radius ) );

			// move target to panned location
			if ( scope.enableDamping === true ) {
				scope.target.addScaledVector( panOffset, scope.dampingFactor );
			} else {
				scope.target.add( panOffset );
				scope.target.clamp( scope.minPan, scope.maxPan );
			}

			offset.setFromSpherical( spherical );

			// rotate offset back to "camera-up-vector-is-up" space
			offset.applyQuaternion( quatInverse );

			position.copy( scope.target ).add( offset );

			scope.object.lookAt( scope.target );

			if ( scope.enableDamping === true ) {
				sphericalDelta.theta *= ( 1 - scope.dampingFactor );
				sphericalDelta.phi *= ( 1 - scope.dampingFactor );
				panOffset.multiplyScalar( 1 - scope.dampingFactor );
			} else {
				sphericalDelta.set( 0, 0, 0 );
				panOffset.set( 0, 0, 0 );
			}

			scale = 1;

			// update condition is:
			// min(camera displacement, camera rotation in radians)^2 > EPS
			// using small-angle approximation cos(x/2) = 1 - x^2 / 8
			if ( zoomChanged ||
				lastPosition.distanceToSquared( scope.object.position ) > EPS ||
				8 * ( 1 - lastQuaternion.dot( scope.object.quaternion ) ) > EPS ) {

				scope.dispatchEvent( changeEvent );

				lastPosition.copy( scope.object.position );
				lastQuaternion.copy( scope.object.quaternion );
				zoomChanged = false;

				return true;
			}

			return false;
		};
	}();

	this.dispose = function () {
		scope.domElement.removeEventListener( 'contextmenu', onContextMenu, false );
		scope.domElement.removeEventListener( 'mousedown', onMouseDown, false );
		scope.domElement.removeEventListener( 'wheel', onMouseWheel, false );
		scope.domElement.removeEventListener( 'touchstart', onTouchStart, false );
		scope.domElement.removeEventListener( 'touchend', onTouchEnd, false );
		scope.domElement.removeEventListener( 'touchmove', onTouchMove, false );
		scope.domElement.ownerDocument.removeEventListener( 'mousemove', onMouseMove, false );
		scope.domElement.ownerDocument.removeEventListener( 'mouseup', onMouseUp, false );
		scope.domElement.removeEventListener( 'keydown', onKeyDown, false );
	};

	//
	// internals
	//

	var scope = this;

	var changeEvent = { type: 'change' };
	var startEvent = { type: 'start' };
	var endEvent = { type: 'end' };

	var STATE = {
		NONE: - 1,
		ROTATE: 0,
		PAN: 2,
		TOUCH_PAN: 4,
		TOUCH_DOLLY_ROTATE: 6
	};

	var state = STATE.NONE;

	var EPS = 0.000001;

	// current position in spherical coordinates
	var spherical = new Spherical();
	var sphericalDelta = new Spherical();

	var scale = 1;
	var panOffset = new Vector3();
	var zoomChanged = false;

	var rotateStart = new Vector2();
	var rotateEnd = new Vector2();
	var rotateDelta = new Vector2();

	var panStart = new Vector2();
	var panEnd = new Vector2();
	var panDelta = new Vector2();

	var dollyStart = new Vector2();
	var dollyEnd = new Vector2();
	var dollyDelta = new Vector2();

	function getAutoRotationAngle() {
		return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;
	}

	function getZoomScale() {
		return Math.pow( 0.95, scope.zoomSpeed );
	}

	function rotateLeft( angle ) {
		sphericalDelta.theta -= angle;
	}

	function rotateUp( angle ) {
		sphericalDelta.phi -= angle;
	}

	var panLeft = function () {
		var v = new Vector3();

		return function panLeft( distance, objectMatrix ) {
			v.setFromMatrixColumn( objectMatrix, 0 ); // get X column of objectMatrix
			v.multiplyScalar( - distance );
			panOffset.add( v );
		};
	}();

	var panUp = function () {
		var v = new Vector3();

		return function panUp( distance, objectMatrix ) {
            v.setFromMatrixColumn( objectMatrix, 0 );
            v.crossVectors( scope.object.up, v );
			v.multiplyScalar( distance );
			panOffset.add( v );
		};
	}();

	// deltaX and deltaY are in pixels; right and down are positive
	var pan = function () {
		var offset = new Vector3();

		return function pan( deltaX, deltaY ) {
			var element = scope.domElement;

            // perspective
            var position = scope.object.position;
            offset.copy( position ).sub( scope.target );
            var targetDistance = offset.length();

            // half of the fov is center to top of screen
            targetDistance *= Math.tan( ( scope.object.fov / 2 ) * Math.PI / 180.0 );

            // we use only clientHeight here so aspect ratio does not distort speed
            panLeft( 2 * deltaX * targetDistance / element.clientHeight, scope.object.matrix );
            panUp( 2 * deltaY * targetDistance / element.clientHeight, scope.object.matrix );
		};
	}();

	function dollyOut( dollyScale ) {
	    scale /= dollyScale;
	}

	function dollyIn( dollyScale ) {
	    scale *= dollyScale;
	}

	//
	// event callbacks - update the object state
	//

	function handleMouseMoveRotate( event ) {
		rotateEnd.set( event.clientX, event.clientY );
		rotateDelta.subVectors( rotateEnd, rotateStart ).multiplyScalar( scope.rotateSpeed );
		var element = scope.domElement;
		rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientHeight ); // yes, height
		rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight );
		rotateStart.copy( rotateEnd );
		scope.update();
	}

	function handleMouseMovePan( event ) {
		panEnd.set( event.clientX, event.clientY );
		panDelta.subVectors( panEnd, panStart ).multiplyScalar( scope.panSpeed );
		pan( panDelta.x, panDelta.y );
		panStart.copy( panEnd );
		scope.update();
	}

	function handleTouchStartRotate( event ) {
		if ( event.touches.length == 1 ) {
			rotateStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
		} else {
			var x = 0.5 * ( event.touches[ 0 ].pageX + event.touches[ 1 ].pageX );
			var y = 0.5 * ( event.touches[ 0 ].pageY + event.touches[ 1 ].pageY );
			rotateStart.set( x, y );
		}
	}

	function handleTouchStartPan( event ) {
		if ( event.touches.length == 1 ) {
			panStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
		} else {
			var x = 0.5 * ( event.touches[ 0 ].pageX + event.touches[ 1 ].pageX );
			var y = 0.5 * ( event.touches[ 0 ].pageY + event.touches[ 1 ].pageY );
			panStart.set( x, y );
		}
	}

	function handleTouchStartDolly( event ) {
		var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
		var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
		var distance = Math.sqrt( dx * dx + dy * dy );
		dollyStart.set( 0, distance );
	}

	function handleTouchStartDollyRotate( event ) {
		if ( scope.enableZoom ) handleTouchStartDolly( event );
		if ( scope.enableRotate ) handleTouchStartRotate( event );
	}

	function handleTouchMoveRotate( event ) {
		if ( event.touches.length == 1 ) {
			rotateEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
		} else {
			var x = 0.5 * ( event.touches[ 0 ].pageX + event.touches[ 1 ].pageX );
			var y = 0.5 * ( event.touches[ 0 ].pageY + event.touches[ 1 ].pageY );
			rotateEnd.set( x, y );
		}

		rotateDelta.subVectors( rotateEnd, rotateStart ).multiplyScalar( scope.rotateSpeed );
		var element = scope.domElement;
		rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientHeight ); // yes, height
		rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight );
		rotateStart.copy( rotateEnd );
	}

	function handleTouchMovePan( event ) {
		if ( event.touches.length == 1 ) {
			panEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
		} else {
			var x = 0.5 * ( event.touches[ 0 ].pageX + event.touches[ 1 ].pageX );
			var y = 0.5 * ( event.touches[ 0 ].pageY + event.touches[ 1 ].pageY );
			panEnd.set( x, y );
		}

		panDelta.subVectors( panEnd, panStart ).multiplyScalar( scope.panSpeed );
		pan( panDelta.x, panDelta.y );
		panStart.copy( panEnd );
	}

	function handleTouchMoveDolly( event ) {
		var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
		var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
		var distance = Math.sqrt( dx * dx + dy * dy );
		dollyEnd.set( 0, distance );
		dollyDelta.set( 0, Math.pow( dollyEnd.y / dollyStart.y, scope.zoomSpeed ) );
		dollyOut( dollyDelta.y );
		dollyStart.copy( dollyEnd );
	}

	function handleTouchMoveDollyRotate( event ) {
		if ( scope.enableZoom ) handleTouchMoveDolly( event );
		if ( scope.enableRotate ) handleTouchMoveRotate( event );
	}

	//
	// event handlers - FSM: listen for events and reset state
	//

	function onMouseDown( event ) {
		if ( scope.enabled === false ) return;

		// Prevent the browser from scrolling.
		event.preventDefault();

		// Manually set the focus since calling preventDefault above
		// prevents the browser from setting it automatically.
		scope.domElement.focus ? scope.domElement.focus() : window.focus();

		switch (event.button) {
			case 0:
                panStart.set( event.clientX, event.clientY );
                state = STATE.PAN;
				break;
			case 2:
		        rotateStart.set( event.clientX, event.clientY );
                state = STATE.ROTATE;
				break;
			default:
				state = STATE.NONE;
		}

		if ( state !== STATE.NONE ) {
			scope.domElement.ownerDocument.addEventListener( 'mousemove', onMouseMove, false );
			scope.domElement.ownerDocument.addEventListener( 'mouseup', onMouseUp, false );
			scope.dispatchEvent( startEvent );
		}
	}

	function onMouseMove( event ) {
		if ( scope.enabled === false ) return;
		event.preventDefault();

		switch ( state ) {
			case STATE.ROTATE:
				if ( scope.enableRotate === false ) return;
				handleMouseMoveRotate( event );
				break;
			case STATE.PAN:
				if ( scope.enablePan === false ) return;
				handleMouseMovePan( event );
				break;
		}
	}

	function onMouseUp( event ) {
		if ( scope.enabled === false ) return;
		scope.domElement.ownerDocument.removeEventListener( 'mousemove', onMouseMove, false );
		scope.domElement.ownerDocument.removeEventListener( 'mouseup', onMouseUp, false );
		scope.dispatchEvent( endEvent );
		state = STATE.NONE;
	}

	function onMouseWheel( event ) {
		if ( scope.enabled === false || scope.enableZoom === false || ( state !== STATE.NONE && state !== STATE.ROTATE ) ) return;
		event.preventDefault();
		event.stopPropagation();
		scope.dispatchEvent( startEvent );

		if ( event.deltaY < 0 ) {
            dollyIn( getZoomScale() );
        } else if ( event.deltaY > 0 ) {
            dollyOut( getZoomScale() );
        }

        scope.update();
		scope.dispatchEvent( endEvent );
	}

	function onKeyDown( event ) {
		if ( scope.enabled === false || scope.enableKeys === false || scope.enablePan === false ) return;
		var needsUpdate = false;

        // https://keycode.info/
		switch (event.keyCode) {
			case 38: // up
			case 87: // w
				pan(0, scope.keyPanSpeed);
				needsUpdate = true;
				break;
			case 40: // down
			case 83: // s
				pan(0, - scope.keyPanSpeed);
				needsUpdate = true;
				break;
			case 37: // left
			case 65: // a
				pan(scope.keyPanSpeed, 0);
				needsUpdate = true;
				break;
			case 39: // right
			case 68: // d
				pan(- scope.keyPanSpeed, 0);
				needsUpdate = true;
				break;
			case 8: // backspace
				scope.reset();
				needsUpdate = true;
				break;
		}

		if ( needsUpdate ) {
			// prevent the browser from scrolling on cursor keys
			event.preventDefault();
			scope.update();
		}
	}

	function onTouchStart( event ) {
		if ( scope.enabled === false ) return;
		event.preventDefault(); // prevent scrolling

		switch ( event.touches.length ) {
			case 1:
                if ( scope.enablePan === false ) return;
                handleTouchStartPan( event );
                state = STATE.TOUCH_PAN;
                break;
			case 2:
                if ( scope.enableZoom === false && scope.enableRotate === false ) return;
                handleTouchStartDollyRotate( event );
                state = STATE.TOUCH_DOLLY_ROTATE;
                break;
			default:
				state = STATE.NONE;
		}

		if ( state !== STATE.NONE ) {
			scope.dispatchEvent( startEvent );
		}
	}

	function onTouchMove( event ) {
		if ( scope.enabled === false ) return;

		event.preventDefault(); // prevent scrolling
		event.stopPropagation();

		switch ( state ) {
			case STATE.TOUCH_PAN:
				if ( scope.enablePan === false ) return;
				handleTouchMovePan( event );
				scope.update();
				break;
			case STATE.TOUCH_DOLLY_ROTATE:
				if ( scope.enableZoom === false && scope.enableRotate === false ) return;
				handleTouchMoveDollyRotate( event );
				scope.update();
				break;
			default:
				state = STATE.NONE;
		}
	}

	function onTouchEnd( event ) {
		if ( scope.enabled === false ) return;
		scope.dispatchEvent( endEvent );
		state = STATE.NONE;
	}

	function onContextMenu( event ) {
		if ( scope.enabled === false ) return;
		event.preventDefault();
	}

	//

	scope.domElement.addEventListener( 'contextmenu', onContextMenu, false );
	scope.domElement.addEventListener( 'mousedown', onMouseDown, false );
	scope.domElement.addEventListener( 'wheel', onMouseWheel, false );
	scope.domElement.addEventListener( 'touchstart', onTouchStart, false );
	scope.domElement.addEventListener( 'touchend', onTouchEnd, false );
	scope.domElement.addEventListener( 'touchmove', onTouchMove, false );
	scope.domElement.addEventListener( 'keydown', onKeyDown, false );

	// make sure element can receive keys.
	if ( scope.domElement.tabIndex === - 1 ) {
		scope.domElement.tabIndex = 0;
	}

	// force an update at start
	this.update();
};

MapControls.prototype = Object.create(EventDispatcher.prototype);
MapControls.prototype.constructor = MapControls;

export { MapControls };