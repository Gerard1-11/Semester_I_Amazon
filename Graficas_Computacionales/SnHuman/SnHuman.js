// 1. Enable shadow mapping in the renderer. 
// 2. Enable shadows and set shadow parameters for the lights that cast shadows. 
// Both the THREE.DirectionalLight type and the THREE.SpotLight type support shadows. 
// 3. Indicate which geometry objects cast and receive shadows.

let renderer = null, 
scene = null, 
camera = null,
root = null,
group = null,
objectList = [],
orbitControls = null;

let objLoader = null, jsonLoader = null;

let duration = 20000; // ms
let currentTime = Date.now();

let directionalLight = null;
let spotLight = null;
let ambientLight = null;
let pointLight = null;
let mapUrl = "../images/checker_large.gif";

let SHADOW_MAP_WIDTH = 2048, SHADOW_MAP_HEIGHT = 2048;
// let objModelUrl = {obj:'../models/obj/Penguin_obj/penguin.obj', map:'../models/obj/Penguin_obj/peng_texture.jpg'};
//let objModelUrl = {obj:'../models/obj/cerberus/Cerberus.obj', map:'../models/obj/cerberus/Cerberus_A.jpg', normalMap:'../models/obj/cerberus/Cerberus_N.jpg', specularMap: '../models/obj/cerberus/Cerberus_M.jpg'};
let objModelUrl = {obj:'Human_806polys.obj', map:'rainbow.jpg'};
//let jsonModelUrl = { url:'../models/json/teapot-claraio.json', };

function promisifyLoader ( loader, onProgress ) 
{
    function promiseLoader ( url ) {
  
      return new Promise( ( resolve, reject ) => {
  
        loader.load( url, resolve, onProgress, reject );
  
      } );
    }
  
    return {
      originalLoader: loader,
      load: promiseLoader,
    };
}
const onError = ( ( err ) => { console.error( err ); } );



async function loadObj(objModelUrl, objectList)
{
    const objPromiseLoader = promisifyLoader(new THREE.OBJLoader());

    try {
        const object = await objPromiseLoader.load(objModelUrl.obj);
        
        let texture = objModelUrl.hasOwnProperty('map') ? new THREE.TextureLoader().load(objModelUrl.map) : null;
        // let normalMap = objModelUrl.hasOwnProperty('normalMap') ? new THREE.TextureLoader().load(objModelUrl.normalMap) : null;
        // let specularMap = objModelUrl.hasOwnProperty('specularMap') ? new THREE.TextureLoader().load(objModelUrl.specularMap) : null;

        object.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                child.material.map = texture;
                // child.material.normalMap = normalMap;
                // child.material.specularMap = specularMap;
            }
        });

        object.scale.set(3, 3, 3);
        object.position.z = 0;
        object.position.x = 0;
        object.rotation.y = 0;
        object.name = "objObject";
        objectList.push(object);
        scene.add(object);
        transformControl.attach(object);

    }
    catch (err) {
        return onError(err);
    }
}

function run() 
{
    requestAnimationFrame(function() { run(); });
    
    // Render the scene
    renderer.render(scene, camera);

    // Update the camera controller
    orbitControls.update();
    
}

function createLights(root)
{
    pointLight = new THREE.PointLight (0xdedede, 0.3);
    pointLight.position.set(0, 10, 30);
    root.add(pointLight);

    pointLight2 = new THREE.PointLight (0xdedede, 1);
    pointLight2.position.set(0, 10, -30);
    root.add(pointLight2);

    //Spotlight 1
    spotLight = new THREE.SpotLight (0xdedede);
    spotLight.position.set(20, 30, 20);
    spotLight.target.position.set(0, 10, 0);
    root.add(spotLight);

    spotLight.castShadow = true;

    spotLight.shadow.camera.near = 1;
    spotLight.shadow. camera.far = 200;
    spotLight.shadow.camera.fov = 45;
    
    spotLight.shadow.mapSize.width = SHADOW_MAP_WIDTH;
    spotLight.shadow.mapSize.height = SHADOW_MAP_HEIGHT;

    //SpotLight2
    spotLight2 = new THREE.SpotLight (0xdedede);
    spotLight2.position.set(-20, 30, 20);
    spotLight2.target.position.set(0, 10, 0);
    root.add(spotLight2);

    spotLight2.castShadow = true;

    spotLight2.shadow.camera.near = 1;
    spotLight2.shadow. camera.far = 200;
    spotLight2.shadow.camera.fov = 45;
    
    spotLight2.shadow.mapSize.width = SHADOW_MAP_WIDTH;
    spotLight2.shadow.mapSize.height = SHADOW_MAP_HEIGHT;
}

function createScene(canvas) 
{
    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    // Set the viewport size
    renderer.setSize(canvas.width, canvas.height);

    // Turn on shadows
    renderer.shadowMap.enabled = true;
    // Options are THREE.BasicShadowMap, THREE.PCFShadowMap, PCFSoftShadowMap
    renderer.shadowMap.type = THREE.BasicShadowMap;
    
    // Create a new Three.js scene
    scene = new THREE.Scene();

    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000 );
    camera.position.set(0, 15, 30);
    //camera.lookAt(0,10,0);
    scene.add(camera);

    orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
    //Target al que apunta la cámara
    orbitControls.target.x = 0;
    orbitControls.target.y = 10;
    orbitControls.target.z = 0;
    
    //Bloquea a la camara a una distancia especifica del target
    orbitControls.minDistance = 30;
    orbitControls.maxDistance = 30;
    
    //PRUEBA:Modifica la velocidad de rotación
    orbitControls.rotateSpeed = 3;

    //Bloquea el movimiento vertical de la camara
    orbitControls.minPolarAngle = Math.PI/2;
    orbitControls.maxPolarAngle = Math.PI/2; 

    //Bloquear el enfoque de la camara
    orbitControls.enabledPan =false;

    //Bloquear el movimiento de la camara de izquierda a derecha
    orbitControls.enableRotate = false;


    transformControl = new THREE.TransformControls(camera, renderer.domElement);
    
    //Cambiar el modo de transformación a rotacion
    transformControl.setMode('rotate');

    //Si surge el evento, 
    transformControl.addEventListener( 'change', renderer.render( scene, camera ));
    
    transformControl.setSize(100);
    transformControl.showX = false;
    transformControl.showY = true;
    transformControl.showZ = false;
    
    transformControl.addEventListener( 'dragging-changed', ( event ) => {
            orbitControls.enabled = ! event.value;
    });

    scene.add(transformControl);
    
    // Create a group to hold all the objects
    root = new THREE.Object3D;

    //Create ligths
    createLights(root);
    
    // Create the objects
    loadObj(objModelUrl, objectList);

    // Create a group to hold the objects
    group = new THREE.Object3D;
    root.add(group);

    // Create a texture map
    let map = new THREE.TextureLoader().load(mapUrl);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(8, 8);

    let color = 0xffffff;

    // Put in a ground plane to show off the lighting
    let geometry = new THREE.PlaneGeometry(200, 200, 50, 50);
    let mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:color, map:map, side:THREE.DoubleSide}));

    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = -0.5;
    mesh.castShadow = false;
    mesh.receiveShadow = true;

    group.add( mesh );

    scene.add( root );


}