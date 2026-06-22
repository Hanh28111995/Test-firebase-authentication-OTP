import { getFirestore } from "firebase-admin/firestore";

export let db = null;

const dbMiddleware = async (req, res, next) => {
  try {    
    if (!db) {
      db = getFirestore();
    }
    
    next();
  } catch (error) {
    console.error("Firestore Middleware gặp lỗi:", error.message);
    return res.status(500).json({
      message: "Database integration failed",
      error: error.message,
    });
  }
};

export default dbMiddleware;