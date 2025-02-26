import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faChevronLeft } from '@fortawesome/free-solid-svg-icons'

interface NameProps {
    names: string[];
    setNames: React.Dispatch<React.SetStateAction<string[]>>;
}

export const AddName:React.FC<NameProps> = ({names, setNames}) => {
    const [displayAddNameContainer, setDisplayAddNameContainer] = useState<boolean>(false);
    // 名前を追加する関数
    const addName = (newName: string) => {
        setNames((prevNames: string[]) => [...prevNames, newName]);
    }
    // 名前を削除する関数
    const removeName = (nameToRemove: string) => {
        setNames((prevNames: string[]) => prevNames.filter(name => name !== nameToRemove));
    }
    // 名前を編集する関数
    const changeName = (oldName: string, newName: string) => {
        setNames((prevNames: string[]) => prevNames.map(name => name === oldName ? newName : name));
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
                        {names.map((name) => (
                        <li key={name}>
                            <span>{name}</span>
                            <button onClick={() => removeName(name)}>削除</button>
                            <button onClick={() => {
                                const newName = prompt("新しい名前を入力してください:", name)
                                if(newName){
                                    changeName(name,newName);
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