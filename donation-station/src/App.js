import { BrowserRouter as Router, Route, Routes, Navigate} from 'react-router-dom';
import {Context} from "./context.js";
import {useState} from "react";
import Header from './header.js';
import LoginPage from './loginPage.js';
import SignupPage from './signupPage.js';
import Home from "./home.js";

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
              <Route path="*" element={<Navigate to="/" />}/>
          </Routes>
      </Router>
    </Context.Provider>
  );
}

export default App;
