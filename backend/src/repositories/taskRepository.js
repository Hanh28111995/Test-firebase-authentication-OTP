import { getDB } from "../config/firebase.js";


export const findAll = async (filter = {}) => {
  const db = getDB();
  let query = db.collection("tasks");
  Object.keys(filter).forEach((key) => {
    if (filter[key] !== undefined && filter[key] !== null) {
      query = query.where(key, "==", filter[key]);
    }
  });
  const snapshot = await query.get();  
  return snapshot.docs.map(doc => ({
    _id: doc.id,
    ...doc.data()
  }));
};

export const findById = async (id) => {
  const db = getDB();
  const doc = await db.collection("tasks").doc(id).get();
  if (!doc.exists) return null;  
  return { _id: doc.id, ...doc.data() };
};

export const createNew = async (taskData) => {
  const db = getDB();
  const docRef = await db.collection("tasks").add({
    ...taskData,
    createdAt: new Date().toISOString()
  });

  const newDoc = await docRef.get();
  return { _id: newDoc.id, ...newDoc.data() };
};

export const updateById = async (id, updateData) => {
  const db = getDB();
  const docRef = db.collection("tasks").doc(id);  
  await docRef.update({
    ...updateData,
    updatedAt: new Date().toISOString()
  });
  const updatedDoc = await docRef.get();
  return { _id: updatedDoc.id, ...updatedDoc.data() };
};

export const deleteById = async (id) => {
  const db = getDB();
  const docRef = db.collection("tasks").doc(id);    
  const docToDelete = await docRef.get();
  if (!docToDelete.exists) return null;

  await docRef.delete();
  return { _id: docToDelete.id, ...docToDelete.data() };
};