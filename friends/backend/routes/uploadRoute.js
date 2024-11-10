const express = require('express');
const multer = require('multer');
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Your Cloudinary upload logic here
        // For example:
        const result = await cloudinary.uploader.upload_stream(
            { resource_type: "image" },
            (error, result) => {
                if (error) {
                    return res.status(500).json({ error: 'Upload to Cloudinary failed' });
                }
                res.status(200).json({ public_id: result.public_id, url: result.secure_url });
            }
        );

        // Pipe file data to Cloudinary upload stream
        req.file.stream.pipe(result);
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ error: 'Error uploading image' });
    }
});

module.exports = router;
