const express = require("express")
const profileRouter = express.Router()
const { userAuth } = require("../middlewares/auth");
const { validateProfileEdit } = require("../utils/validation");

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    return res.send(user);
  } catch (error) {
    return res.status(400).send("Error: " + error.message);
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateProfileEdit(req)) {
      throw new Error("Invalid Edit Request")
    }

    const loggedInUser = req.user;
    Object.keys(req.body).forEach((key)=> loggedInUser[key] = req.body[key])

    await loggedInUser.save()
    return res.json({
      message: `${loggedInUser.firstName}, your profile was updated successfully`,
      data: loggedInUser,
    });
    
  } catch (error) {
    return res.send("Error: " + error.message);
  }
})



module.exports = profileRouter;