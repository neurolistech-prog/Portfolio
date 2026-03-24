/**
 * NEUROLIS OS - Core Engine
 * Développeur : Jed Aloui (Collège Henri Wallon)
 */

let scene, camera, renderer, core, particles;

// 1. Configuration des destinations (Nodes)
const sites = [
    { name: 'BLOG_TECH', url: 'https://actualites-de-technolgie.blogspot.com', color: 0x00f2ff },
    { name: 'GITHUB', url: 'https://github.com/neurolistech-prog', color: 0xbc13fe },
    { name: 'GITLAB', url: 'https://gitlab.com/x.dellop', color: 0xff5f1f },
    { name: 'INSTAGRAM', url: 'https://www.instagram.com/actutechx', color: 0xff0050 },
    { name: 'MON_CV', url: 'assets/cv-jed-aloui.pdf', color: 0x00ff00 }
];

function init() {
    // Initialisation de la scène Three.js
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // Création de la sphère centrale (Wireframe)
    const geometry = new THREE.IcosahedronGeometry(2, 2);
    const material = new THREE.MeshBasicMaterial({ 
        color: 0x00f2ff, 
        wireframe: true,
        transparent: true,
        opacity: 0.5
    });
    core = new THREE.Mesh(geometry, material);
    scene.add(core);

    // Ajout de particules stellaires
    const pGeometry = new THREE.BufferGeometry();
    const pCount = 1000;
    const coords = new Float32Array(pCount * 3);
    for(let i=0; i<pCount*3; i++) coords[i] = (Math.random() - 0.5) * 15;
    pGeometry.setAttribute('position', new THREE.BufferAttribute(coords, 3));
    const pMaterial = new THREE.PointsMaterial({ size: 0.02, color: 0xffffff });
    particles = new THREE.Points(pGeometry, pMaterial);
    scene.add(particles);

    camera.position.z = 5;

    createMenu();
    setupTerminal();
    
    // Retrait du loader après initialisation
    setTimeout(() => {
        document.getElementById('loader').style.opacity = '0';
        setTimeout(() => document.getElementById('loader').remove(), 1000);
    }, 1500);

    animate();
}

// Génération dynamique des boutons autour de la sphère
function createMenu() {
    const menu = document.getElementById('nexus-menu');
    sites.forEach((site, i) => {
        const btn = document.createElement('a');
        btn.href = site.url;
        btn.target = "_blank";
        btn.className = 'node-item';
        btn.innerText = site.name;
        
        // Positionnement circulaire
        const angle = (i / sites.length) * Math.PI * 2;
        const x = Math.cos(angle) * 250 + window.innerWidth / 2;
        const y = Math.sin(angle) * 250 + window.innerHeight / 2;
        
        btn.style.left = `${x}px`;
        btn.style.top = `${y}px`;

        // Interaction visuelle au survol
        btn.onmouseenter = () => {
            gsap.to(core.material.color, { r: (site.color >> 16 & 255)/255, g: (site.color >> 8 & 255)/255, b: (site.color & 255)/255 });
            gsap.to(core.scale, { x: 1.2, y: 1.2, z: 1.2 });
        };
        btn.onmouseleave = () => {
            gsap.to(core.material.color, { r: 0, g: 0.95, b: 1 });
            gsap.to(core.scale, { x: 1, y: 1, z: 1 });
        };

        menu.appendChild(btn);
    });
}

// Logique du terminal IA
function setupTerminal() {
    const input = document.getElementById('user-input');
    const content = document.getElementById('terminal-content');

    input.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter' && input.value !== "") {
            const msg = input.value;
            content.innerHTML += `<p style="color:white">> ${msg}</p>`;
            input.value = "";

            // Simulation de réflexion
            const tempId = "bot-" + Date.now();
            content.innerHTML += `<p class="bot-msg" id="${tempId}">> ANALYSING...</p>`;
            content.scrollTop = content.scrollHeight;

            try {
                // Appel vers ton backend Python sur Cloud Run
                const response = await fetch('https://TON-URL-CLOUD-RUN.a.run.app/ask', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ message: msg })
                });
                const data = await response.json();
                document.getElementById(tempId).innerText = `> ${data.reply}`;
            } catch (err) {
                document.getElementById(tempId).innerText = "> ERROR: Connexion au cerveau de l'IA perdue.";
            }
            content.scrollTop = content.scrollHeight;
        }
    });
}

function animate() {
    requestAnimationFrame(animate);
    core.rotation.y += 0.005;
    core.rotation.x += 0.002;
    particles.rotation.y -= 0.0005;
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

init();
