import React from "react";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebase";

interface LoginProps{
    setIsAuthenticated: (value:boolean) => void;
}

export const Login: React.FC<LoginProps> = ({setIsAuthenticated}) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] =useState("");

    const handleLogin = async () => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            setIsAuthenticated(true);
        } catch (error) {
            alert("ログインに失敗しました");
            console.error(error);
        }
    }
    return(
        <div className="login">
            <h2>ログイン</h2>
            <input
                type="email"
                placeholder="メールアドレス"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                type="password"
                placeholder="パスワード"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleLogin}>ログイン</button>
        </div>
    );
};