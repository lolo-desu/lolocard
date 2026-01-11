find . -name '*.jpg' -print -o -name '*.png' -print \
| sed -E "s|(.*)|https://testingcf.jsdelivr.net/gh/lolo-desu/lolocard/src/日记络络/图片/\1|" \
| pbcopy
