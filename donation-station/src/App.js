import { BrowserRouter as Router, Route, Routes, Navigate} from 'react-router-dom';
import {Context} from "./context.js";
import {useState} from "react";
import Header from './header.js';
import LoginPage from './loginPage.js';
import SignupPage from './signupPage.js';
import Home from "./home.js";
import ViewDonationRequest from './viewDonationRequest.js';
import ViewDonationOffer from './viewDonationOffer.js';
import Profile from './profile.js';

function App() {
  const [user, setUser] = useState(null)

  return (
    <Context.Provider value={{user, setUser}}>
      <Router>
          <Header/>
          <Routes>
              <Route exact path="/" element={<LoginPage />}/>
              <Route exact path="/signUp" element={<SignupPage />}/>
              <Route exact path="/home" element={<Home />}/>
              <Route exact path="/viewDonationRequest/:donationRequestId" element={<ViewDonationRequest />}/>
              <Route exact path="/viewDonationOffer/:donationId" element={<ViewDonationOffer />}/>
              <Route exact path="/profile" element={<Profile />}/>
              <Route path="*" element={<Navigate to="/" />}/>
              
          </Routes>
      </Router>
    </Context.Provider>
  );
}

export default App;
