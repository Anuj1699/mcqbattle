import express from "express";
import { Server } from "socket.io"
import http from "http";
import axios from "axios";
import mongoose from "mongoose";
import Match from "./schema/questionSchema.js";
import jwt from "jsonwebtoken";
import User from "./schema/userSchema.js";
import dotenv from 'dotenv';
import cors from "cors"
import bcrypt from "bcryptjs"
import cookieParser from "cookie-parser";

const app = express();
app.use(cookieParser());
app.use(express.json());
dotenv.config();

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
}));

const server = http.createServer(app);

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Connected");
    }).catch((error) => {
        console.log(error);

    })

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST"],
        credentials: true,
    }
});

const categoryQueue = {};

// io.use((socket, next) => {
//      const token = socket.handshake.headers.cookie
//         ?.split('; ')
//         .find(row => row.startsWith('token='))
//         ?.split('=')[1];        
        
//     if (!token) {
//         console.log("token not found");
//         return;
//     }

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);   
//         socket.user = decoded.user; 
//         next();
//     } catch (err) {
//         console.log(err, "went wrong");
//         return;
//     }
// });


io.on("connection", (socket) => {
    console.log("User Connected");

    socket.on("request_to_play", async (data) => {
        const { category, username} = data;        
        socket.user = username
        if (!categoryQueue[category]) {
            categoryQueue[category] = [];
        }

        categoryQueue[category].push(socket);  

        if (categoryQueue[category].length >= 2) {
            const player1 = categoryQueue[category].shift();
            const player2 = categoryQueue[category].shift();            
            
            if (player1.id === player2.id) {
                return;
            }

            const question = await fetchQuestion(category);

            const matchId = generateMatchId();

            const newMatch = new Match({
                matchId: matchId,
                category: category,
                questions: question.results,
                players: [
                    { id: player1.id, score: 0},
                    { id: player2.id, score: 0}
                ],
                isActive: true
            });

            await newMatch.save();

            player1.emit("game_start", { matchId, opponentId: player2.id, questions: question.results, name: player2.user });
            player2.emit("game_start", { matchId, opponentId: player1.id, questions: question.results, name: player1.user });
        }

        socket.on("cancel_game", (data) => {
            const { id, selectedCategory } = data;
            if (categoryQueue[selectedCategory]) {
                categoryQueue[selectedCategory] = categoryQueue[selectedCategory].filter(player => player.id == id);
            }
        });

        socket.on("update_score", async (data) => {
            const { matchId, id, answer } = data;

            try {
                const match = await Match.findOne({ matchId, isActive: true });

                if (match) {
                    let updatedScore;

                    match.players = match.players.map(player => {
                        if (player.id === id) {
                            if (answer === true) {
                                player.score += 10;
                            }
                            else {
                                player.score -= 1;
                            }

                            updatedScore = player.score;
                        }
                        return player;
                    });

                    await match.save();

                    const opponentId = match.players.find(player => player.id !== id).id;

                    if (opponentId) {
                        io.to(id).emit("score_updated")
                        io.to(opponentId).emit('score_updated', { score: updatedScore });
                    } else {
                        console.error(`Opponent not found for player ID ${id}`);
                    }
                } else {
                    console.log(`Match with id ${matchId} not found.`);
                }
            } catch (error) {
                console.error('Error updating score:', error);
            }
        })
    });

    socket.on("game_ended", async (matchId) => {
        const match = await Match.findOne({
            matchId,
            isActive: true
        });

        if (match) {
            match.isActive = false;

            await match.save();
        }

    })


    socket.on('disconnect', async () => {
        console.log('User Disconnected:', socket.id);
        for (const category in categoryQueue) {
            categoryQueue[category] = categoryQueue[category].filter(player => player.id !== socket.id);
        }

        const match = await Match.findOne({
            "players.id": socket.id,
            isActive: true
        });

        if (match) {
            match.isActive = false;
            await match.save();

            const opponent = match.players.find(player => player.id !== socket.id);

            if (opponent) {
                io.to(opponent.id).emit("opponent_disconnected", {
                    message: "Your Opponent has been disconnected. This game has ended"
                });
            }
        }
    });
});

const fetchQuestion = async (category) => {
    try {
        const res = await axios.get(`https://opentdb.com/api.php?amount=10&category=${category}`);
        return res.data;
    } catch (error) {
    }
}

app.post("/register", async (req, res) => {
    const { username, email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({
            username,
            email,
            password
        });

        await user.save();

        res.json({message: "Successfull"});
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }

})

app.post("/login", async(req, res) => {
    const {email, password} = req.body;

    try {
        let user = await User.findOne({ email });     
    
        if (!user) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);        
        
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const payload = {
            user: {
                id: user.id,
                email: user.email,
                username: user.username
            }
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,     
            sameSite: 'None',  
            secure: false,      
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        

        res.status(200).json({ message: 'Login successful', user});

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
})

function generateMatchId() {
    return 'match_' + Math.random().toString(36).substr(2, 9);
}

const PORT = process.env.PORT;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});