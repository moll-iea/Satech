const Exhibition = require('../models/Exhibition');

exports.getExhibitions = async (req, res) => {
    try {
        const exhibitions = await Exhibition.find()
            .sort({ row: 1, order: 1, createdAt: 1 });

        return res.status(200).json({
            success: true,
            count: exhibitions.length,
            data: exhibitions
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching exhibitions',
            error: error.message
        });
    }
};

exports.createExhibition = async (req, res) => {
    try {
        const { name, link, row, order } = req.body;

        if (!name || !link || !row) {
            return res.status(400).json({
                success: false,
                message: 'Name, link, and row are required.'
            });
        }

        if (![1, 2].includes(parseInt(row))) {
            return res.status(400).json({
                success: false,
                message: 'Row must be 1 or 2.'
            });
        }

        const exhibition = await Exhibition.create({
            name: name.trim(),
            link: link.trim(),
            row: parseInt(row),
            order: order ? parseInt(order) : 0
        });

        return res.status(201).json({
            success: true,
            message: 'Exhibition created successfully',
            data: exhibition
        });
    } catch (error) {
        console.error('Create exhibition error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Error creating exhibition',
            error: error.message
        });
    }
};

exports.updateExhibition = async (req, res) => {
    try {
        const { name, link, row, order } = req.body;
        const updates = {};

        const existingExhibition = await Exhibition.findById(req.params.id);

        if (!existingExhibition) {
            return res.status(404).json({
                success: false,
                message: 'Exhibition not found'
            });
        }

        if (typeof name === 'string') {
            updates.name = name.trim();
        }

        if (typeof link === 'string') {
            updates.link = link.trim();
        }

        if (row) {
            if (![1, 2].includes(parseInt(row))) {
                return res.status(400).json({
                    success: false,
                    message: 'Row must be 1 or 2.'
                });
            }
            updates.row = parseInt(row);
        }

        if (order !== undefined) {
            updates.order = parseInt(order);
        }

        const updatedExhibition = await Exhibition.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            success: true,
            message: 'Exhibition updated successfully',
            data: updatedExhibition
        });
    } catch (error) {
        console.error('Update exhibition error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Error updating exhibition',
            error: error.message
        });
    }
};

exports.deleteExhibition = async (req, res) => {
    try {
        const exhibition = await Exhibition.findById(req.params.id);

        if (!exhibition) {
            return res.status(404).json({
                success: false,
                message: 'Exhibition not found'
            });
        }

        await Exhibition.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            success: true,
            message: 'Exhibition deleted successfully'
        });
    } catch (error) {
        console.error('Delete exhibition error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Error deleting exhibition',
            error: error.message
        });
    }
};
        