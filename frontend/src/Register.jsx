import { Link, useNavigate } from "react-router-dom";
import "./login.css";
import { useState } from "react";
import axios from "axios";

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: "",
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
            const res = await axios.post("https://mcqbattle-server.vercel.app", formData, {
                headers: {
                    "Content-Type": "application/json"
                }
            });
            setFormData("");
            navigate("/");
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
                <h3>Register</h3>
                <label htmlFor="username">Username</label>
                <input type="text" placeholder="Enter Username..." id="username" value={formData.username} onChange={handleChange}/>

                <label htmlFor="email">Email</label>
                <input type="text" placeholder="Enter Email..." id="email" value={formData.email} onChange={handleChange}/>

                <label htmlFor="password">Password</label>
                <input type="password" placeholder="Enter Password..." id="password" value={formData.password} onChange={handleChange}/>

                <button className="button">Register</button>
                <div className="social">
                    <Link className="go" to={"/"}>Already a User?</Link>
                </div>
            </form>
        </>
    )
}

export default Register;