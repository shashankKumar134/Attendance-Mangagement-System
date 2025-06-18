const express = require('express');
const router = express.Router();

const { register, login, getAllUsers } = require('../controllers/authController');
const protect = require('../middleware/authMiddleware'); // ✅ DO NOT use { protect } here

router.post('/register', register);
router.post('/login', login);
router.get('/users', protect, getAllUsers); // ✅ This will now work

module.exports = router;

