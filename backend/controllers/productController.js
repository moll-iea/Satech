const Product = require('../models/Product');
const Category = require('../models/Category');
const cloudinary = require('../config/cloudinary');

const uploadToCloudinary = (fileBuffer, filename, folder = 'satech/products') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                public_id: `${Date.now()}-${filename}`,
                resource_type: 'image'
            },
            (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve(result);
            }
        );

        uploadStream.end(fileBuffer);
    });
};

const deleteFromCloudinary = async (publicId) => {
    if (!publicId) {
        return;
    }

    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
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
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Product image file is required.'
            });
        }

        if (!name || !detail || !categoryId) {
            return res.status(400).json({
                success: false,
                message: 'Name, detail, and category are required.'
            });
        }

        if (!cloudinary.isConfigured) {
            return res.status(500).json({
                success: false,
                message: 'Cloudinary is not configured on the server. Restart the backend after setting CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.'
            });
        }

        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(400).json({
                success: false,
                message: 'Selected category does not exist.'
            });
        }

        const uploadedImage = await uploadToCloudinary(req.file.buffer, req.file.originalname);

        const product = await Product.create({
            name: name.trim(),
            detail: detail.trim(),
            category: category.name,
            categoryId: category._id,
            image: uploadedImage.secure_url,
            imagePublicId: uploadedImage.public_id
        });

        return res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: product
        });
    } catch (error) {
        console.error('Create product error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Error creating product',
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
            if (!cloudinary.isConfigured) {
                return res.status(500).json({
                    success: false,
                    message: 'Cloudinary is not configured on the server. Restart the backend after setting CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.'
                });
            }

            const uploadedImage = await uploadToCloudinary(req.file.buffer, req.file.originalname);
            await deleteFromCloudinary(existingProduct.imagePublicId);
            updates.image = uploadedImage.secure_url;
            updates.imagePublicId = uploadedImage.public_id;
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
        console.error('Update product error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Error updating product',
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

        await deleteFromCloudinary(product.imagePublicId);

        return res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Delete product error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Error deleting product',
            error: error.message
        });
    }
};
