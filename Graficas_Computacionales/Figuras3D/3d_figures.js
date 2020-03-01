let mat4 = glMatrix.mat4;

let projectionMatrix;

let shaderProgram, shaderVertexPositionAttribute, shaderVertexColorAttribute, 
    shaderProjectionMatrixUniform, shaderModelViewMatrixUniform;

let duration = 5000; // ms

// Attributes: Input variables used in the vertex shader. Since the vertex shader is called on each vertex, these will be different every time the vertex shader is invoked.
// Uniforms: Input variables for both the vertex and fragment shaders. These do not change values from vertex to vertex.
// Varyings: Used for passing data from the vertex shader to the fragment shader. Represent information for which the shader can output different value for each vertex.
let vertexShaderSource =    
    "    attribute vec3 vertexPos;\n" +
    "    attribute vec4 vertexColor;\n" +
    "    uniform mat4 modelViewMatrix;\n" +
    "    uniform mat4 projectionMatrix;\n" +
    "    varying vec4 vColor;\n" +
    "    void main(void) {\n" +
    "		// Return the transformed and projected vertex value\n" +
    "        gl_Position = projectionMatrix * modelViewMatrix * \n" +
    "            vec4(vertexPos, 1.0);\n" +
    "        // Output the vertexColor in vColor\n" +
    "        vColor = vertexColor;\n" +
    "    }\n";

// precision lowp float
// This determines how much precision the GPU uses when calculating floats. The use of highp depends on the system.
// - highp for vertex positions,
// - mediump for texture coordinates,
// - lowp for colors.
let fragmentShaderSource = 
    "    precision lowp float;\n" +
    "    varying vec4 vColor;\n" +
    "    void main(void) {\n" +
    "    gl_FragColor = vColor;\n" +
    "}\n";

function initWebGL(canvas)
{
    let gl = null;
    let msg = "Your browser does not support WebGL, " +
        "or it is not enabled by default.";
    try 
    {
        gl = canvas.getContext("experimental-webgl");
    } 
    catch (e)
    {
        msg = "Error creating WebGL Context!: " + e.toString();
    }

    if (!gl)
    {
        alert(msg);
        throw new Error(msg);
    }

    return gl;        
}

function initViewport(gl, canvas)
{
    gl.viewport(0, 0, canvas.width, canvas.height);
}

function initGL(canvas)
{
    // Create a project matrix with 45 degree field of view
    projectionMatrix = mat4.create();
    
    mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 1, 100);
    mat4.translate(projectionMatrix, projectionMatrix, [0, 0, -5]);
}

// Create the vertex, color and index data for a multi-colored tetra
function createTetra(gl, translation, rotationAxis)
{    
    // Vertex Data
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    let verts = [
       // Bottom face
       -1.0, -1.0,  1.0,
        1.0, -1.0,  1.0,
       -1.0, -1.0, -1.0,
        1.0, -1.0, -1.0,

        // Front face
        0.0,  1.0,  0.0,
       -1.0, -1.0,  1.0,
        1.0, -1.0,  1.0,

       // Back face
        0.0,  1.0,  0.0,
       -1.0, -1.0, -1.0,
        1.0, -1.0, -1.0,

       // Right face
        0.0,  1.0,  0.0,
        1.0, -1.0,  1.0,
        1.0, -1.0,  -1.0,

       // Left face
        0.0,  1.0,  0.0,
       -1.0, -1.0,  1.0,
       -1.0, -1.0, -1.0
       ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Color data
    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    let faceColors = [
        [1.0, 0.0, 0.0, 1.0], // RED - Bottom face
        [0.0, 1.0, 0.0, 1.0], // GREEN - Front face
        [1.0, 1.0, 0.0, 1.0], // BLUE - Back face
        [1.0, 0.0, 1.0, 1.0], // PURPLE - Right face
        [0.0, 1.0, 1.0, 1.0]  // YELLOW - Left face
    ];

    // Each vertex must have the color information, that is why the same color is concatenated 4 times, one for each vertex of the tetra's face.
    let vertexColors = [1.0, 0.0, 0.0, 1.0];
    // for (const color of faceColors) 
    // {
    //     for (let j=0; j < 4; j++)
    //         vertexColors.push(...color);
    // }
    
    faceColors.forEach(color =>{
        for (let j=0; j < 3; j++)
            vertexColors.push(...color);
    });
    

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    let tetraIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tetraIndexBuffer);

    let tetraIndices = [
        0, 1, 2,   1, 2, 3,
        4, 5, 6,
        7, 8, 9,
        10, 11, 12,
        13, 14, 15 
    ];

    // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
    // Uint16Array: Array of 16-bit unsigned integers.
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(tetraIndices), gl.STATIC_DRAW);
    
    let tetra = {
            buffer:vertexBuffer, colorBuffer:colorBuffer, indices:tetraIndexBuffer,
            vertSize:3, nVerts:16, colorSize:4, nColors: 18, nIndices:18,
            primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()};

    mat4.translate(tetra.modelViewMatrix, tetra.modelViewMatrix, translation);

    tetra.update = function()
    {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angle = Math.PI * 2 * fract;
    
        // Rotates a mat4 by the given angle
        // mat4 out the receiving matrix
        // mat4 a the matrix to rotate
        // Number rad the angle to rotate the matrix by
        // vec3 axis the axis to rotate around
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };
    
    return tetra;
}

