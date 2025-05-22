# Migrate Products and Create Sample Data

This script will:
1. Update the existing products to match the new schema
2. Add sample categories if they don't exist
3. Add sample products with real-world coconut product images

## How to run:

```bash
cd d:/Hang_ngoo/web/hfbe
node scripts/migrate-products.js
```

Make sure the MongoDB server is running before executing the script.

## Schema Changes:

1. Product Schema:
   - Added `thumbnailImage` field for listing and cart display
   - Added `images` array for product detail gallery
   - Added `rating` and `reviewCount` fields
   - Added `materials` and `dimensions` fields

2. Wishlist Schema:
   - Changed from storing individual wishlist items to a single wishlist per user
   - Now stores an array of product IDs instead of individual products

## Sample Data:

The script includes 8 sample coconut products with:
- High-quality images from real coconut product listings
- Realistic descriptions, prices, and details
- Various product categories

All sample data will only be added if similar products don't already exist.
