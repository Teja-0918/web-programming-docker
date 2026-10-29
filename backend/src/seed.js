const Product = require("./model/products.model");
const User = require("./model/user.model");

const initialProducts = [
  {
    name: "Urban Canvas Backpack",
    description: "Water-resistant travel backpack with 15.6 inch padded laptop compartment and ergonomic straps.",
    price: 1499,
    category: "Accessories",
    stock: 30,
    deliveryDays: 4,
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Fitness Smartwatch Pro",
    description: "AMOLED display, 24/7 heart-rate tracking, SpO2 sensor, and 14-day ultra-long battery life.",
    price: 3499,
    category: "Electronics",
    stock: 20,
    deliveryDays: 2,
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Smart Wireless Headphones",
    description: "Active noise cancellation with 40-hour battery life and studio-grade deep bass acoustics.",
    price: 2999,
    category: "Electronics",
    stock: 15,
    deliveryDays: 3,
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Ergonomic Mechanical Keyboard",
    description: "RGB mechanical gaming and productivity keyboard with hot-swappable tactile brown switches.",
    price: 4999,
    category: "Electronics",
    stock: 12,
    deliveryDays: 3,
    imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
  },
];

const initialUsers = [
  {
    name: "Store Admin",
    email: "admin@mernexus.com",
    role: "admin",
    phone: "+91 9999900000",
    age: 32,
    address: "MERNEXUS HQ, Tech Park",
    city: "Gurugram",
    state: "Haryana",
    pincode: "122002",
  },
  {
    name: "Rahul Sharma",
    email: "rahul.sharma@example.com",
    role: "customer",
    phone: "+91 9876543210",
    age: 28,
    address: "Flat 402, Lotus Towers, Road No. 3",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "500081",
  },
  {
    name: "Priya Patel",
    email: "priya.patel@example.com",
    role: "customer",
    phone: "+91 9123456780",
    age: 26,
    address: "Apt 12B, Green Park, Indiranagar",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560001",
  },
];

async function seedInitialData() {
  try {
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      await Product.insertMany(initialProducts);
      console.log(`[Seed] Seeded ${initialProducts.length} initial products.`);
    }

    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await User.insertMany(initialUsers);
      console.log(`[Seed] Seeded ${initialUsers.length} initial users.`);
    }
  } catch (err) {
    console.error("[Seed] Error seeding initial data:", err.message);
  }
}

module.exports = seedInitialData;
