#!/bin/sh
rm *.tga
rm *.bmp

./a5soln -input scene01_plane.txt  -size 200 200 -output 1.bmp
./a5soln -input scene02_cube.txt  -size 200 200 -output 2.bmp
./a5soln -input scene03_sphere.txt  -size 200 200 -output 3.bmp
./a5soln -input scene04_axes.txt  -size 200 200 -output 4.bmp
./a5soln -input scene05_bunny_200.txt  -size 200 200 -output 5.bmp
./a5soln -input scene06_bunny_1k.txt  -size 200 200 -output 6.bmp
./a5soln -input scene07_shine.txt  -size 200 200 -output 7.bmp
./a5soln -input scene08_c.txt -size 200 200 -output 8.bmp
./a5soln -input scene09_s.txt -size 200 200 -output 9.bmp

./a5soln -input scene06_bunny_1k.txt  -size 300 300 -output 6.bmp\
   -shadows -bounces 4 -jitter -filter
./a5soln -input scene10_sphere.txt  -size 300 300 -output 10.bmp\
   -shadows -bounces 4 -jitter -filter
./a5soln -input scene11_cube.txt  -size 300 300 -output 11.bmp\
 -shadows -bounces 4 -jitter -filter
./a5soln -input scene12_vase.txt  -size 300 300 -output 12.bmp\
 -shadows -bounces 4 -jitter -filter
./a5soln -input scene13_diamond.txt  -size 300 300 -output 13.bmp\
 -shadows -bounces 4 -jitter -filter