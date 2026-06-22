import { getDB } from "../config/firebase.js"; 


export const findUserByPhone = async (phoneNumber, role) => {  
  const db = getDB();
  const snapshot = await db.collection("users")
    .where("phoneNumber", "==", phoneNumber)
    .where("role", "==", role)
    .limit(1)
    .get();
  if (snapshot.empty) return null;  
  const doc = snapshot.docs[0];
  return { _id: doc.id, ...doc.data() };
};

export const findUserByEmail = async (email, role) => {
  const db = getDB();
  const snapshot = await db.collection("users")
    .where("email", "==", email)
    .where("role", "==", role)
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { _id: doc.id, ...doc.data() };
};

export const updateAccessCode = async (user, accessCode) => {
  const db = getDB();
  const userId = user._id;
  const userRef = db.collection("users").doc(userId);
  
  await userRef.update({
    accessCode: accessCode,
    updatedAt: new Date().toISOString()
  });  
  const updatedDoc = await userRef.get();
  return { _id: updatedDoc.id, ...updatedDoc.data() };
};