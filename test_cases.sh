#!/bin/sh
# rm *.tga
# rm *.bmp
rm -r output/
mkdir output/

./proj -input scene/scene01_plane.txt  -size 200 200 -output output/1.bmp
./proj -input scene/scene02_cube.txt  -size 200 200 -output output/2.bmp
./proj -input scene/scene03_sphere.txt  -size 200 200 -output output/3.bmp
./proj -input scene/scene04_axes.txt  -size 200 200 -output output/4.bmp
./proj -input scene/scene05_bunny_200.txt  -size 200 200 -output output/5.bmp
./proj -input scene/scene06_bunny_1k.txt  -size 200 200 -output output/6.bmp
./proj -input scene/scene07_shine.txt  -size 200 200 -output output/7.bmp
./proj -input scene/scene08_c.txt -size 200 200 -output output/8.bmp
./proj -input scene/scene09_s.txt -size 200 200 -output output/9.bmp

./proj -input scene/scene06_bunny_1k.txt  -size 300 300 -output output/6.bmp\
   -shadows -bounces 4 -jitter -filter
./proj -input scene/scene10_sphere.txt  -size 300 300 -output output/10.bmp\
   -shadows -bounces 4 -jitter -filter
./proj -input scene/scene11_cube.txt  -size 300 300 -output output/11.bmp\
 -shadows -bounces 4 -jitter -filter
./proj -input scene/scene12_vase.txt  -size 300 300 -output output/12.bmp\
 -shadows -bounces 4 -jitter -filter
./proj -input scene/scene13_diamond.txt  -size 300 300 -output output/13.bmp\
 -shadows -bounces 4 -jitter -filter
