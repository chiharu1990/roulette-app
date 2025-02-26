import React from "react";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronRight, faClockRotateLeft } from '@fortawesome/free-solid-svg-icons'

interface HistoryProps {
    history: string[];
}


export const History:React.FC<HistoryProps>= ({history}) => {
    const [displayHistoryContainer, setDisplayHistoryContainer] = useState<boolean>(false);


    return(
        <>
            <div className={displayHistoryContainer? "history-container is-open" : "history-container is-close"}>
                <div className="history-display-button" onClick={() => setDisplayHistoryContainer(!displayHistoryContainer)}>
                    {displayHistoryContainer?<FontAwesomeIcon icon={faChevronRight} size="2x" /> : <FontAwesomeIcon icon={faClockRotateLeft} size="2x"/>}
                </div>
                <div className="history-list">
                    <h2>りれき</h2>
                    <ol>
                        {history.map((name, index) => (
                            <li key={index}>{name}</li>
                        ))}
                    </ol>
                </div>
            </div>
        </>
    )
}