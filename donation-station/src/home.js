import checkLoggedIn from "./checkLoggedIn.js";
import {useState, useContext, useEffect} from "react";
import Axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Context } from "./context.js";
import Popup from 'reactjs-popup';
import RequestDonation from "./requestDonation.js"
import OfferDonation from "./offerDonation.js";
import * as geolib from 'geolib';
import DonationRequestSlide from "./donationRequestSlide.js"
import DonationOfferSlide from "./donationOfferSlide.js"

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
    const [page, setPage] = useState("donationRequests")


    function quickSortByDistance(array) {
        if (array.length <= 1) {
          return array;
        }
      
        let distance = geolib.getDistance({latitude: parseInt(user.coordinates.slice(0, user.coordinates.indexOf(","))), longitude: parseInt(user.coordinates.slice(user.coordinates.indexOf(",") + 1, user.coordinates.length))}, {
            latitude: parseInt(array[0].coordinates.slice(0, array[0].coordinates.indexOf(","))), 
            longitude: parseInt(array[0].coordinates.slice(array[0].coordinates.indexOf(",") + 1, array[0].coordinates.length + 1))
        })

        var pivot = distance;
        
        var left = []; 
        var right = [];
      
        for (var i = 1; i < array.length; i++) {

            let distance = geolib.getDistance({latitude: parseInt(user.coordinates.slice(0, user.coordinates.indexOf(","))), longitude: parseInt(user.coordinates.slice(user.coordinates.indexOf(",") + 1, user.coordinates.length))}, {
                latitude: parseInt(array[i].coordinates.slice(0, array[i].coordinates.indexOf(","))), 
                longitude: parseInt(array[i].coordinates.slice(array[i].coordinates.indexOf(",") + 1, array[i].coordinates.length + 1))
            })

            distance < pivot ? left.push(array[i]) : right.push(array[i]);
        }
      
        return quickSortByDistance(left).concat(array[0], quickSortByDistance(right));
    };

    const getInfo = (userId)=>{
        Axios.post("http://localhost:30013/getDonationRequests", {userId: userId}).then((response)=>{
            var sorted = quickSortByDistance(response.data.donationRequests);
            setDonationRequests(sorted)  
        })

        Axios.post("http://localhost:30013/getDonations", {userId: userId}).then((response)=>{
            var sorted = quickSortByDistance(response.data.donations);
            setDonations(sorted)  
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

            <div>
                <button onClick={()=>{setPage("donationRequests")}} className={page != "donationRequests" ? "unactiveTab" : "activeTab"}>Donation requests</button>
                <button onClick={()=>{setPage("donationOffers")}} className={page != "donationOffers" ? "unactiveTab" : "activeTab"}>Donation offers</button>
                <button onClick={()=>{setPage("userDonationRequests")}} className={page != "userDonationRequests" ? "unactiveTab" : "activeTab"}>Your donation requests</button>
                <button onClick={()=>{setPage("userDonationOffers")}} className={page != "userDonationOffers" ? "unactiveTab" : "activeTab"}>Your donation offers</button>
            </div>

            {page == "userDonationRequests" &&
                <div>
            
                    {/* Active donation requests */}
                    <h3>Donations you are requesting:</h3>
                    {userDonationRequests.map((val, index)=>{
                        return(
                            <DonationRequestSlide val = {val} index = {index} setDonationRequests = {setUserDonationRequests} donationRequests = {userDonationRequests}/>
                        )
                        
                    })}

                    {userDonationRequests.length == 0 && <p className="info">You don't have any active donation requests currently.</p>}

                    <Popup open={open} onClose={()=>{setOpen(false)}} closeOnDocumentClick = {false} trigger={<button>Request donations</button>}>
                        <RequestDonation setOpen = {setOpen} setDonationRequests = {setUserDonationRequests}/>
                    </Popup>

                </div>
            }

            {page == "userDonationOffers" &&
                <div>
                    {/* Active donation offers */}
                    <h3>Donations you are offering:</h3>
                    {userDonations.map((val, index)=>{

                        return(
                            <>
                                <DonationOfferSlide val = {val} index = {index} setDonations = {setUserDonations} donations = {userDonations}/>

                            </>
                        )
                    })}

                    {userDonations.length == 0 && <p className="info">You don't have any active donation offers currently.</p>}

                    <Popup open={openDonations}  onClose={()=>{setOpenDonations(false)}} closeOnDocumentClick = {false} trigger={<button>Offer donations</button>}>
                        <OfferDonation setOpen = {setOpenDonations} setDonations = {setUserDonations}/>
                    </Popup>
                </div>
            }

            {page == "donationRequests" &&
                <div>
                    {/* Active donation requests of other users*/}
                    <h3>Donation requests:</h3>
                    {donationRequests.map((val, index)=>{
                        return(
                            <>
                                <DonationRequestSlide val = {val} index = {index} setDonationRequests = {setDonationRequests} donationRequests = {donationRequests}/>

                            </>
                        )
                        
                    })}

                    {donationRequests.length == 0 && <p className="info">No active donation requests found</p>}
                </div>
            }

            {page == "donationOffers" &&
                <div>
                    {/* Active donation offers of other users */}
                    <h3>Donation offers:</h3>
                    {donations.map((val, index)=>{
                        return(
                            <>
                                <DonationOfferSlide val = {val} index = {index} setDonations = {setDonations} donations = {donations}/>

                            </>
                        )
                    })}

                    {donations.length == 0 && <p className="info">No donation offers available</p>}
                </div>
            }
        </>
    )
}

export default Home;