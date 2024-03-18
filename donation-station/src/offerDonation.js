import {useState, useContext} from "react";
import Axios from 'axios';
import { Context } from "./context.js";
import Select from 'react-select'
import Autocomplete from "react-google-autocomplete";

function OfferDonation({setDonations, setOpen}){
    const {user} = useContext(Context);
    const [location, setLocation] = useState()
    const [additionalNotes, setAdditionalNotes] = useState()
    const [specificDonation, setSpecificDonation] = useState()
    const [donationDropOffTime, setDonationDropOffTime] = useState()
    const [donationType, setDonationType] = useState()

    const offerDonations = (e)=>{
        e.preventDefault()
        Axios.post("http://localhost:30013/addDonation", {location: location, additionalNotes: additionalNotes, specificDonation: specificDonation, donationDropOffTime: donationDropOffTime, donationType: donationType, userId: user.userId}).then((response)=>{
            
            setDonations((donationRequests)=>{return [...donationRequests, {formattedAddress: location.formatted_address, coordinates: location.coordinates, 
            additionalNotes: additionalNotes, specificDonation: specificDonation, donationDropOffTime: donationDropOffTime, donationType: donationType, 
            userId: user.userId, donationRequestId: response.data.donationRequestId}]})  
            setOpen(false);
        })
    }

    return(
        <>
            <form className="postSlide" onSubmit={offerDonations}>
                <Select required onChange={(e)=>{setDonationType(e.value)}} placeholder = "Type of donation" className="dropdown" options={
                    [
                        {value: "Clothing", label: "Clothing"},
                        {value: "Food", label: "Food"},
                        {value: "Furniture", label: "Furniture"},
                        {value: "Books", label: "Books"},
                        {value: "Toys", label: "Toys"},
                        {value: "Technology", label: "Technology"},
                        {value: "Hygiene Products", label: "Hygiene Products"},
                        {value: "Other goods", label: "Other goods"},
                    ]
                }/>
                <br/>

                <input required style={{"margin-top":"0px"}} onChange={(e)=>{setSpecificDonation(e.target.value)}} type = "text" placeholder="Specific donation"/>
                <br/>

                <Autocomplete
                    apiKey={"AIzaSyAbNQnmsv9QRZlQnZqLGNKin3DVBV5xnXI"}
                    onPlaceSelected={(place) => {
                        if(place.geometry){
                            setLocation({coordinates: place.geometry.location.lat() + ", " + place.geometry.location.lng(), formatted_address: place.formatted_address})
                        }
                        else{
                            alert("Please enter a valid address")
                        }
                    }}
                    
                    options = {{types: ["address"]}}
                    placeholder = "Enter the donation pick up location"
                />
                <br/>

                <label htmlFor="pickUpTime">Donation pick up time:</label>
                <input onChange={(e)=>{setDonationDropOffTime(e.target.value)}} style={{"margin-top":"0px"}} required type="datetime-local" id = "pickUpTime"/>
                
                <textarea className="additionalNotes" placeholder="Additional notes (optional)" onChange={(e)=>{setAdditionalNotes(e.target.value)}}></textarea>

                <button type="button" onClick={()=>{setOpen(false)}}>Cancel</button> <button type="submit">Offer</button>
            </form>
        </>
    )
}

export default OfferDonation;