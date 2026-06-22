import { getDB } from "../config/firebase.js";

export const findAll = async () => {
  const db = getDB();
  const snapshot = await db.collection("users").get();
  return snapshot.docs.map(doc => ({
    _id: doc.id,
    ...doc.data()
  }));
};

export const findById = async (id) => {
  const db = getDB();
  const doc = await db.collection("users").doc(id).get();
  if (!doc.exists) return null;
  return { _id: doc.id, ...doc.data() };
};

export const create = async (userData) => {
  const db = getDB();
  const docRef = await db.collection("users").add({
    ...userData,
    createdAt: new Date().toISOString()
  });
  const newDoc = await docRef.get();
  return { _id: newDoc.id, ...newDoc.data() };
};


export const updateById = async (id, updateData) => {
  const db = getDB();
  const docRef = db.collection("users").doc(id);  
  await docRef.update({
    ...updateData,
    updatedAt: new Date().toISOString()
  });
  const updatedDoc = await docRef.get();
  return { _id: updatedDoc.id, ...updatedDoc.data() };
};


export const deleteById = async (id) => {
  const db = getDB();
  const docRef = db.collection("users").doc(id);  
  const docToDelete = await docRef.get();
  if (!docToDelete.exists) return null;
  await docRef.delete();
  return { _id: docToDelete.id, ...docToDelete.data() };
};


export const findUserByEmailOrPhone = async (identifier) => {
  const db = getDB();
  const usersRef = db.collection("users");
  const promises = [];
  // Tạo câu query tìm theo email nếu có truyền vào
  if (identifier?.email) {
    promises.push(usersRef.where("email", "==", identifier.email).limit(1).get());
  }
  // Tạo câu query tìm theo số điện thoại nếu có truyền vào
  if (identifier?.phoneNumber) {
    promises.push(usersRef.where("phoneNumber", "==", identifier.phoneNumber).limit(1).get());
  }
  // Nếu không truyền cả 2, trả về null luôn
  if (promises.length === 0) return null;
  // Chạy song song cả 2 câu query để tối ưu thời gian phản hồi
  const results = await Promise.all(promises);
  // Duyệt qua kết quả xem có snapshot nào trả về dữ liệu không
  for (const snapshot of results) {
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { _id: doc.id, ...doc.data() };
    }
  }
  return null; // Không tìm thấy ai khớp cả email lẫn phone
};