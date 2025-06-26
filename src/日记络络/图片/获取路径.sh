find . -name '*.jpg' -print -o -name '*.png' -print \
| sed -E "s|(.*)|https://gitgud.io/lolodesu/lolocard/-/raw/master/src/日记络络/图片/\1|" \
| sed -E "s|raw/master|raw/$(git log -n 1 --pretty=format:"%H")|" \
| pbcopy
