import './style.css'

import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
camera.position.set(10, 60, 30);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg') as HTMLCanvasElement
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.render(scene, camera);


const ambientLight = new THREE.AmbientLight(0x444455, 2.0);
const sun = new THREE.DirectionalLight(0xffeedd, 1.2);
sun.position.set(0, 100, 0)
sun.target.position.set(-20, 0, -50);
sun.castShadow = true;
scene.add(ambientLight);
scene.add(sun);
scene.add(sun.target);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

const urlParams = new URLSearchParams(window.location.search);
const x1 = urlParams.get('x1');
const x2 = urlParams.get('x2');
const z1 = urlParams.get('z1');
const z2 = urlParams.get('z2');

const baseUrl = (location.host.slice(-4) === "5173") ? "localhost:7542" : location.host

const renderCenterX = (Number(x2) - Number(x1)) / 2
const renderCenterY = (Number(z2) - Number(z1)) / 2
const areaUrl = `http://${baseUrl}/three/area/${x1}/${z1}/${x2}/${z2}`
const overlayUrl = `http://${baseUrl}/three/overlay/${x1}/${z1}/${x2}/${z2}`
const textureAtlasUrl = `http://${baseUrl}/textureAtlas`

const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load(textureAtlasUrl);
texture.colorSpace = THREE.SRGBColorSpace;
// texture.colorSpace = THREE.LinearSRGBColorSpace;
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

function loadObject(url: string): Promise<WhyObject> {
    return fetch(url).then(response => response.json()).catch(error => {
        console.error(error);
        document.getElementById("app")!!.appendChild(
            document.createTextNode("Error: " + error)
        )
        // alert(error)
    })
}

function displayMesh(mesh: WhyMesh, offsetX: number = 0, offsetY: number = 0, semitransparent: boolean = false) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(mesh.vertices, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(mesh.uvs, 2));
    geometry.setIndex(mesh.indices);
    console.log(mesh.indices.length / 3)
    let material = new THREE.MeshStandardMaterial({map: texture, color: 0xffffff});
    // let material = new THREE.MeshPhysicalMaterial({map: texture, color: 0xffffff});

    if (semitransparent) {
        // material.ior = 1.45;
        material.transparent = true;
        material.opacity = 0.825;
        // material.metalness = 1.0;
        // material.roughness = 0.05;
    }
    material.flatShading = true;
    material.roughness = 1.0;
    const object = new THREE.Mesh(geometry, material);
    object.position.x = offsetX + mesh.posX;
    object.position.z = offsetY + mesh.posY;
    object.position.y = -62;
    scene.add(object);
    console.log(`object added at ${object.position.x} ${object.position.z}`)
}

function displayObject(object: WhyObject, offsetX: number = 0, offsetY: number = 0, semitransparent: boolean = false) {
    if(object.children) {
        object.children.forEach(child => displayObject(child, offsetX + object.posX, offsetY + object.posY, semitransparent))
    }
    if(object.type && object.type === 'ThreeJsMesh') {
        displayMesh(object as WhyMesh, offsetX, offsetY, semitransparent)
    }
}

function reportError(object: WhyObject) {
    console.error('Not a ThreeJsObject');
    let text = JSON.stringify(object);
    if (text.length > 1000) {
        text = text.substring(0, 1000) + '...';
    }
    console.error(text);
    document.getElementById("bg")!!.style.display = "none"
    document.getElementById("app")!!.appendChild(
        document.createTextNode(text)
    )
    // alert(text)
}

loadObject(areaUrl).then(object => {
    if (!object.children) { reportError(object); return; }
    displayObject(object, -renderCenterX, -renderCenterY)
})

loadObject(overlayUrl).then(object => {
    if (!object.children) { reportError(object); return; }
    displayObject(object, -renderCenterX, -renderCenterY, true)
})
