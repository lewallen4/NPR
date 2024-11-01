let scene, camera, renderer, world, model, modelBody, platformBody;
let isMovingForward = false, isMovingBackward = false, isMovingLeft = false, isMovingRight = false;
const forceStrength = 200; // Increased for responsiveness with heavier mass
let cameraOffset = new THREE.Vector3(0, 1.3, -3.3); // Offset position for the camera behind the model



// Speedometer canvas setup
const speedometerCanvas = document.createElement('canvas');
speedometerCanvas.width = 256;
speedometerCanvas.height = 128;
const ctx = speedometerCanvas.getContext('2d');

// Create a Three.js texture from the canvas
const speedometerTexture = new THREE.CanvasTexture(speedometerCanvas);
const speedometerMaterial = new THREE.SpriteMaterial({ map: speedometerTexture });
const speedometerSprite = new THREE.Sprite(speedometerMaterial);
speedometerSprite.scale.set(1, 1, 1); // Adjust size as needed

function init() {
    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 10, 20);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Retrieve the selected car model
    const selectedModel = localStorage.getItem('selectedModel');
    let carModelUrl;

    // Choose the correct model URL based on the selected model number
    if (selectedModel === '1') {
        carModelUrl = 'http://localhost:8000/cars/car1.obj';
    } else if (selectedModel === '2') {
        carModelUrl = 'http://localhost:8000/cars/car2.obj';
    } else if (selectedModel === '3') {
        carModelUrl = 'http://localhost:8000/cars/car3.obj';
    } else {
        console.warn('Selected model not found, defaulting to car1');
        carModelUrl = 'http://localhost:8000/cars/car1.obj';
    }



// Position and add the speedometer sprite in front of the camera
scene.add(speedometerSprite);

// Spotlight setup
const spotlight = new THREE.SpotLight(0xffffff); // White color for the first spotlight
spotlight.position.set(0, 20, 0); // Position above the platform
spotlight.angle = Math.PI / 4;
spotlight.penumbra = 0.3;
spotlight.intensity = 1;
spotlight.castShadow = true;
spotlight.target.position.set(0, 0, 0);
scene.add(spotlight);
scene.add(spotlight.target);

const spotlight2 = new THREE.SpotLight(0xff0000); // Red color
spotlight2.position.set(-100, 20, 0);
spotlight2.angle = Math.PI / 4;
spotlight2.penumbra = 0.3;
spotlight2.intensity = 1.0;
spotlight2.castShadow = true;
spotlight2.target.position.set(0, 0, 0);
scene.add(spotlight2);
scene.add(spotlight2.target);

const spotlight3 = new THREE.SpotLight(0xffff00); // Red color
spotlight3.position.set(120, 100, 0);
spotlight3.angle = Math.PI / 4;
spotlight3.penumbra = 0.3;
spotlight3.intensity = 1.0;
spotlight3.castShadow = true;
spotlight3.target.position.set(120, 0, 0);
scene.add(spotlight3);
scene.add(spotlight3.target);

const spotlight4 = new THREE.SpotLight(0xff0000); // Red color
spotlight4.position.set(0, 20, 30);
spotlight4.angle = Math.PI / 4;
spotlight4.penumbra = 0.3;
spotlight4.intensity = 1.0;
spotlight4.castShadow = true;
spotlight4.target.position.set(40, 0, 30);
scene.add(spotlight4);
scene.add(spotlight4.target);

const spotlight5 = new THREE.SpotLight(0x00ff00); // Green color
spotlight5.position.set(0, 20, -80);
spotlight5.angle = Math.PI / 4;
spotlight5.penumbra = 0.3;
spotlight5.intensity = 1.0;
spotlight5.castShadow = true;
spotlight5.target.position.set(30, 0, -10);
scene.add(spotlight5);
scene.add(spotlight5.target);

const spotlight6 = new THREE.SpotLight(0xff0000); // Red color
spotlight6.position.set(100, 20, 100);
spotlight6.angle = Math.PI / 4;
spotlight6.penumbra = 0.3;
spotlight6.intensity = 1.0;
spotlight6.castShadow = true;
spotlight6.target.position.set(100, 0, 100);
scene.add(spotlight6);
scene.add(spotlight6.target);

