import React from "react";
import { useState, useRef, useEffect } from "react";
import { History } from './History'
import { AddName } from "./AddName";

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
        setHistory((prevHistory: string[]) => {
            const updateHistory = [randomName, ...prevHistory];
            return updateHistory.slice(0,10);
        });
    };

    return (
        <div className="container">
            <AddName names={names} setNames={setNames}/>
            <div className="roulette-body">
                <h1>朝会指名ルーレット</h1>
                <div className="name">{displayName}</div>
                <button onClick={isRunning ? stopRoulette : startRoulette}>
                    {isRunning ? "ストップ" : "スタート"}
                </button>
            </div>
            <History history={history} />
        </div>
    );
};
