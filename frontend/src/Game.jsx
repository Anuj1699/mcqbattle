import { useState, useEffect, useRef } from "react";
import { useAuth } from "./AuthProvider";
import he from "he";
import "./popup.css"
import { Link } from "react-router-dom";

const Game = ({ questions, socket, matchId }) => {
    const [index, setIndex] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState(questions[index]);
    const [shuffledOptions, setShuffledOptions] = useState([]);
    const [gameEnded, setGameEnded] = useState(false);
    const [score, setScore] = useState(0);
    const [opponentScore, setOpponentScore] = useState(0);
    const [timer, setTimer] = useState(10);
    const [disconnect, setDisconnect] = useState(null);

    const intervalRef = useRef(null);
    const { user, opponentName } = useAuth();

    useEffect(() => {
        const allOptions = [
            ...currentQuestion.incorrect_answers,
            currentQuestion.correct_answer
        ];
        setShuffledOptions(shuffleArray(allOptions));
    }, [currentQuestion]);

    useEffect(() => {
        intervalRef.current = setInterval(() => {
            setTimer(prevTime => {
                if (prevTime === 0) {
                    nextQuestion();
                    return 10;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(intervalRef.current);
    }, [index]);

    useEffect(() => {
        socket.on("score_updated", (data) => {
            if (data) {
                setOpponentScore(data.score);
            }
            nextQuestion();
        });

        socket.on("opponent_disconnected", (data) => {
            setGameEnded(true);
            setDisconnect(data.message);
        });

        return () => {
            socket.off("score_updated");
            socket.off("opponent_disconnected");
        };
    }, [socket]);

    useEffect(() => {
        if (index < questions.length) {
            setCurrentQuestion(questions[index]);
        } else {
            setGameEnded(true);
            socket.emit("game_ended", matchId);
        }
    }, [index, questions]);

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    const checkAns = (option) => {
        clearInterval(intervalRef.current);

        const isCorrect = he.decode(option) === currentQuestion.correct_answer;
        setScore((prevScore) => prevScore + (isCorrect ? 10 : -1));
        socket.emit("update_score", {
            id: socket.id,
            answer: isCorrect,
            matchId: matchId
        });
    };

    const nextQuestion = () => {
        setIndex((prevIndex) => prevIndex + 1);
        setTimer(10);
    };

    return (
        <>
            {!gameEnded ? (
                <div style={{ padding: "5px" }}>
                    {/* Main game UI */}
                    <div style={{ color: "white", display: "flex", justifyContent: "space-between" }}>
                        <h1 style={{ fontSize: "17px" }}>You: {score}</h1>
                        <h1 style={{ fontSize: "17px" }}>{opponentScore} :{opponentName}</h1>
                    </div>
                    <div style={{ display: "flex", justifyContent: "center", color: "royalblue", paddingTop: "5px" }}>
                        {timer}
                    </div>
                    <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                        <h1 style={{ color: "white", fontSize: "18px" }}>{index + 1}. </h1>
                        <p style={{ color: "rgb(230, 230, 97)", fontSize: "18px", wordSpacing: "10px" }}>{he.decode(currentQuestion.question)}</p>
                    </div>
                    <ul className="options">
                        {shuffledOptions.map((option, index) => (
                            <li className="eachOption" key={index} onClick={() => checkAns(option)}>
                                {he.decode(option)}
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div style={{ color: 'white', margin: "0 auto"}}>
                    {!disconnect ? (
                        <>
                            <h1>{score > opponentScore ? "You Won" : "You Lose"}</h1>
                            <p>Your Score: {score}</p>
                            <p>{opponentName}: {opponentScore}</p>
                        </>
                    ) : (
                        <div style={{display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center", padding: "20px"}}>
                            <h1 style={{color: "rgb(230, 230, 97)"}}>You Won</h1>
                            <p>Your Score: {score}</p>
                            <p>{opponentName}: {opponentScore}</p>
                            <p style={{color: "maroon"}}>{disconnect}</p>
                        </div>
                    )}
                    <Link className=".press-start-2p-regular" to={"/"} >Home</Link>
                </div>
            )}
        </>
    );
}

export default Game;
