#include "glad.h"
#include <GLFW/glfw3.h>
#include "shader.h"
#include "camera.h"
#include <random>
#include "shader_types.h"

#include <iostream>

void framebuffer_size_callback(GLFWwindow* window, int width, int height);
void processInput(GLFWwindow *window, float deltaTime);
void keyCallback(GLFWwindow* window, int key, int, int action, int);
void mouse_callback(GLFWwindow*, double xpos, double ypos);

const unsigned int SCR_WIDTH = 1280;
const unsigned int SCR_HEIGHT = 720;
float fov = M_PI / 4.f;

Camera camera(glm::vec3(0.0f, 0.0f, 1.0f));
float lastX, lastY;
bool firstMouse = true;

// timing
float lastFrame = 0.0f;

GLFWwindow* initWindow()
{
    glfwInit();
    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 4);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 6);
    glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);
    glfwWindowHint(GLFW_RESIZABLE, GLFW_FALSE);

    GLFWwindow* window = glfwCreateWindow(SCR_WIDTH, SCR_HEIGHT, "Ray Tracer", NULL, NULL);
    if (window == NULL)
    {
        std::cout << "Failed to create GLFW window" << std::endl;
        glfwTerminate();
        return nullptr;
    }
    glfwMakeContextCurrent(window);
	glfwSetCursorPosCallback(window, mouse_callback);
	glfwSetKeyCallback(window, keyCallback);
	glfwSetInputMode(window, GLFW_CURSOR, GLFW_CURSOR_DISABLED);

    if (!gladLoadGLLoader((GLADloadproc)glfwGetProcAddress))
    {
        std::cout << "Failed to initialize GLAD" << std::endl;
        glfwTerminate();
        return nullptr;
    }

    return window;
}

void initQuad(unsigned int& VBO, unsigned int& VAO)
{
    float vertices[] = {
        -1.0f,  1.0f, 0.0f,
         1.0f,  1.0f, 0.0f,
        -1.0f, -1.0f, 0.0f,

         1.0f,  1.0f, 0.0f,
        -1.0f, -1.0f, 0.0f,
         1.0f, -1.0f, 0.0f,
    }; 

    glGenVertexArrays(1, &VAO);
    glGenBuffers(1, &VBO);
    glBindVertexArray(VAO);

    glBindBuffer(GL_ARRAY_BUFFER, VBO);
    glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);

    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(float), (void*)0);
    glEnableVertexAttribArray(0);

    glBindBuffer(GL_ARRAY_BUFFER, 0); 
    glBindVertexArray(0); 
}

Sphere mySphere = {
   {
      {
         1.f, 0.8f, 0.2f
      },
      1.0f,
      0.0f,
      1.f
   },
   {
      10.0f, 0.f, 5.0f
   },
   2.f
};


int main()
{
    GLFWwindow* window = initWindow();
    Shader shaderProgram("shader.vert", "shader.frag");
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_real_distribution<float> dist(0.0f, 1.0f);




    unsigned int VBO, VAO;
    initQuad(VBO, VAO);


    while (!glfwWindowShouldClose(window))
    {
		float currentFrame = glfwGetTime();
		float deltaTime = currentFrame - lastFrame;
		lastFrame = currentFrame;

        processInput(window, deltaTime);

		shaderProgram.setFloat("screenWidth", (float)SCR_WIDTH);
		shaderProgram.setFloat("screenHeight", (float)SCR_HEIGHT);
		shaderProgram.setFloat("fov", fov);
		shaderProgram.setMat3("view", camera.GetViewMatrix());
		shaderProgram.setVec3("camPos", camera.Position);
        shaderProgram.setFloat("UniformRandomSeed", dist(gen));
        for (int i = 0; i < 10; i++) {
            mySphere.center.x = 10*i;
            shaderProgram.setSphere("Spheres", i, mySphere);
        }

        glClearColor(0.2f, 0.3f, 0.3f, 1.0f);
        glClear(GL_COLOR_BUFFER_BIT);

        shaderProgram.use();
        glBindVertexArray(VAO); 
        glDrawArrays(GL_TRIANGLES, 0, 6);

		glfwSwapBuffers(window);
        glfwPollEvents();
    }

    glDeleteVertexArrays(1, &VAO);
    glDeleteBuffers(1, &VBO);

    glfwTerminate();
    return 0;
}

void mouse_callback(GLFWwindow*, double xpos, double ypos)
{
	if (firstMouse)
	{
		lastX = xpos;
		lastY = ypos;
		firstMouse = false;
        return;
	}

	float xoffset = (xpos - lastX);
	float yoffset = (lastY - ypos); // reversed since y-coordinates go from bottom to top

	lastX = xpos;
	lastY = ypos;

	camera.ProcessMouseMovement(xoffset, yoffset);
}

void processInput(GLFWwindow *window, float deltaTime)
{
	if (glfwGetKey(window, GLFW_KEY_ESCAPE) == GLFW_PRESS)
		glfwSetWindowShouldClose(window, true);
	if (glfwGetKey(window, GLFW_KEY_W) == GLFW_PRESS)
		camera.ProcessKeyboard(FORWARD, deltaTime);
	if (glfwGetKey(window, GLFW_KEY_S) == GLFW_PRESS)
		camera.ProcessKeyboard(BACKWARD, deltaTime);
	if (glfwGetKey(window, GLFW_KEY_A) == GLFW_PRESS)
		camera.ProcessKeyboard(LEFT, deltaTime);
	if (glfwGetKey(window, GLFW_KEY_D) == GLFW_PRESS)
		camera.ProcessKeyboard(RIGHT, deltaTime);
	if (glfwGetKey(window, GLFW_KEY_T) == GLFW_PRESS) {
        float newFov = fov * (deltaTime + 1);
        if (newFov < M_PI / 2) fov = newFov;
    }
	if (glfwGetKey(window, GLFW_KEY_G) == GLFW_PRESS){
        fov /= (deltaTime + 1);
    }
}

void keyCallback(GLFWwindow* window, int key, int, int action, int)
{
    if ((key != GLFW_KEY_LEFT_CONTROL) || action != GLFW_PRESS) return;

    if (glfwGetInputMode(window, GLFW_CURSOR) == GLFW_CURSOR_DISABLED) {
        glfwSetInputMode(window, GLFW_CURSOR, GLFW_CURSOR_NORMAL);
        glfwSetCursorPosCallback(window, NULL);
    } else {
        glfwSetInputMode(window, GLFW_CURSOR, GLFW_CURSOR_DISABLED);
        firstMouse = true;
        glfwSetCursorPosCallback(window, mouse_callback);
    }
}