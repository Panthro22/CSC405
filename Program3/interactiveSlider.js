//Global Variables section

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

var projectionMatrix;
var viewMatrix;
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
const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vertexShaderSource);

const fragmentShaderSource = `
precision mediump float;
varying vec4 vColor;
uniform bool uIsHighlighted; // Uniform to determine if the part is highlighted
uniform vec4 uHighlightColor; // Uniform to specify the highlight color
void main() {
	if (uIsHighlighted) {
		gl_FragColor = uHighlightColor; // Use the highlight color
	} else {
		gl_FragColor = vColor; // Use the original color
	}
}
`;
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

let rotationAngleX = 0;
let rotationAngleY = 0;
let rotationAngleZ = 0;

let cameraZ = -5;

// Get the slider element
const thetaSlider = document.getElementById("thetaSlider");
const phiSlider = document.getElementById("phiSlider");
const radiusSlider = document.getElementById("radiusSlider");

let radius = 2.0,
	theta = 0.0,
	phi = 0.0;

let isHighlighted = false;
const originalColors = [...colors];

// Function section
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

thetaSlider.addEventListener("input", function () {
	theta = parseFloat(this.value);
	render();
});

phiSlider.addEventListener("input", function () {
	phi = parseFloat(this.value);
	render();
});

radiusSlider.addEventListener("input", function () {
	radius = parseFloat(this.value);
	render();
});

function render() {
	// zeroed out values to stop rotation. bug caused from the sliders increasing the rotation angle.
	rotationAngleX += 0;
	rotationAngleY -= 0;
	rotationAngleZ += 0; // Increment the rotation angle over time
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
	viewMatrix = mat4.create();
	let eyeX = radius * Math.sin(theta) * Math.cos(phi);
	let eyeY = radius * Math.sin(phi);
	let eyeZ = radius * Math.cos(theta) * Math.cos(phi);
	mat4.lookAt(viewMatrix, [eyeX, eyeY, eyeZ], [0, 0, 0], [0, 1, 0]);

	projectionMatrix = mat4.create();
	const aspect = canvas.clientWidth / canvas.clientHeight;
	// Set the perspective matrix which determines how the 3D scene is projected onto the 2D viewport
	// first parameter is the matrix to store the result, second is the field of view in radians, third is the aspect ratio of the canvas, fourth is the near clipping plane, fifth is the far clipping plane
	mat4.perspective(projectionMatrix, (45 * Math.PI) / 180, aspect, 0.01, 10);

	// Update the uniform matrices in the shader program
	gl.uniformMatrix4fv(uModelLoc, false, modelMatrix);
	gl.uniformMatrix4fv(uViewLoc, false, viewMatrix);
	gl.uniformMatrix4fv(uProjectionLoc, false, projectionMatrix);

	// Draw the cube
	gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
	// Call the render function again
	requestAnimationFrame(render);
}

function adjustSliderValue(slider, delta) {
	// Calculate the new value based on the scroll delta
	let newValue = parseFloat(slider.value) + delta;
	// Clamp the value between the slider's min and max
	newValue = Math.max(slider.min, Math.min(slider.max, newValue));
	slider.value = newValue;
}
// mouse wheel event listener
[phiSlider, thetaSlider, radiusSlider].forEach((slider) => {
	slider.addEventListener("wheel", (event) => {
		// Prevent the page from scrolling
		event.preventDefault();

		// Determine the direction of the scroll
		const delta = event.deltaY < 0 ? 0.1 : -0.1;

		// Adjust the slider value
		adjustSliderValue(slider, delta);

		// Trigger the input event to update the scene
		slider.dispatchEvent(new Event("input"));
	});
});

// Call the render function
render();

// Final Program Additional Features

// Function to highlight a part of the cube
function highlightPart(partIndex, highlightColor) {
	// Modify the colors array to highlight the specified part
	for (let i = 0; i < 4; i++) {
		colors[partIndex * 4 + i] = highlightColor[i];
	}
	// Update the color buffer data
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

	// Set the uniform variables for highlighting
	gl.useProgram(shaderProgram);
	gl.uniform1i(gl.getUniformLocation(shaderProgram, "uIsHighlighted"), true);
	gl.uniform4fv(
		gl.getUniformLocation(shaderProgram, "uHighlightColor"),
		highlightColor
	);

	isHighlighted = true; // Flag to indicate the cube is currently highlighted
}

// Function to reset cube to original colors
function resetCubeColors() {
	// Restore the original colors
	for (let i = 0; i < colors.length; i++) {
		colors[i] = originalColors[i];
	}
	// Update the color buffer data
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

	// Set the uniform variables for normal rendering
	gl.useProgram(shaderProgram);
	gl.uniform1i(gl.getUniformLocation(shaderProgram, "uIsHighlighted"), false);
	gl.uniform4fv(
		gl.getUniformLocation(shaderProgram, "uHighlightColor"),
		[0.0, 0.0, 0.0, 0.0]
	);

	isHighlighted = false; // Flag to indicate the cube is no longer highlighted
}

