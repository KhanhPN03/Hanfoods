# Reset and Import Product Data

## Overview

This script will:
1. Delete all existing products in the database
2. Create categories if they don't exist
3. Import new product data with Google Cloud Storage URLs for images
4. Verify the imported data

## Products Included

The script includes 10 coconut products across 4 categories:

- Dụng Cụ Nhà Bếp (Kitchen Utensils)
- Đồ Trang Trí (Decorative Items)
- Vật Dụng Cá Nhân (Personal Items)
- Quà Tặng (Gifts)

Each product has:
- A high-quality thumbnail image
- Multiple images for the product gallery
- Detailed descriptions in Vietnamese
- Realistic pricing
- Stock information
- Material details
- Dimensions

## Image Hosting

All product images are hosted on Google Cloud Storage with URLs in the format:
```
https://storage.googleapis.com/coconature-products/[product-image-name].jpg
```

## How to Run

### Option 1: Using npm script

```bash
cd d:/Hang_ngoo/web/hfbe
npm run reset-products
```

### Option 2: Direct node execution

```bash
cd d:/Hang_ngoo/web/hfbe
node scripts/reset-and-import-products.js
```

## Important Notes

- This script will DELETE ALL existing products
- It will not delete any other data (like users, orders, etc.)
- The script will automatically create categories if they don't exist
- Each run will generate new product IDs

## Expected Output

After running the script, you should see:
1. Confirmation of database connection
2. Number of products deleted
3. Categories added or confirmed as existing
4. Products added
5. Verification of the data import with counts
6. A sample product record showing format and structure

## Troubleshooting

If you encounter any errors:

1. Make sure MongoDB is running and accessible
2. Check that the MONGODB_URI in your .env file is correct
3. Ensure you have the required dependencies installed (uuid, mongoose)
4. Check for any network issues that might affect image URL access
