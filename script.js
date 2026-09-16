(function () {
  'use strict';

  // --- Three.js 3D Background ---
  const container = document.getElementById('canvas-container');
  let renderer, scene, camera, pointLight;
  const has3D = container && typeof THREE !== 'undefined';
  if (has3D) {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
  }

  const mouse = { x: 0, y: 0 };
  let targetRotX = 0;
  let targetRotY = 0;
  const shapes = [];

  if (has3D) {
  // --- Create floating geometry shapes ---
  const geometries = [
    new THREE.IcosahedronGeometry(0.6, 0),
    new THREE.OctahedronGeometry(0.5, 0),
    new THREE.TorusGeometry(0.4, 0.15, 12, 18),
    new THREE.TetrahedronGeometry(0.5, 0),
    new THREE.BoxGeometry(0.5, 0.5, 0.5),
    new THREE.ConeGeometry(0.4, 0.7, 6)
  ];

  const colors = [
    new THREE.Color('#00f0ff'),
    new THREE.Color('#7b2ff7'),
    new THREE.Color('#ff2d95'),
    new THREE.Color('#00f0ff'),
    new THREE.Color('#7b2ff7'),
    new THREE.Color('#ff2d95')
  ];

  const count = 60;

  for (let i = 0; i < count; i++) {
    const geo = geometries[Math.floor(Math.random() * geometries.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const mat = new THREE.MeshStandardMaterial({
      color: color,
      wireframe: Math.random() > 0.5,
      transparent: true,
      opacity: 0.15 + Math.random() * 0.25,
      emissive: color,
      emissiveIntensity: 0.1 + Math.random() * 0.2,
      roughness: 0.3,
      metalness: 0.7
    });
    const mesh = new THREE.Mesh(geo, mat);

    const radius = 8 + Math.random() * 12;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    mesh.position.x = radius * Math.sin(phi) * Math.cos(theta);
    mesh.position.y = radius * Math.sin(phi) * Math.sin(theta);
    mesh.position.z = radius * Math.cos(phi);

    const scale = 0.4 + Math.random() * 1.2;
    mesh.scale.set(scale, scale, scale);

    mesh.userData = {
      rotSpeed: 0.002 + Math.random() * 0.01,
      rotAxis: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
      floatSpeed: 0.2 + Math.random() * 0.4,
      floatOffset: Math.random() * Math.PI * 2,
      basePos: mesh.position.clone(),
      radius: radius,
      theta: theta,
      phi: phi
    };

    scene.add(mesh);
    shapes.push(mesh);
  }

  // --- Lights ---
  const ambientLight = new THREE.AmbientLight(0x222244, 0.5);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0x00f0ff, 0.8);
  dirLight.position.set(5, 10, 7);
  scene.add(dirLight);

  const dirLight2 = new THREE.DirectionalLight(0x7b2ff7, 0.5);
  dirLight2.position.set(-5, -3, -7);
  scene.add(dirLight2);

  pointLight = new THREE.PointLight(0xff2d95, 0.4, 30);
  pointLight.position.set(0, 0, 0);
  scene.add(pointLight);

  camera.position.z = 14;
  }

  // --- Mouse Tracking ---
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

  // --- Resize ---
  window.addEventListener('resize', () => {
    if (has3D) {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
  });

  // --- Animation Loop ---
  function animate() {
    requestAnimationFrame(animate);
    if (!has3D) return;

    targetRotX += (mouse.y * 0.3 - targetRotX) * 0.02;
    targetRotY += (mouse.x * 0.3 - targetRotY) * 0.02;

    const time = Date.now() * 0.001;

    shapes.forEach((mesh) => {
      const data = mesh.userData;

      mesh.rotateOnWorldAxis(data.rotAxis, data.rotSpeed);

      const floatY = Math.sin(time * data.floatSpeed + data.floatOffset) * 0.8;
      const floatX = Math.cos(time * data.floatSpeed * 0.7 + data.floatOffset) * 0.4;

      data.theta += 0.0003;
      data.phi += 0.0001;

      const r = data.radius + Math.sin(time * 0.2 + data.floatOffset) * 0.5;
      mesh.position.x = r * Math.sin(data.phi) * Math.cos(data.theta) + floatX;
      mesh.position.y = r * Math.sin(data.phi) * Math.sin(data.theta) + floatY;
      mesh.position.z = r * Math.cos(data.phi);
    });

    scene.rotation.x += (targetRotX - scene.rotation.x) * 0.02;
    scene.rotation.y += (targetRotY - scene.rotation.y) * 0.02;

    pointLight.position.x = Math.sin(time * 0.3) * 5;
    pointLight.position.y = Math.cos(time * 0.4) * 5;
    pointLight.position.z = Math.sin(time * 0.2) * 5;

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
        document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      });
    });
  }

  // --- Smooth scroll for nav links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });

  // --- Counter Animation ---
  const statNumbers = document.querySelectorAll('.stat-number');

  function animateCounters() {
    statNumbers.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-target'));
      let current = 0;
      const increment = Math.ceil(target / 60);
      const duration = 2000;
      const stepTime = Math.max(16, Math.floor(duration / target));

      function updateCounter() {
        current += increment;
        if (current < target) {
          counter.textContent = current;
          setTimeout(updateCounter, stepTime);
        } else {
          counter.textContent = target;
        }
      }
      updateCounter();
    });
  }

  // --- Intersection Observer for counters ---
  const heroSection = document.querySelector('.hero');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounters();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  if (heroSection) {
    observer.observe(heroSection);
  }

  // --- Parallax on scroll for hero ---
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroContent = document.querySelector('.hero-content');
    if (heroContent && scrolled < window.innerHeight) {
      heroContent.style.transform = `translateY(${scrolled * 0.15}px)`;
      heroContent.style.opacity = 1 - scrolled / window.innerHeight;
    }
  });

  // --- Active nav link on scroll ---
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 200;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  });

})();
