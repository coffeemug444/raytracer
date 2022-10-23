#version 460 core
layout(location = 0) in vec3 aPos;      // ranges from 0,0,0 to 1,1,0. Vertex coords of the rendered quad

uniform float screenHeight;
uniform float screenWidth;
uniform float fov;              // given in radians
uniform mat3 view;
out vec3 rayDir;


void main()
{
	rayDir = normalize(view * vec3(aPos.x * screenWidth/screenHeight * tan(fov / 2), aPos.y * tan(fov / 2), -1));

	gl_Position = vec4(aPos, 1.0);
}
