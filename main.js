let scene, camera, renderer, car, track, spotlight;
let speed = 0.00; // Current speed
let acceleration = .01; // Acceleration factor per frame
let deceleration = .0005; // Deceleration factor
let maxSpeed = 1; // Maximum speed
let turnSpeed = 0;
let isAccelerating = false; // Flag for accelerating (W key)
let isDecelerating = false; // Flag for decelerating (S key)
let isTurningLeft = false; // Flag for turning left (A key)
let isTurningRight = false; // Flag for turning right (D key)
const carHeight = 1.5; // Height of the car from the ground
let gravity = 0.002; // Gravity constant
let verticalSpeed = 0; // Speed of falling

const planeWidth = 100; // Width of the gray plane (X direction)
const planeLength = 1000; // Length of the gray plane (Z direction)
let tree; // For detecting collisions with the tree

function init() {
    scene = new THREE.Scene();

    // Set up the camera (third-person view)
    camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.3, 500);
    camera.position.set(0, 1.3, -3);
    camera.lookAt(new THREE.Vector3(0, 1.5, -5));

    // Renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Add a basic plane for the track (solid ground)
    const trackGeometry = new THREE.PlaneGeometry(planeWidth, planeLength);
    const trackMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });
    track = new THREE.Mesh(trackGeometry, trackMaterial);
    track.rotation.x = - Math.PI / 2;
    scene.add(track);

    // Add a tree (a green vertical cylinder)
    const treeGeometry = new THREE.CylinderGeometry(0.5, 0.5, 5, 32);
    const treeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    tree = new THREE.Mesh(treeGeometry, treeMaterial);
    tree.position.set(2, 2.5, -10); // Tree height is 5, so y position should be 2.5 to place it on the ground
    scene.add(tree);

    // Load the car model
    const loader = new THREE.OBJLoader();
    loader.load(
        'http://localhost:8000/Desktop/3js/car2.obj',
        function (object) {
            car = object; // Assign the loaded object to the global `car` variable
            car.scale.set(1.0, 1.0, 1.0); // Scale the car
            car.position.y = 10; // Start above the ground to allow falling
            scene.add(car);

            // Create the spotlight and position it over the car
            spotlight = new THREE.SpotLight(0xffffff, 1);
            spotlight.position.set(0, 10, 0); // Initial position (over the car)
            spotlight.angle = Math.PI / 4; // Spotlight cone angle
            spotlight.penumbra = 0.1; // Soft edges of the spotlight
            spotlight.castShadow = true; // Enable shadows

            // Add spotlight to the scene
            scene.add(spotlight);
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

// Function to check if the car is over the plane
function isCarOnTrack() {
    const halfWidth = planeWidth / 2;
    const halfLength = planeLength / 2;

    return (
        car.position.x >= -halfWidth &&
        car.position.x <= halfWidth &&
        car.position.z >= -halfLength &&
        car.position.z <= halfLength
    );
}

// Function to check if the car has collided with the tree
function checkCollisionWithTree() {
    const treeRadius = 0.5; // Approximate radius of the tree
    const carRadius = 1; // Approximate radius of the car

    const dx = car.position.x - tree.position.x;
    const dz = car.position.z - tree.position.z;
    const distance = Math.sqrt(dx * dx + dz * dz);

    return distance < (treeRadius + carRadius); // Collision happens if the distance is less than combined radii
}

// Animate the scene
function animate() {
    requestAnimationFrame(animate);

    if (car) {
        // Apply gravity and make the car fall
        verticalSpeed -= gravity;

        // Check if the car is on the track
        const onTrack = isCarOnTrack();

        if (onTrack) {
            // If the car is above the plane, let it fall to the plane level
            if (car.position.y > carHeight) {
                car.position.y += verticalSpeed;
            }

            // Once it reaches the plane, stop falling and reset vertical speed
            if (car.position.y <= carHeight) {
                car.position.y = carHeight;
                verticalSpeed = 0; // Stop falling once on the ground
            }
        } else {
            // If the car is off the plane, keep it falling
            car.position.y += verticalSpeed;
        }

        // Check for collision with the tree
        if (checkCollisionWithTree()) {
            // Reduce speed by 95%
            speed *= 0.05;

            // Reverse direction based on where the collision happened
            const dx = car.position.x - tree.position.x;
            const dz = car.position.z - tree.position.z;
            const angleOfCollision = Math.atan2(dz, dx);

            car.rotation.y = angleOfCollision + Math.PI; // Face opposite direction of impact
        }

        // Adjust speed based on acceleration/deceleration when keys are held down
        if (isAccelerating) {
            speed = Math.min(speed + acceleration, maxSpeed); // Gradually increase speed
        }
        if (isDecelerating) {
            speed = Math.max(speed - acceleration, -maxSpeed); // Gradually decrease speed (reverse)
        }

        // Gradually slow down the car when no key is pressed
        if (!isAccelerating && !isDecelerating) {
            if (speed > 0) speed -= deceleration;
            if (speed < 0) speed += deceleration;
            if (Math.abs(speed) < deceleration) speed = 0; // Stop when slow enough
        }

        // Update car position based on speed
        car.position.z += Math.cos(car.rotation.y) * speed;
        car.position.x += Math.sin(car.rotation.y) * speed;

        car.rotation.y += turnSpeed;

        // Update camera position
        const cameraOffset = new THREE.Vector3(0, .7, -2.0); // Desired offset
        const cameraPosition = cameraOffset.applyMatrix4(car.matrixWorld); 
        camera.position.copy(cameraPosition);
        camera.lookAt(car.position.x, car.position.y + .8, car.position.z); // Look at the car

        // Update spotlight position and direction
        spotlight.position.set(car.position.x, car.position.y + 10, car.position.z);
        spotlight.target.position.set(car.position.x, car.position.y, car.position.z);
        spotlight.target.updateMatrixWorld(); // Ensure spotlight target is updated
    }

    renderer.render(scene, camera);
}

// Key controls using WASD for driving
window.addEventListener('keydown', (event) => {
    switch(event.key) {
        case 'w': // W key for accelerating
        case 'W':
            isAccelerating = true;
            break;
        case 's': // S key for decelerating
        case 'S':
            isDecelerating = true;
            break;
        case 'a': // A key for turning left
        case 'A':
            turnSpeed = 0.05;
            break;
        case 'd': // D key for turning right
        case 'D':
            turnSpeed = -0.05;
            break;
    }
});

window.addEventListener('keyup', (event) => {
    switch(event.key) {
        case 'w': // Stop accelerating
        case 'W':
            isAccelerating = false;
            break;
        case 's': // Stop decelerating
        case 'S':
            isDecelerating = false;
            break;
        case 'a': // Stop turning left
        case 'A':
        case 'd': // Stop turning right
        case 'D':
            turnSpeed = 0;
            break;
    }
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

init();