// Create the vertex, color and index data for a multi-colored Octahedron
function createOcta(gl, translation, rotationAxis, down)
{    
    // Vertex Data
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    let verts = [

        // Up Front face
        0.0,  2.0,  0.0,
       -1.0,  0.0,  1.0,
        1.0,  0.0,  1.0,

       // UP Back face
        0.0,  2.0,  0.0,
       -1.0,  0.0, -1.0,
        1.0,  0.0, -1.0,

       // Up Right face
        0.0,  2.0,  0.0,
        1.0,  0.0,  1.0,
        1.0,  0.0,  -1.0,

       // Up Left face
        0.0,  2.0,  0.0,
       -1.0,  0.0,  1.0,
       -1.0,  0.0, -1.0,

       // Front face
        0.0, -2.0,  0.0,
       -1.0,  0.0,  1.0,
        1.0,  0.0,  1.0,

       // Back face
        0.0, -2.0,  0.0,
       -1.0,  0.0, -1.0,
        1.0,  0.0, -1.0,

       // Right face
        0.0, -2.0,  0.0,
        1.0,  0.0,  1.0,
        1.0,  0.0,  -1.0,

       // Left face
        0.0, -2.0,  0.0,
       -1.0,  0.0,  1.0,
       -1.0,  0.0, -1.0
       ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Color data
    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    let faceColors = [
        [1.0, 0.0, 0.0, 1.0], // RED - Up Front face
        [0.0, 1.0, 0.0, 1.0], // GREEN - Up Back face
        [0.0, 0.0, 1.0, 1.0], // BLUE - Up Right face
        [1.0, 0.0, 1.0, 1.0], // PURPLE - Up Left face
        [0.0, 1.0, 1.0, 1.0], // CYAN - Down Front face
        [1.0, 1.0, 0.0, 1.0], // YELLOW- Down Back face
        [0.5, 0.5, 0.5, 1.0], // GRAY - Down Front face
        [0.2, 0.6, 1.0, 1.0], // SKYBLUE - Down Front face
    ];

    // Each vertex must have the color information, that is why the same color is concatenated 4 times, one for each vertex of the octa's face.
    let vertexColors = [];
    // for (const color of faceColors) 
    // {
    //     for (let j=0; j < 4; j++)
    //         vertexColors.push(...color);
    // }
    
    faceColors.forEach(color =>{
        for (let j=0; j < 3; j++)
            vertexColors.push(...color);
    });
    

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    let octaIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, octaIndexBuffer);

    let octaIndices = [
        0, 1, 2,
        3, 4, 5, 
        6, 7, 8,
        9, 10, 11, 
        12, 13, 14, 
        15 ,16, 17,
        18, 19, 20,
        21, 22, 23
    ];

    // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
    // Uint16Array: Array of 16-bit unsigned integers.
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(octaIndices), gl.STATIC_DRAW);
    
    let octa = {
            buffer:vertexBuffer, colorBuffer:colorBuffer, indices:octaIndexBuffer,
            vertSize:3, nVerts:24, colorSize:4, nColors: 24, nIndices:24,
            primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()};

    

    mat4.translate(octa.modelViewMatrix, octa.modelViewMatrix, translation);

    octa.update = function()
    {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angle = Math.PI * 2 * fract;
        

        if(down){
            mat4.translate(this.modelViewMatrix, this.modelViewMatrix,[0,-6*fract,0])
            if(this.modelViewMatrix[13]<-2){
                down=false;
            }
        }
        else{
            mat4.translate(this.modelViewMatrix, this.modelViewMatrix,[0,+6*fract,0])
            if(this.modelViewMatrix[13]>2){
                down=true;  
            }
        }
    
        // Rotates a mat4 by the given angle
        // mat4 out the receiving matrix
        // mat4 a the matrix to rotate
        // Number rad the angle to rotate the matrix by
        // vec3 axis the axis to rotate around
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };
    
    return octa;
}

