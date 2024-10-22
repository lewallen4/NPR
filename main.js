let scene, camera, renderer, car, track;
let speed = 0.00; // Constant forward movement
let turnSpeed = 0;

function init() {
    scene = new THREE.Scene();

    // Set up the camera (first-person view)
    camera = new THREE.PerspectiveCamera(80, window.innerWidth/window.innerHeight, 0.3, 500);
    camera.position.set(0, 1.3, -3);
    camera.lookAt(new THREE.Vector3(0, 1.5, -5));

    // Renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Add a basic plane for the track
    const trackGeometry = new THREE.PlaneGeometry(100, 1000);
    const trackMaterial = new THREE.MeshBasicMaterial({ color: 0x555555 });
    track = new THREE.Mesh(trackGeometry, trackMaterial);
    track.rotation.x = - Math.PI / 2;
    scene.add(track);

    // Add a tree (a green vertical cylinder)
    const treeGeometry = new THREE.CylinderGeometry(0.5, 0.5, 5, 32);
    const treeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const tree = new THREE.Mesh(treeGeometry, treeMaterial);
    tree.position.set(2, 2.5, -10);
    scene.add(tree);

    // Load the car model
    const loader = new THREE.OBJLoader();
    loader.load(
        'http://localhost:8000/Desktop/3js/car2.obj',
        function (object) {
            car = object; // Assign the loaded object to the global `car` variable
            car.scale.set(1.0, 1.0, 1.0); // Scale down the car to 50%
            scene.add(car);
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            console.log('An error happened');
        }
    );

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Start the rendering loop
    animate();
}

// Animate the scene
function animate() {
    requestAnimationFrame(animate);

    if (car) {
        car.position.z += Math.cos(car.rotation.y) * speed;
        car.position.x += Math.sin(car.rotation.y) * speed;
        car.rotation.y += turnSpeed;

        const cameraOffset = new THREE.Vector3(0, .7, -2.0); // Keep this as the desired offset
        const cameraPosition = cameraOffset.applyMatrix4(car.matrixWorld); 
        camera.position.copy(cameraPosition);
        camera.lookAt(car.position.x, car.position.y + .8, car.position.z); // Look at the car
    }

    renderer.render(scene, camera);
}

// Key controls
window.addEventListener('keydown', (event) => {
    switch(event.key) {
        case 'ArrowUp':
            speed = 0.1;
            break;
        case 'ArrowDown':
            speed = -0.1;
            break;
        case 'ArrowLeft':
            turnSpeed = 0.05;
            break;
        case 'ArrowRight':
            turnSpeed = -0.05;
            break;
    }
});

window.addEventListener('keyup', (event) => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        speed = 0.00;
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        turnSpeed = 0;
    }
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

init();
