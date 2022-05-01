#include <cmath>
#include <iomanip>
#include <iostream>

using namespace std;

#define LEN 60
#define LEFT_BRACKET "▕"
#define RIGHT_BRACKET "▏"
#define FULL_BLOCK "█"
const char *partialBlocks[] = {" ", "▏", "▎", "▍", "▌", "▋", "▊", "▉"};
void printProgress(double percentage) {
    int fullBlocks = (int)floor(percentage * LEN);
    int partialIndex = (int)(8 * LEN * (percentage - (double)fullBlocks / LEN));
    cout << "\r" << LEFT_BRACKET;
    for (int i = 0; i < LEN; ++i)
        cout << (i < fullBlocks
                     ? FULL_BLOCK
                 : i == fullBlocks
                     ? partialBlocks[partialIndex]
                     : " ");
    cout << RIGHT_BRACKET << setprecision(2) << fixed
         << 100 * percentage << "% " << flush;
}
