import Axios from 'axios';
import { Context } from "./context.js";
import {useState, useContext, useEffect} from "react";
import { useNavigate, useParams } from 'react-router-dom';
import checkLoggedIn from "./checkLoggedIn.js";
import * as geolib from 'geolib';
import DonationOfferSlide from "./donationOfferSlide.js"

function ViewDonationRequest(){
    Axios.defaults.withCredentials = true;
    let navigate = useNavigate()
    const { donationRequestId } = useParams();
    const {setUser, user} = useContext(Context);
    const [donationRequestInfo, setDonationRequestInfo] = useState()
    const [message, setMessage] = useState()
    const [messages, setMessages] = useState([])
    const [donationOfferSuggestions, setDonationOfferSuggestions] = useState([])

    function quickSortByDistance(array) {
        if (array.length <= 1) {
          return array;
        }
      
        let distance = geolib.getDistance({latitude: parseInt(user.location.slice(0, user.location.indexOf(","))), longitude: parseInt(user.location.slice(user.location.indexOf(",") + 1, user.location.length))}, {
            latitude: parseInt(array[0].coordinates.slice(0, array[0].coordinates.indexOf(","))), 
            longitude: parseInt(array[0].coordinates.slice(array[0].coordinates.indexOf(",") + 1, array[0].coordinates.length + 1))
        })

        var pivot = distance;
        
        var left = []; 
        var right = [];
      
        for (var i = 1; i < array.length; i++) {

            let distance = geolib.getDistance({latitude: parseInt(user.location.slice(0, user.location.indexOf(","))), longitude: parseInt(user.location.slice(user.location.indexOf(",") + 1, user.location.length))}, {
                latitude: parseInt(array[i].coordinates.slice(0, array[i].coordinates.indexOf(","))), 
                longitude: parseInt(array[i].coordinates.slice(array[i].coordinates.indexOf(",") + 1, array[i].coordinates.length + 1))
            })

            distance < pivot ? left.push(array[i]) : right.push(array[i]);
        }
      
        return quickSortByDistance(left).concat(array[0], quickSortByDistance(right));
    };

    const getInfo = ()=>{
        // get basic info first
        Axios.post("http://localhost:30013/getDonationRequestInfo", {donationRequestId: donationRequestId}).then((response)=>{
            if (!response.data.donationRequestInfo){
                navigate("/")
            }
            response.data.donationRequestInfo.distance = geolib.getDistance({latitude: parseInt(user.location.slice(0, user.location.indexOf(","))), longitude: parseInt(user.location.slice(user.location.indexOf(",") + 1, user.location.length))}, {
                latitude: parseInt(response.data.donationRequestInfo.coordinates.slice(0, response.data.donationRequestInfo.coordinates.indexOf(","))), 
                longitude: parseInt(response.data.donationRequestInfo.coordinates.slice(response.data.donationRequestInfo.coordinates.indexOf(",") + 1, response.data.donationRequestInfo.coordinates.length + 1))
            }) * 0.00062137

            // if this is users donation request, get donation offer suggestions
            if (user.userId == response.data.donationRequestInfo.userId){
                Axios.post("http://localhost:30013/getDonationOfferSuggestions", {donationRequestType: response.data.donationRequestInfo.donationType}).then((response)=>{
                    let sorted = quickSortByDistance(response.data.donationOfferSuggestions)
                    setDonationOfferSuggestions(sorted)  
                })
            }
            setDonationRequestInfo(response.data.donationRequestInfo)  
        })

        Axios.post("http://localhost:30013/getDonationMessages", {donationId: donationRequestId, type: "donation_requests"}).then((response)=>{
            setMessages(response.data.messages)  
        })
        
    }

    useEffect(()=>{
        if(!user){
            checkLoggedIn(setUser).then((user)=>{
                if(user){
                    setUser(user)
                    getInfo()
                }
                else{
                    navigate("/")
                }
            })
        }
        else{
            getInfo()
        }
    }, [])

    const postMessage = (message)=>{
        Axios.post("http://localhost:30013/postMessage", {messagerId: user.userId, originalPostId: donationRequestId, type: "donation_requests", message: message}).then((response)=>{
            alert("Requester has been notfied!")
            setMessages([...messages, {username: user.username, userId: user.userId, message: message, messageId: response.data.messageId}])
        })
    }

    return(
        <>
            {donationRequestInfo && <div>
                <h1>Donation request: {donationRequestInfo.specificProductRequest} by @{donationRequestInfo.username}</h1>

                <div className='flexx'>
                    
                    <div className="smallSlide">
                        <p className='smallSlide'>Address: {donationRequestInfo.formattedAddress} ({Math.round(donationRequestInfo.distance)} miles away)</p>
                        <p className='smallSlide' style={{"textAlign":"center", "display":"inline"}}>Pick-up time: </p> 
                        <input style={{"width":"39%"}} className="time" type = "datetime-local" value={donationRequestInfo.donationPickUpTime.substring(0, 16)} disabled/>
                        {donationRequestInfo.additionalNotes && <p className='smallSlide'>Additional notes: {donationRequestInfo.additionalNotes}</p>}
                    </div>
                </div>
                
                <h3>Messages:</h3>
                {messages.map((val, index)=>{
                    return(
                        <>
                            <div className='messageSlide'>
                                <p style={{"float":"left"}}>@{val.username}</p>
                                <p>{val.message}</p>
                            </div>
                        </>
                    )
                })}

                {messages.length == 0 && <p className='info'>No messages posted yet</p>}
                <div className='flexx'>
                    <textarea required onChange={(e)=>{setMessage(e.target.value)}} placeholder='Send a message' className='postTextarea'></textarea>
                    <button style={{"margin":"10px"}} onClick={()=>{postMessage(message)}}>Send</button>
                </div>
                {user.userId != donationRequestInfo.userId ?
                    <>
                        <button onClick={()=>{postMessage(user.username + " has accepted the donation request")}}>Accept request</button>
                    </>
                    :
                    <>
                        <h3>Related donation offers:</h3>
                        {donationOfferSuggestions.map((val, index)=>{
                            return(
                                <>
                                    <DonationOfferSlide val = {val} index = {index} setDonations = {setDonationOfferSuggestions} donations = {donationOfferSuggestions}/>
                                </>
                            )
                        })}

                        {donationOfferSuggestions == 0 && <p className='info'>No related donation offers found.</p>}

                    </>
                }
                
            </div>}
        </>
    )
}

export default ViewDonationRequest;