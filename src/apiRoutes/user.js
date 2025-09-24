const express = require("express");
const userRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const User = require("../models/user");
const ConnectionRequest = require("../models/ConnectionRequest");
const USER_SAFE_DATA = "firstName lastName gender about age photoUrl skills";

userRouter.get("/user/received-requests", userAuth, async (req, res) => {
  try {
    const loggedinUser = req.user;
    const connectionRequestData = await ConnectionRequest.find({
      toUserId: loggedinUser._id,
      status: "interested",
    }).populate("fromUserId", USER_SAFE_DATA);

    return res.json({
      message: "connection requests fetched successfully",
      data: connectionRequestData,
    });
  } catch (error) {
    return res.status(400).send("Error: " + error.message);
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedinUser = req.user;

    const connectionRequest = await ConnectionRequest.find({
      $or: [{ toUserId: loggedinUser._id }, { fromUserId: loggedinUser._id }],
      status: "accepted",
    }).populate("fromUserId", USER_SAFE_DATA);

    const data = connectionRequest.map((row) => {
      if (row.fromUserId.toString() === loggedinUser._id.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    });

    return res.json({
      message: "connections fetched successfully",
      data,
    });
  } catch (error) {
    return res.status(400).send("Error: " + error.message);
  }
});

userRouter.get("/user/feed", userAuth, async (req, res) => {
  try {
    const loggedinUser = req.user;
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit > 50 ? 50 : limit; //to make sure attacker won't request tooo many users
    const skip = (page - 1) * limit;
    const connectionRequest = await ConnectionRequest.find({
      $or: [{ toUserId: loggedinUser._id }, { fromUserId: loggedinUser._id }],
    }).select("fromUserId toUserId");

    const hideUserFromFeed = new Set();
    connectionRequest.forEach((req) => {
      hideUserFromFeed.add(req.fromUserId.toString());
      hideUserFromFeed.add(req.toUserId.toString());
    });

    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUserFromFeed) } },
        { _id: { $ne: loggedinUser._id } },
      ],
    })
      .select(USER_SAFE_DATA)
      .skip(skip)
      .limit(limit);

    console.log(users.length);
    return res.json({
      message: "feed fetched successfully",
      data: users,
    });
  } catch (error) {
    return res.status(400).send("Error" + error.message);
  }
});

module.exports = userRouter;
