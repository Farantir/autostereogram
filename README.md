# i do not recomend using this program
while it does create autostereograms the algorithm used is not physically accurate.
This results in some artefacts and a non-linear depth representation.
There are a lot of good papers on this topic and i plan to reimplement the program,
using a better algorithem.

# autostereogram
standalone js autostereogram generator with demo webpage.

for more informations about autostereograms refer to the wikipedia page:
https://en.wikipedia.org/wiki/Autostereogram

## usage
to use the autostereogram.js in your own Projekts, simply tweak the settings in autostereogram\_settings and call create\_stereogram(depth,pattern) using a grayscale image as depth Map and a Vivid image as Pattern. If no pattern is given, the script will switch to random dot mode.

create\_stereogram(depth,pattern) will return a canvas element with the "stereoimage" id. 

## settings
1. colum_width: defines the amount of pixels, each row will have
2. max_shift: defines the maximum "shift" of a white depth map Pixel. Thus, higer values will give a greater 3d effekt
3. rmin...bmin: for random dot pictures only, defines the minimum ramdom color of the colorchannel (i know that this isn't optimal. A hsv representation would be a better approach)
4. rmax...bmax: for random dot pictures only, defines the maximum ramdom color of the colorchannel (i know that this isn't optimal. A hsv representation would be a better approach)
5. filter_linear: interpolates between pixels, thus creating smooth height gradient
6. upscale: scales the depth map before calculating the 3d image 2 = 200% 0,5 = 50%
7. downscale: scales the finished stereogram. 2 = 50%, 0.5 = 200%
8. pattern_scale : scaling of the pattern image. 2 = 200%, 0,5 = 50%
9. pattern_shift : negative amount pattern will be shiftet, if the pattern is smaller than the colum width. May be used to avoid alialising
10. remove\_hidden\_surface : tries to remove "unseen" areas of the image, mostly eliminating image artifacts


