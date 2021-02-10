import * as THREE from './three.module.js';

function Grid(sizeX, sizeY, offsetX, offsetY, offsetZ, step, color) {
	const halfSizeX = sizeX / 2;
	const halfSizeY = sizeY / 2;
	const divisionsX = sizeX / step;
	const divisionsY = sizeY / step;
	const vertices = [];

	for ( let i = 0, x = - halfSizeX; i <= divisionsX; i ++, x += step ) {
		vertices.push( x + offsetX, - halfSizeY + offsetY, offsetZ, x + offsetX, halfSizeY + offsetY, offsetZ );
	}

	for ( let i = 0, y = - halfSizeY; i <= divisionsY; i ++, y += step ) {
		vertices.push( - halfSizeX + offsetX, y + offsetY, offsetZ, halfSizeX + offsetX, y + offsetY, offsetZ );
	}

	const geometry = new THREE.BufferGeometry();
	geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
	const material = new THREE.LineBasicMaterial( { color } );
	THREE.LineSegments.call( this, geometry, material );
}

Grid.prototype = Object.create( THREE.LineSegments.prototype );
Grid.prototype.constructor = Grid;

export { Grid };