// Create the vertex, color and index data for a multi-colored Pentagonal Pyramid
function createPira(gl, translation, rotationAxis)
{    
    // Vertex Data
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    let verts = [];

    //Base
    for(let degree = 0; degree <360 ; degree+=72)
{
    radian = ((degree*Math.PI)/180)
    verts.push(Math.cos(radian));
    verts.push(-1);
    verts.push(Math.sin(radian));
}

    //Triangles
    for(let degree = 0; degree <=360 ; degree+=72)
    {
        radian = ((degree*Math.PI)/180)
        radian2 =(((degree+72)*Math.PI)/180)
        verts.push(Math.cos(radian));
        verts.push(-1);
        verts.push(Math.sin(radian));
        verts.push(Math.cos(radian2));
        verts.push(-1);
        verts.push(Math.sin(radian2));
        verts.push(0);
        verts.push(1.5);
        verts.push(0);
    }

console.log(verts)



console.log(verts)
console.log(verts.length/3)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Color data
    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    let faceColors = [
        [1.0, 0.0, 0.0, 1.0], // RED - Up Front face
        [0.0, 1.0, 0.0, 1.0], // GREEN - Up Back face
        [0.0, 0.0, 1.0, 1.0], // BLUE - Up Right face
        [1.0, 0.0, 1.0, 1.0], // PURPLE - Up Left face
        [0.0, 1.0, 1.0, 1.0], // CYAN - Down Front face
        [1.0, 1.0, 0.0, 1.0], // YELLOW- Down Back face
    ];

    // Each vertex must have the color information, that is why the same color is concatenated 4 times, one for each vertex of the tetra's face.
    let vertexColors = [1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0];
    // for (const color of faceColors) 
    // {
    //     for (let j=0; j < 4; j++)
    //         vertexColors.push(...color);
    // }
    
    faceColors.forEach(color =>{
        for (let j=0; j < 3; j++)
            vertexColors.push(...color);
    });
    

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    let piraIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, piraIndexBuffer);

    let piraIndices = [
        0, 1, 4,   1, 2, 4,   2, 3, 4,
        5, 6, 7,
        8, 9, 10,
        11, 12, 13, 
        14, 15, 16,
        17, 18, 19
    ];

    // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
    // Uint16Array: Array of 16-bit unsigned integers.
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(piraIndices), gl.STATIC_DRAW);
    
    let pira = {
            buffer:vertexBuffer, colorBuffer:colorBuffer, indices:piraIndexBuffer,
            vertSize:3, nVerts:20, colorSize:4, nColors: 20, nIndices:24,
            primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()};

    mat4.translate(pira.modelViewMatrix, pira.modelViewMatrix, translation);

    pira.update = function()
    {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angle = Math.PI * 2 * fract;
    
        // Rotates a mat4 by the given angle
        // mat4 out the receiving matrix
        // mat4 a the matrix to rotate
        // Number rad the angle to rotate the matrix by
        // vec3 axis the axis to rotate around
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };
    
    return pira;
}

