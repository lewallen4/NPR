// Variables for scene elements
let scene, camera, renderer, carModel1, carModel2, carModel3;
let cylinder1, cylinder2;
let leftArrow, rightArrow, selectTextSprite;
let selectedModel = 1; // 1 for carModel1, 2 for carModel2, 3 for carModel3

// Initialize the selection screen
function initSelectionScreen() {
    // Set up the scene
    scene = new THREE.Scene();

    // Set up the camera based on the provided parameters
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 1000);
    camera.position.set(0, 1.6943, 3.7909);
    camera.lookAt(0, 1, 0); // Ensure camera is looking at the object center

    // Set up the renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    // Lighting setup
    const light1 = new THREE.DirectionalLight(0xffffff, .5);
    light1.position.set(2.85, 2.45, 3.65);
    light1.castShadow = true;
    scene.add(light1);

    const light2 = new THREE.DirectionalLight(0xff0000, 0.3);
    light2.position.set(13.82, 5.29, -19.72);
    light2.castShadow = true;
    scene.add(light2);

    const light3 = new THREE.DirectionalLight(0xffffff, 0.3);
    light3.position.set(-7.08, 10, 7.5);
    light3.castShadow = true;
    scene.add(light3);

    // Platform cylinders
    const cylinderGeometry = new THREE.CylinderGeometry(1, 1, 1, 32);
    const cylinderMaterial1 = new THREE.MeshStandardMaterial({ color: 0xffffff });
    cylinder1 = new THREE.Mesh(cylinderGeometry, cylinderMaterial1);
    cylinder1.position.set(0, 0.5, -0.082);
    cylinder1.scale.set(1, 0.2, 1);
    cylinder1.receiveShadow = true;
    scene.add(cylinder1);

    const cylinderMaterial2 = new THREE.MeshStandardMaterial({ color: 0xffffff });
    cylinder2 = new THREE.Mesh(cylinderGeometry, cylinderMaterial2);
    cylinder2.position.set(0, 0.5, -0.169);
    cylinder2.scale.set(1.2, 0.2, 1.2);
    cylinder2.receiveShadow = true;
    scene.add(cylinder2);

    // Load the first car model
    const loader = new THREE.OBJLoader();
    loader.load('http://localhost:8000/cars/car1.obj', function (obj) {
        carModel1 = obj;
        carModel1.scale.set(1, 1, 1);
        carModel1.position.set(0, 0.88, 0);
        carModel1.castShadow = true;
        scene.add(carModel1);
    });

    // Load the second car model and make it initially invisible
    loader.load('http://localhost:8000/cars/car2.obj', function (obj) {
        carModel2 = obj;
        carModel2.scale.set(1, 1, 1);
        carModel2.position.set(0, 0.88, 0);
        carModel2.castShadow = true;
        carModel2.visible = false; // Start with carModel2 hidden
        scene.add(carModel2);
    });

    // Load the third car model and make it initially invisible
    loader.load('http://localhost:8000/cars/car3.obj', function (obj) {
        carModel3 = obj;
        carModel3.scale.set(1, 1, 1);
        carModel3.position.set(0, 0.88, 0);
        carModel3.castShadow = true;
        carModel3.visible = false; // Start with carModel3 hidden
        scene.add(carModel3);
    });

    // Create HUD elements
    createHUD();

    // Add event listener for key presses to toggle models and load main2.js
    window.addEventListener('keydown', handleKeyPress);

    animate();
}

// Function to create HUD elements (arrows and text)
function createHUD() {
    // Left arrow
    const leftArrowTexture = new THREE.TextureLoader().load('http://localhost:8000/left_arrow.png');
    const leftArrowMaterial = new THREE.SpriteMaterial({ map: leftArrowTexture });
    leftArrow = new THREE.Sprite(leftArrowMaterial);
    leftArrow.position.set(-1.8, 0, -3);
    leftArrow.scale.set(0.5, 0.5, 1);
    scene.add(leftArrow);

    // Right arrow
    const rightArrowTexture = new THREE.TextureLoader().load('http://localhost:8000/right_arrow.png');
    const rightArrowMaterial = new THREE.SpriteMaterial({ map: rightArrowTexture });
    rightArrow = new THREE.Sprite(rightArrowMaterial);
    rightArrow.position.set(1.8, 0, -3);
    rightArrow.scale.set(0.5, 0.5, 1);
    scene.add(rightArrow);

    // Selection text at the bottom
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 64;
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Press SPACE to select', canvas.width / 2, canvas.height / 2);

    const selectTextTexture = new THREE.CanvasTexture(canvas);
    const selectTextMaterial = new THREE.SpriteMaterial({ map: selectTextTexture });
    selectTextSprite = new THREE.Sprite(selectTextMaterial);
    selectTextSprite.position.set(0, -1.3, -3);
    selectTextSprite.scale.set(2, 0.5, 1);
    scene.add(selectTextSprite);
}

// Handle key presses for toggling cars and selection
function handleKeyPress(event) {
    if (event.code === 'Space') {
        // Load the selected model in main2.js
        loadMainWithSelectedCar();
    } else if (event.code === 'KeyA' || event.code === 'KeyD') {
        toggleCarModel();
    }
}

// Toggle between car models
function toggleCarModel() {
    // Hide all cars
    carModel1.visible = false;
    carModel2.visible = false;
    carModel3.visible = false;

    // Toggle through models
    if (selectedModel === 1) {
        carModel2.visible = true;
        selectedModel = 2;
    } else if (selectedModel === 2) {
        carModel3.visible = true;
        selectedModel = 3;
    } else {
        carModel1.visible = true;
        selectedModel = 1;
    }
}

// Function to load main2.js with the selected car model
function loadMainWithSelectedCar() {
    // Store selected model information (e.g., in local storage or a global variable)
    localStorage.setItem('selectedModel', selectedModel);

    // Clear the selection screen elements
    renderer.domElement.remove();

    // Dynamically create and load the main2.js script
    const script = document.createElement('script');
    script.src = './main2.js';
    document.body.appendChild(script);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Rotate the currently visible car model slowly if it's loaded
    if (carModel1 && carModel1.visible) {
        carModel1.rotation.y += 0.01;
    } else if (carModel2 && carModel2.visible) {
        carModel2.rotation.y += 0.01;
    } else if (carModel3 && carModel3.visible) {
        carModel3.rotation.y += 0.01;
    }

    // Update HUD element positions to stay fixed with the camera
    leftArrow.position.set(camera.position.x - 2, camera.position.y, camera.position.z - 3);
    rightArrow.position.set(camera.position.x + 2, camera.position.y, camera.position.z - 3);
    selectTextSprite.position.set(camera.position.x, camera.position.y - 1.9, camera.position.z - 3);

    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

initSelectionScreen();
