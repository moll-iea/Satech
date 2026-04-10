const Product = require('../models/Product');
const Category = require('../models/Category');
const fs = require('fs');
const path = require('path');

const toPublicImagePath = (file) => {
    if (!file) {
        return '';
    }

    return `/uploads/products/${file.filename}`;
};

const removeLocalImage = (imagePath) => {
    if (!imagePath || !imagePath.startsWith('/uploads/products/')) {
        return;
    }

    const fullPath = path.join(__dirname, '..', imagePath.replace(/^\//, ''));

    if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
    }
};

exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find()
            .populate('categoryId', 'name description')
            .sort({ category: 1, createdAt: 1 });

        return res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching products',
            error: error.message
        });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const { name, detail, categoryId } = req.body;
        const image = toPublicImagePath(req.file);

        if (!name || !detail || !categoryId || !image) {
            return res.status(400).json({
                success: false,
                message: 'Name, detail, category, and image file are required.'
            });
        }

        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(400).json({
                success: false,
                message: 'Selected category does not exist.'
            });
        }

        const product = await Product.create({
            name: name.trim(),
            detail: detail.trim(),
            category: category.name,
            categoryId: category._id,
            image
        });

        return res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: product
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error creating product',
            error: error.message
        });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { name, detail, categoryId } = req.body;
        const updates = {};
        const existingProduct = await Product.findById(req.params.id);

        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        if (typeof name === 'string') {
            updates.name = name.trim();
        }

        if (typeof detail === 'string') {
            updates.detail = detail.trim();
        }

        let category = null;
        if (categoryId) {
            category = await Category.findById(categoryId);

            if (!category) {
                return res.status(400).json({
                    success: false,
                    message: 'Selected category does not exist.'
                });
            }

            updates.category = category.name;
            updates.categoryId = category._id;
        }

        if (req.file) {
            removeLocalImage(existingProduct.image);
            updates.image = toPublicImagePath(req.file);
        }

        updates.updatedAt = Date.now();

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            updates,
            {
                new: true,
                runValidators: true
            }
        );

        return res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            data: product
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error updating product',
            error: error.message
        });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        removeLocalImage(product.image);

        return res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error deleting product',
            error: error.message
        });
    }
};
