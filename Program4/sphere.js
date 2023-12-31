// Get the canvas element
const canvas = document.getElementById("canvas");
if (!canvas) {
	console.log("Failed to retrieve the canvas element");
}

// Initialize WebGL context
const gl = canvas.getContext("webgl");
if (!gl) {
	console.log("WebGL is not supported.");
}

var vertexA = [0.0, 0.0, -1.0];
var vertexB = [0.0, 0.942809, 0.333333];
var vertexC = [-0.816497, -0.471405, 0.333333];
var vertexD = [0.816497, -0.471405, 0.333333];
var depthsOfTheKnown = 4;
var sphereVertices = [];

function divideTriangle(a, b, c, depth) {
	if (depth == 0) {
		sphereVertices.push(a, b, b, c, c, a); // push as three vertices for drawing triangles .push(a,b,c) or 3 pairs of vertices for drawing lines .push(a, b, b, c, c, a);
	} else {
		// Calculate midpoints of edges
		var vertexAB = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
		var vertexAC = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2];
		var vertexBC = [(b[0] + c[0]) / 2, (b[1] + c[1]) / 2, (b[2] + c[2]) / 2];

		// Normalize midpoints to maintain the sphere's shape
		vertexAB = normalize(vertexAB);
		vertexAC = normalize(vertexAC);
		vertexBC = normalize(vertexBC);

		// Recursively subdivide each smaller triangle
		divideTriangle(a, vertexAB, vertexAC, depth - 1);
		divideTriangle(vertexAB, b, vertexBC, depth - 1);
		divideTriangle(vertexAC, vertexBC, c, depth - 1);
		divideTriangle(vertexAB, vertexBC, vertexAC, depth - 1);
	}
}

function normalize(Vertex) {
	const length = Math.sqrt(
		Vertex[0] * Vertex[0] + Vertex[1] * Vertex[1] + Vertex[2] * Vertex[2]
	);
	return [Vertex[0] / length, Vertex[1] / length, Vertex[2] / length];
}

// Start recursive subdivision with the tetrahedron's vertices
divideTriangle(vertexA, vertexB, vertexC, depthsOfTheKnown);
divideTriangle(vertexD, vertexC, vertexB, depthsOfTheKnown);
divideTriangle(vertexA, vertexD, vertexB, depthsOfTheKnown);
divideTriangle(vertexA, vertexC, vertexD, depthsOfTheKnown);

// Convert sphereVertices array to Float32Array for WebGL
const sphereVerticesArray = new Float32Array(sphereVertices.flat());

// Create a buffer for the sphere vertices
const sphereVertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, sphereVerticesArray, gl.STATIC_DRAW);

// Define the total number of vertices for drawing
const numVertices = sphereVerticesArray.length / 3;

// Define shader programs, buffers, and other WebGL initialization
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(
	vertexShader,
	`
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
`
);

gl.compileShader(vertexShader);

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(
	fragmentShader,
	`
	precision mediump float;
	varying vec4 vColor;
	void main() {
		gl_FragColor = vColor;
	}
`
);

gl.compileShader(fragmentShader);

const shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vertexShader);
gl.attachShader(shaderProgram, fragmentShader);
gl.linkProgram(shaderProgram);

gl.useProgram(shaderProgram);

const aPosition = gl.getAttribLocation(shaderProgram, "aPosition");
gl.enableVertexAttribArray(aPosition);
gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);

const aColor = gl.getAttribLocation(shaderProgram, "aColor");
gl.enableVertexAttribArray(aColor);
gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0);

const uModel = gl.getUniformLocation(shaderProgram, "uModel");
const uView = gl.getUniformLocation(shaderProgram, "uView");
const uProjection = gl.getUniformLocation(shaderProgram, "uProjection");

const modelMatrix = mat4.create();
const viewMatrix = mat4.create();
const projectionMatrix = mat4.create();

mat4.perspective(
	projectionMatrix,
	45,
	canvas.width / canvas.height,
	0.1,
	100.0
);
mat4.translate(viewMatrix, viewMatrix, [0.0, 0.0, -3.0]);

gl.uniformMatrix4fv(uModel, false, modelMatrix);
gl.uniformMatrix4fv(uView, false, viewMatrix);
gl.uniformMatrix4fv(uProjection, false, projectionMatrix);

let radius = 2.0,
	theta = 0.0,
	phi = 0.0;

// Call a function to draw the wireframe
render();

let rotationAngleX = 0;
let rotationAngleY = 0;
let rotationAngleZ = 0;

let cameraZ = -5;

// Get the slider element
const thetaSlider = document.getElementById("thetaSlider");
const phiSlider = document.getElementById("phiSlider");
const radiusSlider = document.getElementById("radiusSlider");

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
	// Clear the canvas
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// Set up the shaders, webGL settings, buffers etc.
	gl.useProgram(shaderProgram);
	gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexBuffer);
	gl.enableVertexAttribArray(aPosition);
	gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(aColor);
	gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0);
	gl.uniformMatrix4fv(uModel, false, modelMatrix);
	gl.uniformMatrix4fv(uView, false, viewMatrix);
	gl.uniformMatrix4fv(uProjection, false, projectionMatrix);

	// view matrix for the camera position and orientation

	let camY = radius * Math.sin(phi);
	let camZ = radius * Math.cos(theta) * Math.cos(phi);
	let camX = radius * Math.sin(theta) * Math.cos(phi);
	mat4.lookAt(viewMatrix, [camX, camY, camZ], [0, 0, 0], [0, 1, 0]);

	const aspect = canvas.clientWidth / canvas.clientHeight;
	mat4.perspective(projectionMatrix, (45 * Math.PI) / 180, aspect, 0.01, 10);

	// Define the drawing mode as lines (for wireframe)
	gl.drawArrays(gl.LINES, 0, numVertices); // numVertices is the total number of vertices in your wireframe
	requestAnimationFrame(render);
}

function adjustSliderValue(slider, delta) {
	// Calculate the new value based on the scroll delta
	let newValue = parseFloat(slider.value) + delta;
	// Trap the value between the slider's min and max
	newValue = Math.max(slider.min, Math.min(slider.max, newValue));
	slider.value = newValue;
}
// mouse wheel event listener
[phiSlider, thetaSlider, radiusSlider].forEach((slider) => {
	slider.addEventListener("wheel", (event) => {
		// Prevent the page from moving
		event.preventDefault();

		// direction of the scroll
		const delta = event.deltaY < 0 ? 0.1 : -0.1;

		// Adjust the slider value
		adjustSliderValue(slider, delta);

		// Trigger the input event to update the scene
		slider.dispatchEvent(new Event("input"));
	});
});

canvas.addEventListener("mousemove", (event) => {
	if (!isDragging) return;

	const currentX = event.clientX;
	const currentY = event.clientY;

	const deltaX = currentX - prevX;
	const deltaY = currentY - prevY;

	// Adjust rotation angles based on deltaX and deltaY
	rotationAngleY += deltaX * 0.01; // Adjust the rotation speed as needed
	rotationAngleX += deltaY * 0.01;

	render();

	prevX = currentX;
	prevY = currentY;
});

canvas.addEventListener("mouseup", () => {
	isDragging = false;
});

canvas.addEventListener("wheel", (event) => {
	// Prevent the page from scrolling
	event.preventDefault();

	// Determine the direction of the scroll
	const delta = event.deltaY < 0 ? 0.1 : -0.1;

	// Adjust the radius (zoom) value
	radius += delta;

	// Limit the zoom level to a reasonable range
	radius = Math.max(0.1, Math.min(5.0, radius));

	render();
});
