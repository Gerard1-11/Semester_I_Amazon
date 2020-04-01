let container;
let camera, scene, raycaster, renderer;

let root = null,
group = null,
objectList = [],
objectList2 =[],
objectList3 =[];
orbitControls = null;
let objectCenter;

let objLoader = null;
let duration = 5000; // ms
let currentTime = Date.now();

let mouse = new THREE.Vector2(), INTERSECTED, CLICKED;
let radius = 100, theta = 0;

let puntosTot = 0;

let floorUrl = "suelo1.jpg";
let objModelUrl2 = {obj:'pokeballMod.obj', map:'PKtex.png'};
let objModelUrl = {obj:'Mew_Pokemon_OBjMod.obj', map:'mew_eyes_Texture.png'};

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

function moveX(object, speed) {
    if(object.position.x > 0){
        var d = object.position.x - objectCenter.position.x;
        if (object.position.x > objectCenter.position.x) {
            object.position.x -= Math.min( speed, d );
        }
    }else if (object.position.x < 0){
        var d = object.position.x + objectCenter.position.x;
        if (object.position.x < objectCenter.position.x) {
            object.position.x += Math.max( speed, d );
        }
    }
}

function moveY(object, speed) {
    console.log(object.position)
    if(object.position.y > 0){
        var d = object.position.y - objectCenter.position.y;
        if (object.position.y > objectCenter.position.y) {
            object.position.y -= Math.min( speed, d );
        }
    }else if (object.position.y < 0){
        var d = object.position.y + objectCenter.position.y;
        if (object.position.y < objectCenter.position.y) {
            object.position.y += Math.max( speed, d );
        }
    }
} 

function moveZ(object, speed) {
    if(object.position.z > 0){
        var d = object.position.z - objectCenter.position.z;
        if (object.position.z > objectCenter.position.z) {
            object.position.z -= Math.min( speed, d );
        }
    }else if (object.position.z < 0){
        var d = object.position.z + objectCenter.position.z;
        if (object.position.z < objectCenter.position.z) {
            object.position.z += Math.max( speed, d );
        }
    }
}

function setObjectPosition(object){
    det =  Math.random()
    det2 = Math.random()
    det3 = Math.random()

        
    
    if(det<.5){
        if(det2<.5){
            object.position.x = (Math.random() * -10)
            object.position.z = 75 + (Math.random() * 75)
            object.position.y = (Math.random() * -10)
            
        }else{
            object.position.x = (Math.random() * -10)
            object.position.z = 75 + (Math.random() * 50)
            object.position.y = (Math.random() * 10)
        }
    }else{
        if(det3<.5){
            object.position.x = (Math.random() * 10)
            object.position.z = 75 + (Math.random() * 25)
            object.position.y = (Math.random() * -10)
        }else{
            object.position.x = (Math.random() * 10)
            object.position.z = 75 + (Math.random() * 100)
            object.position.y = (Math.random() * 10)
        }
    }
    
    object.rotation.y = -200;
}

function animate() {
    
    $("#puntaje").html("SCORE: " + puntosTot );

    let now = Date.now();
    let deltat = now - currentTime;
    currentTime = now;
    let fract = deltat / duration;
    let angle = Math.PI * 2 * fract;

    for(object of objectList){
        if(object){

            if(object.position.z == 0){
                if(puntosTot>0){
                    puntosTot-=1;
                }
                setObjectPosition(object);
            }

            object.rotation.x += angle * 2;
            object.rotation.y += angle / 6;
            object.rotation.z += angle * 2/3;
            moveZ(object,.15);
        } 
    }   
}

async function loadMultObjs(objModelUrl, objectList, index)
{
    const objPromiseLoader = promisifyLoader(new THREE.OBJLoader());

    try {
        const object = await objPromiseLoader.load(objModelUrl.obj);
        
        let texture = objModelUrl.hasOwnProperty('map') ? new THREE.TextureLoader().load(objModelUrl.map) : null;
        
        object.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                child.material.map = texture;
                // child.material.normalMap = normalMap;
                // child.material.specularMap = specularMap;
            }
        });

        object.scale.set(.2, .2, .2);
        let name = "objObject" + String(index);
        object.name = name
        setObjectPosition(object);
        objectList.push(object);
        scene.add(object);

    }
    catch (err) {
        return onError(err);
    }
}

