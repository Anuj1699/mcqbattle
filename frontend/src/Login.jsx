import { useState } from 'react';
import { useAuth } from './AuthProvider';
import "./login.css";
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";

const Login = () => {
    const navigate = useNavigate();
    const {login} = useAuth();
    
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const handleChange = (e) => {
        const {value, id} = e.target;

        setFormData({
            ...formData,
            [id]: value
        });
    }

    const handleSubmit = async(e) => {
        e.preventDefault();

        try {
            const res = await axios.post("https://mcqbattle-api.onrender.com/login", formData,{
                headers: {
                    "Content-Type": "application/json"
                },
                withCredentials: true,
            })
            localStorage.setItem("user", JSON.stringify(res.data.user));
            login(res.data.user);
            setFormData("");
            navigate("/game");
        } catch (error) {
            console.log(error);
            
        }
    }
    
    return (
        <>
            <div className="background">
                <div className="shape"></div>
                <div className="shape"></div>
            </div>

            <form onSubmit={handleSubmit}>
                <h3>Login</h3>

                <label htmlFor="email">Email</label>
                <input type="text" placeholder="Enter Email" id="email" value={formData.email} onChange={handleChange}/>

                <label htmlFor="password">Password</label>
                <input type="password" placeholder="Enter Password" id="password" value={formData.password} onChange={handleChange}/>

                <button className="button">Log In</button>
                <div className="social">
                    <Link className="go" to={"/register"}>Register</Link>
                </div>
            </form>
        </>
    )
}

export default Login;