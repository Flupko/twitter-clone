const User = require("../models/userModel");
const Notification = require("../models/notificationModel");
const bcrypt = require("bcryptjs")
const {v2:cloudinary} = require("cloudinary")

const getUserProfile = async (req, res) => {
    const { username } = req.params;
    try {
        const user = await User.findOne({ username: username }).select("-password");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        console.log("Error in getUserProfile ", error.message);
        res.status(500).json({ error: error.message });
    }
};

const followUnfollowUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userToModify = await User.findById(id);
        const curUser = await User.findById(req.user._id);

        if (id == req.user._id.toString()) {
            return res
                .status(400)
                .json({ error: "You can't follow/unfollow yourself" });
        }

        if (!userToModify || !curUser) {
            return res.status(400).json({ error: "User not found" });
        }

        const isFollowing = curUser.following.includes(id);

        if (isFollowing) {
            // Unfollow the user

            await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
            await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });

            res.status(200).json({ message: "User unfollowed successfully" });

            //   TODO: return the id of the user as a response
        } else {
            // Follow user
            await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
            await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
            // Send notification
            const newNotification = new Notification({
                type: "follow",
                from: req.user._id,
                to: userToModify._id,
            });

            await newNotification.save();

            res.status(200).json({ message: "User followed successfully" });

            //   TODO: return the id of the user as a response
        }
    } catch (error) {
        console.log("Error in getUserProfile ", error.message);
        res.status(500).json({ error: error.message });
    }
};

const getSuggestedUsers = async (req, res) => {
    try {
        const userId = req.user._id;

        const usersFollowedByMe = await User.findById(userId).select("following");


        const users = await User.aggregate([
            { $match: {$and: [
                {_id:{$ne: userId}},
                {_id:{$nin: usersFollowedByMe.following}},
            ]}},
            { $sample: { size: 4 } },
            { $project: { password: 0 } }  
        ]);

        res.status(200).json(users);

    } catch (error) {
        console.log("Error in suggested users");
        res.status(500).json({error: error.message})
     }
};

const updateUser = async (req, res) => {
    const {fullname, email, username, currentPassword, newPassword, bio, link} = req.body
    let {profileImg, coverImg} = req.body

    const userId = req.user._id

    try {
        let user = await User.findById(userId)
        if(!user){
            return res.status(404).json({error: "User not found"})
        } 

        if ((!currentPassword && newPassword) || (currentPassword && !newPassword)){
            return res.status(400).json({error: "Provide both the current and new passwords"})
        }

        if(currentPassword && newPassword){
            const isMatch = await bcrypt.compare(currentPassword, user.password)
            if (!isMatch){
                return res.status(400).json({error: "Current password is incorrect"})
            }

            if(newPassword.length < 6){
                return res.status(400).json({error: "New password must be at least 6 characters long"})
            }

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt)

        }


        if (profileImg) {

            if (user.profileImg){
                await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0])
            }

            const uploadedResponse = await cloudinary.uploader.upload(profileImg)
            profileImg = uploadedResponse.secure_url;
        }

        if (coverImg) {

            if (user.coverImg){
                await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0])
            }

            const uploadedResponse = await cloudinary.uploader.upload(coverImg)
            coverImg = uploadedResponse.secure_url;
        }

        user.fullname = fullname || user.fullname;
        user.email = email || user.email
        user.username = username || user.username
        user.bio = bio || user.bio;
        user.link = link || user.link
        user.profileImg = profileImg || user.profileImg
        user.coverImg = coverImg || user.coverImg

        user = await user.save()

        delete user.password;

        return res.status(200).json(user)
        


    } catch(error) {
        console.log("Error in updateUser", error.message)
        return res.status(500).json({error: error.message})
    }
}

module.exports = { getUserProfile, followUnfollowUser, getSuggestedUsers, updateUser };
