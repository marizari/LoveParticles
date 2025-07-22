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

const controls = new THREE.OrbitControls(camera, renderer.domElement);

/* HEART PARTICLES */
const path = document.querySelector("path");
const length = path.getTotalLength();
const vertices = [];

const tl = gsap.timeline({ repeat: -1, yoyo: true });

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

/* SHADER MATERIAL */
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

const particles = new THREE.Points(geometry, material);
particles.position.x -= 600 / 2;
particles.position.y += 552 / 2;
scene.add(particles);

/* BACKGROUND PARTICLES */
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

/* INTERACTION: explode on mouse */
function explodeParticles() {
  vertices.forEach(v => {
    gsap.to(v, {
      x: v.x * 1.8,
      y: v.y * 1.8,
      z: v.z * 1.8,
      duration: 1,
      ease: "power2.out",
      overwrite: true
    });
  });
}

function implodeParticles() {
  vertices.forEach(v => {
    gsap.to(v, {
      x: v.x / 1.8,
      y: v.y / 1.8,
      z: v.z / 1.8,
      duration: 1,
      ease: "power2.inOut",
      overwrite: true
    });
  });
}

window.addEventListener("mouseenter", explodeParticles);
window.addEventListener("mouseleave", implodeParticles);

/* RENDER */
function render() {
  requestAnimationFrame(render);
  uniforms.uTime.value += 0.02;
  geometry.setFromPoints(vertices);
  bgParticles.rotation.y += 0.0005;
  renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

requestAnimationFrame(render);
