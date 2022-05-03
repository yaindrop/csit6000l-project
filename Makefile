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


EMCC = ~/emsdk/upstream/emscripten/emcc
EMOBJDIR = emobj
EMOBJS = $(SRCS:%.cpp=$(EMOBJDIR)/%.o)

WEBDIR = front/web
WEBJS = $(WEBDIR)/index.js
WEBWASM = $(WEBDIR)/index.wasm
WEBDATA = $(WEBDIR)/index.data
EMCFLAGS = -O3 -Wall -Wextra -std=c++20
EMFLAGS = --bind -sALLOW_MEMORY_GROWTH -sASYNCIFY -sENVIRONMENT=web -sMODULARIZE=1 -s'EXPORT_NAME="initModule"' -sASSERTIONS=1 -s'EXPORTED_RUNTIME_METHODS=["FS"]' --preload-file scene 

web: $(WEBJS)

$(WEBJS): $(EMOBJS)
	mkdir -p $(WEBDIR)
	$(EMCC) $(EMCFLAGS) $(EMOBJS) -o $@ $(LINKFLAGS) $(EMFLAGS)

$(EMOBJDIR)/%.o: %.cpp
	@echo "COMPILING SOURCE $< INTO OBJECT $@"
	@mkdir -p '$(@D)'
	@$(EMCC) $(EMCFLAGS) $< -c -o $@ $(INCFLAGS) 

clean:
	rm -rf *.bak $(OBJDIR) core.* $(PROG) $(EMOBJDIR) $(WEBJS) $(WEBWASM) $(WEBDATA)
