// Get the canvas element
const canvas = document.getElementById("canvas");
if (!canvas) {
	console.error("Failed to retrieve the canvas element");
}

// Initialize WebGL context
const gl = canvas.getContext("webgl");
if (!gl) {
	console.error("WebGL is not supported.");
}

// Vertex shader source code
const vertexShaderSource = `
    attribute vec4 aPosition;
    attribute vec4 aColor;
    varying vec4 vColor;
    uniform mat4 uModel;
    uniform mat4 uView;
    uniform mat4 uProjection;
    void main() {
        gl_Position = uProjection * uView * uModel * aPosition;
        vColor = aColor;
    }
`;

// Fragment shader source code
const fragmentShaderSource = `
    precision mediump float;
    varying vec4 vColor;
    void main() {
        gl_FragColor = vColor;
    }
`;

function loadShader(gl, type, source) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.error(
			"An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader)
		);
		gl.deleteShader(shader);
		return null;
	}

	return shader;
}

const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

// Shader program
const shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vertexShader);
gl.attachShader(shaderProgram, fragmentShader);
gl.linkProgram(shaderProgram);

if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
	console.error(
		"Unable to initialize the shader program: " +
			gl.getProgramInfoLog(shaderProgram)
	);
}
// initially used 8 vertices, was only showing red and green faces with the middle of the other sides being blended in between.
// changed to 24 vertices to show all faces of the cube with the correct colors
const vertices = [
	// Front face
	// 0
	-1.0, -1.0, 1.0,
	// 1
	1.0, -1.0, 1.0,
	// 2
	1.0, 1.0, 1.0,
	// 3
	-1.0, 1.0, 1.0,

	// Back face
	// 4
	-1.0, -1.0, -1.0,
	// 5
	1.0, -1.0, -1.0,
	// 6
	1.0, 1.0, -1.0,
	// 7
	-1.0, 1.0, -1.0,

	// Top face
	// 8
	-1.0, 1.0, -1.0,
	// 9
	1.0, 1.0, -1.0,
	// 10
	1.0, 1.0, 1.0,
	// 11
	-1.0, 1.0, 1.0,

	// Bottom face
	// 12
	-1.0, -1.0, -1.0,
	// 13
	1.0, -1.0, -1.0,
	// 14
	1.0, -1.0, 1.0,
	// 15
	-1.0, -1.0, 1.0,

	// Right face
	// 16
	1.0, -1.0, -1.0,
	// 17
	1.0, 1.0, -1.0,
	// 18
	1.0, 1.0, 1.0,
	// 19
	1.0, -1.0, 1.0,

	// Left face
	// 20
	-1.0, -1.0, -1.0,
	// 21
	-1.0, 1.0, -1.0,
	// 22
	-1.0, 1.0, 1.0,
	// 23
	-1.0, -1.0, 1.0,
];

// updates the indices to show all faces of the cube for having more vertices
const indices = [
	// Front face
	0, 1, 2, 0, 2, 3,

	// Back face
	4, 5, 6, 4, 6, 7,

	// Top face
	8, 9, 10, 8, 10, 11,

	// Bottom face
	12, 13, 14, 12, 14, 15,

	// Right face
	16, 17, 18, 16, 18, 19,

	// Left face
	20, 21, 22, 20, 22, 23,
];

// Setting up colors for each part of the cube
// RGBA
const colors = [
	// Front face Red
	// Vertex 0
	1.0, 0.0, 0.0, 1.0,
	// Vertex 1
	1.0, 0.0, 0.0, 1.0,
	// Vertex 2
	1.0, 0.0, 0.0, 1.0,
	// Vertex 3
	1.0, 0.0, 0.0, 1.0,

	// Back face Green
	// Vertex 4
	0.0, 1.0, 0.0, 1.0,
	// Vertex 5
	0.0, 1.0, 0.0, 1.0,
	// Vertex 6
	0.0, 1.0, 0.0, 1.0,
	// Vertex 7
	0.0, 1.0, 0.0, 1.0,

	// Top face Blue
	// Vertex 8
	0.0, 0.0, 1.0, 1.0,
	// Vertex 9
	0.0, 0.0, 1.0, 1.0,
	// Vertex 10
	0.0, 0.0, 1.0, 1.0,
	// Vertex 11
	0.0, 0.0, 1.0, 1.0,

	// Bottom face Yellow
	// Vertex 12
	1.0, 1.0, 0.0, 1.0,
	// Vertex 13
	1.0, 1.0, 0.0, 1.0,
	// Vertex 14
	1.0, 1.0, 0.0, 1.0,
	// Vertex 15
	1.0, 1.0, 0.0, 1.0,

	// Right face Magenta
	// Vertex 16
	1.0, 0.0, 1.0, 1.0,
	// Vertex 17
	1.0, 0.0, 1.0, 1.0,
	// Vertex 18
	1.0, 0.0, 1.0, 1.0,
	// Vertex 19
	1.0, 0.0, 1.0, 1.0,

	// Left face Cyan
	// Vertex 20
	0.0, 1.0, 1.0, 1.0,
	// Vertex 21
	0.0, 1.0, 1.0, 1.0,
	// Vertex 22
	0.0, 1.0, 1.0, 1.0,
	// Vertex 23
	0.0, 1.0, 1.0, 1.0,
];

