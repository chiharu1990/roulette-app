import React, { useState, useRef, useEffect } from "react";
import { auth } from "../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { v4 as uuidv4 } from "uuid";
import originalMembersData from "../data/members.json";

type Member = {
    id: string;
    name: string;
    hasWon?: boolean;
};

const STORAGE_KEY = "roulette_members";

const getInitialMembers = (): Member[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch {
            // fall through to default
        }
    }
    return originalMembersData.map((m) => ({ ...m, hasWon: false }));
};

export const Roulette = () => {
    const [displayName, setDisplayName] = useState<string>('');
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [members, setMembers] = useState<Member[]>(getInitialMembers);
    const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState<string>("");
    const [newMemberName, setNewMemberName] = useState<string>("");
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                window.location.reload();
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
    }, [members]);

    const startRoulette = () => {
        if (isRunning) return;
        setIsRunning(true);

        intervalRef.current = setInterval(() => {
            const remaining = members.filter((m) => !m.hasWon);
            if (remaining.length === 0) return;
            const randomIndex = Math.floor(Math.random() * remaining.length);
            setDisplayName(remaining[randomIndex].name);
        }, 100);
    };

    const stopRoulette = () => {
        if (!isRunning) return;

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsRunning(false);

        const remaining = members.filter((m) => !m.hasWon);
        if (remaining.length === 0) return;

        const randomIndex = Math.floor(Math.random() * remaining.length);
        const winner = remaining[randomIndex];
        setDisplayName(winner.name);

        const updated = members.map((m) =>
            m.id === winner.id ? { ...m, hasWon: true } : m
        );

        if (updated.every((m) => m.hasWon)) {
            setMembers(updated);
            alert("全員が当たりました！リストが復活します。");
            setTimeout(() => resetList(), 500);
        } else {
            setMembers(updated);
        }
    };

    const resetList = () => {
        setMembers(
            originalMembersData.map((m) => ({ ...m, hasWon: false }))
        );
    };

    const removeMember = (memberId: string) => {
        setMembers(members.filter((m) => m.id !== memberId));
    };

    const editMember = (memberId: string) => {
        setMembers(
            members.map((m) =>
                m.id === memberId ? { ...m, name: editingName } : m
            )
        );
        setEditingMemberId(null);
        setEditingName("");
    };

    const addMember = () => {
        if (newMemberName.trim() === "") return;
        const newMember: Member = {
            id: uuidv4(),
            name: newMemberName,
            hasWon: false,
        };
        setMembers([...members, newMember]);
        setNewMemberName("");
    };

    return (
        <div className="container">
            <div className="left-side display-content">
                <div className="inner">
                    <h2>名前を追加</h2>
                    <div>
                        <input
                            type="text"
                            value={newMemberName}
                            onChange={(e) => setNewMemberName(e.target.value)}
                            placeholder="新しい名前を入力"
                        />
                        <button onClick={addMember}>追加</button>
                    </div>

                    <div className="name-list">
                        <h2>メンバー</h2>
                        <ul>
                            {members.map((member) => (
                                <li key={member.id} style={{ display: member.hasWon ? 'none' : 'block' }}>
                                    {editingMemberId === member.id ? (
                                        <>
                                            <input
                                                type="text"
                                                value={editingName}
                                                onChange={(e) => setEditingName(e.target.value)}
                                                onKeyDown={(e) => e.key === "Enter" && editMember(member.id)}
                                            />
                                            <button onClick={() => editMember(member.id)}>更新</button>
                                            <button onClick={() => setEditingMemberId(null)}>キャンセル</button>
                                        </>
                                    ) : (
                                        <>
                                            <span>{member.name}</span>
                                            <button onClick={() => {
                                                setEditingMemberId(member.id);
                                                setEditingName(member.name);
                                            }}>
                                                編集
                                            </button>
                                            <button onClick={() => removeMember(member.id)}>削除</button>
                                        </>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
            <div className="roulette-body">
                <h1>ルーレット</h1>
                <div className="name">{displayName}</div>
                <button onClick={isRunning ? stopRoulette : startRoulette}>
                    {isRunning ? "ストップ" : "スタート"}
                </button>
                <button className="reset-btn" onClick={resetList}>リセット</button>
                <button className="logout-btn" onClick={() => auth.signOut()}>
                    ログアウト
                </button>
            </div>
        </div>
    );
};
