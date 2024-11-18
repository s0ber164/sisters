import sys
import os
from rembg import remove
from PIL import Image

def get_content_box(image):
    """Get the bounding box of the non-transparent content."""
    if image.mode != 'RGBA':
        image = image.convert('RGBA')
    
    # Get the alpha channel
    alpha = image.split()[3]
    
    # Get the bounding box of non-transparent pixels
    bbox = alpha.getbbox()
    
    return bbox if bbox else (0, 0, image.width, image.height)

def fit_to_aspect_ratio(width, height, target_ratio=1/1):
    """Adjust dimensions to match target aspect ratio while maintaining or increasing both dimensions."""
    current_ratio = width / height
    
    if current_ratio > target_ratio:
        # Image is too wide, increase height
        new_height = int(width / target_ratio)
        return width, new_height
    else:
        # Image is too tall, increase width
        new_width = int(height * target_ratio)
        return new_width, height

def center_and_add_margin(image, margin_percent=6, target_ratio=1/1):
    """Center the image content, add margin, and ensure 1:1 aspect ratio."""
    if image.mode != 'RGBA':
        image = image.convert('RGBA')
    
    # Get the bounding box of the content
    bbox = get_content_box(image)
    content_width = bbox[2] - bbox[0]
    content_height = bbox[3] - bbox[1]
    
    # Calculate margin in pixels (6% of the larger dimension)
    margin = int(max(content_width, content_height) * (margin_percent / 100))
    
    # Calculate dimensions with margin
    width_with_margin = content_width + (2 * margin)
    height_with_margin = content_height + (2 * margin)
    
    # Adjust dimensions to match 1:1 aspect ratio while maintaining margins
    final_width, final_height = fit_to_aspect_ratio(width_with_margin, height_with_margin, target_ratio)
    
    # Create new image with the calculated dimensions
    new_image = Image.new('RGBA', (final_width, final_height), (0, 0, 0, 0))
    
    # Calculate position to paste the content (centered)
    paste_x = (final_width - content_width) // 2
    paste_y = (final_height - content_height) // 2
    
    # Crop the content and paste it centered
    content = image.crop(bbox)
    new_image.paste(content, (paste_x, paste_y))
    
    return new_image

def add_background(image, color=(170, 170, 170)):  # hex #aaaaaa = rgb(170,170,170)
    """Add a solid background color to an image with transparency."""
    # Create a new image with the same size and the specified background color
    background = Image.new('RGB', image.size, color)
    
    # If the image has an alpha channel, use it as a mask
    if image.mode in ('RGBA', 'LA') or (image.mode == 'P' and 'transparency' in image.info):
        # Convert to RGBA if not already
        image = image.convert('RGBA')
        background.paste(image, mask=image.split()[3])  # 3 is the alpha channel
    else:
        background.paste(image)
    
    return background

def process_single_image(input_path, output_path):
    """Process a single image: remove background, center, add margin, and set gray background."""
    try:
        print(f"Processing image: {input_path}", flush=True)
        print(f"Output path: {output_path}", flush=True)
        
        # Open and process image
        input_image = Image.open(input_path)
        
        # Remove background
        print("Removing background...", flush=True)
        output_image = remove(input_image)
        
        # Center and add margin
        print("Centering image and adding margin...", flush=True)
        output_image = center_and_add_margin(output_image, margin_percent=6)
        
        # Add gray background
        print("Adding gray background...", flush=True)
        output_image = add_background(output_image, (170, 170, 170))
        
        # Create output directory if it doesn't exist
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # Save the processed image
        print("Saving processed image...", flush=True)
        output_image.save(output_path, 'PNG')
        
        print("Processing completed successfully", flush=True)
        return True
        
    except Exception as e:
        print(f"Error processing image: {str(e)}", flush=True)
        return False

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python process_single_image.py <input_path> <output_path>", flush=True)
        sys.exit(1)
        
    input_path = sys.argv[1]
    output_path = sys.argv[2]
    
    print(f"Input path: {input_path}", flush=True)
    print(f"Output path: {output_path}", flush=True)
    
    if not os.path.exists(input_path):
        print(f"Error: Input file not found: {input_path}", flush=True)
        sys.exit(1)
        
    success = process_single_image(input_path, output_path)
    sys.exit(0 if success else 1)
