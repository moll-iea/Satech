const News = require('../models/News');

// Get all news articles
exports.getAllNews = async (req, res) => {
  try {
    const news = await News.find().sort({ date: -1 });
    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single news article
exports.getNewsById = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }
    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create news article
exports.createNews = async (req, res) => {
  const { title, category, date, summary, link } = req.body;

  if (!title || !category || !date || !summary) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const news = new News({
    title,
    category,
    date: new Date(date),
    summary,
    link: link || '#',
    imageUrl: req.file ? req.file.path : null,  // ✅ Cloudinary returns full URL in req.file.path
  });

  try {
    const savedNews = await news.save();
    res.status(201).json(savedNews);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update news article
exports.updateNews = async (req, res) => {
  const { id } = req.params;
  const { title, category, date, summary, link } = req.body;

  try {
    const news = await News.findById(id);
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }

    if (title) news.title = title;
    if (category) news.category = category;
    if (date) news.date = new Date(date);
    if (summary) news.summary = summary;
    if (link) news.link = link;
    if (req.file) {
      news.imageUrl = req.file.path;  // ✅ Same fix here
    }
    news.updatedAt = Date.now();

    const updatedNews = await news.save();
    res.status(200).json(updatedNews);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete news article
exports.deleteNews = async (req, res) => {
  const { id } = req.params;

  try {
    const news = await News.findByIdAndDelete(id);
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }
    res.status(200).json({ message: 'News deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};