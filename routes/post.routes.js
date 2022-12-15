const express = require('express');
const mongoose = require('mongoose');
// const { request } = require('../app.js');
const PostModel = require('../models/Post.model.js');
const UserModel = require('../models/User.model.js');

const router = express.Router();

//Create new Post

router.post('/users/:id/post', (req, res) => {
  console.log("backend call");
console.log(req.body)
PostModel.create(req.body).then((post) => {
  console.log(post);
  res.status(200).json('Post created');
})

  // const newPost = new PostModel(req.body);
  // newPost
  //   .save()
  //   .then((post) => {
  //     res.status(200).json('Post created');
  //   })
  //   .catch((error) => {
  //     res.status(500);
  //   });
});

//Get a post

router.get('/users/:id/post', (req, res) => {
  const { id } = req.params;

  PostModel.find({userId: id})
    .then((post) => {
      res.status(200).json(post);
    })
    .catch((error) => {
      res.status(500);
    });
});

// Update a post

router.put('/users/:id/post', async (req, res) => {
  const postId = req.params.id;
  const { userId } = req.body;
  try {
    const post = await PostModel.findById(postId);
    if (post.userId === userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).json('Post Updated');
    } else {
      res.status(403).json('Action forbidden');
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

//Delete a post

router.delete('/users/:id/post', async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  try {
    const post = await PostModel.findById(id);
    if (post.userId === userId) {
      await post.deleteOne({ $set: req.body });
      res.status(200).json('Post Deleted');
    } else {
      res.status(403).json('Action forbidden');
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

//Likes/disikes post

router.put('users/:id/post/like', async (req, res) => {
  const id = req.params.id;
  const { userId } = req.body;
  try {
    const post = await PostModel.findById(id);
    if (!post.likes.includes(userId)) {
      await post.updateOne({ $push: { likes: userId } });
      res.status(200).json('Post liked');
    } else {
      await post.updateOne({ $pull: { likes: userId } });
      res.status(200).json('Post Unliked');
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

//Get timeline posts
router.get('users/:id/post/timeline', async (req, res) => {
  const userId = req.params.id;
  try {
    const currentUserPosts = await PostModel.find({ userId: userId });
    const followingPosts = await UserModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: 'posts',
          localField: 'following',
          foreignField: 'userId',
          as: 'followingPosts',
        },
      },
      {
        $project: {
          followingPosts: 1,
          _id: 0,
        },
      },
    ]);

    res.status(200).json(
      currentUserPosts
        .concat(...followingPosts[0].followingPosts)
        .sort((a, b) => {
          return b.createdAt - a.createdAt;
        })
    );
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
