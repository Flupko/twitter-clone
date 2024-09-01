const Notification = require("../models/notificationModel.js");

const getNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        const notifications = await Notification.find({to: userId}).populate({path:"from", select: "username profileImg"})

        await Notification.updateMany({to: userId}, {read:true});

        res.status(200).json(notifications)
    } catch (error) {
        console.log("Error in getNotifications controller", error.message);
        res.status(500).json({error: "Internal server error"})
    }
};

const deleteNotifications = async (req, res) => { 
    try {
        const userId = req.user._id;
        await Notification.deleteMany({to:userId})
        res.status(200).json({message: "Notifications successfully deleted"})
    } catch (error) {
        console.log("Error in deleteNotifications controller", error.message);
        res.status(500).json({error: "Internal server error"})
    }

};

const deleteNotification = async (req, res) => {
    try {
        const userId = req.user._id
        const notifId = req.params.id

        const notification = await Notification.findById(notifId);

        if(!notification){
            return res.status(404).json({error: "Notification not found"})
        }

        if(notification.to.toString() !== userId.toString()){
            return res.status(403).json({error: "You are unthoraurized to delete this notification"})
        }

        await Notification.findByIdAndDelete(notifId)

        return res.status(200).json({message: "Notification successfully deleted"})


    } catch (error) {
        console.log("Error in deleteNotification controller", error.message);
        res.status(500).json({error: "Internal server error"})
    }
}

module.exports = { getNotifications, deleteNotifications, deleteNotification };
