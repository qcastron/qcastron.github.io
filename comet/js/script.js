import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000); // Black background preserved

const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 2000);
const defaultCamPos = new THREE.Vector3(0, 0, 140);
const visualCenterOfMass = new THREE.Vector3(15, 15, 0);
camera.position.copy(defaultCamPos);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.copy(visualCenterOfMass);
controls.maxDistance = 240;
controls.minDistance = 5;

function createSoftParticleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const imgData = ctx.createImageData(128, 128);
  const data = imgData.data;

  for (let y = 0; y < 128; y++) {
    for (let x = 0; x < 128; x++) {
      const dx = (x - 63.5) / 63.5;
      const dy = (y - 63.5) / 63.5;
      const r = Math.sqrt(dx * dx + dy * dy);
      let alpha = 0;
      if (r < 1.0) {
        alpha = Math.pow(1.0 - r, 3.2);
      }
      const idx = (y * 128 + x) * 4;
      data[idx] = 255;
      data[idx + 1] = 255;
      data[idx + 2] = 255;
      data[idx + 3] = Math.floor(alpha * 255);
    }
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

const softTexture = createSoftParticleTexture();

const STAR_COUNT = 5000;
const starGeo = new THREE.BufferGeometry();
const starPositions = new Float32Array(STAR_COUNT * 3);
const starColors = new Float32Array(STAR_COUNT * 3);
const starBaseColors = new Float32Array(STAR_COUNT * 3);

const starPalette = [
  new THREE.Color(0xffffff),
  new THREE.Color(0x9bb0ff),
  new THREE.Color(0xffddb4),
  new THREE.Color(0xd0f0ff)
];

for (let i = 0; i < STAR_COUNT; i++) {
  const r = 480 + Math.random() * 600;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos((Math.random() * 2) - 1);

  starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
  starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
  starPositions[i * 3 + 2] = r * Math.cos(phi);

  const col = starPalette[Math.floor(Math.random() * starPalette.length)];
  const brightness = 0.35 + Math.random() * 0.65;

  const cr = col.r * brightness;
  const cg = col.g * brightness;
  const cb = col.b * brightness;

  starColors[i * 3] = cr;
  starColors[i * 3 + 1] = cg;
  starColors[i * 3 + 2] = cb;

  starBaseColors[i * 3] = cr;
  starBaseColors[i * 3 + 1] = cg;
  starBaseColors[i * 3 + 2] = cb;
}

starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

const starMat = new THREE.PointsMaterial({
  size: 3,
  vertexColors: true,
  transparent: true,
  opacity: 0.85,
  sizeAttenuation: true
});
const starField = new THREE.Points(starGeo, starMat);
scene.add(starField);

const nucleusGroup = new THREE.Group();
const NUCLEUS_POS = new THREE.Vector3(-25, -18, 0);
nucleusGroup.position.copy(NUCLEUS_POS);
scene.add(nucleusGroup);

const baseCoreRadius = 0.42;
const nucleusGeo = new THREE.IcosahedronGeometry(baseCoreRadius, 3);
const posAttr = nucleusGeo.attributes.position;
for (let i = 0; i < posAttr.count; i++) {
  let v = new THREE.Vector3().fromBufferAttribute(posAttr, i);
  let displacement = Math.sin(v.x * 8.5) * Math.cos(v.y * 7.0 + v.z * 4.8) * (baseCoreRadius * 0.22);
  v.multiplyScalar(1.0 + displacement);
  posAttr.setXYZ(i, v.x, v.y, v.z);
}
nucleusGeo.computeVertexNormals();

const nucleusMat = new THREE.MeshStandardMaterial({
  color: 0x788c96,
  roughness: 0.96,
  metalness: 0.04,
  flatShading: true
});
const nucleusMesh = new THREE.Mesh(nucleusGeo, nucleusMat);
nucleusGroup.add(nucleusMesh);

const sunLight = new THREE.DirectionalLight(0xffffff, 2.8);
sunLight.position.set(-45, -45, 10);
scene.add(sunLight);

const ambientLight = new THREE.AmbientLight(0x0a1428, 0.6);
scene.add(ambientLight);

const V_ION = new THREE.Vector3(0.707, 0.707, 0.0).normalize();
const V_DUST_CURVE = new THREE.Vector3(-0.35, 0.93, 0.1).normalize();

function buildOrthonormalBasis(direction) {
  const w = direction.clone().normalize();
  let u = new THREE.Vector3(0, 1, 0).cross(w);
  if (u.lengthSq() < 0.01) {
    u = new THREE.Vector3(1, 0, 0).cross(w);
  }
  u.normalize();
  const v = w.clone().cross(u).normalize();
  return { u, v, w };
}

const tailBasis = buildOrthonormalBasis(V_ION);

const comaGroup = new THREE.Group();
comaGroup.position.copy(NUCLEUS_POS);
scene.add(comaGroup);

const COMA_TYPE_A_COUNT = 3000;
const COMA_TYPE_B_COUNT = 800;

const comaColorHead = new THREE.Color(0x88ffff);
const comaColorMid = new THREE.Color(0x00e5ff);
const comaColorOuter = new THREE.Color(0x004488);

function createComaSystem(count, isTypeB) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const data = [];

  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    const radX = Math.sin(phi) * Math.cos(theta);
    const radY = Math.sin(phi) * Math.sin(theta);
    const radZ = Math.cos(phi);

    const rNorm = Math.cbrt(Math.random());
    const maxOutflow = (isTypeB ? 4.5 : 6.5) + Math.random() * 4.0;
    const speed = (isTypeB ? 1.8 : 2.5) + Math.random() * 3.5;

    data.push({ radX, radY, radZ, rNorm, outflow: Math.random() * maxOutflow, maxOutflow, speed });

    pos[i * 3] = 0; pos[i * 3 + 1] = 0; pos[i * 3 + 2] = 0;
    col[i * 3] = comaColorHead.r; col[i * 3 + 1] = comaColorHead.g; col[i * 3 + 2] = comaColorHead.b;
  }

  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

  const mat = new THREE.PointsMaterial({
    size: isTypeB ? 4.8 : 2.2,
    map: softTexture,
    vertexColors: true,
    transparent: true,
    opacity: isTypeB ? 0.032 : 0.055,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true
  });

  return { points: new THREE.Points(geo, mat), geo, mat, data, count };
}

