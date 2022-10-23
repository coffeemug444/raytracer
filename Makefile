CC=g++
FLAGS = -Wall -Wextra -Werror -pedantic -g
LIBS = -lglfw

main: main.cpp
	g++ $(FLAGS) -o $@ $< glad.c $(LIBS)

.PHONY: clean
clean:
	rm -f main