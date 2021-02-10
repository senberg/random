import * as THREE from './three.module.js';
import * as MAPCONTROLS from './MapControls.js';
import * as GRID from './Grid.js';

function main(){
    const canvas = document.querySelector("#view");
    const camera = createCamera();
    const controls = new MAPCONTROLS.MapControls(camera, canvas);

    const scene = new THREE.Scene();
    const grid = new GRID.Grid(180000000, 80000000, 0, 0, 0, 2000000, 0x003300);
    scene.add(grid);
    const deployment = new GRID.Grid(180000000, 20000000, 0, -50000000, 0, 2000000, 0x004D00);
    scene.add(deployment);
    const enemyDeployment = new GRID.Grid(180000000, 20000000, 0, 50000000, 0, 2000000, 0x330000);
    scene.add(enemyDeployment);
    const cubes = createCubes();
    addLights();

    canvas.focus();
    const renderer = new THREE.WebGLRenderer({canvas, stencil: false, antialias: true, powerPreference: "high-performance"});
    window.addEventListener('resize', resize, false);
    resize();
    requestAnimationFrame(render);

    function render(timestamp) {
        requestAnimationFrame(render);
        const time = timestamp * 0.001;  // convert time to seconds

        cubes.forEach((cube, index) => {
            const speed = 1 + index * .1;
            const rotation = time * speed / 10;
            cube.rotation.x = rotation;
            cube.rotation.y = rotation;
        });

        renderer.render(scene, camera);
    }

    function resize() {
        const pixelRatio = window.devicePixelRatio;
        const clientWidth = canvas.clientWidth * pixelRatio | 0;
        const clientHeight = canvas.clientHeight * pixelRatio | 0;
        const needResize = canvas.width !== clientWidth || canvas.height !== clientHeight;

        if (needResize) {
            renderer.setSize(clientWidth, clientHeight, false);
            camera.aspect = clientWidth / clientHeight;
            camera.updateProjectionMatrix();
        }
    }

    function createCamera(){
        const fieldOfView = 35;
        const aspectRatio = canvas.clientWidth / canvas.clientHeight;
        const nearClippingPlane = 0.01;
        const farClippingPlane = 400000000;
        const camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearClippingPlane, farClippingPlane);
        camera.position.set(0, -130000000, 55000000);
        camera.up.set(0, 0, 1);
        return camera;
    }

    function createCubes(){
        const geometry = new THREE.BoxGeometry(200000, 200000, 200000);
        const xCount = 5;
        const yCount = 5;
        const space = 1000000;
        const offsetX = -((xCount - 1) / 2) * space;
        const offsetY = -((yCount - 1) / 2) * space;
        const cubes = [];

        for(let x = 0; x<xCount; x++){
            for(let y = 0; y<yCount; y++){
                const color = Math.floor(0xFFFFFF * Math.random());
                const material = new THREE.MeshStandardMaterial ({color});
                const cube = new THREE.Mesh(geometry, material);
                cube.position.x = x * space + offsetX;
                cube.position.y = y * space + offsetY;
                cubes.push(cube);
                scene.add(cube);
            }
        }

        return cubes;
    }

    function addLights(){
        scene.add(new THREE.HemisphereLight(0xFFFFFF, 0x202020, 1))

        const redLight = new THREE.DirectionalLight(0xCC0000, 2);
        redLight.position.set(0, 1, 0);
        scene.add(redLight);
    }

}

main();