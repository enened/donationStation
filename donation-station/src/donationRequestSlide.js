import Axios from 'axios';
import { Context } from "./context.js";
import {useState, useContext, useEffect} from "react";
import { useNavigate } from 'react-router-dom';


function DonationRequestSlide({val, index, setDonationRequests, donationRequests}){
    const {setUser, user} = useContext(Context);
    let navigate = useNavigate()

    const deleteDonationRequest = (index, donationRequestId)=>{
        Axios.post("http://localhost:30013/deleteDonationRequest", {donationRequestId}).then((response)=>{
            let tempDonationRequests = [...donationRequests]
            tempDonationRequests.splice(index, 1)
            setDonationRequests(tempDonationRequests)  
        })
    }

    return(
            <>
            <div className="donationSlides">
                <div>
                    <p>Type: {val.donationType}</p>
                    <p>Product: {val.specificProductRequest}</p>
                    <p>Notes: {val.additionalNotes}</p>
                </div>

                <div className="flexxCol">
                    <p>Address: {val.formattedAddress}</p>
                    <div className="flexx">
                        <p style={{"textAlign":"center", "display":"inline"}}>Pick-up time: </p> 
                        <input className="time" type = "datetime-local" value={val.donationPickUpTime.substring(0, 16)} disabled/>
                    </div>
                </div>
                {user.userId == val.userId ?
                <div>
                    <button style={{"margin":"5px"}} onClick={()=>{deleteDonationRequest(index, val.donationRequestId)}}>Mark done</button>
                    <button style={{"margin":"5px"}} onClick={()=>{navigate("/viewDonationRequest/" + val.donationRequestId)}}>View</button>
                </div> 
                :
                <button onClick={()=>{navigate("/viewDonationRequest/" + val.donationRequestId)}} style={{"margin":"0px"}}>Offer donation</button>
                }

            </div>
        </>
    )
}

export default DonationRequestSlide;