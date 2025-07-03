import React, { useState, useRef, useEffect } from "react";
import { db, auth } from "../firebase/firebase";
import { collection, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { v4 as uuidv4 } from "uuid";

type Member = {
    id: string;
    name: string;
    hasWon?: boolean;
};

type List = {
    id: string;
    name: string;
    members: Member[];
    originalMembers?: Member[];
};

export const Roulette = () => {
    const [displayName, setDisplayName] = useState<string>('');
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [selectedListId, setSelectedListId] = useState<string>("");
    const [lists, setLists] = useState<{ id: string; name: string; members: Member[] }[]>([]);
    const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState<string>("");
    const [newMemberName, setNewMemberName] = useState<string>("");
    const counter = useRef<number>(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (!user) {
            window.location.reload();
        }
        });
        return () => unsubscribe();
    }, []);

    // ** Firestoreからリストを取得する関数 **
    useEffect(() => {
        const fetchLists = async () => {
            const querySnapshot = await getDocs(collection(db, "lists"));
            const listsData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as List[];

            // **Firestoreに `originalMembers` がない場合は作成**
            listsData.forEach(async (list) => {
                if (!list.originalMembers) {
                    await updateDoc(doc(db, "lists", list.id), {
                        originalMembers: list.members, // 最初のメンバーを保存
                    });
                }
            });

            setLists(listsData);

            if (listsData.length > 0) {
                setSelectedListId(listsData[0].id); // 最初のリストを選択
            }
        };
        fetchLists();
    }, []);

    const selectedList = lists.find((list) => list.id === selectedListId);

    const startRoulette = () => {
        if (isRunning) return;
        setIsRunning(true);

        intervalRef.current = setInterval(() => {
        if (!selectedList) return;

        // 当選していないメンバーのみを対象に選択
        const remainingMembers = selectedList.members.filter((member) => !member.hasWon);
        const randomIndex = Math.floor(Math.random() * remainingMembers.length);
        setDisplayName(remainingMembers[randomIndex].name);
        counter.current++;
        }, 100);
    };

    const stopRoulette = async () => {
        if (!isRunning) return;

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsRunning(false);

        if (!selectedList) return;

        // 当選メンバーを選択
        const remainingMembers = selectedList.members.filter((member) => !member.hasWon);
        const randomIndex = Math.floor(Math.random() * remainingMembers.length);
        const winner = remainingMembers[randomIndex];
        setDisplayName(winner.name);

        // 当選したメンバーに `hasWon: true` を設定
        const updatedMembersWithWin = selectedList.members.map((member) =>
            member.id === winner.id ? { ...member, hasWon: true } : member
        );

        // Firestoreに保存
        await updateDoc(doc(db, "lists", selectedListId), {
            members: updatedMembersWithWin,
        });

        // メンバーが全員当たった場合、リストを自動復活
        if (updatedMembersWithWin.every((member) => member.hasWon)) {
            alert("全員が当たりました！リストが復活します。");

            // アラート後にリストを復元するため、少し遅延させる
            setTimeout(() => {
                resetList(); // リストを自動復活
            }, 500);
        }

        // リストのメンバーを更新
        setLists(
            lists.map((list) =>
                list.id === selectedListId ? { ...list, members: updatedMembersWithWin } : list
            )
        );
    };

    const resetList = async () => {
        const listRef = doc(db, "lists", selectedListId);
        const listSnap = await getDoc(listRef);

        if (listSnap.exists()) {
            const originalMembers = listSnap.data().originalMembers;
            if (originalMembers) {
                setLists((prevLists) =>
                    prevLists.map((list) =>
                        list.id === selectedListId ? { ...list, members: [...originalMembers] } : list
                    )
                );

                // Firestoreのデータをリセット
                await updateDoc(listRef, {
                    members: originalMembers,
                });
            }
        }
    };

    const removeMember = async (memberId: string) => {
        if (!selectedList) return;

            // 該当のメンバーを削除
            const updatedMembers = selectedList.members.filter(member => member.id !== memberId);

            // Firestoreのデータを更新
            await updateDoc(doc(db, "lists", selectedListId), {
                members: updatedMembers
            });

            // ローカルのリストも更新
            setLists(lists.map(list =>
                list.id === selectedListId ? { ...list, members: updatedMembers } : list
            ));
        };

        const editMember = async (memberId: string) => {
            if (!selectedList) return;

            // メンバーリストの中から該当メンバーの名前を更新
            const updatedMembers = selectedList.members.map(member =>
                member.id === memberId ? { ...member, name: editingName } : member
            );

            // Firestoreのデータを更新
            await updateDoc(doc(db, "lists", selectedListId), {
                members: updatedMembers
            });

             // Firestoreの originalMembers も更新
            await updateDoc(doc(db, "lists", selectedListId), {
                originalMembers: updatedMembers,
            });

            // ローカルのリストも更新
            setLists(lists.map(list =>
                list.id === selectedListId ? { ...list, members: updatedMembers } : list
            ));

            // 編集モードを解除
            setEditingMemberId(null);
            setEditingName("");
        };

        const addMember = async () => {
            if (!selectedList || newMemberName.trim() === "") return;

            // 新しいメンバーを作成
            const newMember: Member = {
                id: uuidv4(),
                name: newMemberName,
                hasWon: false
            };

            // 新しいメンバーを追加
            const updatedMembers = [...selectedList.members, newMember];

            // Firestore のデータを更新
            await updateDoc(doc(db, "lists", selectedListId), {
                members: updatedMembers,
                originalMembers: updatedMembers, // originalMembersも更新
            });

            // ローカルのリストを更新
            setLists(lists.map(list =>
                list.id === selectedListId ? { ...list, members: updatedMembers, originalMembers: updatedMembers } : list
            ));

            // 入力フィールドをクリア
            setNewMemberName("");
        };
    return (
        <div className="container">
            <div className = "left-side display-content">
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
                            {selectedList?.members.map((member) => (
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