const comaTypeA = createComaSystem(COMA_TYPE_A_COUNT, false);
const comaTypeB = createComaSystem(COMA_TYPE_B_COUNT, true);
comaGroup.add(comaTypeA.points);
comaGroup.add(comaTypeB.points);

const ION_TYPE_A_COUNT = 80000;
const ION_TYPE_B_COUNT = 10000;
const ION_MAX_LEN = 135.0;

const ionColorHead = new THREE.Color(0x00f0ff);
const ionColorMid = new THREE.Color(0x1e88e5);
const ionColorTail = new THREE.Color(0x031236);

function createIonSystem(count, isTypeB) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const data = [];

  for (let i = 0; i < count; i++) {
    const u = Math.random() * ION_MAX_LEN;
    const speed = 28.0 + Math.random() * 22.0;

    const circleAngle = Math.random() * Math.PI * 2;
    const rFraction = Math.sqrt(Math.random());

    const sTheta = Math.random() * Math.PI * 2;
    const sPhi = Math.acos((Math.random() * 2) - 1);
    const sRad = Math.cbrt(Math.random());
    const spawnX = Math.sin(sPhi) * Math.cos(sTheta) * sRad;
    const spawnY = Math.sin(sPhi) * Math.sin(sTheta) * sRad;
    const spawnZ = Math.cos(sPhi) * sRad;

    const normU = u / ION_MAX_LEN;
    const color = new THREE.Color();
    if (normU < 0.25) {
      color.lerpColors(ionColorHead, ionColorMid, normU / 0.25);
    } else {
      color.lerpColors(ionColorMid, ionColorTail, (normU - 0.25) / 0.75);
    }

    data.push({ u, speed, circleAngle, rFraction, spawnX, spawnY, spawnZ, baseColor: color });

    pos[i * 3] = 0; pos[i * 3 + 1] = 0; pos[i * 3 + 2] = 0;
    col[i * 3] = color.r; col[i * 3 + 1] = color.g; col[i * 3 + 2] = color.b;
  }

  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

  const mat = new THREE.PointsMaterial({
    size: isTypeB ? 8.0 : 1.0,
    map: softTexture,
    vertexColors: true,
    transparent: true,
    opacity: isTypeB ? 0.018 : 0.08,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true
  });

  return { points: new THREE.Points(geo, mat), geo, mat, data, count };
}

