import React from "react";
import { CountdownCircleTimer } from "react-countdown-circle-timer";

const renderTime = ({ remainingTime }) => {
    if (remainingTime === 0) {
        return <div className="timer">Too late...</div>;
    }

    return (
        <div className="timer">
            <div className="value">{remainingTime}</div>
        </div>
    );
};

const Timer = () => {
    return (
        <>
            <div className="timer-wrapper">
                <CountdownCircleTimer
                    isPlaying
                    duration={10}
                    colors={["#004777", "#F7B801", "#A30000", "#A30000"]}
                    colorsTime={[10, 6, 3, 0]}
                    onComplete={() => ({ shouldRepeat: true, delay: 1 })}
                >
                    {renderTime}
                </CountdownCircleTimer>
            </div>
        </>

    );
}

export default Timer;