import { getDB } from "../config/firebase.js";


const Ignore_AccessCode = (doc) => {
  if (!doc.exists) return null;
  const { accessCode, ...restData } = doc.data();  
  return {
    _id: doc.id,
    ...restData
  };
};

export const findAll = async () => {
  const db = getDB();
  const snapshot = await db.collection("users").get();    
  return snapshot.docs.map(doc => Ignore_AccessCode(doc));
};

export const findById = async (id) => {
  const db = getDB();
  const doc = await db.collection("users").doc(id).get();
  if (!doc.exists) return null;
  
  return Ignore_AccessCode(doc);
};

export const create = async (userData) => {
  const db = getDB();
  const docRef = await db.collection("users").add({
    ...userData,
    createdAt: new Date().toISOString()
  });
  const newDoc = await docRef.get();
  
  return Ignore_AccessCode(newDoc);
};

export const updateById = async (id, updateData) => {
  const db = getDB();
  const docRef = db.collection("users").doc(id);  
  await docRef.update({
    ...updateData,
    updatedAt: new Date().toISOString()
  });
  const updatedDoc = await docRef.get();
  
  return Ignore_AccessCode(updatedDoc);
};

export const deleteById = async (id) => {
  const db = getDB();
  const docRef = db.collection("users").doc(id);  
  const docToDelete = await docRef.get();
  if (!docToDelete.exists) return null;
  await docRef.delete();
  
  return Ignore_AccessCode(docToDelete);
};

export const findUserByEmailOrPhone = async (identifier) => {
  const db = getDB();
  const usersRef = db.collection("users");
  const promises = [];
  
  if (identifier?.email) {
    promises.push(usersRef.where("email", "==", identifier.email).limit(1).get());
  }
  if (identifier?.phoneNumber) {
    promises.push(usersRef.where("phoneNumber", "==", identifier.phoneNumber).limit(1).get());
  }
  
  if (promises.length === 0) return null;
  
  const results = await Promise.all(promises);
  
  for (const snapshot of results) {
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return Ignore_AccessCode(doc); // Loại bỏ accessCode tại đây
    }
  }
  return null;
};

export const findUserWithSecret = async (id) => {
  if (!id) return null;

  const db = getDB();
  try {    
    const docRef = db.collection("users").doc(id);
    const docSnap = await docRef.get();    
    if (!docSnap.exists) {
      return null;
    }    
    return { 
      _id: docSnap.id, 
      ...docSnap.data() 
    };
  } catch (error) {
    console.error("Lỗi khi tìm user bằng ID trong Repo:", error.message);
    return null;
  }
};