const ionTypeA = createIonSystem(ION_TYPE_A_COUNT, false);
const ionTypeB = createIonSystem(ION_TYPE_B_COUNT, true);
scene.add(ionTypeA.points);
scene.add(ionTypeB.points);

const DUST_TYPE_A_COUNT = 90000;
const DUST_TYPE_B_COUNT = 25000;
const DUST_MAX_LEN = 115.0;

const dustColorHead = new THREE.Color(0xfffcf5);
const dustColorMid = new THREE.Color(0xffd54f);
const dustColorTail = new THREE.Color(0x3e2723);

function createDustSystem(count, isTypeB) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const data = [];

  for (let i = 0; i < count; i++) {
    const u = Math.random() * DUST_MAX_LEN;
    const speed = 11.0 + Math.random() * 14.0;

    const circleAngle = Math.random() * Math.PI * 2;
    const rFraction = Math.pow(Math.random(), 0.6);
    const fanAngle = (Math.random() - 0.5) * 2.0;

    const sTheta = Math.random() * Math.PI * 2;
    const sPhi = Math.acos((Math.random() * 2) - 1);
    const sRad = Math.cbrt(Math.random());
    const spawnX = Math.sin(sPhi) * Math.cos(sTheta) * sRad;
    const spawnY = Math.sin(sPhi) * Math.sin(sTheta) * sRad;
    const spawnZ = Math.cos(sPhi) * sRad;

    const normU = u / DUST_MAX_LEN;
    const color = new THREE.Color();
    if (normU < 0.22) {
      color.lerpColors(dustColorHead, dustColorMid, normU / 0.22);
    } else {
      color.lerpColors(dustColorMid, dustColorTail, (normU - 0.22) / 0.78);
    }

    data.push({ u, speed, circleAngle, rFraction, fanAngle, spawnX, spawnY, spawnZ, baseColor: color });

    pos[i * 3] = 0; pos[i * 3 + 1] = 0; pos[i * 3 + 2] = 0;
    col[i * 3] = color.r; col[i * 3 + 1] = color.g; col[i * 3 + 2] = color.b;
  }

  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

  const mat = new THREE.PointsMaterial({
    size: isTypeB ? 8.0 : 1.8,
    map: softTexture,
    vertexColors: true,
    transparent: true,
    opacity: isTypeB ? 0.022 : 0.038,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true
  });

  return { points: new THREE.Points(geo, mat), geo, mat, data, count };
}

const dustTypeA = createDustSystem(DUST_TYPE_A_COUNT, false);
const dustTypeB = createDustSystem(DUST_TYPE_B_COUNT, true);
scene.add(dustTypeA.points);
scene.add(dustTypeB.points);

const params = {
  profilePreset: 'High',
  panSpeed: 1.0,

  overexposureDimming: 6.5,
  dimDistance: 13.0,
  logisticSlope: 0.12,

  coreRadius: 1.0,

  comaSize: 1.0,
  comaBrightness: 0.8,
  comaTypeA_Size: 0.5,
  comaTypeA_Density: 0.1,
  comaTypeA_Brightness: 15.0,
  comaTypeB_Size: 20.0,
  comaTypeB_Density: 1,
  comaTypeB_Brightness: 0.6,

  ionBrightness: 1.0,
  ionWindSpeed: 1.0,
  ionThickness: 1.5,
  ionTypeA_Size: 1.0,
  ionTypeA_Density: 4.0,
  ionTypeA_Brightness: 30.0,
  ionTypeB_Size: 15.0,
  ionTypeB_Density: 1,
  ionTypeB_Brightness: 1,

  dustBrightness: 3.0,
  dustFanSpread: 1.0,
  dustThickness: 1.0,
  dustTypeA_Size: 1.0,
  dustTypeA_Density: 4.0,
  dustTypeA_Brightness: 15.0,
  dustTypeB_Size: 20.0,
  dustTypeB_Density: 1,
  dustTypeB_Brightness: 0.3,

  animSpeed: 1.0,
  starBrightness: 1.0,
  resetCamera: function () {
    camera.position.copy(defaultCamPos);
    controls.target.copy(visualCenterOfMass);
    controls.update();
  }
};

