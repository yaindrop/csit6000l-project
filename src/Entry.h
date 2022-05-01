#ifndef ENTRY_H
#define ENTRY_H

#include "render/Arguments.h"
#include <functional>

void entry(const Arguments &args, std::function<void(double)> onProgress);

#endif // ENTRY_H
