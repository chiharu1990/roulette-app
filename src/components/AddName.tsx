import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import { addNameToFirestore, getNamesFromFirestore, removeNameFromFirestore, updateNameInFirestore } from "../firebase/firestoreFuctions";

interface NameProps {
    names: {id: string; name: string}[];
    setNames: React.Dispatch<React.SetStateAction< {id: string; name: string}[]>>;
}

export const AddName:React.FC<NameProps> = ({names, setNames}) => {
    const [displayAddNameContainer, setDisplayAddNameContainer] = useState<boolean>(false);

    useEffect(() => {
        const fetchNames = async () => {
            const firestoreNames = await getNamesFromFirestore();
            setNames(firestoreNames);
        };
        fetchNames();
    }, [setNames]);


    // 名前を追加する関数
    const addName = async (newName: string) => {
        if(newName.trim() === "") return;
        await addNameToFirestore(newName);
        const firestoreNames = await getNamesFromFirestore();
        setNames(firestoreNames);
    };
    // 名前を削除する関数
    const removeName = async (id: string) => {
        await removeNameFromFirestore(id);
        const firestoreNames = await getNamesFromFirestore();
        setNames(firestoreNames);
    }
    // 名前を編集する関数
    const changeName = async(id: string, newName: string) => {
        await updateNameInFirestore(id, newName);
        const firestoreNames = await getNamesFromFirestore();
        setNames(firestoreNames);
    };
return(
    <>
        <div className={displayAddNameContainer? "add-name-container is-open" : "add-name-container is-close"}>
            <div className="display-content">
                <h2>名前を追加</h2>
                <div>
                    <input type="text" id="new-name" placeholder="なまえ"/>
                    <button onClick={() => {
                        const newName = (document.getElementById("new-name")as HTMLInputElement).value;
                        addName(newName);
                        (document.getElementById("new-name")as HTMLInputElement).value = "";
                    }}>追加</button>
                </div>
                <div className="name-list">
                    <h2>リスト</h2>
                    <ul>
                        {names.map(({id,name}) => (
                        <li key={id}>
                            <span>{name}</span>
                            <button onClick={() => removeName(id)}>削除</button>
                            <button onClick={() => {
                                const newName = prompt("新しい名前を入力してください:", name)
                                if(newName){
                                    changeName(id,newName);
                                }
                            } }>変更</button>
                        </li>
                        ))}
                    </ul>
                </div>
            </div>
            <div className="list-display-button" onClick={() => setDisplayAddNameContainer(!displayAddNameContainer)}>
                {displayAddNameContainer?<FontAwesomeIcon icon={faChevronLeft} size="2x" /> : <FontAwesomeIcon icon={faPlus} size="2x"/>}
            </div>
        </div>
    </>
)
}