function applyProfilePreset(preset) {
  params.profilePreset = preset;
  const isHigh = preset === 'High';
  const densityMultA = isHigh ? 1.0 : 0.0;

  comaTypeA.geo.setDrawRange(0, Math.floor(COMA_TYPE_A_COUNT * params.comaTypeA_Density * densityMultA));
  ionTypeA.geo.setDrawRange(0, Math.floor(ION_TYPE_A_COUNT * (params.ionTypeA_Density / 4.0) * densityMultA));
  dustTypeA.geo.setDrawRange(0, Math.floor(DUST_TYPE_A_COUNT * (params.dustTypeA_Density / 4.0) * densityMultA));
}

comaTypeA.mat.size = params.comaTypeA_Size;
comaTypeA.mat.opacity = 0.055 * params.comaTypeA_Brightness * params.comaBrightness;
comaTypeB.mat.size = params.comaTypeB_Size;
comaTypeB.mat.opacity = 0.032 * params.comaTypeB_Brightness * params.comaBrightness;

ionTypeA.mat.size = params.ionTypeA_Size;
ionTypeA.mat.opacity = 0.005 * params.ionTypeA_Brightness * params.ionBrightness;
ionTypeB.mat.size = params.ionTypeB_Size;
ionTypeB.mat.opacity = 0.02 * params.ionTypeB_Brightness * params.ionBrightness;

dustTypeA.mat.size = params.dustTypeA_Size;
dustTypeA.mat.opacity = 0.005 * params.dustTypeA_Brightness * params.dustBrightness;
dustTypeB.mat.size = params.dustTypeB_Size;
dustTypeB.mat.opacity = 0.02 * params.dustTypeB_Brightness * params.dustBrightness;

comaTypeA.geo.setDrawRange(0, Math.floor(COMA_TYPE_A_COUNT * params.comaTypeA_Density));
comaTypeB.geo.setDrawRange(0, Math.min(COMA_TYPE_B_COUNT, Math.floor(COMA_TYPE_B_COUNT * params.comaTypeB_Density)));
ionTypeA.geo.setDrawRange(0, Math.floor(ION_TYPE_A_COUNT * (params.ionTypeA_Density / 4.0)));
ionTypeB.geo.setDrawRange(0, Math.min(ION_TYPE_B_COUNT, Math.floor(ION_TYPE_B_COUNT * params.ionTypeB_Density)));
dustTypeA.geo.setDrawRange(0, Math.floor(DUST_TYPE_A_COUNT * (params.dustTypeA_Density / 4.0)));
dustTypeB.geo.setDrawRange(0, Math.min(DUST_TYPE_B_COUNT, Math.floor(DUST_TYPE_B_COUNT * params.dustTypeB_Density)));

const gui = new dat.GUI({ width: 330 });

const dimFolder = gui.addFolder('Anti-Blowout Dimming');
dimFolder.add(params, 'overexposureDimming', 0.0, 20.0).name('Dimming Strength');
dimFolder.add(params, 'dimDistance', 1.0, 40.0).name('Dimming Range');
dimFolder.add(params, 'logisticSlope', 0.05, 1.5).name('Transition Slope');

const perfFolder = gui.addFolder('Performance & Presets');
const presetController = perfFolder.add(params, 'profilePreset', ['High', 'Low']).name('Rendering Profile').onChange(v => applyProfilePreset(v));

const camFolder = gui.addFolder('Camera Automation');
camFolder.add(params, 'panSpeed', 0.0, 10.0).name('Pan Speed');

const coreFolder = gui.addFolder('Rocky Core');
coreFolder.add(params, 'coreRadius', 0.1, 4.0).name('Core Radius').onChange((v) => nucleusMesh.scale.setScalar(v));

const comaFolder = gui.addFolder('Spherical Coma');
comaFolder.add(params, 'comaSize', 0.5, 6.0).name('Coma Size (Radius)');
comaFolder.add(params, 'comaBrightness', 0.0, 2.0).name('Global Coma Opacity');

