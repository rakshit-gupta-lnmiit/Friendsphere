const User = require('./models/User'); // Adjust path as necessary

async function findOrCreateUser(googleUser) {
  try {
    // Find user by email (assumes Google user's email is unique)
    let user = await User.findOne({ email: googleUser.email });

    if (!user) {
      // User not found, create a new one
      user = new User({
        fullname: googleUser.displayName || "No Name",
        username: googleUser.email.split("@")[0], // or any logic to generate a username
        email: googleUser.email,
        avatar: googleUser.photoURL || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png",
        password: "", // No password for Google users
        role: "user", // Default role, you can adjust if necessary
      });

      await user.save(); // Save the new user in the database
    }

    return user; // Return the existing or new user document
  } catch (error) {
    console.error("Error finding or creating user:", error);
    throw new Error("User registration failed.");
  }
}
module.exports  = findOrCreateUser;