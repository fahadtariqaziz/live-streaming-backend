const express = require("express");
const { registerUser, loginUser, logout, forgotPassword, resetPassword, getUserDetails, updatePassword, updateProfile, getAllUsers, getSingleUser, updateUserRole, deleteUser } = require("../controllers/userController");
const {isAuthenticatedUser , authorizeRoles } = require('../middleware/auth');

const router = express.Router();


router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logout);

router.route("/password/forgot").post(forgotPassword);  //forgotPasword kiya tou import ho gya
router.route("/password/reset/:token").put(resetPassword);
//router.put('/api/v1/password/reset/:token', resetPassword);

router.route("/me").get(isAuthenticatedUser ,getUserDetails);
router.route("/password/update").put(isAuthenticatedUser ,updatePassword);
router.route("/me/update").put(isAuthenticatedUser ,updateProfile);


router.route("/admin/users").get(isAuthenticatedUser, authorizeRoles("admin"), getAllUsers);  //isAuthenticated ka matlb login ho  or role ka matlb bhi admin ho
router.route("/admin/user/:id")
.get(isAuthenticatedUser, authorizeRoles("admin"), getSingleUser)
.put(isAuthenticatedUser, authorizeRoles("admin"), updateUserRole)
.delete(isAuthenticatedUser, authorizeRoles("admin"), deleteUser);

module.exports = router;