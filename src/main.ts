import './style.css'

import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';


const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg') as HTMLCanvasElement
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

camera.position.setZ(30);
camera.position.setX(10);
camera.position.setY(60);


renderer.render(scene, camera);

// scene.add(torus);

const ambientLight = new THREE.AmbientLight(0x444455);
// const pointLight = new THREE.PointLight(0xffffff);
// const hemiLight = new THREE.HemisphereLight( 0x0000ff, 0x00ff00, 0.6 );
const sun = new THREE.DirectionalLight(0xffeedd, 0.8);
sun.position.set(0, 100, 0)
sun.target.position.set(-20, 0, -50);
sun.castShadow = true;
sun.shadow.mapSize.width = 4096;
sun.shadow.mapSize.height = 4096;
sun.shadow.radius = 2;
sun.shadow.camera.near = 0.5;
sun.shadow.camera.far = 500;
sun.shadow.camera.left = -500;
sun.shadow.camera.right = 500;
sun.shadow.camera.top = 500;
sun.shadow.camera.bottom = -500;


// pointLight.position.set(25, 25, 25);


// scene.add(pointLight);
scene.add(ambientLight);
// scene.add(hemiLight);
scene.add(sun);
scene.add(sun.target);

// const lightHelper = new THREE.PointLightHelper(pointLight);
const gridHelper = new THREE.GridHelper(200, 50);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);




// scene.add(lightHelper);
scene.add(gridHelper);

function animate() {
    requestAnimationFrame(animate);

    controls.update();

    renderer.render(scene, camera);
}

animate();

// const meshUrl = 'http://localhost:7542/three/tiles/17/65508/65544'

const urlParams = new URLSearchParams(window.location.search);
const x1 = urlParams.get('x1');
const x2 = urlParams.get('x2');
const z1 = urlParams.get('z1');
const z2 = urlParams.get('z2');

const renderCenterX = (Number(x2) - Number(x1)) / 2
const renderCenterY = (Number(z2) - Number(z1)) / 2

const areaUrl = `http://localhost:7542/three/area/${x1}/${z1}/${x2}/${z2}`
const meshUrl = 'http://localhost:7542/three/tiles/17/65529/65539'
const textureAtlasUrl = 'http://localhost:7542/textureAtlas'
// const textureAtlasUrl = 'http://localhost:7542/tiles/17/65529/65539?dimension=0.2745372073367526'

const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load(textureAtlasUrl);
texture.magFilter = THREE.NearestFilter;
texture.minFilter = THREE.NearestFilter;
texture.wrapT = THREE.RepeatWrapping;
// texture.wrapS = THREE.RepeatWrapping;

interface WhyObject {
    type: string;
    posX: number;
    posY: number;
    children?: WhyObject[];
}
interface WhyMesh extends WhyObject {
    vertices: number[];
    indices: number[];
    uvs: number[];
}



function loadMesh(url: string): Promise<WhyMesh> {
    return fetch(url).then(response => response.json())
}

function loadObject(url: string): Promise<WhyObject> {
    return fetch(url).then(response => response.json())
}

function displayMesh(mesh: WhyMesh, offsetX: number = 0, offsetY: number = 0) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(mesh.vertices, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(mesh.uvs, 2));
    geometry.setIndex(mesh.indices);
    console.log(mesh.indices.length / 3)

    const material = new THREE.MeshStandardMaterial({map: texture, color: 0xffffff});
    material.flatShading = true
    // const material = new THREE.MeshBasicMaterial({map: texture});
    const object = new THREE.Mesh(geometry, material);
    object.position.x = offsetX + mesh.posX;
    object.position.z = offsetY + mesh.posY;
    object.position.y = -63;
    scene.add(object);
    console.log(`object added at ${object.position.x} ${object.position.z}`)
}

function displayObject(object: WhyObject, offsetX: number = 0, offsetY: number = 0) {
    if(object.children) {
        object.children.forEach(child => displayObject(child, offsetX + object.posX, offsetY + object.posY))
    }
    if(object.type) {
        if (object.type === 'dev.wefhy.whymap.tiles.mesh.ThreeJsMesh') {
            displayMesh(object as WhyMesh, offsetX, offsetY)
        } else {
            console.log(object.type)
        }
    }
}

loadObject(areaUrl).then(object => {
    displayObject(object, -renderCenterX, -renderCenterY)
})

loadMesh(meshUrl).then(mesh => {
    return
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(mesh.vertices, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(mesh.uvs, 2));
    geometry.setIndex(mesh.indices);
    console.log(mesh.indices.length / 3)

    const material = new THREE.MeshStandardMaterial({map: texture, color: 0xffffff});
    material.flatShading = true
    // const material = new THREE.MeshBasicMaterial({map: texture});
    const object = new THREE.Mesh(geometry, material);
    object.position.x = -10;
    object.position.z = -2;
    object.position.y = -6;
    // renderer.shadowMapEnabled = true;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.needsUpdate = true;
    renderer.shadowMap.autoUpdate = true
    object.castShadow = true;
    object.receiveShadow = true;
    scene.add(object);
})


