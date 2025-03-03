import React from "react";
import { useState, useRef, useEffect } from "react";
import { History } from './History'
import { AddName } from "./AddName";
import { collection, addDoc, getDocs, query, limit, orderBy } from "firebase/firestore";
import { db, auth } from "../firebase/firebase";
import { getNamesFromFirestore } from "../firebase/firestoreFuctions";
import { onAuthStateChanged } from "firebase/auth";


export const Roulette = () => {
    const [displayName, setDisplayName] = useState<string>('');
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [names, setNames] =  useState<{ id: string; name: string }[]>([]);
    const [history, setHistory] = useState<string[]>([]);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const counter = useRef<number>(0);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                if(window.location.reload){
                    window.location.reload();
                }
            }
        });
        return () => unsubscribe();
    }, []);

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
    },[])

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

        if (names.length === 0) {
            alert("名前がありません！");
            setIsRunning(false);
            return;
        }

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsRunning(false);

        const randomName = names[Math.floor(Math.random() * names.length)].name;
        setDisplayName(randomName);

        await saveHistoryToFirestore(randomName);
        setHistory((prev) => [randomName, ...prev].slice(0, 10));
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
                <button className="logout-btn" onClick={() => auth.signOut()}>ログアウト</button>
            </div>
            <History history={history} />
        </div>
    );
};