// Create the vertex, color and index data for a multi-colored Dodecahedron
function createDode(gl, translation, rotationAxis)
{    
    // Vertex Data
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    ratio = (1+Math.sqrt(5))/2
    let verts = [
        //Face 1
        0.0, -1*ratio,  1/ratio,
        0.0, -1*ratio, -1/ratio,
        1.0, -1.0, -1.0, 
        ratio, -1/ratio, 0.0, 
        1.0, -1.0, 1.0,

        //Face 2 
        1.0, -1.0, -1.0, 
        1/ratio, 0.0, -ratio, 
        1.0,  1.0, -1.0,
        ratio,  1/ratio, 0.0,
        ratio, -1/ratio, 0.0,

        //Face 3 
        ratio, -1/ratio, 0.0,
        ratio,  1/ratio, 0.0,
        1.0,  1.0,  1.0, 
        1/ratio, 0.0,  ratio, 
        1.0, -1.0,  1.0,
        
        //Face 4 
         1.0, -1.0,  1.0,
         1/ratio, 0.0,  ratio,
        -1/ratio, 0.0,  ratio,
        -1.0, -1.0,  1.0,
         0.0, -1*ratio, 1/ratio, 

         //Face 5 
         0.0, -1*ratio, 1/ratio,
        -1.0, -1.0,  1.0, 
        -ratio, -1/ratio, 0.0,
        -1.0, -1.0, -1.0,
         0.0, -1*ratio, -1/ratio, 

         //Face 6 
         0.0, -1*ratio, -1/ratio,
         -1.0, -1.0, -1.0,
         -1/ratio, 0.0, -1*ratio,
          1/ratio, 0.0, -1*ratio,
         1.0, -1.0, -1.0, 

          //Face 7 
          0.0, 1*ratio, -1/ratio,
          1.0, 1.0, -1.0,
          1/ratio, 0.0, -1*ratio,
         -1/ratio, 0.0, -1*ratio,
         -1.0,  1.0,  -1.0, 

         //Face 8 
         -1.0,  1.0,  -1.0, 
         -1/ratio, 0.0, -1*ratio,
         -1.0, -1.0, -1.0,
         -1*ratio, -1/ratio, 0.0,
         -1*ratio, 1/ratio, 0.0,

         //Face 9 
         -1*ratio, 1/ratio, 0.0,
         -1*ratio, -1/ratio, 0.0,
         -1.0, -1.0,  1.0, 
         -1/ratio, 0.0, ratio,
         -1.0,  1.0,  1.0,

         //Face 10
         -1.0,  1.0,  1.0,
         -1/ratio, 0.0, ratio,
          1/ratio, 0.0, ratio,
          1.0, 1.0, 1.0,
          0.0, ratio, 1/ratio,

          //Face 11
          0.0, ratio, 1/ratio,
          1.0, 1.0, 1.0,
          ratio,  1/ratio,  0.0,
          1.0, 1.0, -1.0,
          0.0, ratio, -1/ratio,

          //Face 12
          -1.0,  1.0,  1.0,
          0.0, ratio, 1/ratio,
          0.0, ratio, -1/ratio,
          -1.0,  1.0,  -1.0, 
          -1*ratio, 1/ratio, 0.0
       ];

    console.log(verts, ratio)

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Color data
    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    let faceColors = [
        [0.5, 0.5, 0.5, 1.0], // GRAY - Face 1
        [0.9, 0.2, 0.5, 1.0], // DARKPINK - Face 2
        [0.0, 0.0, 1.0, 1.0], // BLUE - Face 3
        [1.0, 0.0, 0.0, 1.0], // RED - Face 4
        [1.0, 0.0, 1.0, 1.0], // PURPLE - Face 5
        [0.0, 1.0, 1.0, 1.0], // CYAN - Face 6
        [0.2, 0.6, 1.0, 1.0], // SKYBLUE - Face 7
        [0.0, 1.0, 0.0, 1.0], // GREEN - Face 8
        [0.5, 0.2, 1.0, 1.0], // PURPLEBLUE- Face 19
        [1.0, 1.0, 0.0, 1.0], // YELLOW- Face 10
        [0.7, 0.7, 0.7, 1.0], // LIGHTGRAY - Face 11
        [0.9, 0.2, 0.1, 1.0], // ORANGERED - Face 12
    ];

    // Each vertex must have the color information, that is why the same color is concatenated 4 times, one for each vertex of the octa's face.
    let vertexColors = [];
    // for (const color of faceColors) 
    // {
    //     for (let j=0; j < 4; j++)
    //         vertexColors.push(...color);
    // }
    
    faceColors.forEach(color =>{
        for (let j=0; j < 5; j++)
            vertexColors.push(...color);
    });
    

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    let dodeIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, dodeIndexBuffer);

    let dodeIndices = [
        0, 1, 2,    0, 2, 4,    2, 3, 4, //Face 1
        5, 6, 7,    5, 7, 9,    7, 8, 9, //Face 2
        10, 11, 12,    10, 12, 14,    12, 13, 14, //Face 3
        15, 16, 17,    15, 17, 19,    17, 18, 19, //Face 4
        20, 21, 22,    20, 22, 24,    22, 23, 24, //Face 5
        25, 26, 27,    25, 27, 29,    27, 28, 29, //Face 6
        30, 31, 32,    30, 32, 34,    32, 33, 34, //Face 7
        35, 36, 37,    35, 37, 39,    37, 38, 39, //Face 8
        40, 41, 42,    40, 42, 44,    42, 43, 44, //Face 9
        45, 46, 47,    45, 47, 49,    47, 48, 49, //Face 10
        50, 51, 52,    50, 52, 54,    52, 53, 54, //Face 11
        55, 56, 57,    55, 57, 59,    57, 58, 59  //Face 12
    ];

    // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
    // Uint16Array: Array of 16-bit unsigned integers.
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(dodeIndices), gl.STATIC_DRAW);
    
    let dode = {
            buffer:vertexBuffer, colorBuffer:colorBuffer, indices:dodeIndexBuffer,
            vertSize:3, nVerts:60, colorSize:4, nColors: 60, nIndices:108,
            primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()};

    mat4.translate(dode.modelViewMatrix, dode.modelViewMatrix, translation);

    dode.update = function()
    {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angle = Math.PI * 2 * fract;
    
        // Rotates a mat4 by the given angle
        // mat4 out the receiving matrix
        // mat4 a the matrix to rotate
        // Number rad the angle to rotate the matrix by
        // vec3 axis the axis to rotate around
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };
    
    return dode;
}

