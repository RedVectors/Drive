/**
 * Created by admin on 16.10.2016.
 */
/**
 * Created by mshamota on 05.10.2016.
 */
var stats, controls;
var camera, scene, renderer;
//var octree;

init();
paintGL();

/*
function buildParticles() {
    //var textureLoader = new THREE.TextureLoader();
    //var tex = textureLoader.load("2.png");//THREE.ImageUtils.loadTexture("1.jpg"),

    var vShader = $("#NodeVertexShader");
    var fShader = $("#NodeFragmentShader");
    //var material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );





    //var box = new THREE.BoxGeometry(20,20,20);
    //var mesh = new THREE.Mesh(box,new THREE.MeshBasicMaterial( { color: 0xffffffff } ));
    $.getJSON("response-export.json", function (json) {

        //var particles = new THREE.Geometry();

        $.each( json["aggregations"], function (key, val) {

            var world_radius = 250;//размер области отрисовки
            var biggest_size_k = 0.2;//максимальный элемент занимает world_radius * k
            var count = val["buckets"].length;
            var size;
            var weight;
            var sizeScale;
            var sizes = new Float32Array(count);
            var positions = new Float32Array(count * 3);

            if (key != "agg_my")
                return;

            var i = 0;

            $.each(val["buckets"], function (key, val) {
                //console.log(key + ' ' + val);
                var vertex = new THREE.Vector3();
                vertex.x = (Math.random() * 2 - 1) * world_radius;
                vertex.y = (Math.random() * 2 - 1) * world_radius;
                vertex.z = (Math.random() * 2 - 1) * world_radius;
                vertex.toArray(positions, i * 3);

                weight = val.doc_count;//радиус вписанной окружности точки

                sizeScale = i == 0 ? biggest_size_k * world_radius / weight : sizeScale;//первое значение в выборке самое большое
                size = weight * sizeScale;
                sizes[i] = size;
                var node = {
                    vertex: vertex,
                    radius: size
                };

                octree.addDeferred(val, node);

                i++;
            });


            var particleMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    //projectionMat: {value: renderer.projectionMatrix}
                    vpSizeY: {value: renderer.context.canvas.height},
                    //scale: { value: sizeScale }
                    //color:     { value: new THREE.Color( 0xffffff ) },
                    //texture:   { value: new THREE.TextureLoader().load( "textures/sprites/spark1.png" ) }
                },
                vertexShader:   vShader.text(),
                fragmentShader: fShader.text(),
                transparent: true,
                depthWrite: false,
                blending: THREE.AdditiveBlending
            });

            var geometry = new THREE.BufferGeometry();
            geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.addAttribute('customSize', new THREE.BufferAttribute(sizes, 1));

            var particles = new THREE.Points(geometry, particleMaterial);

            particles.name = "agg_my";
            scene.add(particles);
            //scene.add(mesh);

            //octree.update();
        });
    });
}
*/

function update()
{
    controls.update(); // required if controls.enableDamping = true, or if controls.autoRotate = true
    stats.update();
}

function initializeGL() {
    scene = new THREE.Scene();
    var WIDTH = window.innerWidth, HEIGHT = window.innerHeight;

    camera = new THREE.PerspectiveCamera(75, window.width / window.height, 0.1, 10000);
    camera.position.z = 750;
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();

    window.addEventListener('resize', function() {
        var WIDTH = window.innerWidth, HEIGHT = window.innerHeight;

        renderer.setSize(WIDTH, HEIGHT);
        camera.aspect = WIDTH / HEIGHT;
        camera.updateProjectionMatrix();
    });


    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(WIDTH, HEIGHT);
    renderer.sortObjects = false;
    //renderer.domElement.addEventListener("click", onMouseClick);

    document.body.appendChild(renderer.domElement);

    scene.background = new THREE.Color(0x152565);
}
/*
 function resizeGL(canvas) {
 camera.aspect = canvas.width / canvas.height;
 camera.updateProjectionMatrix();

 renderer.setPixelRatio(canvas.devicePixelRatio);
 renderer.setSize(canvas.width, canvas.height);
 }
 */

function initStats() {
    stats = new Stats();
    stats.setMode(0); // 0: fps, 1: ms
    // Align top-left
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';
    document.getElementById("Stats-output").appendChild(stats.domElement);
}

function initControls(){
    controls = new THREE.OrbitControls( camera, renderer.domElement );
    //controls.addEventListener( 'change', render ); // add this only if there is no animation loop (requestAnimationFrame)
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;
}

/*
function initOctree(){
    //octree = new THREE.Octree( {
    octree = new OctreeParticle( {
        // uncomment below to see the octree (may kill the fps)

        //scene: scene,

        // when undeferred = true, objects are inserted immediately
        // instead of being deferred until next octree.update() call
        // this may decrease performance as it forces a matrix update

        //undeferred: false, <-- Have no meaning for OctreeParticle

        // set the max depth of tree
        depthMax: Infinity,
        // max number of objects before nodes split or merge
        objectsThreshold: 10,
        // percent between 0 and 1 that nodes will overlap each other
        // helps insert objects that lie over more than one node
        overlapPct: 0.15
    } );
}

function onMouseClick(event) {

    var mouse = new THREE.Vector2();
    var raycaster = new THREE.Raycaster();

    event.preventDefault();

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    raycaster.setFromCamera( mouse, camera );
    //var right = new THREE.Vector3(camera.matrix.elements[0], camera.matrix.elements[1], camera.matrix.elements[2]).normalize();
    //var up = new THREE.Vector3(camera.matrix.elements[4], camera.matrix.elements[5], camera.matrix.elements[6]).normalize();
    //var backward = new THREE.Vector3(camera.matrix.elements[8], camera.matrix.elements[9], camera.matrix.elements[10]).normalize();

    var octreeObjects = octree.search(
        raycaster.ray.origin,
        raycaster.ray.far,
        false,
        raycaster.ray.direction);


    var boundingSphere = new THREE.Sphere();
    $.each(octreeObjects, function(key, val) {

        //TODO:into particlenode class
        //TODO:sort by dist
        //var x = right.clone().multiplyScalar(val.radius);
        //var y = up.clone().multiplyScalar(val.radius);
        //boundingSphere.center = (x).sub(y).add(val.position);
        boundingSphere.center = val.position;
        boundingSphere.radius = val.radius;
        if (raycaster.ray.intersectSphere(boundingSphere)) {
            var mesh = new THREE.Mesh(new THREE.SphereGeometry(val.radius,10,10),new THREE.MeshBasicMaterial({color:0xffffffff}));
            mesh.position.set(boundingSphere.center.x,boundingSphere.center.y,boundingSphere.center.z);
            scene.add(mesh);
            console.log(val.object.key);
        }
    });
}
*/
function init() {
    initializeGL();
    initStats();
    initControls();
    //initOctree();
    //buildParticles();
}

function paintGL() {
    update();
    requestAnimationFrame(paintGL);
    renderer.render(scene, camera);
}