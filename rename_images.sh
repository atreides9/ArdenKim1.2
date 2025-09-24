#!/bin/bash
# Image filename conversion script

echo "🔄 Starting image filename conversion..."

# Rename Korean filenames to English
if [ -f "./브메.png" ]; then
    mv "./브메.png" "./brainmate-thumb.png"
    echo "✅ Renamed 브메.png to brainmate-thumb.png"
fi

if [ -f "./스타벅스.jpg" ]; then
    mv "./스타벅스.jpg" "./starbucks-thumb.jpg" 
    echo "✅ Renamed 스타벅스.jpg to starbucks-thumb.jpg"
fi

if [ -f "./하나카드.png" ]; then
    mv "./하나카드.png" "./hanacard-thumb.png"
    echo "✅ Renamed 하나카드.png to hanacard-thumb.png"
fi

echo "🎉 Image filename conversion completed"