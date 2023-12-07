// Get the canvas element
const canvas = document.getElementById("canvas");

// Initialize WebGL context
const gl = canvas.getContext("webgl");
if (!gl) {
	console.error("WebGL is not supported.");
}

// Define colors for the vertices
const colors = [
	1.0,
	0.0,
	0.0, // Vertex 1: Red
	0.0,
	0.5,
	0.0, // Vertex 2: Green
	0.0,
	0.0,
	0.35, // Vertex 3: Blue
];

// Vertex shader source code
const vertexShaderSource = `
    attribute vec2 coordinates;
		attribute vec3 vertexColor;
		varying vec3 fragColor;
    void main(void) {
        gl_Position = vec4(coordinates, 1.0, 1.0);
				fragColor = vertexColor;
    }
`; // 2nd number is the z axis with 1 is the closest to the screen, 0 is the farthest from the screen.
//3rd number is the depth of the triangle from the default camera position.

// Fragment shader source code
const fragmentShaderSource = `
    precision mediump float;
		varying vec3 fragColor;

    void main(void) {
        gl_FragColor = vec4(fragColor, 0.5); 
    } 
`; // vec4(fragColor,a) where a is the value for transparency.

// Create shaders
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

// Compile vertex shader
gl.shaderSource(vertexShader, vertexShaderSource);
gl.compileShader(vertexShader);

// Compile fragment shader
gl.shaderSource(fragmentShader, fragmentShaderSource);
gl.compileShader(fragmentShader);

// Create shader program
const shaderProgram = gl.createProgram();
// Attach shaders to the program
gl.attachShader(shaderProgram, vertexShader);
gl.attachShader(shaderProgram, fragmentShader);
// Link and use the program
gl.linkProgram(shaderProgram);
gl.useProgram(shaderProgram);

// Define vertices for the initial triangle
const vertices = [-1.0, 1.0, -1.0, -1.0, 1.0, 1.0];
// anything greater than at 1 will cause the triangle to be off the canvas or less than -1 at default camera position depth.

// Create a buffer to store color data and bind it
const colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

// buffer to store vertex data
const vertexBuffer = gl.createBuffer();

// Bind and buffer data to the buffer
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

// link the color buffer to the color attribute
const vertexColor = gl.getAttribLocation(shaderProgram, "vertexColor");
gl.enableVertexAttribArray(vertexColor);
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.vertexAttribPointer(vertexColor, 3, gl.FLOAT, false, 0, 0);

// Get the attribute location and enable it
const coordinates = gl.getAttribLocation(shaderProgram, "coordinates");
gl.enableVertexAttribArray(coordinates);
gl.vertexAttribPointer(coordinates, 2, gl.FLOAT, false, 0, 0);

// Function to render the Sierpinski Gasket
function renderSierpinski(vertices, depth) {
	if (depth === 0) {
		// Base case: Render the triangle
		// Buffer the vertices for the base triangle
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
		gl.drawArrays(gl.TRIANGLES, 0, 3);
	} else {
		// Recursive case: Divide and render smaller triangles
		const vectorPoint0 = vertices.slice(0, 2);
		const vectorPoint1 = vertices.slice(2, 4);
		const vectorPoint2 = vertices.slice(4, 6);

		// Calculate midpoints
		const midpoint01 = [
			(vectorPoint0[0] + vectorPoint1[0]) / 2,
			(vectorPoint0[1] + vectorPoint1[1]) / 2,
		];
		const midpoint12 = [
			(vectorPoint1[0] + vectorPoint2[0]) / 2,
			(vectorPoint1[1] + vectorPoint2[1]) / 2,
		];
		const midpoint20 = [
			(vectorPoint2[0] + vectorPoint0[0]) / 2,
			(vectorPoint2[1] + vectorPoint0[1]) / 2,
		];

		// Recursively render three smaller triangles
		renderSierpinski(
			[...vectorPoint0, ...midpoint01, ...midpoint20],
			depth - 1
		);
		renderSierpinski(
			[...midpoint01, ...vectorPoint1, ...midpoint12],
			depth - 1
		);
		renderSierpinski(
			[...midpoint20, ...midpoint12, ...vectorPoint2],
			depth - 1
		);
	} // the ... means to spread the array into individual elements
}

// Clear the canvas and render the Sierpinski Gasket
gl.clearColor(0.6, 0.3, 0.2, 1.0); // background color for the canvas
gl.clear(gl.COLOR_BUFFER_BIT); // Clear canvas

// Render the Sierpinski Gasket with desire depth
renderSierpinski(vertices, 3); // vertices is the array of points, # is the depth of recursion.
