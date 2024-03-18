import checkLoggedIn from "./checkLoggedIn.js";
import {useState, useContext, useEffect} from "react";
import Axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Context } from "./context.js";
import Autocomplete from "react-google-autocomplete";

function Profile(){
    Axios.defaults.withCredentials = true;
    let navigate = useNavigate()
    const {setUser, user} = useContext(Context);
    const [location, setLocation] = useState();
    const [currPassword, setCurrPassword] = useState();
    const [newPassword, setNewPassword] = useState();
    const [retypedNewPassword, setRetypedNewPassword] = useState();

    useEffect(()=>{
        if(!user){
            checkLoggedIn(setUser).then((user)=>{
                if(user){
                    setUser(user)
                    setLocation({formattedAddress: user.formattedAddress, coordinates: user.coordinates})
                }
                else{
                    navigate("/")
                }
            })
        }
        else{
            setLocation({formattedAddress: user.formattedAddress, coordinates: user.coordinates})
        }
    }, [])

    const getLocation = (e)=>{
        let tempLocation = {...location}
        tempLocation = {formattedAddress: e.target.value}
        setLocation(tempLocation)
    }

    // save address in database if user entered valid address
    const saveAddress = ()=>{
        if(location.coordinates){
            Axios.post("http://localhost:30013/saveAddress", {location: location, userId: user.userId}).then((response)=>{
                alert("Address saved successfully!")
            });
        }
        else{
            alert("Please enter a valid address")
        }
    }

    // save new password in database if retyped passward matches new password and current password is correct
    const savePassword = (e)=>{
        e.preventDefault()
        if(retypedNewPassword == newPassword){
            Axios.post("http://localhost:30013/savePassword", {currPassword: currPassword, newPassword: newPassword, userId: user.userId}).then((response)=>{
                if(response.data == "Wrong password"){
                    alert("Wrong current password. ")
                }
                else{
                    alert("Password saved successfully!")
                }
            });
        }
        else{
            alert("Retyped new password does not match new password.")
        }
    }


    return(
        <>
            {user &&
                <div>
                    <h1>{user.username}'s profile</h1>

                    <h3>Change address:</h3>    
                    <Autocomplete
                        apiKey={"AIzaSyAbNQnmsv9QRZlQnZqLGNKin3DVBV5xnXI"}
                        onPlaceSelected={(place) => {
                            if(place.geometry){
                                setLocation({coordinates: place.geometry.location.lat() + ", " + place.geometry.location.lng(), formattedAddress: place.formatted_address})
                            }
                            else{
                                alert("Please enter a valid address")
                            }
                        }}
                        onChange={getLocation}
                        options = {{types: ["address"]}}
                        placeholder = "Enter your address"
                        value = {location && location.formattedAddress}
                    /> 
                    <br/>
                
                    <button style={{"margin":"5px"}} onClick={saveAddress}>Save address</button>


                    <h3>Change password:</h3>
                    <form onSubmit={savePassword}>
                        <input required type="password" onChange={(e)=>{setCurrPassword(e.target.value)}} placeholder="Current password"/> 
                        <br/>   
                        <input required type="password" onChange={(e)=>{setNewPassword(e.target.value)}} placeholder="New password"/>
                        <br/>   
                        <input required type="password" onChange={(e)=>{setRetypedNewPassword(e.target.value)}} placeholder="Retype new password"/> 
                        <br/>    
                        <button>Save password</button>
                    </form>
                </div>
            }
        </>
    )
}

export default Profile;