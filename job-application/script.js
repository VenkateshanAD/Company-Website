(function () {
  'use strict';

  const container = document.getElementById('canvas-container');
  if (!container) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const mouse = { x: 0, y: 0 };

  // --- Central 3D Torus Knot (hero piece) ---
  const knotGeo = new THREE.TorusKnotGeometry(1.2, 0.35, 180, 24);
  const knotMat = new THREE.MeshPhysicalMaterial({
    color: 0x00f0ff,
    emissive: 0x00f0ff,
    emissiveIntensity: 0.15,
    metalness: 0.9,
    roughness: 0.15,
    transparent: true,
    opacity: 0.7,
    wireframe: false,
    clearcoat: 0.3,
  });
  const knot = new THREE.Mesh(knotGeo, knotMat);
  knot.position.set(0, 1, -6);
  scene.add(knot);

  const knotWireGeo = new THREE.TorusKnotGeometry(1.25, 0.38, 180, 24);
  const knotWireMat = new THREE.MeshBasicMaterial({
    color: 0x7b2ff7,
    wireframe: true,
    transparent: true,
    opacity: 0.15,
  });
  const knotWire = new THREE.Mesh(knotWireGeo, knotWireMat);
  knotWire.position.copy(knot.position);
  scene.add(knotWire);

  // --- Orbiting rings ---
  const ringCount = 3;
  const rings = [];
  for (let i = 0; i < ringCount; i++) {
    const radius = 1.8 + i * 0.6;
    const ringGeo = new THREE.TorusGeometry(radius, 0.02, 32, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: i === 0 ? 0x00f0ff : i === 1 ? 0x7b2ff7 : 0xff2d95,
      transparent: true,
      opacity: 0.2 + i * 0.05,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.copy(knot.position);
    ring.userData = {
      speed: 0.2 + i * 0.1,
      tiltX: (i - 1) * 0.4,
      tiltY: i * 0.3,
    };
    ring.rotation.x = ring.userData.tiltX;
    ring.rotation.y = ring.userData.tiltY;
    scene.add(ring);
    rings.push(ring);
  }

  // --- Floating particles (starfield) ---
  const particleCount = 2000;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  const colorPalette = [
    new THREE.Color('#00f0ff'),
    new THREE.Color('#7b2ff7'),
    new THREE.Color('#ff2d95'),
    new THREE.Color('#ffffff'),
  ];

  for (let i = 0; i < particleCount; i++) {
    const radius = 5 + Math.random() * 25;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);

    const col = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    colors[i * 3] = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;

    sizes[i] = 0.02 + Math.random() * 0.08;
  }

  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  particleGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const particleMat = new THREE.PointsMaterial({
    size: 0.08,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // --- Small floating shapes ---
  const smallShapes = [];
  const geos = [
    new THREE.OctahedronGeometry(0.12, 0),
    new THREE.TetrahedronGeometry(0.12, 0),
    new THREE.IcosahedronGeometry(0.1, 0),
    new THREE.BoxGeometry(0.1, 0.1, 0.1),
  ];

  for (let i = 0; i < 80; i++) {
    const geo = geos[Math.floor(Math.random() * geos.length)];
    const mat = new THREE.MeshPhysicalMaterial({
      color: colorPalette[Math.floor(Math.random() * colorPalette.length)],
      emissive: 0x00f0ff,
      emissiveIntensity: 0.1,
      metalness: 0.8,
      roughness: 0.2,
      transparent: true,
      opacity: 0.15 + Math.random() * 0.25,
    });
    const mesh = new THREE.Mesh(geo, mat);

    const r = 3 + Math.random() * 4;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    mesh.position.set(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta) + 1,
      r * Math.cos(phi) - 6
    );

    mesh.userData = {
      speed: 0.002 + Math.random() * 0.008,
      axis: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
      floatSpeed: 0.3 + Math.random() * 0.5,
      floatOffset: Math.random() * Math.PI * 2,
      basePos: mesh.position.clone(),
    };

    scene.add(mesh);
    smallShapes.push(mesh);
  }

  // --- Lights ---
  const ambient = new THREE.AmbientLight(0x222244, 0.4);
  scene.add(ambient);

  const dir1 = new THREE.DirectionalLight(0x00f0ff, 0.6);
  dir1.position.set(5, 10, 5);
  scene.add(dir1);

  const dir2 = new THREE.DirectionalLight(0x7b2ff7, 0.4);
  dir2.position.set(-5, -3, 0);
  scene.add(dir2);

  const point = new THREE.PointLight(0xff2d95, 0.3, 20);
  point.position.set(0, 2, -6);
  scene.add(point);

  camera.position.set(0, 1, 3);
  camera.lookAt(0, 1, -6);

  // --- Mouse tracking ---
  document.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      mouse.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
    }
  }, { passive: true });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // --- Animation loop ---
  function animate() {
    requestAnimationFrame(animate);

    const time = Date.now() * 0.001;

    // Rotate central knot
    knot.rotation.x += 0.005;
    knot.rotation.y += 0.01;
    knotWire.rotation.x = knot.rotation.x;
    knotWire.rotation.y = knot.rotation.y;

    // Pulsing glow
    const pulse = 0.6 + Math.sin(time * 0.8) * 0.4;
    knotMat.emissiveIntensity = 0.08 + pulse * 0.15;

    // Orbit rings
    rings.forEach((ring, i) => {
      ring.rotation.z += ring.userData.speed * 0.01;
      ring.rotation.x = ring.userData.tiltX + Math.sin(time * 0.2 + i) * 0.05;
      ring.rotation.y = ring.userData.tiltY + time * ring.userData.speed * 0.1;
      const ringPulse = 0.15 + Math.sin(time * 0.5 + i * 1.5) * 0.08;
      ring.material.opacity = ringPulse;
    });

    // Particle system rotation - slow drift
    particles.rotation.y += 0.0003;
    particles.rotation.x += 0.0001;

    // Small shapes float
    smallShapes.forEach((mesh) => {
      mesh.rotateOnWorldAxis(mesh.userData.axis, mesh.userData.speed);
      const data = mesh.userData;
      const offset = Math.sin(time * data.floatSpeed + data.floatOffset) * 0.3;
      mesh.position.y = data.basePos.y + offset;
    });

    // Mouse parallax on knot
    const targetKnotX = mouse.y * 0.15;
    const targetKnotY = mouse.x * 0.2;
    knot.position.x += (targetKnotX - knot.position.x) * 0.02;
    knot.position.y += (targetKnotY - knot.position.y + 1 - knot.position.y) * 0.02;
    knotWire.position.copy(knot.position);
    rings.forEach((ring) => {
      ring.position.copy(knot.position);
    });

    // Camera subtle sway
    camera.position.x += (mouse.x * 0.1 - camera.position.x) * 0.01;
    camera.position.y += (-mouse.y * 0.05 + 1 - camera.position.y) * 0.01;
    camera.lookAt(0, 1, -6);

    // Moving point light
    point.position.x = Math.sin(time * 0.2) * 3;
    point.position.y = 1 + Math.cos(time * 0.3) * 2;
    point.position.z = -6 + Math.sin(time * 0.15) * 2;

    renderer.render(scene, camera);
  }

  animate();

  // --- Navbar Scroll Effect ---
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 80) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }

  // --- Mobile Nav Toggle ---
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinks.classList.remove('active');
      });
    });
  }

  // --- Form Handling ---
  const form = document.getElementById('applyForm');
  const successMsg = document.getElementById('successMessage');

  if (!form) return;

  const firstName = document.getElementById('firstName');
  const lastName = document.getElementById('lastName');
  const email = document.getElementById('email');
  const phone = document.getElementById('phone');
  const position = document.getElementById('position');
  const qualification = document.getElementById('qualification');
  const institution = document.getElementById('institution');
  const field = document.getElementById('field');
  const gradYear = document.getElementById('gradYear');
  const grade = document.getElementById('grade');
  const coverLetter = document.getElementById('coverLetter');
  const resume = document.getElementById('resume');
  const agree = document.getElementById('agree');
  const submitBtn = form.querySelector('button[type="submit"]');
  const fileText = document.getElementById('fileText');
  const charCount = document.querySelector('.char-count');

  // Populate year dropdown
  if (gradYear) {
    const currentYear = 2026;
    for (let y = currentYear; y >= currentYear - 30; y--) {
      const opt = document.createElement('option');
      opt.value = y;
      opt.textContent = y;
      gradYear.appendChild(opt);
    }
  }

  function showError(input, msg) {
    const errorEl = input.closest('.input-group').querySelector('.error-msg');
    if (errorEl) {
      errorEl.textContent = msg;
      errorEl.classList.toggle('visible', !!msg);
    }
    input.classList.toggle('error', !!msg);
  }

  function validateField(input) {
    const val = input.value.trim();
    let msg = '';

    if (input.hasAttribute('required') && !val) {
      msg = 'This field is required';
    } else if (input.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      msg = 'Please enter a valid email address';
    } else if (input.id === 'phone' && val && !/^[\d\s\-\+\(\)]{7,20}$/.test(val)) {
      msg = 'Please enter a valid phone number';
    } else if (input.id === 'coverLetter' && val.length < 20) {
      msg = 'Please write at least 20 characters';
    }

    showError(input, msg);
    return !msg;
  }

  const inputs = [firstName, lastName, email, phone, position, qualification, institution, field, gradYear, coverLetter];

  inputs.forEach((input) => {
    if (!input) return;
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('error')) validateField(input);
    });
  });

  // Cover letter char count
  if (coverLetter && charCount) {
    coverLetter.addEventListener('input', () => {
      const len = coverLetter.value.length;
      charCount.textContent = `${len} characters`;
      charCount.style.color = len < 20 ? 'var(--error)' : 'var(--text-dim)';
    });
  }

  // File upload
  if (resume && fileText) {
    resume.addEventListener('change', () => {
      if (resume.files.length > 0) {
        const file = resume.files[0];
        if (file.type !== 'application/pdf') {
          showError(resume, 'Only PDF files are accepted');
          resume.value = '';
          fileText.textContent = 'Drop your PDF resume here or click to browse (min 2MB)';
          fileText.closest('.file-upload-content').classList.remove('uploaded');
          return;
        }
        if (file.size < 2 * 1024 * 1024) {
          showError(resume, 'File must be at least 2MB');
          resume.value = '';
          fileText.textContent = 'Drop your PDF resume here or click to browse (min 2MB)';
          fileText.closest('.file-upload-content').classList.remove('uploaded');
          return;
        }
        fileText.textContent = file.name;
        fileText.closest('.file-upload-content').classList.add('uploaded');
        showError(resume, '');
      } else {
        fileText.textContent = 'Drop your PDF resume here or click to browse (min 2MB)';
        fileText.closest('.file-upload-content').classList.remove('uploaded');
      }
    });
  }

  // Form submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let valid = true;
    inputs.forEach((input) => {
      if (input && !validateField(input)) valid = false;
    });

    if (resume && !resume.files.length) {
      showError(resume, 'Please upload your resume');
      valid = false;
    }

    if (agree && !agree.checked) {
      showError(agree, 'You must agree to the privacy policy');
      valid = false;
    }

    if (!valid) {
      const firstError = form.querySelector('.error');
      if (firstError) firstError.focus();
      return;
    }

    // Simulate submission
    submitBtn.disabled = true;
    submitBtn.classList.add('btn-loading');

    setTimeout(() => {
      submitBtn.classList.remove('btn-loading');
      submitBtn.disabled = false;
      form.style.display = 'none';
      successMsg.style.display = 'block';
    }, 1500);
  });

  // Checkbox error handling
  if (agree) {
    agree.addEventListener('change', () => {
      if (agree.checked) showError(agree, '');
    });
  }

})();
