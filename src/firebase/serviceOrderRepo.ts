import firebase_app from "./firebaseAppConfig"
import {
  getFirestore,
  collection,
  doc,
  query,
  where,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
} from "firebase/firestore";

// Inicializa o Firestore
export const db = getFirestore(firebase_app, "oficina-db");

// ==========================
// CRUD para ServiceOrder
// ==========================

// CREATE
export async function createServiceOrder(data: any) {
  const docRef = await addDoc(collection(db, "ServiceOrder"), data);
  return { id: docRef.id };
}

// READ ALL
export async function getServiceOrders() {
  const items: any[] = [];
  const q = query(collection(db, "ServiceOrder"));
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((doc) => {
    items.push({ id: doc.id, ...doc.data() });
  });

  return items;
}

// READ ONE
export async function getServiceOrderById(id: string) {
  const docRef = doc(db, "ServiceOrder", id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    return null;
  }
}

// UPDATE
export async function updateServiceOrder(id: string, data: any) {
  const docRef = doc(db, "ServiceOrder", id);
  await updateDoc(docRef, data);
  return { success: true };
}

// DELETE
export async function deleteServiceOrder(id: string) {
  const docRef = doc(db, "ServiceOrder", id);
  await deleteDoc(docRef);
  return { success: true };
}

// ==========================
// CRUD para BudgetItem
// ==========================

// CREATE
export async function createBudgetItem(data: any) {
  const docRef = await addDoc(collection(db, "BudgetItem"), data);
  return { id: docRef.id };
}

// READ ALL
export async function getBudgetItems() {
  const items: any[] = [];
  const q = query(collection(db, "BudgetItem"));
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((doc) => {
    items.push({ id: doc.id, ...doc.data() });
  });

  return items;
}

// READ by ServiceOrderId
export async function getBudgetItemsByServiceOrderId(serviceOrderId: string) {
  const items: any[] = [];
  const q = query(
    collection(db, "BudgetItem"),
    where("serviceOrderId", "==", doc(db, "ServiceOrder", serviceOrderId))
  );
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((doc) => {
    items.push({ id: doc.id, ...doc.data() });
  });

  return items;
}

// UPDATE
export async function updateBudgetItem(id: string, data: any) {
  const docRef = doc(db, "BudgetItem", id);
  await updateDoc(docRef, data);
  return { success: true };
}

// DELETE
export async function deleteBudgetItem(id: string) {
  const docRef = doc(db, "BudgetItem", id);
  await deleteDoc(docRef);
  return { success: true };
}
