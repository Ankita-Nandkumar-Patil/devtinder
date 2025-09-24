const express = require("express");
const ConnectionRequest = require("../models/ConnectionRequest");
const { userAuth } = require("../middlewares/auth");
const User = require("../models/user");
const requestRouter = express.Router();

requestRouter.post(
  "/request/send/:status/:userId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.userId;
      const status = req.params.status;

      // invalid status validation
      const allowedStatuses = ["interested", "ignored"];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).send("Invalid status type: " + status);
      }

      // invalid user validation
      const user = await User.findById(toUserId);
      if (!user) {
        return res.status(404).send("user does not exist");
      }

      // duplicate connection request
      const existingConnectionRequests = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });

      if (existingConnectionRequests) {
        return res.status(400).send("duplicate connection request");
      }

      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionRequest.save();
      return res.json({
        message: "Connection request sent successfully",
        data,
      });
    } catch (error) {
      return res.status(400).send("Error: " + error.message);
    }
  }
);

requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedinUser = req.user;
      const { requestId, status } = req.params;
      const allowedStatuses = ["accepted", "rejected"];

      if (!allowedStatuses.includes(status)) {
        return res.json({ message: "Status not allowed" });
      }

      // validation
      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedinUser._id,
        status: "interested",
      });

      if (!connectionRequest) {
        return res.json({ message: "invalid connection request" });
      }

      connectionRequest.status = status;
      const data = await connectionRequest.save();

      return res.json({
        message: "connection request : " + status,
        data,
      });
    } catch (error) {
      return res.status(400).send("Error: " + error.message);
    }
  }
);

module.exports = requestRouter;
