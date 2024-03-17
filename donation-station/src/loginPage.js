import {useState, useContext, useEffect} from "react";
import Axios from 'axios'
import { useNavigate } from 'react-router-dom';
import { Context } from "./context.js";
import checkLoggedIn from "./checkLoggedIn.js";

function LoginPage(){
    Axios.defaults.withCredentials = true;
    let navigate = useNavigate()
    const {setUser,  user} = useContext(Context);
    const [username, setUsername] = useState()
    const [password, setPassword] = useState()

    const login = (e)=>{
        e.preventDefault()
        Axios.post("http://localhost:30013/login", {username: username, password: password}).then((response)=>{
            if (response.data == "Wrong combo"){
                alert("Wrong username or password")
            }
            else{
                setUser(response.data.user);
                navigate("/home")            
            }
        });
    }

    
    useEffect(()=>{
        if(!user){
            checkLoggedIn(setUser).then((user)=>{
                if(user){
                    setUser(user)
                }
                else{
                    navigate("/")
                }
            })
        }
    }, [])

    return(
        <>
            <h1>Login</h1>

            <form onSubmit={login}>
                <input type="text" required placeholder="Username" onChange={(e)=>{setUsername(e.target.value)}}/>
                <br/>
                <input type="password" required placeholder="Password" onChange={(e)=>{setPassword(e.target.value)}}/>
                <br/>
                <button>Login</button>  
            </form>
        </>
    )
}

export default LoginPage;