// Create the vertex, color and index data for a multi-colored Dodecahedron with two rotation axis
function createDode2(gl, translation, rotationAxis, rotationAxis2)
{    
    // Vertex Data
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    ratio = (1+Math.sqrt(5))/2
    let verts = [
        //Face 1
        0.0, -1*ratio,  1/ratio,
        0.0, -1*ratio, -1/ratio,
        1.0, -1.0, -1.0, 
        ratio, -1/ratio, 0.0, 
        1.0, -1.0, 1.0,

        //Face 2 
        1.0, -1.0, -1.0, 
        1/ratio, 0.0, -ratio, 
        1.0,  1.0, -1.0,
        ratio,  1/ratio, 0.0,
        ratio, -1/ratio, 0.0,

        //Face 3 
        ratio, -1/ratio, 0.0,
        ratio,  1/ratio, 0.0,
        1.0,  1.0,  1.0, 
        1/ratio, 0.0,  ratio, 
        1.0, -1.0,  1.0,
        
        //Face 4 
         1.0, -1.0,  1.0,
         1/ratio, 0.0,  ratio,
        -1/ratio, 0.0,  ratio,
        -1.0, -1.0,  1.0,
         0.0, -1*ratio, 1/ratio, 

         //Face 5 
         0.0, -1*ratio, 1/ratio,
        -1.0, -1.0,  1.0, 
        -ratio, -1/ratio, 0.0,
        -1.0, -1.0, -1.0,
         0.0, -1*ratio, -1/ratio, 

         //Face 6 
         0.0, -1*ratio, -1/ratio,
         -1.0, -1.0, -1.0,
         -1/ratio, 0.0, -1*ratio,
          1/ratio, 0.0, -1*ratio,
         1.0, -1.0, -1.0, 

          //Face 7 
          0.0, 1*ratio, -1/ratio,
          1.0, 1.0, -1.0,
          1/ratio, 0.0, -1*ratio,
         -1/ratio, 0.0, -1*ratio,
         -1.0,  1.0,  -1.0, 

         //Face 8 
         -1.0,  1.0,  -1.0, 
         -1/ratio, 0.0, -1*ratio,
         -1.0, -1.0, -1.0,
         -1*ratio, -1/ratio, 0.0,
         -1*ratio, 1/ratio, 0.0,

         //Face 9 
         -1*ratio, 1/ratio, 0.0,
         -1*ratio, -1/ratio, 0.0,
         -1.0, -1.0,  1.0, 
         -1/ratio, 0.0, ratio,
         -1.0,  1.0,  1.0,

         //Face 10
         -1.0,  1.0,  1.0,
         -1/ratio, 0.0, ratio,
          1/ratio, 0.0, ratio,
          1.0, 1.0, 1.0,
          0.0, ratio, 1/ratio,

          //Face 11
          0.0, ratio, 1/ratio,
          1.0, 1.0, 1.0,
          ratio,  1/ratio,  0.0,
          1.0, 1.0, -1.0,
          0.0, ratio, -1/ratio,

          //Face 12
          -1.0,  1.0,  1.0,
          0.0, ratio, 1/ratio,
          0.0, ratio, -1/ratio,
          -1.0,  1.0,  -1.0, 
          -1*ratio, 1/ratio, 0.0
       ];

    console.log(verts, ratio)

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Color data
    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    let faceColors = [
        [0.5, 0.5, 0.5, 1.0], // GRAY - Face 1
        [0.9, 0.2, 0.5, 1.0], // DARKPINK - Face 2
        [0.0, 0.0, 1.0, 1.0], // BLUE - Face 3
        [1.0, 0.0, 0.0, 1.0], // RED - Face 4
        [1.0, 0.0, 1.0, 1.0], // PURPLE - Face 5
        [0.0, 1.0, 1.0, 1.0], // CYAN - Face 6
        [0.2, 0.6, 1.0, 1.0], // SKYBLUE - Face 7
        [0.0, 1.0, 0.0, 1.0], // GREEN - Face 8
        [0.5, 0.2, 1.0, 1.0], // PURPLEBLUE- Face 19
        [1.0, 1.0, 0.0, 1.0], // YELLOW- Face 10
        [0.7, 0.7, 0.7, 1.0], // LIGHTGRAY - Face 11
        [0.9, 0.2, 0.1, 1.0], // ORANGERED - Face 12
    ];

    // Each vertex must have the color information, that is why the same color is concatenated 4 times, one for each vertex of the octa's face.
    let vertexColors = [];
    // for (const color of faceColors) 
    // {
    //     for (let j=0; j < 4; j++)
    //         vertexColors.push(...color);
    // }
    
    faceColors.forEach(color =>{
        for (let j=0; j < 5; j++)
            vertexColors.push(...color);
    });
    

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    let dodeIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, dodeIndexBuffer);

    let dodeIndices = [
        0, 1, 2,    0, 2, 4,    2, 3, 4, //Face 1
        5, 6, 7,    5, 7, 9,    7, 8, 9, //Face 2
        10, 11, 12,    10, 12, 14,    12, 13, 14, //Face 3
        15, 16, 17,    15, 17, 19,    17, 18, 19, //Face 4
        20, 21, 22,    20, 22, 24,    22, 23, 24, //Face 5
        25, 26, 27,    25, 27, 29,    27, 28, 29, //Face 6
        30, 31, 32,    30, 32, 34,    32, 33, 34, //Face 7
        35, 36, 37,    35, 37, 39,    37, 38, 39, //Face 8
        40, 41, 42,    40, 42, 44,    42, 43, 44, //Face 9
        45, 46, 47,    45, 47, 49,    47, 48, 49, //Face 10
        50, 51, 52,    50, 52, 54,    52, 53, 54, //Face 11
        55, 56, 57,    55, 57, 59,    57, 58, 59  //Face 12
    ];

    // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
    // Uint16Array: Array of 16-bit unsigned integers.
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(dodeIndices), gl.STATIC_DRAW);
    
    let dode = {
            buffer:vertexBuffer, colorBuffer:colorBuffer, indices:dodeIndexBuffer,
            vertSize:3, nVerts:60, colorSize:4, nColors: 60, nIndices:108,
            primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()};

    mat4.translate(dode.modelViewMatrix, dode.modelViewMatrix, translation);

    dode.update = function()
    {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angle = Math.PI * 2 * fract;
    
        // Rotates a mat4 by the given angle
        // mat4 out the receiving matrix
        // mat4 a the matrix to rotate
        // Number rad the angle to rotate the matrix by
        // vec3 axis the axis to rotate around
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis2);
    };
    
    return dode;
}