const comaA = comaFolder.addFolder('Type A (Fine Dust)');
comaA.add(params, 'comaTypeA_Size', 0.1, 2.0).name('Particle Size').onChange(v => comaTypeA.mat.size = v);
comaA.add(params, 'comaTypeA_Density', 0.01, 1.0).name('Density').onChange(() => applyProfilePreset(params.profilePreset));
comaA.add(params, 'comaTypeA_Brightness', 0.0, 40.0).name('Type A Opacity').onChange(v => comaTypeA.mat.opacity = 0.055 * v * params.comaBrightness);

const comaB = comaFolder.addFolder('Type B (Large Flares)');
comaB.add(params, 'comaTypeB_Size', 1.0, 50.0).name('Particle Size').onChange(v => comaTypeB.mat.size = v);
comaB.add(params, 'comaTypeB_Density', 0.01, 1.0).name('Density').onChange(v => comaTypeB.geo.setDrawRange(0, Math.min(COMA_TYPE_B_COUNT, Math.floor(COMA_TYPE_B_COUNT * v))));
comaB.add(params, 'comaTypeB_Brightness', 0.0, 2.0).name('Type B Opacity').onChange(v => comaTypeB.mat.opacity = 0.032 * v * params.comaBrightness);

const ionFolder = gui.addFolder('Blue Ion Tail');
ionFolder.add(params, 'ionBrightness', 0.0, 3.0).name('Global Ion Opacity').onChange(v => {
  ionTypeA.mat.opacity = 0.005 * params.ionTypeA_Brightness * v;
  ionTypeB.mat.opacity = 0.02 * params.ionTypeB_Brightness * v;
});
ionFolder.add(params, 'ionWindSpeed', 0.1, 3.0).name('Solar Wind Speed');
ionFolder.add(params, 'ionThickness', 0.1, 4.0).name('Tail Thickness');

const ionA = ionFolder.addFolder('Type A (Fine Gas)');
ionA.add(params, 'ionTypeA_Size', 0.1, 3.0).name('Particle Size').onChange(v => ionTypeA.mat.size = v);
ionA.add(params, 'ionTypeA_Density', 0.1, 10.0).name('Density').onChange(() => applyProfilePreset(params.profilePreset));
ionA.add(params, 'ionTypeA_Brightness', 0.0, 40.0).name('Type A Opacity').onChange(v => ionTypeA.mat.opacity = 0.005 * v * params.ionBrightness);

const ionB = ionFolder.addFolder('Type B (Gas Pockets)');
ionB.add(params, 'ionTypeB_Size', 1.0, 40.0).name('Particle Size').onChange(v => ionTypeB.mat.size = v);
ionB.add(params, 'ionTypeB_Density', 0.05, 2.0).name('Density').onChange(v => ionTypeB.geo.setDrawRange(0, Math.min(ION_TYPE_B_COUNT, Math.floor(ION_TYPE_B_COUNT * v))));
ionB.add(params, 'ionTypeB_Brightness', 0.0, 2.0).name('Type B Opacity').onChange(v => ionTypeB.mat.opacity = 0.02 * v * params.ionBrightness);

const dustFolder = gui.addFolder('White-Yellow Dust Tail');
dustFolder.add(params, 'dustBrightness', 0.0, 10.0).name('Global Dust Opacity').onChange(v => {
  dustTypeA.mat.opacity = 0.005 * params.dustTypeA_Brightness * v;
  dustTypeB.mat.opacity = 0.02 * params.dustTypeB_Brightness * v;
});
dustFolder.add(params, 'dustFanSpread', 0.1, 3.0).name('Curve Spread');
dustFolder.add(params, 'dustThickness', 0.1, 3.0).name('Tail Thickness');

const dustA = dustFolder.addFolder('Type A (Fine Dust)');
dustA.add(params, 'dustTypeA_Size', 0.1, 3.0).name('Particle Size').onChange(v => dustTypeA.mat.size = v);
dustA.add(params, 'dustTypeA_Density', 0.1, 10.0).name('Density').onChange(() => applyProfilePreset(params.profilePreset));
dustA.add(params, 'dustTypeA_Brightness', 0.0, 40.0).name('Type A Opacity').onChange(v => dustTypeA.mat.opacity = 0.005 * v * params.dustBrightness);

