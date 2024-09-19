import { io } from 'socket.io-client';
import React, { useState, useEffect } from 'react';
import "./index.css";
import Popup from 'reactjs-popup';
import "./popup.css";
import data from "./data/data";
import Wait from "./Wait.jsx";
import Profile from './Profile.jsx';
import { useAuth } from './AuthProvider.jsx';

const socket = io("http://localhost:5000", {
  withCredentials: true, 
  transports: ["websocket"],
});

function PopUp() {
  const [playOnline, setPlayOnline] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [error, setError] = useState("");
  const [gameStart, setGameStart] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [matchId, setMatchId] = useState(null);
  const {user} = useAuth();
  const {opponent} = useAuth();

  useEffect(() => {
    socket.on("game_start", (data) => {
      setPlayOnline(true);
      setMatchId(data.matchId);
      setQuestions(data.questions);
      opponent(data.name);
    });

    return () => {
      socket.off("game_start");
    }
  }, []);

  const handleStart = () => {
    setGameStart(true);

    if (selectedCategory === "") {
      setError("Choose a Category");
      setGameStart(false);
      return;
    }

    socket.emit("request_to_play", {
      category: selectedCategory,
      username: user.username
    });

    setError("");
  }

  return (
    <>
      <div className='main-screen press-start-2p-regular'>
        {!gameStart ?
          <div className='home-screen'>
            <Profile/>
            <h1 className='title'>1 Vs 1 MCQ BATTLE</h1>
            <Popup
              trigger={<button className="press-start-2p-regular">Play</button>}
              modal
              nested
            >
              {close => (
                <div className="modal press-start-2p-regular">
                  <button className="close" onClick={close}>
                    &times;
                  </button>
                  <div className="header"> Select Category </div>
                  <div className='games'>
                    {data.map((e, index) => {
                      return (
                        <div key={index} onClick={() => setSelectedCategory(e.id)} className='content'>
                          <div className="img-box">
                            <img src={e.img} alt="img" />
                          </div>
                          <h1 className='game-name press-start-2p-regular'>{e.game}</h1>
                        </div>
                      )
                    })}
                  </div>
                  <div className="actions">
                    <button
                      className="press-start-2p-regular"
                      onClick={handleStart}
                    >
                      start
                    </button>
                  </div>
                  {error && <p style={{fontSize: "10px"}}>{error}</p>}
                </div>
              )}
            </Popup>
          </div>
          : <Wait matchId={matchId} questions={questions} playOnline={playOnline} socket={socket} selectedCategory={selectedCategory} setGameStart={setGameStart} />}
      </div>
    </>
  )
}

export default PopUp;
