#!/bin/bash

seed=""

ww="1600"
hh="1598"

number=500

wwm1=$((ww-1))
hhm1=$((hh-1))

list=""
xseed=$((seed % 32767))
yseed=$((seed+1 % 32767))

for ((i=0; i<number; i++)); do
	if [ "$seed" = "" ]; then
		x=$((RANDOM % wwm1))
		y=$((RANDOM % hhm1))
		else
		RANDOM=$((xseed % 32767))
		x=$(($RANDOM % wwm1))
		RANDOM=$((yseed % 32767))
		y=$(($RANDOM % hhm1))
	fi
	list="$list point $x,$y"
	j=$((i+1))
	xseed=$((xseed+i*i))
	yseed=$((yseed+j*j))
done
echo "list: $list"
echo "j: $j"
echo "xseed: $xseed"
echo "yseed: $yseed"
