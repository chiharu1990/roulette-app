import { useState, useRef, useEffect } from "react";

export const Roulette = () => {
    const [displayName, setDisplayName] = useState<string>('');
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [names, setNames] =  useState<string[]>([]);
    const [history, setHistory] = useState<string[]>([]);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const counter = useRef<number>(0);

    // 名前のリストをローカルストレージから読み込む
    useEffect(() => {
        const storedNames = localStorage.getItem("names");
        if (storedNames) {
            setNames(JSON.parse(storedNames));
        } else {
            const defaultNames = ["なまえ1", "なまえ2", "なまえ3", "なまえ4", "なまえ5"];
            setNames(defaultNames);
            localStorage.setItem("names", JSON.stringify(defaultNames));
        }
    },[]);
    // 履歴のリストをローカルストレージから読み込む
    useEffect(() => {
        const storedHistory = localStorage.getItem("history");
        if(storedHistory) {
            setHistory(JSON.parse(storedHistory));
        }
    },[])

    // 名前のリストと履歴が更新されるたびにローカルストレージに保存
    useEffect(() => {
        if (names.length > 0) {
            localStorage.setItem("names", JSON.stringify(names));
        }
        if(history.length > 0) {
            localStorage.setItem("history", JSON.stringify(history))
        }
    },[names,history]);

    // ルーレットを開始する関数
    const startRoulette = () => {
        if (isRunning) return; // すでに動いていたら何もしない
        setIsRunning(true);

        intervalRef.current = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * names.length)
            setDisplayName(names[randomIndex]);
            counter.current++;
        }, 100);
    };

    // ルーレットを停止する関数
    const stopRoulette = () => {
        if (!isRunning) return; // すでに止まっていたら何もしない

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsRunning(false);

        const randomName = names[Math.floor(Math.random() * names.length)];

        setDisplayName(randomName);
        // 履歴に追加
        setHistory(prevHistory => {
            const updateHistory = [randomName, ...prevHistory];
            return updateHistory.slice(0,10);
        });
    };

    // 名前を追加する関数
    const addName = (newName: string) => {
        setNames(prevNames => [...prevNames, newName]);
    }
    // 名前を削除する関数
    const removeName = (nameToRemove: string) => {
        setNames(prevNames => prevNames.filter(name => name !== nameToRemove));
    }
    // 名前を編集する関数
    const changeName = (oldName: string, newName: string) => {
        setNames(prevNames => prevNames.map(name => name === oldName ? newName : name));
    };

    return (
        <>
            <div className="roulette-body">
                <h1>朝会指名ルーレット</h1>
                <div className="name">{displayName}</div>
                <button onClick={isRunning ? stopRoulette : startRoulette}>
                    {isRunning ? "ストップ" : "スタート"}
                </button>
            </div>
            <div>
                <h2>名前を追加</h2>
                <input type="text" id="new-name" placeholder="なまえ"/>
                <button onClick={() => {
                    const newName = (document.getElementById("new-name")as HTMLInputElement).value;
                    addName(newName);
                    (document.getElementById("new-name")as HTMLInputElement).value = "";
                }}>追加</button>
                <h2>リスト</h2>
                {names.map((name) => (
                <div key={name}>
                    <span>{name}</span>
                    <button onClick={() => removeName(name)}>削除</button>
                    <button onClick={() => {
                        const newName = prompt("新しい名前を入力してください:", name)
                        if(newName){
                            changeName(name,newName);
                        }
                    } }>変更</button>
                </div>
                ))}
            </div>
            <div>
                <h2>りれき</h2>
                <ol>
                    {history.map((name, index) => (
                        <li key={index}>{name}</li>
                    ))}
                </ol>
            </div>
        </>
    );
};
