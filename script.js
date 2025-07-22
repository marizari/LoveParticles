console.clear();

// SETUP
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

// CONTROLS
const controlsWebGL = new THREE.OrbitControls(camera, renderer.domElement);

// PARTICLES FROM HEART
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
const material = new THREE.PointsMaterial({
  color: 0xee5282,
  blending: THREE.AdditiveBlending,
  size: 3
});
const particles = new THREE.Points(geometry, material);
particles.position.x -= 600 / 2;
particles.position.y += 552 / 2;
scene.add(particles);

gsap.fromTo(scene.rotation, {
  y: -0.2
}, {
  y: 0.2,
  repeat: -1,
  yoyo: true,
  ease: 'power2.inOut',
  duration: 3
});

// RENDER
function render() {
  requestAnimationFrame(render);
  geometry.setFromPoints(vertices);
  renderer.render(scene, camera);
}
render();

// RESIZE
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// SHIPPAR NOME
const nomesMah = [
  "maria", "eduarda", "delazari", "pacheco",
  "maria eduarda", "maria delazari", "eduarda pacheco",
  "maria eduarda pacheco delazari", "mah"
];

const nomesVille = [
  "ville", "nunes", "figueiredo", "silva",
  "ville nunes", "ville figueiredo", "ville da silva",
  "ville nunes figueiredo da silva"
];

function normalizar(nome) {
  return nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function shippar() {
  const nome1 = normalizar(document.getElementById("nome1").value);
  const nome2 = normalizar(document.getElementById("nome2").value);
  const resultadoDiv = document.getElementById("resultado");

  let porcentagem = 0;

  if (
    (nomesMah.some(n => nome1.includes(n)) && nomesVille.some(n => nome2.includes(n))) ||
    (nomesMah.some(n => nome2.includes(n)) && nomesVille.some(n => nome1.includes(n)))
  ) {
    porcentagem = 100;
  } else {
    porcentagem = Math.floor(Math.random() * 99) + 1;
  }

  resultadoDiv.style.opacity = "0";
  resultadoDiv.innerHTML = `💘 Compatibilidade: <strong>${porcentagem}%</strong> 💘`;
  setTimeout(() => {
    resultadoDiv.style.animation = "fadeIn 1s ease forwards";
  }, 100);
}
