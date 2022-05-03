#!/bin/sh
# rm *.tga
# rm *.bmp
rm -r output/
mkdir output/

./test_casting.sh
./test_tracing.sh
./test_jitter_filter.sh
./test_blurry.sh
