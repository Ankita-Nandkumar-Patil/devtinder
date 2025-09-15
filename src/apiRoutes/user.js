const express = require("express")
const userRouter = express.Router()
const { userAuth } = require("../middlewares/auth")
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const USER_SAFE_DATA = "firstName lastName gender about";

userRouter.get("/user/received-requests", userAuth ,async (req, res) => {
  try {
    const loggedinUser = req.user;
    const connectionRequestData = await ConnectionRequest.find({
      toUserId: loggedinUser._id,
      status: "interested",
    }).populate(
      "fromUserId", 
      USER_SAFE_DATA
    );

    res.json({
      message: "connection requests fetched successfully",
      data: connectionRequestData
    })

  } catch (error) {
    res.status(400).send("Error: " + error.message)    
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedinUser = req.user;

    const connectionRequest = await ConnectionRequest.find({
      $or: [{ toUserId: loggedinUser._id }, { fromUserId: loggedinUser._id }],
      status: "accepted"
    }).populate("fromUserId", USER_SAFE_DATA);

    const data = connectionRequest.map((row => {
      if (row.fromUserId.toString() === loggedinUser._id.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    }));

    res.json({
      message: "connections fetched successfully",
      data,
    });
  } catch (error) {
    res.status(400).send("Error: " + error.message)
  }
})

userRouter.get("/user/feed", userAuth, async (req, res) => {
  try {
    const loggedinUser = req.user;
    
    const connectionRequest = await ConnectionRequest.find({
      $or: [ 
        { toUserId: loggedinUser._id },
        {fromUserId: loggedinUser._id}
      ]
    }).select("fromUserId toUserId")

    const hideUserFromFeed = new Set();
    connectionRequest.forEach((req) => {
      hideUserFromFeed.add(req.fromUserId.toString())
      hideUserFromFeed.add(req.toUserId.toString())
    })

    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUserFromFeed) } },
        {_id: { $ne: loggedinUser._id}}
      ]
    }).select(USER_SAFE_DATA)
    res.json({
      message: "feed fetched successfully",
      data: users
    })
  } catch (error) {
    res.status(400).send("Error", error.message)
  }
  
})


module.exports = userRouter;