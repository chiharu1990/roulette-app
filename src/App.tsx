import React, { useEffect, useState } from 'react';
import { Roulette } from './components/Roulette';
import { Login } from './components/Login';
import { auth } from './firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setIsAuthenticated(!!user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if(loading) {
        return <div className="loading">Loading...</div>
    }

    return(
        <div>
            {isAuthenticated ? (
                <Roulette />
            ) : (
                <Login setIsAuthenticated={setIsAuthenticated} />
            )}
        </div>
    )
}