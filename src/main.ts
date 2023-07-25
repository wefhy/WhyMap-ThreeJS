import './style.css'

import * as THREE from 'three';

import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';


const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg') as HTMLCanvasElement
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

camera.position.setZ(30);

renderer.render(scene, camera);

const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
// const material = new THREE.MeshBasicMaterial({color: 0xFF6347, wireframe: true});
const material = new THREE.MeshStandardMaterial({color: 0xFF6347});
const torus = new THREE.Mesh(geometry, material);

// scene.add(torus);

const ambientLight = new THREE.AmbientLight(0x444455);
const pointLight = new THREE.PointLight(0xffffff);
const hemiLight = new THREE.HemisphereLight( 0x0000ff, 0x00ff00, 0.6 );
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


pointLight.position.set(25, 25, 25);


// scene.add(pointLight);
scene.add(ambientLight);
// scene.add(hemiLight);
scene.add(sun);
scene.add(sun.target);

const lightHelper = new THREE.PointLightHelper(pointLight);
const gridHelper = new THREE.GridHelper(200, 50);

const controls = new OrbitControls(camera, renderer.domElement);



scene.add(lightHelper, gridHelper);

function animate() {
    requestAnimationFrame(animate);

    torus.rotation.x += 0.01;
    torus.rotation.y += 0.005;
    torus.rotation.z += 0.01;

    controls.update();

    renderer.render(scene, camera);
}

animate();

// const terrain = new THREE.Mesh(
//     new THREE.PlaneGeometry(3, 3, 64, 64),
//     new THREE.MeshStandardMaterial({color: 0x00ff00})
// );
//
// terrain.rotation.x = -Math.PI / 2;
// terrain.position.y = -0.5;
//
// scene.add(terrain);

// const meshUrl = 'http://localhost:7542/three/tiles/17/65508/65544'
const meshUrl = 'http://localhost:7542/three/tiles/17/65529/65539'
const textureAtlasUrl = 'http://localhost:7542/textureAtlas'
// const textureAtlasUrl = 'http://localhost:7542/tiles/17/65529/65539?dimension=0.2745372073367526'

const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load(textureAtlasUrl);
texture.magFilter = THREE.NearestFilter;
texture.minFilter = THREE.NearestFilter;
texture.wrapT = THREE.RepeatWrapping;
// texture.wrapS = THREE.RepeatWrapping;

interface WhyMesh {
    vertices: number[];
    indices: number[];
    uvs: number[];
}

function loadMesh(url: string): Promise<WhyMesh> {
    return fetch(url)
        .then(response => response.json())
        .then(data => {
            return {
                vertices: data.vertices,
                indices: data.faces,
                uvs: data.uvs
            }
        })
}

loadMesh(meshUrl).then(mesh => {
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

// const color = 0xFFFFFF;
// const intensity = 1;
// const light = new THREE.AmbientLight(color, intensity);
// scene.add(light);






// import typescriptLogo from './typescript.svg'
// import viteLogo from '/vite.svg'
// import { setupCounter } from './counter.ts'
//
// document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
//   <div>
//     <a href="https://vitejs.dev" target="_blank">
//       <img src="${viteLogo}" class="logo" alt="Vite logo" />
//     </a>
//     <a href="https://www.typescriptlang.org/" target="_blank">
//       <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
//     </a>
//     <h1>Vite + TypeScript</h1>
//     <div class="card">
//       <button id="counter" type="button"></button>
//     </div>
//     <p class="read-the-docs">
//       Click on the Vite and TypeScript logos to learn more
//     </p>
//   </div>
// `
//
// setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)
