const Video = require('../models/Video');
const cloudinary = require('../config/cloudinary');

const uploadToCloudinary = (fileBuffer, filename, folder = 'satech/videos') => {
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

exports.getVideos = async (req, res) => {
    try {
        const videos = await Video.find().sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: videos.length,
            data: videos
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching videos',
            error: error.message
        });
    }
};

exports.createVideo = async (req, res) => {
    try {
        const { title, url, description } = req.body;
        
        if (!title || !url) {
            return res.status(400).json({
                success: false,
                message: 'Title and URL are required'
            });
        }

        let thumbnailUrl = '';
        let thumbnailPublicId = '';

        if (req.file) {
            try {
                const uploadResult = await uploadToCloudinary(req.file.buffer, req.file.originalname);
                thumbnailUrl = uploadResult.secure_url;
                thumbnailPublicId = uploadResult.public_id;
            } catch (uploadError) {
                return res.status(400).json({
                    success: false,
                    message: 'Error uploading thumbnail',
                    error: uploadError.message
                });
            }
        }

        const video = new Video({
            title,
            url,
            description: description || '',
            thumbnail: thumbnailUrl,
            thumbnailPublicId
        });

        await video.save();

        return res.status(201).json({
            success: true,
            message: 'Video created successfully',
            data: video
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error creating video',
            error: error.message
        });
    }
};

exports.updateVideo = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, url, description } = req.body;

        if (!title || !url) {
            return res.status(400).json({
                success: false,
                message: 'Title and URL are required'
            });
        }

        const video = await Video.findById(id);
        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        video.title = title;
        video.url = url;
        video.description = description || video.description;

        if (req.file) {
            try {
                if (video.thumbnailPublicId) {
                    await deleteFromCloudinary(video.thumbnailPublicId);
                }
                const uploadResult = await uploadToCloudinary(req.file.buffer, req.file.originalname);
                video.thumbnail = uploadResult.secure_url;
                video.thumbnailPublicId = uploadResult.public_id;
            } catch (uploadError) {
                return res.status(400).json({
                    success: false,
                    message: 'Error uploading thumbnail',
                    error: uploadError.message
                });
            }
        }

        await video.save();

        return res.status(200).json({
            success: true,
            message: 'Video updated successfully',
            data: video
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error updating video',
            error: error.message
        });
    }
};

exports.deleteVideo = async (req, res) => {
    try {
        const { id } = req.params;

        const video = await Video.findById(id);
        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        if (video.thumbnailPublicId) {
            await deleteFromCloudinary(video.thumbnailPublicId);
        }

        await Video.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: 'Video deleted successfully'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error deleting video',
            error: error.message
        });
    }
};