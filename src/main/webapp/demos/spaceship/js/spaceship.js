import * as THREE from './three/build/three.module.js';
import {GLTFLoader} from './three/examples/jsm/loaders/GLTFLoader.js';
import {Controls} from './three/examples/jsm/controls/Controls.js';

function main(){
    const canvas = document.getElementById("view");
    const camera = createCamera();
    const controls = createControls(camera, canvas);
    const loader = new GLTFLoader();
    const scene = new THREE.Scene();
    const background = addBackground();
    addSpaceship();
    addLights();
    const renderer = createRenderer();
    resize();
    const clock = new THREE.Clock();
    canvas.focus();
    requestAnimationFrame(render);

    function render(timestamp) {
        requestAnimationFrame(render);
        const delta = clock.getDelta();
        controls.update(delta);
        background.rotateOnAxis(background.spinAxis, background.spinSpeed * delta);
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
        const fieldOfView = 60;
        const aspectRatio = canvas.clientWidth / canvas.clientHeight;
        const nearClippingPlane = 0.1;
        const farClippingPlane = Number.MAX_SAFE_INTEGER;
        const camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearClippingPlane, farClippingPlane);
        camera.position.y = 1.6;
        camera.lookAt.y = 1.6;
        camera.lookAt.z = 1;
        return camera;
    }

    function createControls(camera, canvas){
        const controls = new Controls(camera, canvas);
        canvas.addEventListener('click', function () {controls.lock();}, false);
        return controls;
    }

    function addBackground(){
        const background = new THREE.Group();

        function randomQuaternion(){
            const u1 = Math.random();
            const u2 = Math.random();
            const u3 = Math.random();
            const sqrt1MinusU1 = Math.sqrt(1 - u1);
            const sqrtU1 = Math.sqrt(u1);
            const x = sqrt1MinusU1 * Math.sin(2.0 * Math.PI * u2);
            const y = sqrt1MinusU1 * Math.cos(2.0 * Math.PI * u2);
            const z = sqrtU1 * Math.sin(2.0 * Math.PI * u3);
            const w = sqrtU1 * Math.cos(2.0 * Math.PI * u3);
            return new THREE.Quaternion(x, y, z, w);
        }

        for(let color = 0x111111; color <= 0xFFFFFF; color += 0x111111){
            const geometry = new THREE.Geometry();

            for(let i=0; i<1000; i++) {
                const starPosition = new THREE.Vector3(10000000, 0, 0);
                starPosition.applyQuaternion(randomQuaternion());
                geometry.vertices.push(starPosition);
            }

            background.add(new THREE.Points(geometry, new THREE.PointsMaterial({ color })));
        }

        scene.add(background);
        background.spinAxis = new THREE.Vector3(1, 1, 0).normalize();
        background.spinSpeed = 0.1;
        return background;
    }

    function addSpaceship(){
        loader.load(
            'models/spaceship.glb',
            function ( gltf ) {
                scene.add( gltf.scene );
            },
            undefined,
            function ( error ) {
                console.error( error );
            }
        );
    }

    function addLights(){
        const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.5);
        scene.add(ambientLight);
        const pointLight = new THREE.PointLight(0xFFFFFF, 100);
        pointLight.position.set(0, 0, 2);
        scene.add(pointLight);
    }

    function createRenderer(){
        const renderer = new THREE.WebGLRenderer({canvas, antialias: true, alpha: true, powerPreference: "high-performance"});
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.physicallyCorrectLights = true;
        window.addEventListener('resize', resize, false);
        return renderer;
    }
}

main();