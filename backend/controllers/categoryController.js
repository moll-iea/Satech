const Category = require('../models/Category');
const Product = require('../models/Product');

exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: 1 });

        return res.status(200).json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching categories',
            error: error.message
        });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const { name, description = '' } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Category name is required.'
            });
        }

        const normalizedName = name.trim();
        const existingCategory = await Category.findOne({
            name: { $regex: new RegExp(`^${normalizedName}$`, 'i') }
        });

        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: 'Category already exists.'
            });
        }

        const category = await Category.create({
            name: normalizedName,
            description: description.trim()
        });

        return res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: category
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error creating category',
            error: error.message
        });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { name, description = '' } = req.body;

        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        if (name && name.trim()) {
            const normalizedName = name.trim();
            const duplicate = await Category.findOne({
                _id: { $ne: req.params.id },
                name: { $regex: new RegExp(`^${normalizedName}$`, 'i') }
            });

            if (duplicate) {
                return res.status(400).json({
                    success: false,
                    message: 'Category already exists.'
                });
            }

            category.name = normalizedName;
        }

        category.description = description.trim();
        await category.save();

        await Product.updateMany(
            { categoryId: category._id },
            { $set: { category: category.name } }
        );

        return res.status(200).json({
            success: true,
            message: 'Category updated successfully',
            data: category
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error updating category',
            error: error.message
        });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        const usedByProducts = await Product.exists({ categoryId: category._id });
        if (usedByProducts) {
            return res.status(400).json({
                success: false,
                message: 'Category is used by existing products. Reassign or delete those products first.'
            });
        }

        await category.deleteOne();

        return res.status(200).json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error deleting category',
            error: error.message
        });
    }
};
