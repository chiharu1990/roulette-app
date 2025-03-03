import React, { useState } from 'react';
import { Roulette } from './components/Roulette';
import { Login } from './components/Login';

export const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

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