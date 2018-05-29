# autostereogram
standalone js autostereogram generator with demo webpage
for more informations about autostereograms refer to the wikipediapage:
https://en.wikipedia.org/wiki/Autostereogram

## live version
https://jhippe.de/autostereogram/

## usage
to use the autostereogram.js in your own Projekts, simply tweak the settings in autostereogram\_settings and call create\_stereogram(depth,pattern) using a grayscale image as depth Map and a Vivid image as Pattern. If no pattern is given, the script will switch to random dot mode.

## settings
colum_width: defines the amount of pixels, each row will have
max_shift: defines the maximum "schift" of a white depth map Pixel. Thus, higer walues will give a greater 3d effekt
rmin...bmin: for random dot pictures only, defines the minimum ramdom color of the colorchannel
rmax...bmax: for random dot pictures only, defines the maximum ramdom color of the colorchannel
filter_linear: interpolates between pixels, thus creating smooth height gradient
upscale: scales the depth map before calculating the 3d image 2 = 200% 0,5 = 50%
downscale: scales the finished stereogram. 2 = 50%, 0.5 = 200%


