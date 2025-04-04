const mongoose = require("mongoose");
const User = require("./userModel"); // Update the path to your User model

async function createAdmin() {
  try {
    // Replace "your-database-name" with the actual name of your database
    const uri ="mongodb+srv://rajesh:rajesh4757@cluster0.wbf7y.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

    // Connect to MongoDB
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Admin data
    const adminData = {
      firstname: "Admin",
      lastname: "User",
      email: "admin3@gmail.com",
      mobile: "1234567890",
      password: "admin123",
    };

    // Check if an admin already exists
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      console.log("Admin user already exists!");
      return;
    }

    // Register the admin
    const admin = await User.create({
      ...adminData,
      role: "admin",
    });

    console.log("Admin created successfully:", admin);
  } catch (error) {
    console.error("Error creating admin:", error.message);
  } finally {
    // Close the database connection
    mongoose.connection.close();
  }
}

createAdmin();

