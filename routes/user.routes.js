const express = require("express");
const UserModel = require("../models/User.model.js");
const bcrypt = require("bcrypt");

const router = express.Router();
const saltRounds = 10;

//get a user

router.get('/:id', (req, res) => {
  const { id } = req.params;
  UserModel.findById(id)
    .then((users) => {
      if (users) {
        const { password, ...otherDetails } = users._doc;
        res.status(200).json(otherDetails);
      } else {
        res.status(404).json('No such user exists');
      }
    })
    .catch((error) => {
      res.status(500).json(error);
    });
});

//update

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { currentUserId, currentUserAdminStatus, password } = req.body;

  if (id === currentUserId || currentUserAdminStatus) {
    UserModel.findByIdAndUpdate(id, req.body, { new: true })
      .then((user) => {
        if (password) {
          const salt = bcrypt.genSaltSync(saltRounds);
          req.body.password = bcrypt.hashSync(password, salt);
        }
        res.status(200).json(user);
      })
      .catch((error) => {
        res.status(500).json(error);
      });
  } else {
    res.status(403).json('Access Denied! you can only update your own profile');
  }
});

//Delete user

router.delete('/:id', (req, res, next) => {
  const { id } = req.params;
  const { currentUserId, currentUserAdminStatus } = req.body;

  if (currentUserId === id || currentUserAdminStatus) {
    UserModel.findByIdAndDelete(id)
      .then((user) => {
        res.status(200).json('User deleted successfully');
      })
      .catch((error) => {
        res.status(500).json(error);
      });
  } else {
    res.status(403).json('Access Denied! you can only delete your own profile');
  }
});

//Follower user

router.put('/:id/follow', async (req, res) => {
  const { id } = req.params;
  const { currentUserId } = req.body;

  if (currentUserId === id) {
    res.status(403).json('Action forbidden');
  } else {
    try {
      const followUser = await UserModel.findById(id);
      const followingUser = await UserModel.findById(currentUserId);

      if (!followUser.followers.includes(currentUserId)) {
        await followUser.updateOne({ $push: { followers: currentUserId } });
        await followingUser.updateOne({ $push: { following: id } });
        res.status(200).json('User followed!');
      } else {
        res.status(403).json('User is Already followed by you');
      }
    } catch (error) {
      res.status(500).json(error);
    }
  }
});

//unfollow user

router.put('/:id/unfollow', async (req, res) => {
  const { id } = req.params;
  const { currentUserId } = req.body;

  if (currentUserId === id) {
    res.status(403).json('Action forbidden');
  } else {
    try {
      const followUser = await UserModel.findById(id);
      const followingUser = await UserModel.findById(currentUserId);

      if (followUser.followers.includes(currentUserId)) {
        await followUser.updateOne({ $pull: { followers: currentUserId } });
        await followingUser.updateOne({ $pull: { following: id } });
        res.status(200).json('User unfollowed!');
      } else {
        res.status(403).json('User is not followed by you');
      }
    } catch (error) {
      res.status(500).json(error);
    }
  }
});

module.exports = router;