function createShader(gl, str, type)
{
    let shader;
    if (type == "fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (type == "vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

function initShader(gl)
{
    // load and compile the fragment and vertex shader
    let fragmentShader = createShader(gl, fragmentShaderSource, "fragment");
    let vertexShader = createShader(gl, vertexShaderSource, "vertex");

    // link them together into a new program
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // get pointers to the shader params
    shaderVertexPositionAttribute = gl.getAttribLocation(shaderProgram, "vertexPos");
    gl.enableVertexAttribArray(shaderVertexPositionAttribute);

    shaderVertexColorAttribute = gl.getAttribLocation(shaderProgram, "vertexColor");
    gl.enableVertexAttribArray(shaderVertexColorAttribute);
    
    shaderProjectionMatrixUniform = gl.getUniformLocation(shaderProgram, "projectionMatrix");
    shaderModelViewMatrixUniform = gl.getUniformLocation(shaderProgram, "modelViewMatrix");

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }
}

function draw(gl, objs) 
{
    // clear the background (with black)
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT  | gl.DEPTH_BUFFER_BIT);
   

    // set the shader to use
    gl.useProgram(shaderProgram);

    for(i = 0; i< objs.length; i++)
    {
        obj = objs[i];
        // connect up the shader parameters: vertex position, color and projection/model matrices
        // set up the buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer);
        gl.vertexAttribPointer(shaderVertexPositionAttribute, obj.vertSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, obj.colorBuffer);
        gl.vertexAttribPointer(shaderVertexColorAttribute, obj.colorSize, gl.FLOAT, false, 0, 0);
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indices);

        gl.uniformMatrix4fv(shaderProjectionMatrixUniform, false, projectionMatrix);
        gl.uniformMatrix4fv(shaderModelViewMatrixUniform, false, obj.modelViewMatrix);

        // Draw the object's primitives using indexed buffer information.
        // void gl.drawElements(mode, count, type, offset);
        // mode: A GLenum specifying the type primitive to render.
        // count: A GLsizei specifying the number of elements to be rendered.
        // type: A GLenum specifying the type of the values in the element array buffer.
        // offset: A GLintptr specifying an offset in the element array buffer.
        gl.drawElements(obj.primtype, obj.nIndices, gl.UNSIGNED_SHORT, 0);
    }
}

function run(gl, objs) 
{
    // The window.requestAnimationFrame() method tells the browser that you wish to perform an animation and requests that the browser call a specified function to update an animation before the next repaint. The method takes a callback as an argument to be invoked before the repaint.
    requestAnimationFrame(function() { run(gl, objs); });

    draw(gl, objs);

    for(i = 0; i<objs.length; i++)
        objs[i].update();
}
