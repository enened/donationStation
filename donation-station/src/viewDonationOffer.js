import Axios from 'axios';
import { Context } from "./context.js";
import {useState, useContext, useEffect} from "react";
import { useNavigate, useParams } from 'react-router-dom';
import checkLoggedIn from "./checkLoggedIn.js";
import * as geolib from 'geolib';
import DonationRequestSlide from "./donationRequestSlide.js"

function ViewDonationOffers(){
    Axios.defaults.withCredentials = true;
    let navigate = useNavigate()
    const { donationId } = useParams();
    const {setUser, user} = useContext(Context);
    const [donationOfferInfo, setDonationOfferInfo] = useState()
    const [message, setMessage] = useState()
    const [messages, setMessages] = useState([])
    const [donationRequestSuggestions, setDonationRequestSuggestions] = useState([])

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

    const getInfo = (user)=>{
        // get basic info first
        Axios.post("http://localhost:30013/getDonationOfferInfo", {donationId: donationId}).then((response)=>{
            if (!response.data.donationOfferInfo){
                navigate("/")
            }

            response.data.donationOfferInfo.distance = geolib.getDistance({latitude: parseInt(user.location.slice(0, user.location.indexOf(","))), longitude: parseInt(user.location.slice(user.location.indexOf(",") + 1, user.location.length))}, {
                latitude: parseInt(response.data.donationOfferInfo.coordinates.slice(0, response.data.donationOfferInfo.coordinates.indexOf(","))), 
                longitude: parseInt(response.data.donationOfferInfo.coordinates.slice(response.data.donationOfferInfo.coordinates.indexOf(",") + 1, response.data.donationOfferInfo.coordinates.length + 1))
            }) * 0.00062137

            // if this is users donation request, get donation offer suggestions
            if (user.userId == response.data.donationOfferInfo.userId){
                Axios.post("http://localhost:30013/getDonationRequestSuggestions", {donationRequestType: response.data.donationOfferInfo.donationType}).then((response)=>{
                    let sorted = quickSortByDistance(response.data.donationRequestSuggestions)
                    setDonationRequestSuggestions(sorted)  
                })
            }
            setDonationOfferInfo(response.data.donationOfferInfo)  
        })

        Axios.post("http://localhost:30013/getDonationMessages", {donationId: donationId, type: "donation"}).then((response)=>{
            setMessages(response.data.messages)  
        })
        
    }

    useEffect(()=>{
        if(!user){
            checkLoggedIn(setUser).then((user)=>{
                if(user){
                    setUser(user)
                    getInfo(user)
                }
                else{
                    navigate("/")
                }
            })
        }
        else{
            getInfo(user)
        }
    }, [])

    const postMessage = (message)=>{
        Axios.post("http://localhost:30013/postMessage", {messagerId: user.userId, originalPostId: donationId, type: "donation", message: message}).then((response)=>{
            alert("Donor has been notfied!")
            setMessages([...messages, {username: user.username, userId: user.userId, message: message, messageId: response.data.messageId}])
        })
    }

    console.log(messages)

    return(
        <>
            {donationOfferInfo && <div>
                <h1>Donation Offer: {donationOfferInfo.specificDonation} by @{donationOfferInfo.username}</h1>

                <div className='flexx'>
                    
                    <div className="smallSlide">
                        <p className='smallSlide'>Address: {donationOfferInfo.formattedAddress} ({Math.round(donationOfferInfo.distance)} miles away)</p>
                        <p className='smallSlide' style={{"textAlign":"center", "display":"inline"}}>Pick-up time: </p> 
                        <input style={{"width":"39%"}} className="time" type = "datetime-local" value={donationOfferInfo.donationDropOffTime.substring(0, 16)} disabled/>
                        {donationOfferInfo.additionalNotes && <p className='smallSlide'>Additional notes: {donationOfferInfo.additionalNotes}</p>}
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
                {user.userId != donationOfferInfo.userId ?
                    <>
                        <button onClick={()=>{postMessage(user.username + " has accepted the donation offer")}}>Accept offer</button>
                    </>
                    :
                    <>
                        <h3>Related donation offers:</h3>
                        {donationRequestSuggestions.map((val, index)=>{
                            return(
                                <>
                                    <DonationRequestSlide val = {val} index = {index} setDonationRequests = {setDonationRequestSuggestions} donationRequests = {donationRequestSuggestions}/>
                                </>
                            )
                        })}
                        {donationRequestSuggestions == 0 && <p className='info'>No related donation requests found.</p>}
                    </>
                }
                
            </div>}
        </>
    )
}

export default ViewDonationOffers;