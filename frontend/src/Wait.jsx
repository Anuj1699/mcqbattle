import Game from "./Game";
import "./index.css";


const Wait = ({matchId, playOnline,socket, selectedCategory,setGameStart,questions }) => {
    
    const handleCancel = () => {
        socket.emit("cancel_game", {
            selectedCategory,
            socket: socket.id
        });

        setGameStart(false);
    }

    return (
        <>
            {!playOnline ?
                <div style={{display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column"}}>
                    <h1 style={{color: "rgb(230, 230, 97)"}}>Waiting For Opponent</h1>
                    <button className="press-start-2p-regular" onClick={handleCancel}>Cancel</button>
                </div> :
                <Game questions={questions} socket={socket} matchId={matchId}/>}
        </>
    )
}

export default Wait;