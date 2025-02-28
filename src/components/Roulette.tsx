import React from "react";
import { useState, useRef, useEffect } from "react";
import { History } from './History'
import { AddName } from "./AddName";
import { collection, addDoc, getDocs, query, limit, orderBy } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { getNamesFromFirestore } from "../firebase/firestoreFuctions";

export const Roulette = () => {
    const [displayName, setDisplayName] = useState<string>('');
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [names, setNames] =  useState<{ id: string; name: string }[]>([]);
    const [history, setHistory] = useState<string[]>([]);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const counter = useRef<number>(0);


    useEffect(() => {
        const fetchNames = async () => {
            const firestoreNames = await getNamesFromFirestore();
            setNames(firestoreNames);
        };
        fetchNames();
    }, []);

    useEffect(() => {
        const fetchHistory = async () => {
            const q = query(
                collection(db, "history"),
                orderBy("timestamp", "desc"),
                limit(10)
            );
            const querySnapshot = await getDocs(q);
            const historyData = querySnapshot.docs.map(doc => doc.data().name);
            setHistory(historyData);
        };
        fetchHistory();
    })

    const saveHistoryToFirestore = async (name: string) => {
        try {
            await addDoc(collection(db, "history"), {
                name: name,
                timestamp: new Date()
            });
        } catch(error) {
            console.error("エラーが発生しました", error)
        }
    }

    // ルーレットを開始する関数
    const startRoulette = () => {
        if (isRunning) return; // すでに動いていたら何もしない
        setIsRunning(true);

        intervalRef.current = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * names.length)
            setDisplayName(names[randomIndex].name);
            counter.current++;
        }, 100);
    };

    // ルーレットを停止する関数
    const stopRoulette = async () => {
        if (!isRunning) return; // すでに止まっていたら何もしない

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsRunning(false);

        const randomName = names[Math.floor(Math.random() * names.length)].name;

        setDisplayName(randomName);

        // 履歴に追加
        await saveHistoryToFirestore(randomName);
        const q = query(
            collection(db, "history"),
            orderBy("timestamp", "desc"),
            limit(10)
        );
        const querySnapshot = await getDocs(q);
        const historyData = querySnapshot.docs.map(doc => doc.data().name);
        setHistory(historyData);
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
