#include "Entry.h"
#include "ProgressBar.h"
#include "render/Arguments.h"
#include <iostream>

using namespace std;

int main(int argc, const char *argv[]) {
    const Arguments args(argc, argv);

    if (args.inputFile == NULL) {
        cout << "Insufficient argument: expecting -input [inputFile], exiting ..." << endl;
        return 1;
    }

    entry(args, printProgress);

    return 0;
}
