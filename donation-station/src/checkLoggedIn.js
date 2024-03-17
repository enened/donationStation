import Axios from 'axios';

async function checkLoggedIn(setUser){

    const response = await Axios.get("http://localhost:30013/login")

    setUser(response.data.user)
    return response.data.user
}

export default checkLoggedIn;