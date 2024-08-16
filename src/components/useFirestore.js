import {
  collection,
  doc,
  setDoc,
  updateDoc,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";

const useFirestore = (setData) => {
  const firestoreTimestampToDate = (firestoreTimestamp) => {
    const { seconds, nanoseconds } = firestoreTimestamp;
    const milliseconds = seconds * 1000 + nanoseconds / 1000000;
    const date = new Date(milliseconds);
    return date;
  };

  // ==================================================================================

  const schedulerUpdate = async () => {
    const data = await getDocs(collection(db, "scheduler"));
    const newArr = [];
    data.forEach((doc) => {
      const firestoreObj = doc.data();
      const startDate = firestoreTimestampToDate(firestoreObj.startDate);
      const endDate = firestoreTimestampToDate(firestoreObj.endDate);
      newArr.push({ ...firestoreObj, startDate, endDate });
    });
    setData(newArr);
  };

  const create = async (added) => {
    const id = Date.now().toString();
    const title = added.title ? added.title : "";
    const rRule = added.rRule ? added.rRule : "";
    await setDoc(doc(db, "scheduler", id), { id, ...added, title, rRule });
    schedulerUpdate(setData);
  };

  const update = async (changed) => {
    const [id] = Object.keys(changed);
    const rRule = changed[id].rRule ? changed[id].rRule : "";
    await updateDoc(doc(db, "scheduler", id), { ...changed[id], rRule });
    schedulerUpdate(setData);
  };

  const deleteNote = async (id) => {
    await deleteDoc(doc(db, "scheduler", id));
    schedulerUpdate(setData);
  };

  const replace = async (added, changed) => {
    const [id] = Object.keys(changed);
    await deleteNote(id, setData);
    await create(added, setData);
  };

  return { schedulerUpdate, create, update, deleteNote, replace };
};

export default useFirestore;
