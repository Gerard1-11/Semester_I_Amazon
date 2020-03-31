let container;
let camera, scene, raycaster, renderer;

let root = null,
group = null,
objectList = [],
objectList2 =[],
objectList3 =[];
orbitControls = null;

let objLoader = null;
let duration = 5000; // ms
let currentTime = Date.now();

let mouse = new THREE.Vector2(), INTERSECTED, CLICKED;
let radius = 100, theta = 0;

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

function animate() {		
    let now = Date.now();
    let deltat = now - currentTime;
    currentTime = now;
    let fract = deltat / duration;
    let angle = Math.PI * 2 * fract;

    

    for(object of objectList){
        if(object){
            object.rotation.y += angle / 2;
            object.rotation.x += angle / 2;

            if(object.position.x !=0 || object.position.x !=0){
                det4 = Math.random()
                if(det4 < 1/3){
                    object.position.x += Math.sign(object.position.x) * -.2

                }else if(det4<2/3 && det4>=1/3){
                    object.position.z += Math.sign(object.position.z) * -.2
                }else{
                    continue
                }
            }else{
                continue
            }
        }
    }

    for(object of objectList2){
        if(object){
            object.rotation.y += angle / 2;
            object.rotation.x -= angle / 2;
            object.rotation.z += angle / 2;
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

        object.scale.set(2, 2, 2);
        
        let name = "objObject" + String(index);

        object.name = name
        det =  Math.random()
        det2 = Math.random()
        det3 = Math.random()

        
        if(det <.5){
            if(det2<.5){
                if(det3<.5){
                    object.position.z = 150 + (Math.random() * 150)
                    object.position.x = -100 + (Math.random() * -150)
                }else{
                    object.position.z = 100 + (Math.random() * 150)
                    object.position.x = -150+ (Math.random() * -150)
                }
            }else{
                if(det3<.5){
                    object.position.z = -150+ (Math.random() * -150)
                    object.position.x = -10+ (Math.random() * -150)
                }else{
                    object.position.z = -100+ (Math.random() * -150)
                    object.position.x = -150+ (Math.random() * -150)
                }
            }
        }else{
            if(det2<.5){
                if(det3<.5){
                    object.position.z = 150+ (Math.random() * 150)
                    object.position.x = 100+ (Math.random() * 150)
                }else{
                    object.position.z = 100+ (Math.random() * 150)
                    object.position.x = 150+ (Math.random() * 150)
                }
            }else{
                if(det3<.5){
                    object.position.z = -150+ (Math.random() * -150)
                    object.position.x = 100+ (Math.random() * 150)
                }else{
                    object.position.z = -100+ (Math.random() * -150)
                    object.position.x = 150+ (Math.random() * 150)
                }
            }
        }
        
        
        object.rotation.y = -200;
        
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

        object.scale.set(10, 10, 10);
        object.position.z = 0;
        object.position.x = 0;
        object.position.y = 50;
        
        object.name = "pokeball";
        objectList.push(object);
        scene.add(object);

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

    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.set(0,200, 0);
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

    loadObj(objModelUrl,objectList)
    
    for ( let i = 1; i < 41; i ++ ) 
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

    let intersects = raycaster.intersectObjects( scene.children, true);
    
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

    let intersects = raycaster.intersectObjects( scene.children, true);

    console.log("intersects", intersects);
    if ( intersects.length > 0 ) 
    {
        CLICKED = intersects[ intersects.length - 1 ].object;
        CLICKED.material.emissive.setHex( 0x00ff00 );
        console.log(CLICKED.name);
        scene.remove(CLICKED.name)
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