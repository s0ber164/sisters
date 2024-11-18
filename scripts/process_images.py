import csv
import sys
import requests
import os
import traceback
from rembg import remove
from PIL import Image, ImageOps
from io import BytesIO

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

def process_images_from_csv(csv_path, output_dir):
    print(f"Starting to process CSV file: {csv_path}", flush=True)
    print(f"Output directory: {output_dir}", flush=True)
    print(f"Current working directory: {os.getcwd()}", flush=True)
    
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    try:
        print(f"Reading CSV file...", flush=True)
        with open(csv_path, 'r', encoding='utf-8-sig') as file:
            # Check if file is empty
            if os.path.getsize(csv_path) == 0:
                raise ValueError("CSV file is empty")
            
            content = file.read()
            print(f"CSV content: {content}", flush=True)
            file.seek(0)
            
            reader = csv.DictReader(file)
            
            # Validate CSV headers
            print(f"CSV headers: {reader.fieldnames}", flush=True)
            if 'image_url' not in reader.fieldnames:
                raise ValueError("CSV must have 'image_url' column")
            
            for i, row in enumerate(reader, 1):
                try:
                    # Get image URL from CSV
                    image_url = row.get('image_url')
                    if not image_url:
                        print(f"No image URL found in row {i}", flush=True)
                        continue
                    
                    print(f"Processing image {i}: {image_url}", flush=True)
                    
                    # Download image
                    print(f"Downloading image...", flush=True)
                    response = requests.get(image_url, timeout=30)
                    response.raise_for_status()
                    
                    # Open image
                    print(f"Opening image...", flush=True)
                    input_image = Image.open(BytesIO(response.content))
                    
                    # Remove background
                    print(f"Removing background from image {i}", flush=True)
                    output_image = remove(input_image)
                    
                    # Center, add margin, and ensure 1:1 aspect ratio
                    print(f"Centering image, adding margin, and adjusting to 1:1 ratio...", flush=True)
                    output_image = center_and_add_margin(output_image, margin_percent=6, target_ratio=1/1)
                    
                    # Add gray background
                    print(f"Adding gray background...", flush=True)
                    output_image = add_background(output_image, (170, 170, 170))
                    
                    # Save processed image
                    filename = f"processed_{i}.png"
                    output_path = os.path.join(output_dir, filename)
                    print(f"Saving to: {output_path}", flush=True)
                    output_image.save(output_path, 'PNG')
                    
                    print(f"Successfully processed and saved: {output_path}", flush=True)
                    
                except requests.exceptions.RequestException as e:
                    print(f"Error downloading image in row {i}: {str(e)}", flush=True)
                    traceback.print_exc(file=sys.stdout)
                    continue
                except Exception as e:
                    print(f"Error processing row {i}: {str(e)}", flush=True)
                    traceback.print_exc(file=sys.stdout)
                    continue
    
    except Exception as e:
        print(f"Fatal error processing CSV: {str(e)}", flush=True)
        traceback.print_exc(file=sys.stdout)
        raise

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python process_images.py <csv_file> <output_dir>", flush=True)
        sys.exit(1)
        
    csv_path = sys.argv[1]
    output_dir = sys.argv[2]
    
    print(f"Script arguments:", flush=True)
    print(f"CSV path: {csv_path}", flush=True)
    print(f"Output directory: {output_dir}", flush=True)
    
    if not os.path.exists(csv_path):
        print(f"Error: CSV file not found: {csv_path}", flush=True)
        sys.exit(1)
        
    try:
        process_images_from_csv(csv_path, output_dir)
        print("Processing completed successfully", flush=True)
    except Exception as e:
        print(f"Fatal error: {str(e)}", flush=True)
        traceback.print_exc(file=sys.stdout)
        sys.exit(1)
