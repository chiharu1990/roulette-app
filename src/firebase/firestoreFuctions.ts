import { db } from "./firebase";
import {collection, addDoc, deleteDoc, doc, updateDoc, getDocs} from "firebase/firestore";

// 名前をFirestoreに追加する関数
export const addNameToFirestore = async (newName: string) => {
    try {
        const docRef = await addDoc(collection(db, "names"),{
            name: newName,
            timestamp: new Date(),
        });
        console.log("Document written with ID:" ,docRef.id);
    } catch(e) {
        console.error("Error adding dovument: " , e);
    }
};

// 名前をFirestoreから削除する関数
export const removeNameFromFirestore = async (nameId: string) => {
    try{
        await deleteDoc(doc(db, "names", nameId));
        console.log("Document successfully deleted!");
    } catch(e) {
        console.error("Error removing document: ", e);
    }
};

// 名前をFirestoreで更新する関数
export const updateNameInFirestore = async(nameId: string, newName: string) => {
    try{
        await updateDoc(doc(db, "names", nameId),{
            name: newName,
        });
        console.log("Document successfully updated!");
    } catch (e) {
        console.error("Error updating document: ", e);
    }
}

// Firestoreから名前一覧を取得する関数
export const getNamesFromFirestore = async () => {
    const querySnapshot = await getDocs(collection(db, "names"));
    const names: {id: string; name: string}[] = [];
    querySnapshot.forEach((doc) => {
        names.push({id:doc.id, name: doc.data().name});
    });
    return names;
}
