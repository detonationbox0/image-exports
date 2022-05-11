# create noise image
convert -size ${ww}x${hh} xc: $seed +noise Random \
	-virtual-pixel tile \
	$setcspace -colorspace gray -contrast-stretch 0% \
    $tmp0


#1:
convert -quiet rooster.jpg -blur 0x5 +repage frosted_1.mpc

#2:
convert -size 1600x1598 xc: +noise Random \
	-virtual-pixel tile \
	-colorspace gray -contrast-stretch 0% \
    outFile.png

#3:
convert outFile.png -colorspace sRGB\
    -channel R -evaluate sine 10 \
    -channel G -evaluate cosine 10 \
    -channel RG -separate frosted_1.mpc -insert 0 \
    -set colorspace RGB -define compose:args=5x5 \
    -compose displace -composite rooster_out.png



# Thermo effect

# read the input image into the temporary cached image and test if valid
# Creates a gray version
convert -quiet "$infile" $setcspace -colorspace gray +repage "$tmpA1" ||
	errMsg "--- FILE $infile DOES NOT EXIST OR IS NOT AN ORDINARY FILE, NOT READABLE OR HAS ZERO size  ---"

#test -
convert -quiet rooster.jpg -colorspace gray +repage thermo_temp.png 

#convert lowpt and highpt to range and offset
range=`convert xc: -format "%[fx:round(1000*($highpt-$lowpt)/100)]" info:`
offset=`convert xc: -format "%[fx:round(1000*$lowpt/100)]" info:`

# test
convert xc: -format "%[fx:round(1000*(100-0)/100)]" info: # $ 1000%
convert xc: -format "%[fx:round(1000*0/100)]" info: # $ 0% 



convert $tmpA1 \
	\( -size 1x1 xc:blueviolet xc:blue xc:cyan xc:green1 xc:yellow xc:orange xc:red \
		+append -filter Cubic -resize 1000x1! -crop ${range}x${range}+${offset}+0 +repage \
		-resize 1000x1! \) \
	$setcspace -clut "$outfile"
    
# note added $setcspace before -clut to fix bug between 6.8.4.0 and 6.8.4.10
convert thermo_temp.png \
	\( -size 1x1 xc:blueviolet xc:blue xc:cyan xc:green1 xc:yellow xc:orange xc:red \
		+append -filter Cubic -resize 1000x1! -crop 1000%x1000%+0%+0 +repage \
		-resize 1000x1! \) \
	    -clut thermo_out.png


# My own Toon Effect

convert rooster.jpg -charcoal 5 output.png

convert -gravity center \
	\( output.png set -background none \) \
	\( rooster.jpg +clone -blur 0x3 \) -compose Multiply -composite multiplied.png

convert -quiet "$infile" +repage $dir/tmpI.mpc

convert $dir/tmpI.mpc \
	\( -clone 0 -colorspace gray -define convolve:scale='!' \
	-define morphology:compose=Lighten \
	-morphology Convolve  'Sobel:>' \
	-negate -evaluate pow $gain -sigmoidal-contrast $smoothing,50% \) \
	+swap -compose colorize -composite \
	$composing $modulating \
	"$outfile"