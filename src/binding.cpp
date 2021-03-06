#ifdef __EMSCRIPTEN__
#include <emscripten.h>
#include <emscripten/bind.h>

#include "Entry.h"
#include "render/Arguments.h"
#include <chrono>
#include <iostream>
#include <string>
#include <vector>

using namespace emscripten;

inline val progressEvent(double percentage) {
    val res = val::object();
    res.set("type", 0);
    res.set("percentage", percentage);
    return res;
}

std::string exec(std::vector<std::string> argvec, val callback, double callbackFreq) {
    int argc = argvec.size() + 1;
    const char **argv = new const char *[argc];
    for (size_t i = 1; i < argc; ++i) {
        argv[i] = argvec[i - 1].c_str();
    }

    Arguments args(argc, argv);

    using namespace std::chrono;
    auto t0 = duration_cast<milliseconds>(system_clock::now().time_since_epoch());
    auto onProgress = [&callback, &t0, callbackFreq](double p) {
        auto t1 = duration_cast<milliseconds>(system_clock::now().time_since_epoch());
        if ((t1 - t0).count() * callbackFreq > 1000) {
            t0 = t1;
            int stop = callback(progressEvent(p)).as<int>();
            if (stop) {
                exit(0);
            }
            emscripten_sleep(0);
        }
    };

    entry(args, onProgress);

    delete[] argv;

    return args.inputFile;
}

EMSCRIPTEN_BINDINGS(my_module) {
    register_vector<std::string>("StringVector");
    function("exec", &exec);
}

#endif