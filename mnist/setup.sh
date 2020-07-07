destination="mnist_png.tar.gz"
url="https://raw.githubusercontent.com/myleott/mnist_png/master/mnist_png.tar.gz"
curl --output $destination $url
tar -xvzf $destination
root_path=$(pwd)
mnist_png="$root_path/mnist_png"
labels=$mnist_png/labels.txt
testing="$mnist_png/testing"
training="$mnist_png/training"

# List labels
cd $testing
ls -d */ | sed 's#/##g' > $labels

# List files
while read line; do
  ls "$testing/$line" > "$testing/$line.txt"
  ls "$training/$line" > "$training/$line.txt"
done <$labels

cd $root_path