async function loadObj(objModelUrl, objectList)
{
    const objPromiseLoader = promisifyLoader(new THREE.OBJLoader());

    try {
        const object = await objPromiseLoader.load(objModelUrl.obj);
        
        let texture = objModelUrl.hasOwnProperty('map') ? new THREE.TextureLoader().load(objModelUrl.map) : null;
        
        object.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                child.material.map = texture;
                // child.material.normalMap = normalMap;
                // child.material.specularMap = specularMap;
            }
        });

        object.scale.set(1, 1, 1);
        object.position.z = 0;
        object.position.y = 0;
        object.position.x = 0;
        object.name = "pokeball";
        objectCenter = object;
        objectList.push(object);
        //scene.add(object);

    }
    catch (err) {
        return onError(err);
    }
}

function createScene(canvas) 
{
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    // Set the viewport size
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Turn on shadows
    renderer.shadowMap.enabled = true;
    // Options are THREE.BasicShadowMap, THREE.PCFShadowMap, PCFSoftShadowMap
    renderer.shadowMap.type = THREE.BasicShadowMap;

    camera = new THREE.PerspectiveCamera( 100, window.innerWidth / window.innerHeight, 1, 50 );
    camera.position.set(0, 0, -5);
    camera.lookAt(0,0,0);
    
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xf0f0f0 );
    
    let light = new THREE.DirectionalLight( 0xffffff, .40 );
    light.position.set( 1, 1, 1 );
    scene.add( light );

    let light2 = new THREE.DirectionalLight( 0xffffff, .40 );
    light2.position.set( 1, 1, -1 );
    scene.add( light2 );
    
    let light3 = new THREE.DirectionalLight( 0xffffff, .40 );
    light3.position.set( -1, 1, 1 );
    scene.add( light3 );
    
    let light4 = new THREE.DirectionalLight( 0xffffff, .40 );
    light4.position.set( -1, 1, -1 );
    scene.add( light4 );
    
    // floor

    let map = new THREE.TextureLoader().load(floorUrl);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(8, 8);

    let floorGeometry = new THREE.PlaneGeometry( 2000, 2000, 100, 100 );
    let floor = new THREE.Mesh(floorGeometry, new THREE.MeshPhongMaterial({color:0xffffff, map:map, side:THREE.DoubleSide}));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -50
    //scene.add( floor );

    scene.background = map; 

    loadObj(objModelUrl,objectList2)
    
    for ( let i = 0; i < 30; i ++ ) 
    {
        loadMultObjs(objModelUrl2,objectList, i)
    }
    
    raycaster = new THREE.Raycaster();
        
    document.addEventListener('mousemove', onDocumentMouseMove);
    document.addEventListener('mousedown', onDocumentMouseDown);
    
    window.addEventListener( 'resize', onWindowResize);
}

function onWindowResize() 
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function onDocumentMouseMove( event ) 
{
    event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    // find intersections
    raycaster.setFromCamera( mouse, camera );

    let intersects = raycaster.intersectObjects( objectList, true);
    
    if ( intersects.length > 0 ) 
    {
        let closer = intersects.length - 1;

        if ( INTERSECTED != intersects[ closer ].object ) 
        {
            if ( INTERSECTED)
            {
                INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
            }

            INTERSECTED = intersects[ closer ].object;
            INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
            INTERSECTED.material.emissive.setHex( 0xff0000 );
        }
    } 
    else 
    {
        if ( INTERSECTED ) 
            INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

        INTERSECTED = null;
    }
}

function onDocumentMouseDown(event)
{
    event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    // find intersections
    raycaster.setFromCamera( mouse, camera );

    let intersects = raycaster.intersectObjects( objectList, true);

    console.log("intersects", intersects);
    if ( intersects.length > 0 ) 
    {
        CLICKED = intersects[ intersects.length - 1 ].object;
        CLICKED.material.emissive.setHex( 0x00ff00 );
        console.log(CLICKED.name);
        //scene.remove(CLICKED.parent);
        setObjectPosition(CLICKED.parent);
        puntosTot += 1;
        $("#puntaje").html("SCORE: " + puntosTot );
        console.log(puntosTot)
        
    } 
    else 
    {
        if ( CLICKED ) 
            CLICKED.material.emissive.setHex( CLICKED.currentHex );

        CLICKED = null;
    }
}
//
function run() 
{
    requestAnimationFrame(() => run() );
    render();
    
    
    animate();
}

function render() 
{
    renderer.render( scene, camera );
}