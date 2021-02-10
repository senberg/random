import * as THREE from './three.module.js';

function GridBufferGeometry(sizeX, sizeY, offsetX, offsetY, offsetZ, step, width) {
    THREE.BufferGeometry.call( this );
    this.type = 'GridBufferGeometry';

	const halfSizeX = sizeX / 2;
	const halfSizeY = sizeY / 2;
	const divisionsX = sizeX / step;
	const divisionsY = sizeY / step;
	const vertices = [];
	const normals = [];

	for ( let i = 0, x = - halfSizeX; i <= divisionsX; i ++, x += step ) {
	    addLineVertices(vertices, x + offsetX, - halfSizeY + offsetY, x + offsetX, halfSizeY + offsetY, width);
	}

	for ( let i = 0, y = - halfSizeY; i <= divisionsY; i ++, y += step ) {
	    addLineVertices(vertices, - halfSizeX + offsetX, y + offsetY, halfSizeX + offsetX, y + offsetY, width);
	}

    function addLineVertices(vertices, xStart, yStart, xEnd, yEnd, width){
        vertices.push(xStart - width, yEnd + width,  0.0);
        vertices.push(xStart - width, yStart - width,  0.0);
        vertices.push(xEnd + width, yEnd + width,  0.0);
        vertices.push(xEnd + width, yEnd + width,  0.0);
        vertices.push(xStart - width, yStart - width,  0.0);
        vertices.push(xEnd + width, yStart - width,  0.0);
        normals.push(0, 0, 1);
        normals.push(0, 0, 1);
        normals.push(0, 0, 1);
        normals.push(0, 0, 1);
        normals.push(0, 0, 1);
        normals.push(0, 0, 1);
    }

	this.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
	this.setAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ) );
}

GridBufferGeometry.prototype = Object.create( THREE.BufferGeometry.prototype );
GridBufferGeometry.prototype.constructor = GridBufferGeometry;

export { GridBufferGeometry };