const dustB = dustFolder.addFolder('Type B (Dust Clouds)');
dustB.add(params, 'dustTypeB_Size', 1.0, 50.0).name('Particle Size').onChange(v => dustTypeB.mat.size = v);
dustB.add(params, 'dustTypeB_Density', 0.05, 1.0).name('Density').onChange(v => dustTypeB.geo.setDrawRange(0, Math.min(DUST_TYPE_B_COUNT, Math.floor(DUST_TYPE_B_COUNT * v))));
dustB.add(params, 'dustTypeB_Brightness', 0.0, 3.0).name('Type B Opacity').onChange(v => dustTypeB.mat.opacity = 0.02 * v * params.dustBrightness);

const envFolder = gui.addFolder('Global Environment');
envFolder.add(params, 'animSpeed', 0.0, 2.5).name('Sim Speed');
envFolder.add(params, 'starBrightness', 0.1, 2.0).name('Stars Brightness').onChange(v => starMat.opacity = 0.85 * v);
envFolder.add(params, 'resetCamera').name('Reset Camera View');

const toggleBtn = document.getElementById('gui-toggle-btn');
const guiContainer = document.querySelector('.dg.ac');
const headerBrand = document.querySelector('.header-brand');
let guiVisible = false;
let hideTimer = null;

function showControlsUI() {
  toggleBtn.classList.remove('fade-out');
  if (guiContainer && guiVisible) {
    guiContainer.classList.remove('fade-out');
  }
  if (headerBrand) {
    headerBrand.classList.remove('fade-out');
  }
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    toggleBtn.classList.add('fade-out');
    if (guiContainer) {
      guiContainer.classList.add('fade-out');
    }
    if (headerBrand) {
      headerBrand.classList.add('fade-out');
    }
  }, 3500);
}

window.addEventListener('mousemove', showControlsUI);
window.addEventListener('touchstart', showControlsUI);
showControlsUI();

toggleBtn.addEventListener('click', () => {
  guiVisible = !guiVisible;
  if (guiContainer) {
    guiContainer.style.display = guiVisible ? 'block' : 'none';
    if (guiVisible) {
      guiContainer.classList.remove('fade-out');
    }
  }
  toggleBtn.querySelector('span').textContent = guiVisible ? 'Hide Controls' : 'Show Controls';
});

const clock = new THREE.Clock();
let benchmarkActive = true;
let benchFrameCount = 0;
let benchStartTime = performance.now();

/**
 * Logistic curve transition for smooth anti-blowout particle exit
 * S(u) = 1 / (1 + exp(-slope * (u - dist)))
 * dimFactor = 1 / (1 + overexposureDimming * (1 - S(u)))
 */
