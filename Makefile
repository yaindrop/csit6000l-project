CC = g++
SRCDIR = src
OBJDIR = obj

SRCS = $(wildcard $(SRCDIR)/*.cpp)
SRCS += $(wildcard $(SRCDIR)/*/*.cpp)
SRCS += $(wildcard vecmath/src/*.cpp)

OBJS := $(SRCS:%.cpp=$(OBJDIR)/%.o)

PROG = proj
CFLAGS = -O2 -Wall -Wextra -std=c++20
INCFLAGS = -Ivecmath/include

all: $(PROG)

$(PROG): $(OBJS)
	$(CC) $(CFLAGS) $(OBJS) -o $@ $(LINKFLAGS)

$(OBJDIR)/%.o: %.cpp
	@echo "COMPILING SOURCE $< INTO OBJECT $@"
	@mkdir -p '$(@D)'
	@$(CC) $(CFLAGS) $< -c -o $@ $(INCFLAGS)

clean:
	rm -rf *.bak $(OBJDIR) core.* $(PROG) 
