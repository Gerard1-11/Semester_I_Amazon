let container;
let camera, scene, raycaster, renderer;

let objectList = [];
let objectList2 = [];
let objCollBoxes = [];
let objectCenterBBox, objectBBox;

let root = null,
group = null,
orbitControls = null;

let objLoader = null;
let duration = 5000; // ms
let currentTime = Date.now();

let mouse = new THREE.Vector2(), INTERSECTED, CLICKED;
let radius = 100, theta = 0;

let puntaje = $('#puntaje');
var puntos = "0"

let vidas = 5;

let floorUrl = "bkGround.jpg";

function animate() {		
    let now = Date.now();
    let deltat = now - currentTime;
    currentTime = now;
    let fract = deltat / duration;
    let angle = Math.PI * 2 * fract;

    objectCenterBBox.update();
    knotBox = new THREE.Box3().setFromObject(objectCenterBBox);
    
     

    
    let index = 0;
    for(object of objectList){
        if(object){
            
            objCollBoxes[index] = new THREE.BoxHelper(object, 0x000000);
            icoBox = new THREE.Box3().setFromObject(objCollBoxes[index]);

            if(knotBox.intersectsBox(icoBox)){
                scene.remove(object);
                scene.remove(objCollBoxes[index])
                console.log(vidas)
                console.log(objectList.length)
                console.log(objCollBoxes.length)
            }

            object.rotation.y -= angle / 4;
            object.rotation.x += angle / 2;
            object.rotation.z -= angle / 6;

            if(object.position.x !=0 || object.position.x !=0){
                det4 = Math.random()
                if(det4 < 1/3){
                    if(puntos < 1000){
                        object.position.x += Math.sign(object.position.x) * -.1
                    }else if(puntos >=1000 && puntos < 3000){
                        object.position.x += Math.sign(object.position.x) * -.2
                    }else if(puntos >=3000 && puntos < 8000){
                        object.position.x += Math.sign(object.position.x) * -.4
                    }else{
                        object.position.x += Math.sign(object.position.x) * -.6
                    }
                }else if(det4<2/3 && det4>=1/3){
                    if(puntos < 1000){
                        object.position.z += Math.sign(object.position.z) * -.1
                    }else if(puntos >=1000 && puntos < 3000){
                        object.position.z += Math.sign(object.position.z) * -.2
                    }else if(puntos >=3000 && puntos < 8000){
                        object.position.z += Math.sign(object.position.z) * -.4
                    }else{
                        object.position.z += Math.sign(object.position.z) * -.6
                    }
                    
                }else{
                    continue
                }
            }else{
                continue
            }
        }
        index++;
    }

    objectList2[0].rotation.y += angle / 2;
    objectList2[0].rotation.x += angle / 2;
    objectList2[0].rotation.z += angle / 2;



    
        
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
    scene.background = new THREE.TextureLoader().load(floorUrl);
    
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
    //scene.add( floor );

    let geometry = new THREE.IcosahedronBufferGeometry(15, 0);
    let geometryCenter = new THREE.TorusKnotBufferGeometry( 20, 5, 200, 32 );
    let objectCenter = new THREE.Mesh( geometryCenter, new THREE.MeshNormalMaterial() );
    objectCenterBBox = new THREE.BoxHelper(objectCenter, 0x000000);
    objectCenterBBox.update();
    objectCenterBBox.visible = false;
    objectList2.push(objectCenter)

    scene.add( objectCenter );
    scene.add(objectCenterBBox);
    for ( let i = 0; i < 100; i ++ ) 
    {
        let object = new THREE.Mesh( geometry, new THREE.MeshToonMaterial( { color: Math.random() * 0xffffff } ) );
        let objectBBox = new THREE.BoxHelper(object, 0x000000);
        objectBBox.update();
        objectBBox.visible = false;
        objCollBoxes.push(objectBBox)
        
        object.name = 'Ico_' + i;
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
        
        objectList.push(object)
        scene.add( object );
        scene.add(objectBBox);
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

    let intersects = raycaster.intersectObjects( scene.children );
    
    if ( intersects.length > 0 ) 
    {
        let closer = intersects.length - 1;

        if ( INTERSECTED != intersects[ closer ].object ) 
        {
            if ( INTERSECTED)
            {
                //INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
            }

            INTERSECTED = intersects[ closer ].object;
            //INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
            //INTERSECTED.material.emissive.setHex( 0xff0000 );
        }
    } 
    else 
    {
        if ( INTERSECTED ) 
            //INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

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

    let intersects = raycaster.intersectObjects( scene.children );

    console.log("intersects", intersects);
    if ( intersects.length > 0 ) 
    {
        CLICKED = intersects[ intersects.length - 1 ].object;
        //CLICKED.material.emissive.setHex( 0x00ff00 );
        console.log(CLICKED.name);
        puntos = String(Number(puntos) + 100 )
        console.log(puntos)
        scene.remove(CLICKED)
        index = ((CLICKED.name).split("_"))[1]
        scene.remove(objCollBoxes[index])
        console.log(objectList.length)
        console.log(objCollBoxes.length)
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
    requestAnimationFrame( run );
    render();

    animate();

    puntaje.html("Puntaje: " + puntos);

    
}

function render() 
{
    renderer.render( scene, camera );
}