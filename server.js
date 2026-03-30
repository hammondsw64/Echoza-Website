const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const safeOriginalName = file.originalname.replace(/\s+/g, '_');
    cb(null, `${timestamp}-${safeOriginalName}`);
  }
});

const allowedTypes = new Set([
  'audio/mpeg',
  'audio/wav',
  'audio/x-wav',
  'audio/flac',
  'audio/x-flac',
  'audio/aac',
  'audio/ogg',
  'audio/mp4'
]);

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (allowedTypes.has(file.mimetype)) {
      cb(null, true);
      return;
    }

    cb(new Error('Only audio files are allowed.'));
  },
  limits: {
    fileSize: 25 * 1024 * 1024
  }
});

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(uploadsDir));

app.get('/api/songs', async (req, res) => {
  try {
    const files = await fs.promises.readdir(uploadsDir);
    const songs = await Promise.all(
      files.map(async (filename) => {
        const filePath = path.join(uploadsDir, filename);
        const stats = await fs.promises.stat(filePath);

        return {
          filename,
          size: stats.size,
          uploadedAt: stats.birthtime,
          url: `/uploads/${encodeURIComponent(filename)}`
        };
      })
    );

    songs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    res.json(songs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load songs.' });
  }
});

app.post('/api/upload', upload.single('song'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file was uploaded.' });
    return;
  }

  res.status(201).json({
    message: 'Song uploaded successfully.',
    song: {
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      url: `/uploads/${encodeURIComponent(req.file.filename)}`
    }
  });
});

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    res.status(400).json({ error: 'File is too large. Maximum size is 25MB.' });
    return;
  }

  if (error) {
    res.status(400).json({ error: error.message || 'Upload failed.' });
    return;
  }

  next();
});

app.listen(PORT, () => {
  console.log(`Echoza running on http://localhost:${PORT}`);
});
