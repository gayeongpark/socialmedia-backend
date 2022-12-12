const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required.'],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required.'],
    },
    firstname: {
      type: String,
      required: [true, 'Firstname is required.'],
    },
    lastname: {
      type: String,
      required: [true, 'Lastname is required.'],
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    profilePicture: String,
    coverPicture: String,
    location: String,
    followers: [],
    following: [],
  },
  { timestamps: true }
);

const User = model("User", userSchema);

module.exports = User;