function calculateLogisticDimFactor(u) {
  const dimmingStrength = params.overexposureDimming;
  if (dimmingStrength <= 0.001) return 1.0;

  const dist = params.dimDistance;
  const slope = params.logisticSlope;

  const sig = 1.0 / (1.0 + Math.exp(-slope * (u - dist)));
  return 1.0 / (1.0 + dimmingStrength * (1.0 - sig));
}

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.1) * params.animSpeed;

  // GPU Performance Benchmark Check
  if (benchmarkActive) {
    benchFrameCount++;
    const elapsedBench = (performance.now() - benchStartTime) / 1000.0;
    if (elapsedBench >= 5.0) {
      const avgFps = benchFrameCount / elapsedBench;
      if (avgFps < 20.0) {
        applyProfilePreset('Low');
        if (presetController) presetController.setValue('Low');
        const toastEl = document.getElementById('perf-toast');
        if (toastEl && window.bootstrap) {
          const toast = new bootstrap.Toast(toastEl);
          toast.show();
        }
      }
      benchmarkActive = false;
    }
  }

  // Camera Panning Automation
  if (params.panSpeed > 0 && delta > 0) {
    const panAngle = THREE.MathUtils.degToRad(params.panSpeed * 2.0) * delta;
    const camOffset = camera.position.clone().sub(controls.target);
    camOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), panAngle);
    camera.position.copy(controls.target).add(camOffset);
  }

  if (delta > 0) {
    nucleusMesh.rotation.y += 0.22 * delta;
    nucleusMesh.rotation.x += 0.12 * delta;

    // Dynamic star dimming inside the comet anti-blowout region
    const starColArr = starGeo.attributes.color.array;
    const starBrightMult = params.starBrightness;
    for (let i = 0; i < STAR_COUNT; i++) {
      const sx = starPositions[i * 3] - NUCLEUS_POS.x;
      const sy = starPositions[i * 3 + 1] - NUCLEUS_POS.y;
      const sz = starPositions[i * 3 + 2] - NUCLEUS_POS.z;
      const distToCore = Math.sqrt(sx * sx + sy * sy + sz * sz);

      const starDim = calculateLogisticDimFactor(distToCore);
      const finalFactor = starDim * starBrightMult;

      starColArr[i * 3] = starBaseColors[i * 3] * finalFactor;
      starColArr[i * 3 + 1] = starBaseColors[i * 3 + 1] * finalFactor;
      starColArr[i * 3 + 2] = starBaseColors[i * 3 + 2] * finalFactor;
    }
    starGeo.attributes.color.needsUpdate = true;


    function updateComaPhysics(sys, baseOpacity) {
      const pos = sys.geo.attributes.position.array;
      const col = sys.geo.attributes.color.array;

      sys.mat.opacity = baseOpacity * params.comaBrightness;

      for (let i = 0; i < sys.count; i++) {
        const d = sys.data[i];
        const targetTailSpeed = 12.0;
        const normOutflow = Math.min(1.0, d.outflow / d.maxOutflow);
        const currentSpeed = THREE.MathUtils.lerp(d.speed, targetTailSpeed, normOutflow * normOutflow);

        d.outflow += currentSpeed * delta * params.animSpeed;
        if (d.outflow > d.maxOutflow) {
          d.outflow = 0;
        }

        const dist = d.outflow;
        const currentRadius = d.rNorm * (params.comaSize * 2.2) + dist * 0.32;

        let px = d.radX * currentRadius + V_ION.x * (dist * 0.85);
        let py = d.radY * currentRadius + V_ION.y * (dist * 0.85);
        let pz = d.radZ * currentRadius + V_ION.z * (dist * 0.85);

        pos[i * 3] = px;
        pos[i * 3 + 1] = py;
        pos[i * 3 + 2] = pz;

        const normDist = dist / d.maxOutflow;
        const color = new THREE.Color();
        if (normDist < 0.25) {
          color.lerpColors(comaColorHead, comaColorMid, normDist / 0.25);
        } else {
          color.lerpColors(comaColorMid, comaColorOuter, (normDist - 0.25) / 0.75);
        }

        const fade = Math.max(0.0, 1.0 - Math.pow(normDist, 1.25));

        col[i * 3] = color.r * fade;
        col[i * 3 + 1] = color.g * fade;
        col[i * 3 + 2] = color.b * fade;
      }
      sys.geo.attributes.position.needsUpdate = true;
      sys.geo.attributes.color.needsUpdate = true;
    }

    updateComaPhysics(comaTypeA, 0.055 * params.comaTypeA_Brightness);
    updateComaPhysics(comaTypeB, 0.032 * params.comaTypeB_Brightness);


    function updateIonPhysics(sys, baseOpacity) {
      const pos = sys.geo.attributes.position.array;
      const col = sys.geo.attributes.color.array;

      sys.mat.opacity = baseOpacity * params.ionBrightness;

      for (let i = 0; i < sys.count; i++) {
        const d = sys.data[i];
        d.u += d.speed * (params.ionWindSpeed * 1.0) * delta;
        if (d.u > ION_MAX_LEN) {
          d.u = Math.random() * 1.5;
        }

        const u = d.u;
        const radius = (0.22 + Math.pow(u, 0.52) * 0.12) * (params.ionThickness * 1.5) * d.rFraction;

        const offU = Math.cos(d.circleAngle) * radius;
        const offV = Math.sin(d.circleAngle) * radius;

        const comaBlend = Math.exp(-u / (params.comaSize * 2.2 * 1.2));
        const cX = d.spawnX * (params.comaSize * 2.2) * comaBlend;
        const cY = d.spawnY * (params.comaSize * 2.2) * comaBlend;
        const cZ = d.spawnZ * (params.comaSize * 2.2) * comaBlend;

        let px = NUCLEUS_POS.x + cX + V_ION.x * u + tailBasis.u.x * offU + tailBasis.v.x * offV;
        let py = NUCLEUS_POS.y + cY + V_ION.y * u + tailBasis.u.y * offU + tailBasis.v.y * offV;
        let pz = NUCLEUS_POS.z + cZ + V_ION.z * u + tailBasis.u.z * offU + tailBasis.v.z * offV;

        pos[i * 3] = px;
        pos[i * 3 + 1] = py;
        pos[i * 3 + 2] = pz;

        // Apply smooth logistic dimming factor along ion tail
        const dimFactor = calculateLogisticDimFactor(u);
        const fade = Math.max(0.0, 1.0 - Math.pow(u / ION_MAX_LEN, 1.25)) * dimFactor;

        col[i * 3] = d.baseColor.r * fade;
        col[i * 3 + 1] = d.baseColor.g * fade;
        col[i * 3 + 2] = d.baseColor.b * fade;
      }
      sys.geo.attributes.position.needsUpdate = true;
      sys.geo.attributes.color.needsUpdate = true;
    }

    updateIonPhysics(ionTypeA, 0.005 * params.ionTypeA_Brightness);
    updateIonPhysics(ionTypeB, 0.02 * params.ionTypeB_Brightness);

    
    function updateDustPhysics(sys, baseOpacity) {
      const pos = sys.geo.attributes.position.array;
      const col = sys.geo.attributes.color.array;

      sys.mat.opacity = baseOpacity * params.dustBrightness;

      for (let i = 0; i < sys.count; i++) {
        const d = sys.data[i];
        d.u += d.speed * delta;
        if (d.u > DUST_MAX_LEN) {
          d.u = Math.random() * 2.0;
        }

        const u = d.u;
        const curveFactor = Math.pow(u, 1.62) * 0.0088 * (params.dustFanSpread * 1.0);

        const comaBlend = Math.exp(-u / (params.comaSize * 2.2 * 1.2));
        const cX = d.spawnX * (params.comaSize * 2.2) * comaBlend;
        const cY = d.spawnY * (params.comaSize * 2.2) * comaBlend;
        const cZ = d.spawnZ * (params.comaSize * 2.2) * comaBlend;

        const spineX = NUCLEUS_POS.x + cX + V_ION.x * u + V_DUST_CURVE.x * curveFactor;
        const spineY = NUCLEUS_POS.y + cY + V_ION.y * u + V_DUST_CURVE.y * curveFactor;
        const spineZ = NUCLEUS_POS.z + cZ + V_ION.z * u + V_DUST_CURVE.z * curveFactor;

        const radius = (0.35 + u * 0.13) * (params.dustThickness * 1.0) * d.rFraction;
        const fanOffset = d.fanAngle * (Math.pow(u, 1.1) * 0.15 + 0.2) * (params.dustFanSpread * 1.0);

        const offU = Math.cos(d.circleAngle) * radius + fanOffset;
        const offV = Math.sin(d.circleAngle) * radius;

        let px = spineX + tailBasis.u.x * offU + tailBasis.v.x * offV;
        let py = spineY + tailBasis.u.y * offU + tailBasis.v.y * offV;
        let pz = spineZ + tailBasis.u.z * offU + tailBasis.v.z * offV;

        pos[i * 3] = px;
        pos[i * 3 + 1] = py;
        pos[i * 3 + 2] = pz;

        // Apply smooth logistic dimming factor along dust tail
        const dimFactor = calculateLogisticDimFactor(u);
        const fade = Math.pow(1.0 - (u / DUST_MAX_LEN), 1.15) * dimFactor;

        col[i * 3] = d.baseColor.r * fade;
        col[i * 3 + 1] = d.baseColor.g * fade;
        col[i * 3 + 2] = d.baseColor.b * fade;
      }
      sys.geo.attributes.position.needsUpdate = true;
      sys.geo.attributes.color.needsUpdate = true;
    }

    updateDustPhysics(dustTypeA, 0.005 * params.dustTypeA_Brightness);
    updateDustPhysics(dustTypeB, 0.02 * params.dustTypeB_Brightness);
  }

  controls.update();
  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();