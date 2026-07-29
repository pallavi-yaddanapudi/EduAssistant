const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Document = require('../models/Document');
const { protect, authorize } = require('../middleware/auth');

// Make sure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage engine configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename to avoid overwrites
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// Multer file filter (PDF, DOCX, JPG, PNG)
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.docx', '.jpg', '.jpeg', '.png'];
  const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
  ];

  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  if (allowedExtensions.includes(ext) || allowedMimeTypes.includes(mime)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOCX, JPG, and PNG documents are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// SSE active clients array
let sseClients = [];

// @desc    Register SSE connection for real-time document updates
// @route   GET /api/documents/stream
// @access  Private (Student & Teacher)
router.get('/stream', protect, (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  // Send initial message
  res.write('data: {"connected": true}\n\n');

  const clientId = Date.now();
  const newClient = {
    id: clientId,
    userId: req.user._id.toString(),
    res,
  };

  sseClients.push(newClient);
  console.log(`SSE Client connected: User ${req.user.username} (${req.user.role})`);

  req.on('close', () => {
    sseClients = sseClients.filter((client) => client.id !== clientId);
    console.log(`SSE Client disconnected: User ${req.user.username}`);
  });
});

// Helper function to broadcast updates to a specific student user
const notifyStudentOfUpdate = (userId, document) => {
  const targetClients = sseClients.filter((c) => c.userId === userId.toString());
  targetClients.forEach((client) => {
    client.res.write(`data: ${JSON.stringify({ type: 'STATUS_UPDATE', document })}\n\n`);
  });
};

// Helper function to broadcast new upload to all teachers
const notifyTeachersOfNewUpload = (document) => {
  // We can notify teachers if they have stream open
  sseClients.forEach((client) => {
    // If we want teachers to receive all updates
    client.res.write(`data: ${JSON.stringify({ type: 'NEW_UPLOAD', document })}\n\n`);
  });
};

// @desc    Upload a new document (Student only)
// @route   POST /api/documents/upload
// @access  Private (Student)
router.post(
  '/upload',
  protect,
  authorize('student'),
  upload.single('document'),
  async (req, res) => {
    try {
      const { title, description } = req.body;

      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Please upload a document file' });
      }

      if (!title || !description) {
        // Remove uploaded file if metadata validation fails
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ success: false, message: 'Please provide both title and description' });
      }

      const document = await Document.create({
        title,
        description,
        filename: req.file.filename,
        originalname: req.file.originalname,
        filepath: req.file.path,
        fileType: req.file.mimetype,
        uploadedBy: req.user._id,
        uploadedByName: req.user.username,
        status: 'unverified',
      });

      // Notify teachers about the new document in real-time
      notifyTeachersOfNewUpload(document);

      res.status(201).json({
        success: true,
        message: 'Document uploaded successfully',
        document,
      });
    } catch (error) {
      console.error(error);
      // Clean up uploaded file in case of error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
  }
);

// @desc    Get student's own documents (Student only)
// @route   GET /api/documents/my
// @access  Private (Student)
router.get('/my', protect, authorize('student'), async (req, res) => {
  try {
    const documents = await Document.find({ uploadedBy: req.user._id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      documents,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Get all documents with search and filtering (Teacher only)
// @route   GET /api/documents/all
// @access  Private (Teacher)
router.get('/all', protect, authorize('teacher'), async (req, res) => {
  try {
    const { search, status, fileType } = req.query;
    
    // Construct query object
    const query = {};

    // Search filter (title, description, or student username)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { uploadedByName: { $regex: search, $options: 'i' } },
      ];
    }

    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    // File type filter
    if (fileType && fileType !== 'all') {
      if (fileType === 'pdf') {
        query.fileType = 'application/pdf';
      } else if (fileType === 'docx') {
        query.fileType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      } else if (fileType === 'image') {
        query.fileType = { $in: ['image/jpeg', 'image/png'] };
      }
    }

    const documents = await Document.find(query).sort({ createdAt: -1 });
    res.json({
      success: true,
      documents,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Verify/Approve document status (Teacher only)
// @route   PATCH /api/documents/:id/verify
// @access  Private (Teacher)
router.patch('/:id/verify', protect, authorize('teacher'), async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    if (document.status === 'verified') {
      return res.status(400).json({ success: false, message: 'Document is already verified' });
    }

    document.status = 'verified';
    await document.save();

    // Notify the student who uploaded the document immediately via SSE
    notifyStudentOfUpdate(document.uploadedBy, document);

    res.json({
      success: true,
      message: 'Document verified successfully',
      document,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Error handling for Multer uploads
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'File is too large. Maximum size allowed is 10MB.' });
    }
    return res.status(400).json({ success: false, message: err.message });
  } else if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next();
});

module.exports = router;
