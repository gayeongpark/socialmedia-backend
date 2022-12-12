const { Schema, model } = require("mongoose");

const postSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    description: String,
    likes: [],
    image: String,
  },
  {
    timestamps: true,
  }
);

const Post = model("Post", postSchema);

module.exports = Post;
