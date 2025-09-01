const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controllers');
const { authenticate } = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/roleMiddleware');
const { asyncHandler } = require('../utils/asyncHandler');
const { validation } = require('../middlewares/validation.middleware');
const { register, login } = require('../services/auth.validation');
const { avatarUpload, handleUploadError } = require('../utils/FileUploads');
const trackUserActivity = require('../middlewares/activityMiddleware');
const requireEmailVerified = require('../middlewares/requireEmailVerified');

/**
 * @openapi
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegister'
 *           examples:
 *             regularUser:
 *               summary: Regular user registration
 *               value:
 *                 name: John Doe
 *                 email: johndoe@example.com
 *                 password: SecurePassword123!
 *                 phone: '+1234567890'
 *                 role:
 *                   default: customer
 *             adminUser:
 *               summary: Admin user creation
 *               value:
 *                 name: Admin User
 *                 email: admin@example.com
 *                 password: AdminPassword123!
 *                 role: admin
 *             vendorUser:
 *               summary: Vendor user creation
 *               value:
 *                 name: Vendor User
 *                 email: vendoremail@example.com
 *                 password: VendorSecurePassword123!
 *                 role: vendor
 *     responses:
 *       '201':
 *         description: |
 *              User created successfully.
 *              Please check your email for verification.
 *              If you don't see it, please check your spam folder.
 *              Google signup verification is not required.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserPublic'
 *       '400':
 *         description: Invalid input or user already exists
 */
router.post(
  '/register',
  validation(register),
  asyncHandler(UserController.registerUser)
);

/**
 * @openapi
 * /users/register/vendor:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new vendor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegister'
 *     responses:
 *       201:
 *         description: Vendor created successfully
 */
router.post(
  '/register/vendor',
  validation(register),
  asyncHandler(UserController.registerVendorUser)
);

/**
 * @openapi
 * /users/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLogin'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/UserPublic'
 *                     accessToken:
 *                       type: string
 */
router.post(
  '/login',
  validation(login),
  asyncHandler(UserController.loginUser)
);

// Google OAuth routes
router.get('/google-signup', UserController.googleAuth);
router.get('/google/callback', UserController.googleCallback);

// Token management routes
/**
 * @openapi
 * /users/refresh-token:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 */
router.post('/refresh-token', asyncHandler(UserController.refreshToken));

/**
 * @openapi
 * /users/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout user
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post('/logout', asyncHandler(UserController.logOut));

// Password reset routes
/**
 * @openapi
 * /api/auth/forgot-password:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Request password reset link
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Password reset link sent to email
 */
router.post('/forgot-password', asyncHandler(UserController.forgotPassword));

/**
 * @openapi
 * /api/auth/reset-password/{token}:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Reset password using reset token
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password reset successfully
 */
router.post(
  '/reset-password/:token',
  asyncHandler(UserController.resetPassword)
);

// Email verification routes
/**
 * @openapi
 * /api/auth/verify-email/{token}:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Verify user email using verification token
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Email verified successfully
 */
router.get(
  '/verify-email/:token',
  asyncHandler(UserController.emailVerification)
);

// ============================================================================
// AUTHENTICATED ROUTES (Require authentication)
// ============================================================================

router.use(trackUserActivity);

// Profile routes
/**
 * @openapi
 * /api/auth/profile:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Get current user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserPublic'
 */
router.get(
  '/profile',
  authenticate,
  asyncHandler(UserController.getUserProfile)
);

// Avatar management routes
router.post(
  '/avatar',
  authenticate,
  avatarUpload.single('avatar'),
  asyncHandler(UserController.uploadAvatar),
  handleUploadError
);

router.delete(
  '/avatar',
  authenticate,
  asyncHandler(UserController.deleteAvatar)
);

// Email verification for authenticated users
router.post(
  '/resend-verification',
  authenticate,
  asyncHandler(UserController.resendEmailVerification)
);

// User self-management routes
router.patch(
  '/:id/deactivate',
  authenticate,
  asyncHandler(UserController.deactivateUser)
);

// ============================================================================
// ADMIN ROUTES (Require admin role)
// ============================================================================

// User management routes for admins
/**
 * @openapi
 * /api/auth/users:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Get all users (Admin only)
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserPublic'
 */
router.get(
  '/',
  authenticate,
  checkRole('admin', 'read'),
  asyncHandler(UserController.getAllUsers)
);

/**
 * @openapi
 * /users/online:
 *   get:
 *     tags: [Users]
 *     summary: Get online users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: minutes
 *         in: query
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Online users retrieved
 */
router.get(
  '/online',
  authenticate,
  checkRole('admin', 'read'),
  asyncHandler(UserController.getOnlineUsers)
);

// Individual user management by admin
router.get(
  '/:id/status',
  authenticate,
  asyncHandler(UserController.getUserStatus)
);

router.post(
  '/:id/invalidate-tokens',
  authenticate,
  asyncHandler(UserController.invalidateUserTokens)
);

router.patch(
  '/:id/activate',
  authenticate,
  checkRole('admin', 'edit'),
  asyncHandler(UserController.activateUser)
);

router.patch(
  '/verify/:id',
  authenticate,
  checkRole('admin', 'edit'),
  asyncHandler(UserController.verifyUserByAdmin)
);

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details retrieved
 *   put:
 *     tags: [Users]
 *     summary: Update user profile
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: User updated successfully
 *   delete:
 *     tags: [Users]
 *     summary: Delete user (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 */
router
  .route('/:id')
  .get(authenticate, asyncHandler(UserController.getUserById))
  .patch(
    authenticate,
    requireEmailVerified,
    asyncHandler(UserController.updateUserProfile)
  )
  .delete(
    authenticate,
    checkRole('admin', 'delete'),
    asyncHandler(UserController.deleteUser)
  );

module.exports = router;
