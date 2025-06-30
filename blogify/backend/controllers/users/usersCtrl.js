const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const asyncHandler = require("express-async-handler");
const User = require("../../model/User/User");
const generateToken = require("../../utils/generateToken");
const expressAsyncHandler = require("express-async-handler");
const sendEmail = require("../../utils/sendEmail");
const sendAccVerificationEmail = require("../../utils/sendAccVerificationEmail");

//@desc Register a new user
//@route POST /api/v1/users/register
//@access public
exports.register = asyncHandler(async (req, res) => {
  try {
    const { username, password, email } = req.body;
    
    if (!username || !password || !email) {
      return res.status(400).json({
        status: "failed",
        message: "Please provide username, password, and email"
      });
    }

    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }] 
    });
    
    if (existingUser) {
      return res.status(400).json({
        status: "failed",
        message: existingUser.username === username ? "Username already exists" : "Email already exists"
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      status: "success",
      message: "User registered successfully",
      user: userResponse,
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      status: "failed",
      message: "Internal server error during registration"
    });
  }
});

//@desc Login user
//@route POST /api/v1/users/login
//@access public
exports.login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  
  const user = await User.findOne({ username });
  if (!user) {
    throw new Error("Invalid login credentials");
  }
  
  const isMatched = await bcrypt.compare(password, user?.password);
  if (!isMatched) {
    throw new Error("Invalid login credentials");
  }
  
  user.lastLogin = new Date();
  await user.save();
  
  res.json({
    status: "success",
    email: user?.email,
    _id: user?._id,
    username: user?.username,
    role: user?.role,
    token: generateToken(user),
    profilePicture: user?.profilePicture,
    isVerified: user?.isVerified,
  });
});

//@desc Get profile
//@route GET /api/v1/users/profile/
//@access Private
exports.getProfile = asyncHandler(async (req, res, next) => {
  const id = req.userAuth._id;
  const user = await User.findById(id)
    .populate({
      path: "posts",
      model: "Post",
    })
    .populate({
      path: "following",
      model: "User",
    })
    .populate({
      path: "followers",
      model: "User",
    })
    .populate({
      path: "blockedUsers",
      model: "User",
    })
    .populate({
      path: "profileViewers",
      model: "User",
    });
  res.json({
    status: "success",
    message: "Profile fetched",
    user,
  });
});

//@desc Get public profile
//@route GET /api/v1/users/public-profile/:userId
//@access Public
exports.getPublicProfile = asyncHandler(async (req, res, next) => {
  const userId = req.params.userId;
  const user = await User.findById(userId)
    .select("-password")
    .populate({
      path: "posts",
      populate: {
        path: "category",
      },
    });
  res.json({
    status: "success",
    message: "Public Profile fetched",
    user,
  });
});

//@desc Block user
//@route PUT /api/v1/users/block/:userIdToBlock
//@access Private
exports.blockUser = asyncHandler(async (req, res) => {
  const userIdToBlock = req.params.userIdToBlock;
  const userToBlock = await User.findById(userIdToBlock);
  if (!userToBlock) {
    throw new Error("User to block not found");
  }
  
  const userBlocking = req.userAuth._id;
  
  if (userIdToBlock.toString() === userBlocking.toString()) {
    throw new Error("Cannot block yourself");
  }
  
  const currentUser = await User.findById(userBlocking);
  
  if (currentUser?.blockedUsers?.includes(userIdToBlock)) {
    throw new Error("User already blocked");
  }
  
  currentUser.blockedUsers.push(userIdToBlock);
  await currentUser.save();
  
  res.json({
    message: "User blocked successfully",
    status: "success",
  });
});

//@desc Unblock user
//@route PUT /api/v1/users/unblock/:userIdToUnBlock
//@access Private
exports.unblockUser = asyncHandler(async (req, res) => {
  const userIdToUnBlock = req.params.userIdToUnBlock;
  const userToUnBlock = await User.findById(userIdToUnBlock);
  if (!userToUnBlock) {
    throw new Error("User to be unblock not found");
  }
  
  const userUnBlocking = req.userAuth._id;
  const currentUser = await User.findById(userUnBlocking);

  if (!currentUser.blockedUsers.includes(userIdToUnBlock)) {
    throw new Error("User not blocked");
  }
  
  currentUser.blockedUsers = currentUser.blockedUsers.filter(
    (id) => id.toString() !== userIdToUnBlock.toString()
  );
  
  await currentUser.save();
  res.json({
    status: "success",
    message: "User unblocked successfully",
  });
});

//@desc Profile viewers
//@route GET /api/v1/users/profile-viewer/:userProfileId
//@access Private
exports.profileViewers = asyncHandler(async (req, res) => {
  const userProfileId = req.params.userProfileId;
  const userProfile = await User.findById(userProfileId);
  if (!userProfile) {
    throw new Error("User to view his profile not found");
  }

  const currentUserId = req.userAuth._id;
  
  if (userProfile?.profileViewers?.includes(currentUserId)) {
    throw new Error("You have already viewed this profile");
  }
  
  userProfile.profileViewers.push(currentUserId);
  await userProfile.save();
  
  res.json({
    message: "You have successfully viewed his/her profile",
    status: "success",
  });
});

