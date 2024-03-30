var cubeRotation = 0.0;

main();

//
// Start here
//
function main() {
  const canvas = document.querySelector('#glcanvas');
  const gl = canvas.getContext('webgl');

  // If we don't have a GL context, give up now

  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  // Vertex shader program

  const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec3 aVertexNormal;
    attribute vec4 aVertexColor;

    uniform mat4 uNormalMatrix;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying highp vec3 vLighting;
    varying lowp vec4 vColor;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      // Apply lighting effect
      highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
      highp vec3 directionalLightColor = vec3(1, 1, 1);
      highp vec3 directionalVector = normalize(vec3(0.0, 0.0, 1.0));
      highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);
      highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
      vLighting = ambientLight + (directionalLightColor * directional);
      vColor = aVertexColor;
    }
  `;

  // Fragment shader program

  const fsSource = `
    varying highp vec3 vLighting;

    varying lowp vec4 vColor;

    void main(void) {
      gl_FragColor = vec4(vColor.rgb * vLighting, vColor.a);

    }
  `;

  // Initialize a shader program; this is where all the lighting
  // for the vertices and so forth is established.
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

  // Collect all the info needed to use the shader program.
  // Look up which attributes our shader program is using
  // for aVertexPosition, aVertexNormal, aTextureCoord,
  // and look up uniform locations.
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      vertexNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
      vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),

    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
      normalMatrix: gl.getUniformLocation(shaderProgram, 'uNormalMatrix'),
    }
  };

  // Here's where we call the routine that builds all the
  // objects we'll be drawing.
  const buffers = initBuffers(gl);

  var then = 0;

  // Draw the scene repeatedly
  function render(now) {
    now *= 0.001;  // convert to seconds
    const deltaTime = now - then;
    then = now;

    drawScene(gl, programInfo, buffers, deltaTime);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

//
// initBuffers
//
// Initialize the buffers we'll need. For this demo, we just
// have one object -- a simple three-dimensional cube.
//
function initBuffers(gl) {
  //                                                  CUBE                                                 //
  // Create a buffer for the cube's vertex positions.

  const positionBuffer = gl.createBuffer();

  
  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Now create an array of positions for the cube.

  const positions = [
    // Front face
    -1.0, -1.0,  1.0,
     1.0, -1.0,  1.0,
     1.0,  1.0,  1.0,
    -1.0,  1.0,  1.0,

    // Back face
    -1.0, -1.0, -1.0,
    -1.0,  1.0, -1.0,
     1.0,  1.0, -1.0,
     1.0, -1.0, -1.0,

    // Top face
    -1.0,  1.0, -1.0,
    -1.0,  1.0,  1.0,
     1.0,  1.0,  1.0,
     1.0,  1.0, -1.0,

    // Bottom face
    -1.0, -1.0, -1.0,
     1.0, -1.0, -1.0,
     1.0, -1.0,  1.0,
    -1.0, -1.0,  1.0,

    // Right face
     1.0, -1.0, -1.0,
     1.0,  1.0, -1.0,
     1.0,  1.0,  1.0,
     1.0, -1.0,  1.0,

    // Left face
    -1.0, -1.0, -1.0,
    -1.0, -1.0,  1.0,
    -1.0,  1.0,  1.0,
    -1.0,  1.0, -1.0,
  ];

  // Now pass the list of positions into WebGL to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  // Set up the normals for the vertices, so that we can compute lighting.

  const normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);

  const vertexNormals = [
    // Front
     0.0,  0.0,  1.0,
     0.0,  0.0,  1.0,
     0.0,  0.0,  1.0,
     0.0,  0.0,  1.0,

    // Back
     0.0,  0.0, -1.0,
     0.0,  0.0, -1.0,
     0.0,  0.0, -1.0,
     0.0,  0.0, -1.0,

    // Top
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,

    // Bottom
     0.0, -1.0,  0.0,
     0.0, -1.0,  0.0,
     0.0, -1.0,  0.0,
     0.0, -1.0,  0.0,

    // Right
     1.0,  0.0,  0.0,
     1.0,  0.0,  0.0,
     1.0,  0.0,  0.0,
     1.0,  0.0,  0.0,

    // Left
    -1.0,  0.0,  0.0,
    -1.0,  0.0,  0.0,
    -1.0,  0.0,  0.0,
    -1.0,  0.0,  0.0
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals),
                gl.STATIC_DRAW);

  const faceColors = [
    [0.0,  1.0,  0.0,  1.0],    // Front face: green
    [0.0,  1.0,  0.0,  1.0],    // Back face: green
    [0.0,  1.0,  0.0,  1.0],    // Top face: green
    [0.0,  1.0,  0.0,  1.0],    // Bottom face: green
    [0.0,  1.0,  0.0,  1.0],    // Right face: green
    [0.0,  1.0,  0.0,  1.0],    // Left face: green
  ];

  // Convert the array of colors into a table for all the vertices.

  var colors = [];

  for (var j = 0; j < faceColors.length; ++j) {
    const c = faceColors[j];

    // Repeat each color four times for the four vertices of the face
    colors = colors.concat(c, c, c, c);
  }
  
  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  // Build the element array buffer; this specifies the indices
  // into the vertex arrays for each face's vertices.

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  // This array defines each face as two triangles, using the
  // indices into the vertex array to specify each triangle's
  // position.

  const indices = [
    0,  1,  2,      0,  2,  3,    // front
    4,  5,  6,      4,  6,  7,    // back
    8,  9,  10,     8,  10, 11,   // top
    12, 13, 14,     12, 14, 15,   // bottom
    16, 17, 18,     16, 18, 19,   // right
    20, 21, 22,     20, 22, 23,   // left
  ];

  // Now send the element array to GL

  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  //                                                  PYRAMID                                                  //
  const positionBuffer2 = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer2);

  var positions2 = [
    // Front face
    0.0,  1.0,  0.0,
    -1.0, -1.0,  1.0,
    1.0, -1.0,  1.0,
    // Left face
    0.0,  1.0,  0.0,
    -1.0, -1.0, -1.0,
    -1.0, -1.0,  1.0,
    // Back face
    0.0,  1.0,  0.0,
    1.0, -1.0, -1.0,
    -1.0, -1.0, -1.0,

    // Base face
    -1.0, -1.0, -1.0,
    -1.0, -1.0, 1.0,
    1.0, -1.0, 1.0,

    // Base Face
    1.0, -1.0, -1.0,
    -1.0, -1.0, -1.0,
    1.0, -1.0, 1.0,

    // Right face
    0.0, 1.0, 0.0,
    1.0, -1.0, 1.0,
    1.0, -1.0, -1.0

  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions2), gl.STATIC_DRAW);
  
  const faceColors2 = [
    [1.0,  1.0,  0.0,  1.0],    // Front face: yellow
    [1.0,  1.0,  0.0,  1.0],    // Back face: yellow
    [1.0,  1.0,  0.0,  1.0],    // Top face: yellow
    [1.0,  1.0,  0.0,  1.0],    // Bottom face: yellow
    [1.0,  1.0,  0.0,  1.0],    // Right face: yellow
    [1.0,  1.0,  0.0,  1.0],    // Left face: yellow
  ];

  // Convert the array of colors into a table for all the vertices.

  var colors2 = [];

  for (var j = 0; j < faceColors2.length; ++j) {
    const c = faceColors2[j];

    // Repeat each color four times for the four vertices of the face
    colors2 = colors2.concat(c, c, c, c);
  }
  
  const colorBuffer2 = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer2);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors2), gl.STATIC_DRAW);

  const normalBuffer2 = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer2);

  var vertexNormals2 = [
    // Front face
    0.0, 1.0,  2.0,
    0.0, 1.0,  2.0,
    0.0, 1.0,  2.0,
    // Left face
    -2.0, 1.0, 0.0,
    -2.0, 1.0, 0.0,
    -2.0, 1.0, 0.0,
    // Back face
    0.0, 1.0, -2.0,
    0.0, 1.0, -2.0,
    0.0, 1.0, -2.0,

    // Base face
    0.0, -1.0, 0.0,
    0.0, -1.0, 0.0,
    0.0, -1.0, 0.0,

    // Base Face
    0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,
    0.0, -1.0, 0.0,

    // Right face
    2.0, 1.0, 0.0,
    2.0, 1.0, 0.0,
    2.0, 1.0, 0.0

  ]; 

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals2),
                gl.STATIC_DRAW);
                

 //                                                           SPHERE                                                   //
  const positions3 = []
  const vertexNormals3 = []

  var colors3 = []
  var x, y, z, xy;
  var radius = 1;
  var stackCount = 50;
  var sectorCount = 20;
  var nx, ny, nz, lengthInv = 1.0 / radius;

  var sectorStep = 2 * Math.PI / sectorCount;
  var stackStep = Math.PI / stackCount;
  var Angle, stackA;

  for(let i = 0; i <= stackCount; ++i) {
      stackA = Math.PI / 2 - i * stackStep;
      xy = radius * Math.cos(stackA);
      z = radius * Math.sin(stackA);

      for(let j = 0; j <= sectorCount; ++j) {
          Angle = j * sectorStep;

          x = xy * Math.cos(Angle);
          y = xy * Math.sin(Angle);
          positions3.push(x);
          positions3.push(y);
          positions3.push(z);

          nx = x * lengthInv;
          ny = y * lengthInv;
          nz = z * lengthInv;
          vertexNormals3.push(nx);
          vertexNormals3.push(ny);
          vertexNormals3.push(nz);

          colors3 = colors3.concat([0.0, 0.0, 1.0, 1.0]);
      }
  }
  const positionBuffer3 = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer3);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions3), gl.STATIC_DRAW);

  const normalBuffer3 = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer3);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals3), gl.STATIC_DRAW);

  const colorBuffer3 = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer3);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors3), gl.STATIC_DRAW);
  const indexBuffer3 = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer3);
  
  var indices3 = [];
  var k1, k2;
  for(var i = 0; i < stackCount; ++i) {
    k1 = i * (sectorCount + 1);     // beginning of current stack
    k2 = k1 + sectorCount + 1;      // beginning of next stack

    for(var j = 0; j < sectorCount; ++j, ++k1, ++k2)
    {
        // 2 triangles per sector excluding first and last stacks
        // k1 => k2 => k1+1
        if(i != 0)
        {
            indices3.push(k1);
            indices3.push(k2);
            indices3.push(k1 + 1);
        }

        // k1+1 => k2 => k2+1
        if(i != (stackCount-1))
        {
            indices3.push(k1 + 1);
            indices3.push(k2);
            indices3.push(k2 + 1);
        }
    }
  }
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices3), gl.STATIC_DRAW);


  return {
    position2: positionBuffer2,
    normal2: normalBuffer2,
    color2: colorBuffer2,
    
    position: positionBuffer,
    normal: normalBuffer,
    indices: indexBuffer,
    color: colorBuffer,
    
    position3: positionBuffer3,
    color3: colorBuffer3,
    indices3: indexBuffer3,
    normal3: normalBuffer3,
  };
}


//
// Draw the scene.
//
function drawScene(gl, programInfo, buffers, deltaTime) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

  // Clear the canvas before we start drawing on it.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Create a perspective matrix, a special matrix that is
  // used to simulate the distortion of perspective in a camera.
  // Our field of view is 45 degrees, with a width/height
  // ratio that matches the display size of the canvas
  // and we only want to see objects between 0.1 units
  // and 100 units away from the camera.

  const fieldOfView = 45 * Math.PI / 180;   // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();

  // note: glmatrix.js always has the first argument
  // as the destination to receive the result.
  mat4.perspective(projectionMatrix,
                   fieldOfView,
                   aspect,
                   zNear,
                   zFar);

  //                                                  CUBE                                                  //
  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  const modelViewMatrix = mat4.create();

  // Now move the drawing position a bit to where we want to
  // start drawing the square.

  mat4.translate(modelViewMatrix,     // destination matrix
                 modelViewMatrix,     // matrix to translate
                 [-10.0, 0.0, -6.0]);  // amount to translate
  mat4.rotate(modelViewMatrix,  // destination matrix
              modelViewMatrix,  // matrix to rotate
              cubeRotation,     // amount to rotate in radians
              [0, 0, 0]);       // axis to rotate around (Z)
  mat4.rotate(modelViewMatrix,  // destination matrix
              modelViewMatrix,  // matrix to rotate
              cubeRotation * .7,// amount to rotate in radians
              [0, 0, 0]);       // axis to rotate around (X)

  const normalMatrix = mat4.create();
  mat4.invert(normalMatrix, modelViewMatrix);
  mat4.transpose(normalMatrix, normalMatrix);

  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute
  {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexPosition);
  }

  {
    const numComponents = 4;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexColor,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexColor);
  }
  // Tell WebGL how to pull out the normals from
  // the normal buffer into the vertexNormal attribute.
  {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexNormal,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexNormal);
  }

  // Tell WebGL which indices to use to index the vertices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

  // Tell WebGL to use our program when drawing

  gl.useProgram(programInfo.program);

  mat4.translate(projectionMatrix, projectionMatrix, [0,0,-30]);

  // Set the shader uniforms

  mat4.rotate(projectionMatrix, projectionMatrix, cubeRotation, [0,1,0]);
  mat4.rotate(modelViewMatrix, modelViewMatrix, cubeRotation, [0,1,0]);

  gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix);
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix);
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.normalMatrix,
      false,
      normalMatrix);

  {
    const vertexCount = 36;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  }

  //                                                  PYRAMID                                                  //

  const modelViewMatrix1 = mat4.create();

  // Now move the drawing position a bit to where we want to
  // start drawing the square.

  mat4.translate(modelViewMatrix1,     // destination matrix
                modelViewMatrix1,     // matrix to translate
                [0.0, 0.0, -6.0]);  // amount to translate
  mat4.rotate(modelViewMatrix1,  // destination matrix
              modelViewMatrix1,  // matrix to rotate
              cubeRotation,     // amount to rotate in radians
              [0, 0, 0]);       // axis to rotate around (Z)
  mat4.rotate(modelViewMatrix1,  // destination matrix
              modelViewMatrix1,  // matrix to rotate
              cubeRotation * .7,// amount to rotate in radians
              [0, 0, 0]);       // axis to rotate around (X)

  const normalMatrix1 = mat4.create();
  mat4.invert(normalMatrix1, modelViewMatrix1);
  mat4.transpose(normalMatrix1, normalMatrix1);

  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute
  {
  const numComponents = 3;
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;
  const offset = 0;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position2);
  gl.vertexAttribPointer(
      programInfo.attribLocations.vertexPosition,
      numComponents,
      type,
      normalize,
      stride,
      offset);
  gl.enableVertexAttribArray(
      programInfo.attribLocations.vertexPosition);
  }
  {
    const numComponents = 4;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color2);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexColor,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexColor);
  }
  // Tell WebGL how to pull out the normals from
  // the normal buffer into the vertexNormal attribute.
  {
  const numComponents = 3;
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;
  const offset = 0;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal2);
  gl.vertexAttribPointer(
  programInfo.attribLocations.vertexNormal,
      numComponents,
      type,
      normalize,
      stride,
      offset);
  gl.enableVertexAttribArray(
    programInfo.attribLocations.vertexNormal);
  }
  // // Tell WebGL which indices to use to index the vertices
  // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices2);
  // Tell WebGL to use our program when drawing

  gl.useProgram(programInfo.program);

  mat4.rotate(projectionMatrix, projectionMatrix, cubeRotation, [0,-1,0]);
  mat4.rotate(modelViewMatrix, modelViewMatrix, cubeRotation, [0,-1,0]);

  gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix);
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix1);
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.normalMatrix,
      false,
      normalMatrix1);


  {
  const vertexCount = 36;
  const type = gl.UNSIGNED_SHORT;
  const offset = 0;
  gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  }

  //                                                  SPHERE                                                  //

  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  const modelViewMatrix2 = mat4.create();

  // Now move the drawing position a bit to where we want to
  // start drawing the square.

  mat4.translate(modelViewMatrix2,     // destination matrix
                 modelViewMatrix2,     // matrix to translate
                 [-1.0, 0.0, -4.0]);  // amount to translate
  mat4.rotate(modelViewMatrix2,  // destination matrix
              modelViewMatrix2,  // matrix to rotate
              cubeRotation,     // amount to rotate in radians
              [0, 0, 0]);       // axis to rotate around (Z)
  mat4.rotate(modelViewMatrix2,  // destination matrix
              modelViewMatrix2,  // matrix to rotate
              cubeRotation * .7,// amount to rotate in radians
              [0, 0, 0]);       // axis to rotate around (X)

  const normalMatrix2 = mat4.create();
  mat4.invert(normalMatrix2, modelViewMatrix2);
  mat4.transpose(normalMatrix2, normalMatrix2);

  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute
  {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position3);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexPosition);
  }

  // Tell WebGL how to pull out the texture coordinates from
  // the texture coordinate buffer into the textureCoord attribute.
  {
    const numComponents = 4;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color3);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexColor,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexColor);
  }

  // Tell WebGL how to pull out the normals from
  // the normal buffer into the vertexNormal attribute.
  {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal3);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexNormal,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexNormal);
  }

  // Tell WebGL which indices to use to index the vertices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices3);

  // Tell WebGL to use our program when drawing

  gl.useProgram(programInfo.program);

  mat4.rotate(projectionMatrix, projectionMatrix, cubeRotation, [0,1,0]);
  mat4.rotate(modelViewMatrix, modelViewMatrix, cubeRotation, [0,1,0]);

  mat4.translate(projectionMatrix, projectionMatrix, [-10,0,-4]);

  mat4.rotate(projectionMatrix, projectionMatrix, cubeRotation, [1,1,1]);

  gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix);
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix2);
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.normalMatrix,
      false,
      normalMatrix2);

  {
    const vertexCount = 5880;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  }


  cubeRotation += deltaTime;
}


//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

