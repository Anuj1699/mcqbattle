import { useAuth } from "./AuthProvider";
import "./index.css";

const Profile = () => {
    const {user} = useAuth();
    return (
        <>
         <div style={{display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center"}}>
            <img className="profileImage" src={user.avatar} alt="" />
            <p style={{color: "red", fontSize: "30px"}}>{user.username}</p>
         </div>
        </>
    )    
}

export default Profile;