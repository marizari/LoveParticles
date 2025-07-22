console.clear();

/* SETUP */
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  5000
);
camera.position.z = 500;

const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

/* CONTROLS */
const controlsWebGL = new THREE.OrbitControls(camera, renderer.domElement);

/* FUNDO GALÁXIA */
const loader = new THREE.TextureLoader();
loader.load('https://cdn.pixabay.com/photo/2013/07/18/10/56/space-164560_1280.jpg', function(texture) {
  const bgGeometry = new THREE.PlaneGeometry(4000, 4000);
  const bgMaterial = new THREE.MeshBasicMaterial({ map: texture, depthWrite: false });
  const bgMesh = new THREE.Mesh(bgGeometry, bgMaterial);
  bgMesh.position.z = -1000; // Coloca o fundo bem atrás
  scene.add(bgMesh);
});

/* PARTICLES */
const tl = gsap.timeline({ repeat: -1, yoyo: true });

const path = document.querySelector("path");
const length = path.getTotalLength();
const vertices = [];

for (let i = 0; i < length; i += 0.1) {
  const point = path.getPointAtLength(i);
  const vector = new THREE.Vector3(point.x, -point.y, 0);
  vector.x += (Math.random() - 0.5) * 30;
  vector.y += (Math.random() - 0.5) * 30;
  vector.z += (Math.random() - 0.5) * 70;
  vertices.push(vector);

  tl.from(vector, {
    x: 600 / 2,
    y: -552 / 2,
    z: 0,
    ease: "power2.inOut",
    duration: "random(2, 5)"
  }, i * 0.002);
}

const geometry = new THREE.BufferGeometry().setFromPoints(vertices);
const material = new THREE.PointsMaterial({
  color: 0xee5282,
  blending: THREE.AdditiveBlending,
  size: 3,
  transparent: true
});
const particles = new THREE.Points(geometry, material);
particles.position.x -= 600 / 2;
particles.position.y += 552 / 2;
scene.add(particles);

/* ANIMAÇÃO PULSANTE */
gsap.to(material, {
  size: 6,
  duration: 1.5,
  repeat: -1,
  yoyo: true,
  ease: "sine.inOut"
});

/* ROTACIONAR CENA */
gsap.fromTo(scene.rotation, {
  y: -0.2
}, {
  y: 0.2,
  repeat: -1,
  yoyo: true,
  ease: 'power2.inOut',
  duration: 3
});

/* RENDERING */
function render() {
  requestAnimationFrame(render);
  geometry.setFromPoints(vertices);
  renderer.render(scene, camera);
}

/* RESIZE */
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

requestAnimationFrame(render);
