import checkLoggedIn from "./checkLoggedIn.js";
import {useState, useContext, useEffect} from "react";
import Axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Context } from "./context.js";
import Popup from 'reactjs-popup';
import RequestDonation from "./requestDonation.js"
import OfferDonation from "./offerDonation.js";

function Home(){
    Axios.defaults.withCredentials = true;
    let navigate = useNavigate()
    const {setUser, user} = useContext(Context);
    const [donationRequests, setDonationRequests] = useState([])
    const [donations, setDonations] = useState([])
    const [userDonations, setUserDonations] = useState([])
    const [userDonationRequests, setUserDonationRequests] = useState([])
    const [open, setOpen] = useState()
    const [openDonations, setOpenDonations] = useState()

    const getInfo = (userId)=>{
        Axios.post("http://localhost:30013/getDonationRequests", {userId: userId}).then((response)=>{
            setDonationRequests(response.data.donationRequests)  
        })

        Axios.post("http://localhost:30013/getDonations", {userId: userId}).then((response)=>{
            setDonations(response.data.donations)  
        })

        Axios.post("http://localhost:30013/getUserDonationRequests", {userId: userId}).then((response)=>{
            setUserDonationRequests(response.data.donationRequests)  
        })

        Axios.post("http://localhost:30013/getUserDonations", {userId: userId}).then((response)=>{
            setUserDonations(response.data.donations)  
        })
    }

    useEffect(()=>{
        if(!user){
            checkLoggedIn(setUser).then((user)=>{
                if(user){
                    setUser(user)
                    getInfo(user.userId)
                }
                else{
                    navigate("/")
                }
            })
        }
        else{
            getInfo(user.userId)
        }
    }, [])


    return(
        <>
            <h1>Home</h1>

            {/* Active donation requests */}
            <h3>Your active donation requests:</h3>
            {userDonationRequests.map((val, index)=>{
                return(
                    <>
                        <div className="donationSlides">
                            <div>
                                <p>Type: {val.donationType}</p>
                                <p>Product: {val.specificProductRequest}</p>
                                <p>Notes: {val.additionalNotes}</p>
                            </div>

                            <div>
                                <p>Address: {val.formattedAddress}</p>
                                <p style={{"textAlign":"center"}}>Pick-up time: <input className="time" type = "datetime-local" value={val.donationPickUpTime.substring(0, 16)} disabled/></p> 
                            </div>
                        </div>
                    </>
                )
                
            })}

            {userDonationRequests.length == 0 && <p className="inform">You haven't made any donations requests yet.</p>}

            <Popup open={open} closeOnDocumentClick = {false} trigger={<button onClick={()=>{setOpen(true)}}>Request donations</button>}>
                <RequestDonation setOpen = {setOpen} setDonationRequests = {setUserDonationRequests}/>
            </Popup>

            {/* Active donation offers */}
            <h3>Your active donation offers</h3>
            {userDonations.map((val, index)=>{

                return(
                    <>
                        <div className="donationSlides">
                            <div>
                                <p>Type: {val.donationType}</p>
                                <p>Product: {val.specificDonation}</p>
                                <p>Notes: {val.additionalNotes}</p>
                            </div>

                            <div>
                                <p>Address: {val.formattedAddress}</p>
                                <p style={{"textAlign":"center"}}>Pick-up time: <input className="time" type = "datetime-local" value={val.donationDropOffTime.substring(0, 16)} disabled/></p> 
                            </div>
                        </div>
                    </>
                )
            })}

            {userDonations.length == 0 && <p className="inform">You haven't made any donations yet.</p>}

            <Popup open={openDonations} closeOnDocumentClick = {false} trigger={<button onClick={()=>{setOpenDonations(true)}}>Offer donations</button>}>
                <OfferDonation setOpen = {setOpenDonations} setDonations = {setUserDonations}/>
            </Popup>

            {/* Active donation requests of other users*/}
            <h3>Donation requests:</h3>
            {donationRequests.map((val, index)=>{
                return(
                    <>
                        <div className="donationSlides">
                            <div>
                                <p>Type: {val.donationType}</p>
                                <p>Product: {val.specificProductRequest}</p>
                                <p>Notes: {val.additionalNotes}</p>
                            </div>

                            <div>
                                <p>Address: {val.formattedAddress}</p>
                                <p style={{"textAlign":"center"}}>Pick-up time: <input className="time" type = "datetime-local" value={val.donationPickUpTime.substring(0, 16)} disabled/></p> 
                            </div>
                        </div>
                    </>
                )
                
            })}

            {donationRequests.length == 0 && <p className="inform">No donations requests available</p>}


            {/* Active donation offers of other users */}
            <h3>Donation offers</h3>
            {donations.map((val, index)=>{
                return(
                    <>
                        <div className="donationSlides">
                            <p>Type: {val.donationType}</p>
                            <p>Product: {val.specificProductRequest}</p>
                            <p>Address: {val.formattedAddress}</p>
                            <p>Drop-off tome: {val.donationPickUpTime}</p>
                            <p>Notes: {val.additionalNotes}</p>
                        </div>
                    </>
                )
            })}

            {donations.length == 0 && <p className="inform">No donations available</p>}
        </>
    )
}

export default Home;