const spotlight7 = new THREE.SpotLight(0x0000ff); // Blue color
spotlight7.position.set(100, 20, -80);
spotlight7.angle = Math.PI / 4;
spotlight7.penumbra = 0.3;
spotlight7.intensity = 1.0;
spotlight7.castShadow = true;
spotlight7.target.position.set(40, 0, -80);
scene.add(spotlight7);
scene.add(spotlight7.target);

const spotlight8 = new THREE.SpotLight(0xff0000); // Red color
spotlight8.position.set(-100, 20, 200);
spotlight8.angle = Math.PI / 4;
spotlight8.penumbra = 0.3;
spotlight8.intensity = 1.0;
spotlight8.castShadow = true;
spotlight8.target.position.set(-100, 0, 200);
scene.add(spotlight8);
scene.add(spotlight8.target);

const spotlight9 = new THREE.SpotLight(0xff0000); // Red color
spotlight9.position.set(0, 20, 200);
spotlight9.angle = Math.PI / 4;
spotlight9.penumbra = 0.3;
spotlight9.intensity = 1.0;
spotlight9.castShadow = true;
spotlight9.target.position.set(0, 0, 200);
scene.add(spotlight9);
scene.add(spotlight9.target);




// Physics setup
world = new CANNON.World();
world.gravity.set(0, -9.82, 0);

// Materials for icy effect
const lowFrictionMaterial = new CANNON.Material("lowFrictionMaterial");

// Set low friction and low restitution for stable sliding
const contactMaterial = new CANNON.ContactMaterial(lowFrictionMaterial, lowFrictionMaterial, {
    friction: 0.001, // Extremely low friction for an icy effect
    restitution: 0.01 // Low restitution to avoid bouncing
});
world.addContactMaterial(contactMaterial);

// Load the new platform model
const platformLoader = new THREE.OBJLoader();
platformLoader.load('http://localhost:8000/platform.obj', function (obj) {
    platformBody = obj;
    platformBody.scale.set(1, 1, 1); // Adjust scale if needed
    platformBody.position.set(0, 0, 0);
    platformBody.rotation.x = Math.PI / 2;
    scene.add(platformBody);

// Cannon.js body for the platform model
    const platformShape = new CANNON.Box(new CANNON.Vec3(1000, 0.5, 1000)); // Adjust size to fit your platform
    const platformPhysicsBody = new CANNON.Body({ 
        mass: 0, // Static platform, unaffected by gravity
        material: lowFrictionMaterial
    });
    platformPhysicsBody.addShape(platformShape);
    platformPhysicsBody.position.set(0, 0, 0);
    world.addBody(platformPhysicsBody);
    });




// Load OBJ model for the car based on the selected model
    const loader = new THREE.OBJLoader();
    loader.load(carModelUrl, function (obj) {
        model = obj;
        model.scale.set(2, 2, 2); // Scale as needed
        scene.add(model);

    // Rotate the model 90 degrees forward along the X-axis if needed
    model.rotation.x = Math.PI / 2;

    // Cannon.js body for the OBJ model with low friction material
    const box = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5)); // Adjust to the approximate size of your model
    modelBody = new CANNON.Body({
        mass: 20, // Increase mass for stability, adjust as necessary
        material: lowFrictionMaterial
    });
    modelBody.addShape(box);
    modelBody.position.set(0, 5, 0);
    world.addBody(modelBody);
}, 
// Error handling (optional)
function (error) {
    console.error("An error occurred loading the model:", error);
});

// Controls and animation
window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);

animate();
}

// Functions to handle key events
function handleKeyDown(event) {
    switch (event.key) {
        case 's':
        case 'S':
            isMovingForward = true;
            break;
        case 'w':
        case 'W':
            isMovingBackward = true;
            break;
        case 'd':
        case 'D':
            isMovingLeft = true;
            break;
        case 'a':
        case 'A':
            isMovingRight = true;
            break;
    }
}

function handleKeyUp(event) {
    switch (event.key) {
        case 's':
        case 'S':
            isMovingForward = false;
            break;
        case 'w':
        case 'W':
            isMovingBackward = false;
            break;
        case 'd':
        case 'D':
            isMovingLeft = false;
            break;
        case 'a':
        case 'A':
            isMovingRight = false;
            break;
    }
}