function determineClickedPart(clientX, clientY) {
	const rect = canvas.getBoundingClientRect();
	const x = ((clientX - rect.left) / canvas.clientWidth) * 2 - 1;
	const y = -((clientY - rect.top) / canvas.clientHeight) * 2 + 1;

	// Create a rayOrigin and rayDirection in world space
	const rayOrigin = vec3.fromValues(0, 0, cameraZ); // Assuming camera is at (0, 0, cameraZ)
	const rayDirection = vec3.fromValues(x, y, -1); // Aiming at the negative z-axis

	// Inverse the projection matrix to unproject the ray
	const invProjectionMatrix = mat4.create();
	mat4.invert(invProjectionMatrix, projectionMatrix);

	// Inverse the view matrix to transform ray into world space
	const invViewMatrix = mat4.create();
	mat4.invert(invViewMatrix, viewMatrix);

	// Combine the inverse projection and inverse view matrices
	const invPVMatrix = mat4.create();
	mat4.multiply(invPVMatrix, invProjectionMatrix, invViewMatrix);

	// Transform rayOrigin and rayDirection into world space
	vec3.transformMat4(rayOrigin, rayOrigin, invPVMatrix);
	vec3.transformMat4(rayDirection, rayDirection, invPVMatrix);

	// Normalize the rayDirection
	vec3.normalize(rayDirection, rayDirection);

	// Loop through all the cube's faces and test for intersection
	for (let faceIndex = 0; faceIndex < indices.length / 6; faceIndex++) {
		const startIdx = faceIndex * 6;
		const faceVertices = [
			indices[startIdx],
			indices[startIdx + 1],
			indices[startIdx + 2],
			indices[startIdx + 3],
			indices[startIdx + 4],
			indices[startIdx + 5],
		];

		// Get the vertices of the current face
		const v0 = vec3.fromValues(
			vertices[faceVertices[0] * 3],
			vertices[faceVertices[0] * 3 + 1],
			vertices[faceVertices[0] * 3 + 2]
		);
		const v1 = vec3.fromValues(
			vertices[faceVertices[1] * 3],
			vertices[faceVertices[1] * 3 + 1],
			vertices[faceVertices[1] * 3 + 2]
		);
		const v2 = vec3.fromValues(
			vertices[faceVertices[2] * 3],
			vertices[faceVertices[2] * 3 + 1],
			vertices[faceVertices[2] * 3 + 2]
		);

		// Calculate the normal of the current face
		const normal = vec3.create();
		vec3.cross(
			normal,
			vec3.subtract(vec3.create(), v1, v0),
			vec3.subtract(vec3.create(), v2, v0)
		);
		vec3.normalize(normal, normal);

		// Calculate the plane of the current face
		const plane = {
			point: v0,
			normal: normal,
		};

		// Calculate the intersection point between the ray and the plane of the face
		const intersectionPoint = vec3.create();
		if (rayIntersectsPlane(rayOrigin, rayDirection, plane, intersectionPoint)) {
			// Check if the intersection point is inside the triangle defined by the face vertices
			if (pointInsideTriangle(intersectionPoint, v0, v1, v2)) {
				// Return the index of the clicked part (e.g., face)
				return faceIndex;
			}
		}
	}

	// If no part was clicked, return -1
	return -1;
}

// Function to check if a ray intersects a plane
function rayIntersectsPlane(rayOrigin, rayDirection, plane, intersectionPoint) {
	const { point, normal } = plane;

	const denom = vec3.dot(normal, rayDirection);

	// Check if the ray and plane are not parallel
	if (Math.abs(denom) > 1e-6) {
		const t =
			vec3.dot(vec3.subtract(vec3.create(), point, rayOrigin), normal) / denom;

		// Check if the intersection point is in front of the ray origin
		if (t >= 0) {
			vec3.scaleAndAdd(intersectionPoint, rayOrigin, rayDirection, t);
			return true;
		}
	}

	return false;
}

// Function to check if a point is inside a triangle
function pointInsideTriangle(point, v0, v1, v2) {
	// Compute barycentric coordinates
	const u = vec3.dot(
		vec3.subtract(vec3.create(), v1, v0),
		vec3.subtract(vec3.create(), v2, v0)
	);
	const v = vec3.dot(
		vec3.subtract(vec3.create(), v2, v0),
		vec3.subtract(vec3.create(), point, v0)
	);
	const w = vec3.dot(
		vec3.subtract(vec3.create(), v0, v1),
		vec3.subtract(vec3.create(), point, v1)
	);

	// Check if the point is inside the triangle
	return u >= 0 && v >= 0 && u + v <= 1;
}

// Calculate the ray origin and direction in world space
canvas.addEventListener("mousedown", (event) => {
	// Perform a ray-casting or object picking operation to determine which part was clicked.
	const partIndex = determineClickedPart(event.clientX, event.clientY);

	if (partIndex !== -1) {
		// Highlight the clicked part with a different color (e.g., yellow).
		const highlightColor = [1.0, 1.0, 0.0, 1.0];
		highlightPart(partIndex, highlightColor);

		// Set a timeout to reset the cube colors after a certain duration (e.g., 2 seconds)
		setTimeout(resetCubeColors, 2000);

		render();
	}
});
