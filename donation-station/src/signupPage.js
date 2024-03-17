import {useState, useContext, useEffect} from "react";
import Axios from 'axios'
import { useNavigate } from 'react-router-dom';
import { Context } from "./context.js";
import Autocomplete from "react-google-autocomplete";
import checkLoggedIn from "./checkLoggedIn.js";

function SignupPage(){
    Axios.defaults.withCredentials = true;
    let navigate = useNavigate()
    const {setUser,  user} = useContext(Context);
    const [username, setUsername] = useState()
    const [password, setPassword] = useState()
    const [confirmPassword, setConfirmPassword] = useState()
    const [location, setLocation] = useState()

    const signup = (e)=>{
        e.preventDefault()
        if (confirmPassword != password){
            alert("Retyped password doesn't match password")
            return
        }
        if(!location){
            alert("Please enter a valid address")
            return
        }
        Axios.post("http://localhost:30013/signup", {username: username, password: password, location: location}).then((response)=>{
            if (response.data == "username in use"){
                alert("Username in use. Please choose another username")
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
            <h1>Signup</h1>

            <form onSubmit={signup}>
                <input type="text" required placeholder="Username" onChange={(e)=>{setUsername(e.target.value)}}/>
                <br/>
                <input type="password" required placeholder="Password" onChange={(e)=>{setPassword(e.target.value)}}/>
                <br/>
                <input type="password" required placeholder="Confirm password" onChange={(e)=>{setConfirmPassword(e.target.value)}}/>
                <br/>
                
                <Autocomplete
                    apiKey={"AIzaSyAbNQnmsv9QRZlQnZqLGNKin3DVBV5xnXI"}
                    onPlaceSelected={(place) => {
                        if(place.geometry){
                            setLocation(place.geometry.location.lat() + ", " + place.geometry.location.lng())
                        }
                        else{
                            alert("Please enter a valid address")
                        }
                    }}
                    
                    options = {{types: ["street_address"]}}
                    placeholder = "Enter your address"
                />  

                <br/>
                <button>Signup</button>  
            </form>
        </>
    )
}

export default SignupPage;