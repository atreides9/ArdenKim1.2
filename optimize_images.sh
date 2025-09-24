#!/bin/bash
# WebP Image Optimization Script

echo "🖼️  Starting image optimization..."

# Check if cwebp is installed
if ! command -v cwebp &> /dev/null; then
    echo "❌ cwebp not found. Installing..."
    # For macOS with Homebrew
    if command -v brew &> /dev/null; then
        brew install webp
    else
        echo "⚠️  Please install WebP tools manually:"
        echo "   macOS: brew install webp"
        echo "   Ubuntu: sudo apt install webp"
        exit 1
    fi
fi

# Create optimized directory
mkdir -p ./images/optimized

# Convert and optimize images
total_saved=0

for img in *.{jpg,jpeg,png,JPG,JPEG,PNG}; do
    if [ -f "$img" ]; then
        original_size=$(stat -f%z "$img" 2>/dev/null || stat -c%s "$img" 2>/dev/null)
        
        # Convert to WebP with 80% quality
        cwebp -q 80 "$img" -o "./images/optimized/${img%.*}.webp" 2>/dev/null
        
        if [ $? -eq 0 ]; then
            webp_size=$(stat -f%z "./images/optimized/${img%.*}.webp" 2>/dev/null || stat -c%s "./images/optimized/${img%.*}.webp" 2>/dev/null)
            saved=$((original_size - webp_size))
            total_saved=$((total_saved + saved))
            
            echo "✅ Converted $img"
            echo "   Original: $(numfmt --to=iec $original_size)"
            echo "   WebP: $(numfmt --to=iec $webp_size)"
            echo "   Saved: $(numfmt --to=iec $saved)"
            echo ""
        else
            echo "❌ Failed to convert $img"
        fi
    fi
done

if [ $total_saved -gt 0 ]; then
    echo "🎉 Optimization complete!"
    echo "💾 Total space saved: $(numfmt --to=iec $total_saved)"
    echo ""
    echo "📝 Next steps:"
    echo "1. Update HTML to use WebP images with fallbacks:"
    echo "   <picture>"
    echo "     <source srcset='./images/optimized/image.webp' type='image/webp'>"
    echo "     <img src='./original-image.jpg' alt='Description' loading='lazy'>"
    echo "   </picture>"
    echo ""
    echo "2. Consider using lazy loading for all images"
    echo "3. Add appropriate alt text for accessibility"
else
    echo "ℹ️  No images found to optimize"
fi