// Set the model, view, and projection matrices
const uModelLoc = gl.getUniformLocation(shaderProgram, "uModel");
const uViewLoc = gl.getUniformLocation(shaderProgram, "uView");
const uProjectionLoc = gl.getUniformLocation(shaderProgram, "uProjection");
const uColorLoc = gl.getUniformLocation(shaderProgram, "uColor");

// Create buffer objects
// Create and bind vertex buffer
const vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

// Create and bind index buffer
const indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(
	gl.ELEMENT_ARRAY_BUFFER,
	new Uint16Array(indices),
	gl.STATIC_DRAW
);

// Create and bind the color buffer
const colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

// Linking the color buffer
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
const colorAttributeLocation = gl.getAttribLocation(shaderProgram, "aColor");
gl.vertexAttribPointer(colorAttributeLocation, 4, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(colorAttributeLocation);

// Linking vertex buffer
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
const positionAttributeLocation = gl.getAttribLocation(
	shaderProgram,
	"aPosition"
);
gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(positionAttributeLocation);

// Bind the index buffer
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

// Enable depth testing
gl.enable(gl.DEPTH_TEST);

let rotationAngleX = 0;
let rotationAngleY = 0;
let rotationAngleZ = 0;

function render() {
	rotationAngleX += 0.002;
	rotationAngleY -= 0.01;
	rotationAngleZ += 0.0001; // Increment the rotation angle over time
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.useProgram(shaderProgram);

	// Set the viewport
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

	// Bind and set the vertex buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(positionAttributeLocation);

	// Bind and set the color buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	gl.vertexAttribPointer(colorAttributeLocation, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(colorAttributeLocation);

	// Bind the index buffer
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

	// Set up the matrices
	const modelMatrix = mat4.create();
	mat4.rotateX(modelMatrix, modelMatrix, rotationAngleX); // Rotate around x-axis
	mat4.rotateY(modelMatrix, modelMatrix, rotationAngleY); // Rotate around y-axis
	mat4.rotateZ(modelMatrix, modelMatrix, rotationAngleZ); // Rotate around z-axis

	// Set up the view matrix which determines the camera position and orientation
	const viewMatrix = mat4.create();
	// first lookAt parameters is the view matrix, second is the position of the camera(x,y,z), third is where the center of the camera is pointing at from its
	// position, fourth is the up vector of the camera which
	mat4.lookAt(viewMatrix, [0, 0, -5], [0, 0, 0], [0, 1, 0]); // Look from a different angle

	const projectionMatrix = mat4.create();
	const aspect = canvas.clientWidth / canvas.clientHeight;
	// Set the perspective matrix which determines how the 3D scene is projected onto the 2D viewport
	// first parameter is the matrix to store the result, second is the field of view in radians, third is the aspect ratio of the canvas, fourth is the near clipping plane, fifth is the far clipping plane
	mat4.perspective(projectionMatrix, (45 * Math.PI) / 180, aspect, 0.01, 5);

	// Update the uniform matrices in the shader program
	gl.uniformMatrix4fv(uModelLoc, false, modelMatrix);
	gl.uniformMatrix4fv(uViewLoc, false, viewMatrix);
	gl.uniformMatrix4fv(uProjectionLoc, false, projectionMatrix);

	// Draw the cube
	gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
	// Call the render function again
	requestAnimationFrame(render);
}

// Call the render function
render();
