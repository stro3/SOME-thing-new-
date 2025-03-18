// Enhanced 3D Basketball Model with Animations
function init3DModel() {
    if (!THREE.WEBGL.isWebGLAvailable()) {
        const warning = THREE.WEBGL.getWebGLErrorMessage();
        document.getElementById('basketball-3d').appendChild(warning);
        return;
    }

    const scene = new THREE.Scene();
    const container = document.getElementById('basketball-3d');
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    
    const renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        powerPreference: "high-performance"
    });
    
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Create basketball with enhanced geometry
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const svgData = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
        <defs>
            <pattern id="basketballPattern" width="256" height="256" patternUnits="userSpaceOnUse">
                <rect width="256" height="256" fill="#e65c00"/>
                <path d="M0,128 L256,128" stroke="#000" stroke-width="4" fill="none" opacity="0.4"/>
                <path d="M128,0 L128,256" stroke="#000" stroke-width="4" fill="none" opacity="0.4"/>
                <path d="M0,0 Q128,128 256,256" stroke="#000" stroke-width="4" fill="none" opacity="0.4"/>
                <path d="M0,256 Q128,128 256,0" stroke="#000" stroke-width="4" fill="none" opacity="0.4"/>
                <circle cx="128" cy="128" r="120" stroke="#000" stroke-width="2" fill="none" opacity="0.2"/>
                <circle cx="128" cy="128" r="80" stroke="#000" stroke-width="2" fill="none" opacity="0.2"/>
            </pattern>
            <filter id="noise">
                <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/>
                <feColorMatrix type="saturate" values="0"/>
                <feBlend in="SourceGraphic" mode="multiply"/>
            </filter>
        </defs>
        <rect width="1024" height="1024" fill="url(#basketballPattern)"/>
        <rect width="1024" height="1024" fill="#000" opacity="0.05" filter="url(#noise)"/>
    </svg>`;

    const textureLoader = new THREE.TextureLoader();
    const baseTexture = textureLoader.load('data:image/svg+xml;base64,' + btoa(svgData));
    const normalTexture = textureLoader.load('data:image/svg+xml;base64,' + btoa(svgData.replace('#e65c00', '#808080')));

    const material = new THREE.MeshPhysicalMaterial({
        map: baseTexture,
        normalMap: normalTexture,
        normalScale: new THREE.Vector2(0.15, 0.15),
        roughness: 0.8,
        metalness: 0.1,
        clearcoat: 0.3,
        clearcoatRoughness: 0.2,
        envMapIntensity: 1.0,
        color: 0xe65c00
    });

    const basketball = new THREE.Mesh(geometry, material);
    basketball.castShadow = true;
    basketball.receiveShadow = true;
    scene.add(basketball);

    // Add multiple particle systems
    function createParticleSystem(count, size, color, radius, speed, opacity) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const velocities = new Float32Array(count * 3);
        const angles = new Float32Array(count);
        
        for(let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radiusVariation = radius + Math.random() * 0.5;
            angles[i] = angle;
            
            positions[i * 3] = Math.cos(angle) * radiusVariation;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 2;
            positions[i * 3 + 2] = Math.sin(angle) * radiusVariation;
            
            velocities[i * 3] = (Math.random() - 0.5) * speed;
            velocities[i * 3 + 1] = (Math.random() - 0.5) * speed;
            velocities[i * 3 + 2] = (Math.random() - 0.5) * speed;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const material = new THREE.PointsMaterial({
            size: size,
            color: color,
            transparent: true,
            opacity: opacity,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        const particles = new THREE.Points(geometry, material);
        particles.userData = {
            velocities,
            angles,
            radius,
            speed
        };
        
        return particles;
    }

    // Create multiple particle systems with different behaviors
    const orbitalParticles = createParticleSystem(100, 0.02, 0xffffff, 1.5, 0.001, 0.4);
    const trailParticles = createParticleSystem(50, 0.015, 0xff9933, 1.2, 0.002, 0.3);
    const sparkParticles = createParticleSystem(30, 0.01, 0xffff00, 1.3, 0.003, 0.5);
    
    scene.add(orbitalParticles);
    scene.add(trailParticles);
    scene.add(sparkParticles);

    // Update particle animation function
    function updateParticles(particles, currentTime, influence) {
        const positions = particles.geometry.attributes.position.array;
        const velocities = particles.userData.velocities;
        const angles = particles.userData.angles;
        const count = positions.length / 3;
        
        for(let i = 0; i < count; i++) {
            const i3 = i * 3;
            const angle = angles[i] + currentTime * 0.001 * particles.userData.speed;
            
            // Base orbital motion
            const radius = particles.userData.radius + Math.sin(currentTime * 0.001 + i) * 0.1;
            positions[i3] = Math.cos(angle) * radius;
            positions[i3 + 2] = Math.sin(angle) * radius;
            
            // Add velocity-based movement
            positions[i3] += velocities[i3] * influence;
            positions[i3 + 1] += velocities[i3 + 1] * influence;
            positions[i3 + 2] += velocities[i3 + 2] * influence;
            
            // Reset particles that go too far
            const distance = Math.sqrt(
                positions[i3] * positions[i3] + 
                positions[i3 + 1] * positions[i3 + 1] + 
                positions[i3 + 2] * positions[i3 + 2]
            );
            
            if (distance > particles.userData.radius * 2) {
                const newAngle = Math.random() * Math.PI * 2;
                positions[i3] = Math.cos(newAngle) * particles.userData.radius;
                positions[i3 + 1] = (Math.random() - 0.5) * 2;
                positions[i3 + 2] = Math.sin(newAngle) * particles.userData.radius;
                
                velocities[i3] = (Math.random() - 0.5) * particles.userData.speed;
                velocities[i3 + 1] = (Math.random() - 0.5) * particles.userData.speed;
                velocities[i3 + 2] = (Math.random() - 0.5) * particles.userData.speed;
            }
        }
        
        particles.geometry.attributes.position.needsUpdate = true;
    }

    // Enhanced lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1);
    keyLight.position.set(5, 5, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x9ca3af, 0.3);
    fillLight.position.set(-5, 0, -5);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.2);
    rimLight.position.set(0, 0, -5);
    scene.add(rimLight);

    // Add environment map
    const envMapTexture = new THREE.CubeTextureLoader().load([
        createGradientDataUrl('#1a1a1a', '#2a2a2a'),
        createGradientDataUrl('#1a1a1a', '#2a2a2a'),
        createGradientDataUrl('#1a1a1a', '#2a2a2a'),
        createGradientDataUrl('#1a1a1a', '#2a2a2a'),
        createGradientDataUrl('#1a1a1a', '#2a2a2a'),
        createGradientDataUrl('#1a1a1a', '#2a2a2a')
    ]);
    scene.environment = envMapTexture;

    camera.position.z = 3;

    // Animation system with physics
    let lastTime = 0;
    const rotationSpeed = 0.0005;
    let momentum = { x: 0, y: 0 };
    let targetRotation = { x: 0, y: 0 };
    let bounceHeight = 0;
    let bounceVelocity = 0.02;
    const gravity = 0.001;
    let isBouncePaused = false;
    
    function animate(currentTime) {
        requestAnimationFrame(animate);

        const delta = currentTime - lastTime;
        lastTime = currentTime;

        // Bounce animation
        if (!isBouncePaused) {
            bounceHeight += bounceVelocity;
            bounceVelocity -= gravity;

            if (bounceHeight <= 0) {
                bounceHeight = 0;
                bounceVelocity = Math.abs(bounceVelocity) * 0.8;
                
                if (bounceVelocity < 0.001) {
                    bounceVelocity = 0.02;
                }
            }

            basketball.position.y = bounceHeight;
        }

        // Update all particle systems
        updateParticles(orbitalParticles, currentTime, 1.0);
        updateParticles(trailParticles, currentTime * 1.2, 1.2);
        updateParticles(sparkParticles, currentTime * 0.8, 0.8);

        // Rotate particle systems independently
        orbitalParticles.rotation.y += 0.001;
        trailParticles.rotation.x += 0.0005;
        sparkParticles.rotation.z += 0.0008;

        // Update particle opacities based on motion
        const motionFactor = Math.sqrt(momentum.x * momentum.x + momentum.y * momentum.y);
        trailParticles.material.opacity = 0.3 + motionFactor * 2;
        sparkParticles.material.opacity = 0.5 + motionFactor * 3;

        // Rotation with momentum
        momentum.x += (targetRotation.x - basketball.rotation.x) * 0.05;
        momentum.y += (targetRotation.y - basketball.rotation.y) * 0.05;
        
        momentum.x *= 0.95;
        momentum.y *= 0.95;

        basketball.rotation.x += momentum.x;
        basketball.rotation.y += momentum.y;

        // Spin effect when bouncing
        if (!isMouseMoving) {
            basketball.rotation.y += rotationSpeed * delta;
            basketball.rotation.x = Math.sin(currentTime * 0.001) * 0.1;
        }

        renderer.render(scene, camera);
    }

    // Enhanced interaction handling
    let isMouseMoving = false;
    let mouseTimeout;
    let lastMousePosition = { x: 0, y: 0 };
    
    function handleInteraction(clientX, clientY) {
        if (mouseTimeout) clearTimeout(mouseTimeout);
        
        isMouseMoving = true;
        isBouncePaused = true;
        
        const rect = container.getBoundingClientRect();
        const x = ((clientX - rect.left) / container.clientWidth) * 2 - 1;
        const y = ((clientY - rect.top) / container.clientHeight) * 2 - 1;

        const deltaX = x - lastMousePosition.x;
        const deltaY = y - lastMousePosition.y;
        
        targetRotation.y = x * Math.PI;
        targetRotation.x = y * Math.PI * 0.5;

        lastMousePosition = { x, y };
        
        mouseTimeout = setTimeout(() => {
            isMouseMoving = false;
            isBouncePaused = false;
        }, 150);
    }

    container.addEventListener('mousemove', (event) => {
        handleInteraction(event.clientX, event.clientY);
    });

    container.addEventListener('touchmove', (event) => {
        event.preventDefault();
        const touch = event.touches[0];
        handleInteraction(touch.clientX, touch.clientY);
    });

    // Double click for special spin animation
    container.addEventListener('dblclick', () => {
        momentum.y = 0.5;
        isBouncePaused = true;
        setTimeout(() => {
            isBouncePaused = false;
        }, 1000);
    });

    let resizeTimeout;
    window.addEventListener('resize', () => {
        if (resizeTimeout) clearTimeout(resizeTimeout);
        
        resizeTimeout = setTimeout(() => {
            const width = container.clientWidth;
            const height = container.clientHeight;
            
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        }, 250);
    });

    function createGradientDataUrl(color1, color2) {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 128);
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 128, 128);
        return canvas.toDataURL();
    }

    animate(0);

    return () => {
        if (resizeTimeout) clearTimeout(resizeTimeout);
        if (mouseTimeout) clearTimeout(mouseTimeout);
        geometry.dispose();
        material.dispose();
        baseTexture.dispose();
        normalTexture.dispose();
        envMapTexture.dispose();
        orbitalParticles.geometry.dispose();
        orbitalParticles.material.dispose();
        trailParticles.geometry.dispose();
        trailParticles.material.dispose();
        sparkParticles.geometry.dispose();
        sparkParticles.material.dispose();
        renderer.dispose();
    };
}

// Initialize Three.js if not present
if (!window.THREE) {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    document.head.appendChild(script);
}

class BasketballModel {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.loadingOverlay = this.container.querySelector('.loading-overlay');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.basketball = null;
        this.isSpinning = false;
        this.spinSpeed = 0;
        this.mousePosition = { x: 0, y: 0 };
        
        this.init();
    }

    init() {
        // Setup
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);
        this.camera.position.z = 5;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 5, 5);
        this.scene.add(ambientLight, directionalLight);

        // Accent lights
        const pointLight1 = new THREE.PointLight(0xff7e47, 1, 10);
        const pointLight2 = new THREE.PointLight(0x47b6ff, 1, 10);
        pointLight1.position.set(2, 2, 2);
        pointLight2.position.set(-2, -2, -2);
        this.scene.add(pointLight1, pointLight2);

        // Create basketball
        this.loadBasketball();

        // Events
        window.addEventListener('resize', () => this.onWindowResize());
        this.container.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.container.addEventListener('dblclick', () => this.toggleSpin());
        this.container.addEventListener('touchstart', (e) => this.onTouch(e));
        this.container.addEventListener('touchmove', (e) => this.onTouch(e));

        this.animate();
    }

    loadBasketball() {
        const geometry = new THREE.SphereGeometry(1, 32, 32);
        const textureLoader = new THREE.TextureLoader();
        
        textureLoader.load('assets/basketball-texture.svg', (texture) => {
            const material = new THREE.MeshPhongMaterial({
                map: texture,
                bumpMap: texture,
                bumpScale: 0.02,
                shininess: 5
            });
            
            this.basketball = new THREE.Mesh(geometry, material);
            this.scene.add(this.basketball);
            
            if (this.loadingOverlay) {
                this.loadingOverlay.classList.add('hidden');
            }
        });
    }

    toggleSpin() {
        this.isSpinning = !this.isSpinning;
        if (this.isSpinning) this.spinSpeed = 0.1;
    }

    onMouseMove(event) {
        const rect = this.container.getBoundingClientRect();
        this.mousePosition.x = ((event.clientX - rect.left) / this.container.clientWidth) * 2 - 1;
        this.mousePosition.y = -((event.clientY - rect.top) / this.container.clientHeight) * 2 + 1;
    }

    onTouch(event) {
        event.preventDefault();
        const touch = event.touches[0];
        const rect = this.container.getBoundingClientRect();
        this.mousePosition.x = ((touch.clientX - rect.left) / this.container.clientWidth) * 2 - 1;
        this.mousePosition.y = -((touch.clientY - rect.top) / this.container.clientHeight) * 2 + 1;
    }

    onWindowResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        if (this.basketball) {
            // Mouse-based rotation
            this.basketball.rotation.x += (this.mousePosition.y * 0.5 - this.basketball.rotation.x) * 0.05;
            this.basketball.rotation.y += (this.mousePosition.x * 0.5 - this.basketball.rotation.y) * 0.05;

            // Spin animation
            if (this.isSpinning) {
                this.basketball.rotation.y += this.spinSpeed;
                this.spinSpeed *= 0.99;
                if (this.spinSpeed < 0.001) this.isSpinning = false;
            }

            // Bounce and scale effects
            this.basketball.position.y = Math.sin(Date.now() * 0.003) * 0.2;
            const scale = 1 + Math.sin(Date.now() * 0.003) * 0.02;
            this.basketball.scale.set(scale, scale, scale);
        }

        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new BasketballModel('basketball-3d');
});
