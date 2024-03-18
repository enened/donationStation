import {useState, useContext, useEffect} from "react";
import Axios from 'axios'
import { useNavigate, useLocation } from 'react-router-dom';
import { Context } from "./context.js";

function Header(){
    let navigate = useNavigate()
    let currentUrl = useLocation().pathname;
    const {setUser,  user} = useContext(Context);

    const signout = ()=>{
        Axios.post("http://localhost:30013/signout", ).then((response)=>{
            window.location.reload();
        })
    }

    return(
        <>
            <div className="header">
                <h1 onClick={()=>{navigate("/home")}}>Donation Station</h1>

                <div>
                    {!user ? (currentUrl == "/" ? <button onClick={()=>{navigate("/signUp")}}>Signup</button> :  <button onClick={()=>{navigate("/")}}>Login</button>)
                    :
                    <>
                        <button style={{"margin":"5px"}} onClick={()=>{navigate("/profile")}}>Profile</button>
                        <button onClick={signout}>Signout</button>
                    </>
                    }

                </div>

            </div>
        </>
    )
}

export default Header;