//@desc Following user
//@route PUT /api/v1/users/following/:userIdToFollow
//@access Private
exports.followingUser = asyncHandler(async (req, res) => {
  const currentUserId = req.userAuth._id;
  const userToFollowId = req.params.userToFollowId;
  
  if (currentUserId.toString() === userToFollowId.toString()) {
    throw new Error("You cannot follow yourself");
  }
  
  await User.findByIdAndUpdate(
    currentUserId,
    { $addToSet: { following: userToFollowId } },
    { new: true }
  );
  
  await User.findByIdAndUpdate(
    userToFollowId,
    { $addToSet: { followers: currentUserId } },
    { new: true }
  );
  
  res.json({
    status: "success",
    message: "You have followed the user successfully",
  });
});

//@desc Unfollowing user
//@route PUT /api/v1/users/unfollowing/:userIdToUnFollow
//@access Private
exports.unFollowingUser = asyncHandler(async (req, res) => {
  const currentUserId = req.userAuth._id;
  const userToUnFollowId = req.params.userToUnFollowId;

  if (currentUserId.toString() === userToUnFollowId.toString()) {
    throw new Error("You cannot unfollow yourself");
  }
  
  await User.findByIdAndUpdate(
    currentUserId,
    { $pull: { following: userToUnFollowId } },
    { new: true }
  );
  
  await User.findByIdAndUpdate(
    userToUnFollowId,
    { $pull: { followers: currentUserId } },
    { new: true }
  );
  
  res.json({
    status: "success",
    message: "You have unfollowed the user successfully",
  });
});

//@desc Forgot password
//@route POST /api/v1/users/forgot-password
//@access Public
exports.forgotpassword = expressAsyncHandler(async (req, res) => {
  const { email } = req.body;
  const userFound = await User.findOne({ email });
  if (!userFound) {
    throw new Error("There's No Email In Our System");
  }
  
  const resetToken = await userFound.generatePasswordResetToken();
  await userFound.save();

  sendEmail(email, resetToken);
  res.status(200).json({ message: "Password reset email sent", resetToken });
});

//@desc Reset password
//@route POST /api/v1/users/reset-password/:resetToken
//@access Public
exports.resetPassword = expressAsyncHandler(async (req, res) => {
  const { resetToken } = req.params;
  const { password } = req.body;
  
  const cryptoToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
    
  const userFound = await User.findOne({
    passwordResetToken: cryptoToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  
  if (!userFound) {
    throw new Error("Password reset token is invalid or has expired");
  }
  
  const salt = await bcrypt.genSalt(10);
  userFound.password = await bcrypt.hash(password, salt);
  userFound.passwordResetExpires = undefined;
  userFound.passwordResetToken = undefined;
  
  await userFound.save();
  res.status(200).json({ message: "Password reset successfully" });
});

//@desc Send account verification email
//@route POST /api/v1/users/account-verification-email/
//@access Private
exports.accountVerificationEmail = expressAsyncHandler(async (req, res) => {
  const user = await User.findById(req?.userAuth?._id);
  if (!user) {
    throw new Error("User not found");
  }
  
  const token = await user.generateAccVerificationToken();
  await user.save();
  
  sendAccVerificationEmail(user?.email, token);
  res.status(200).json({
    message: `Account verification email sent ${user?.email}`,
  });
});

//@desc Verify account
//@route POST /api/v1/users/verify-account/:verifyToken
//@access Private
exports.verifyAccount = expressAsyncHandler(async (req, res) => {
  const { verifyToken } = req.params;
  
  const cryptoToken = crypto
    .createHash("sha256")
    .update(verifyToken)
    .digest("hex");
    
  const userFound = await User.findOne({
    accountVerificationToken: cryptoToken,
    accountVerificationExpires: { $gt: Date.now() },
  });
  
  if (!userFound) {
    throw new Error("Account verification token is invalid or has expired");
  }
  
  userFound.isVerified = true;
  userFound.accountVerificationExpires = undefined;
  userFound.accountVerificationToken = undefined;
  
  await userFound.save();
  res.status(200).json({ message: "Account successfully verified" });
});

//@desc Upload profile picture
//@route PUT /api/v1/users/upload-profile-image
//@access Private
exports.uploadProfilePicture = asyncHandler(async (req, res) => {
  const userFound = await User.findById(req?.userAuth?._id);
  if (!userFound) {
    throw new Error("User not found");
  }
  
  const user = await User.findByIdAndUpdate(
    req?.userAuth?._id,
    { $set: { profilePicture: req?.file?.path } },
    { new: true }
  );

  res.json({
    status: "success",
    message: "User profile image updated successfully",
    user,
  });
});

//@desc Upload cover image
//@route PUT /api/v1/users/upload-cover-image
//@access Private
exports.uploadCoverImage = asyncHandler(async (req, res) => {
  const userFound = await User.findById(req?.userAuth?._id);
  if (!userFound) {
    throw new Error("User not found");
  }
  
  const user = await User.findByIdAndUpdate(
    req?.userAuth?._id,
    { $set: { coverImage: req?.file?.path } },
    { new: true }
  );

  res.json({
    status: "success",
    message: "User cover image updated successfully",
    user,
  });
});

//@desc Update user profile
//@route PUT /api/v1/users/update-profile
//@access Private
exports.updateUserProfile = asyncHandler(async (req, res) => {
  const userId = req.userAuth?._id;
  const userFound = await User.findById(userId);
  if (!userFound) {
    throw new Error("User not found");
  }
  
  const { username, email } = req.body;
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      email: email ? email : userFound?.email,
      username: username ? username : userFound?.username,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  
  res.status(200).json({
    status: "success",
    message: "User successfully updated",
    user: updatedUser,
  });
});