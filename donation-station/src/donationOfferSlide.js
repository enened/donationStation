import Axios from 'axios';
import { Context } from "./context.js";
import {useState, useContext, useEffect} from "react";
import { useNavigate } from 'react-router-dom';


function DonationOfferSlide({val, index, setDonations, donations}){
    const {setUser, user} = useContext(Context);
    let navigate = useNavigate()

    const deleteDonations = (index, donationId)=>{
        Axios.post("http://localhost:30013/deleteDonations", {donationId}).then((response)=>{
            let tempDonations = [...donations]
            tempDonations.splice(index, 1)
            setDonations(tempDonations)  
        })
    }

    return(
            <>
                <div className="donationSlides">
                    <div>
                        <h3>{val.specificDonation}</h3>
                        <p>{val.additionalNotes}</p>
                    </div>

                    <div>
                        <p>{val.formattedAddress}</p>
                        <p style={{"textAlign":"center"}}>Pick-up time: <input className="time" type = "datetime-local" value={val.donationDropOffTime.substring(0, 16)} disabled/></p> 
                    </div>
                    {user.userId == val.userId ? 

                    <div>
                        <button style={{"margin":"5px"}} onClick={()=>{deleteDonations(index, val.donationId)}}>Remove</button>
                        <button style={{"margin":"5px"}} onClick={()=>{navigate("/viewDonationOffer/" + val.donationId)}}>View</button>
                    </div>
                    : 
                    <button style={{"margin":"0px"}} onClick={()=>{navigate("/viewDonationOffer/" + val.donationId)}}>Request Donation</button>}
                </div>
        </>
    )
}

export default DonationOfferSlide;