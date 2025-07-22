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
  bgMesh.position.z = -1000;
  scene.add(bgMesh);
});

/* PARTICLES DO CORAÇÃO */
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

/* SHADER COM GRADIENTE */
const uniforms = {
  uTime: { value: 0.0 }
};

const material = new THREE.ShaderMaterial({
  uniforms: uniforms,
  vertexShader: `
    uniform float uTime;
    varying float vTime;
    void main() {
      vTime = uTime;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = 4.0;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    precision mediump float;
    varying float vTime;

    void main() {
      vec2 uv = gl_PointCoord;

      float r = 0.9 + 0.1 * sin(vTime + uv.y * 10.0);
      float g = 0.5 + 0.5 * sin(vTime + uv.x * 5.0);
      float b = 0.7 + 0.3 * sin(vTime * 0.5 + uv.y * 15.0);

      gl_FragColor = vec4(r, g, b, 1.0);
    }
  `,
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});

/* CRIA E POSICIONA O CORAÇÃO */
const geometry = new THREE.BufferGeometry().setFromPoints(vertices);
const particles = new THREE.Points(geometry, material);
particles.position.x -= 600 / 2;
particles.position.y += 552 / 2;
scene.add(particles);

/* PARTICULAS DE FUNDO */
const bgVertices = [];
for (let i = 0; i < 1000; i++) {
  const x = (Math.random() - 0.5) * 4000;
  const y = (Math.random() - 0.5) * 4000;
  const z = -Math.random() * 1500 - 500;
  bgVertices.push(new THREE.Vector3(x, y, z));
}

const bgGeometry = new THREE.BufferGeometry().setFromPoints(bgVertices);
const bgMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 2,
  transparent: true,
  opacity: 0.3,
  depthWrite: false
});

const bgParticles = new THREE.Points(bgGeometry, bgMaterial);
scene.add(bgParticles);

/* INTERAÇÃO COM MOUSE */
let targetRotation = { x: 0, y: 0 };

window.addEventListener("mousemove", (e) => {
  const x = (e.clientX / window.innerWidth) * 2 - 1;
  const y = (e.clientY / window.innerHeight) * 2 - 1;

  targetRotation.y = x * 0.5;
  targetRotation.x = y * 0.3;

  gsap.to(scene.rotation, {
    x: targetRotation.x,
    y: targetRotation.y,
    duration: 1.2,
    ease: "power2.out"
  });
});

/* RENDERING */
function render() {
  requestAnimationFrame(render);
  uniforms.uTime.value += 0.02;
  geometry.setFromPoints(vertices);
  bgParticles.rotation.y += 0.0005;
  renderer.render(scene, camera);
}

/* RESIZE */
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

requestAnimationFrame(render);