function applyControls() {
    if (!modelBody) return; // Skip if model not loaded

    const force = new CANNON.Vec3();

    // Rotation speed for turning (adjust as needed)
    const rotationSpeed = 0.02;

    // Rotate the model on Y-axis based on `A` and `D` keys, flipped directions
    if (isMovingLeft) {
        modelBody.quaternion = modelBody.quaternion.mult(new CANNON.Quaternion().setFromEuler(0, -rotationSpeed, 0));
    }
    if (isMovingRight) {
        modelBody.quaternion = modelBody.quaternion.mult(new CANNON.Quaternion().setFromEuler(0, rotationSpeed, 0));
    }

    // Get the current forward direction of the car in local space
    const forwardDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(model.quaternion);

    // Apply forward or backward force based on `W` and `S` keys
    if (isMovingForward) force.vadd(forwardDirection.clone().multiplyScalar(forceStrength), force);
    if (isMovingBackward) force.vadd(forwardDirection.clone().multiplyScalar(-forceStrength), force);

    // Apply the accumulated force to the model's body
    modelBody.applyForce(force, modelBody.position);

    // Apply additional friction to lateral movement
    applyFriction(forwardDirection);
}

// Function to apply increased friction for lateral movement
function applyFriction(forwardDirection) {
    const lateralFrictionFactor = 1.5; // Increase this value to add more lateral friction

    // Get the current velocity of the model
    const velocity = new THREE.Vector3(
        modelBody.velocity.x,
        modelBody.velocity.y,
        modelBody.velocity.z
    );

    // Project the velocity onto the forward direction to get the forward component
    const forwardVelocity = forwardDirection.clone().multiplyScalar(velocity.dot(forwardDirection));

    // Calculate the lateral velocity by subtracting the forward component from the total velocity
    const lateralVelocity = velocity.sub(forwardVelocity);

    // Apply friction to the lateral velocity by reducing it proportionally
    modelBody.velocity.x -= lateralVelocity.x * lateralFrictionFactor * world.dt;
    modelBody.velocity.z -= lateralVelocity.z * lateralFrictionFactor * world.dt;
}

// Update the HUD position to always be one unit in front of the camera
function updateHUDPosition() {
    const hudDistance = 1; // Distance of 1 unit in front of the camera
    const hudOffset = new THREE.Vector3(1.01, -0.65, -hudDistance); // Offset directly in front of the camera
    hudOffset.applyQuaternion(camera.quaternion); // Align with camera's orientation
    speedometerSprite.position.copy(camera.position).add(hudOffset); // Position in front of the camera
}

// Draw and update the speedometer on the canvas
function updateSpeedometer() {
    ctx.clearRect(0, 0, speedometerCanvas.width, speedometerCanvas.height);

    const speed = modelBody.velocity.length();
    const speedInKmH = (speed * 2.237).toFixed(1);

    // Set text properties
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.textAlign = 'right'; // Align text to the right

    // Draw right-aligned text at the right edge of the canvas
    ctx.fillText(`${speedInKmH} mp/h`, speedometerCanvas.width - 10, 70);

    // Update the texture
    speedometerTexture.needsUpdate = true;
}



function updateCameraPosition() {
    if (!modelBody) return;

    // Calculate the offset based on the car's orientation
    const offset = new THREE.Vector3(0, cameraOffset.y, cameraOffset.z);
    offset.applyQuaternion(model.quaternion); // Rotate offset to match car's orientation

    // Calculate the target position based on the car's position and offset
    const targetPosition = new THREE.Vector3().copy(model.position).add(offset);

    // Lerp only the X and Y components for smooth side and height transitions
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetPosition.x, 0.4); // Adjust lerp factor as needed
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetPosition.y, 0.4);

    // Directly set the Z position to keep a fixed distance behind the car
    camera.position.z = targetPosition.z;

    // Make the camera look slightly above the car's position
    const lookAtTarget = new THREE.Vector3(
        model.position.x,
        model.position.y + 1, // Offset to look slightly above the car
        model.position.z
    );
    camera.lookAt(lookAtTarget);
}





// Main animation loop
function animate() {
    requestAnimationFrame(animate);
    world.step(1 / 60);

    applyControls();
    updateCameraPosition();
    updateHUDPosition();
    updateSpeedometer();

    if (model) {
        model.position.copy(modelBody.position);
        model.quaternion.copy(modelBody.quaternion);
    }

    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

init();