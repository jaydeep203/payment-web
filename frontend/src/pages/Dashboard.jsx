import { useEffect, useState } from "react"
import { Appbar } from "../components/Appbar"
import { Balance } from "../components/Balance"
import { Users } from "../components/Users"
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
    const [balance, setBalance] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {

        const token = localStorage.getItem("token");
        if(!token){
            navigate("/signin");
        }

        axios.get("https://payment-web-84db.onrender.com/api/v1/user/me", {
            headers:{
                "authorization" : "Bearer " + token 
            } 
        }).then(
            Response => {
                if(!Response.data.success){
                    navigate("/signin");
                }
            }
        );

        axios.get("https://payment-web-84db.onrender.com/api/v1/account/balance", {
            headers:{
                "authorization": "Bearer "+token
            }
        }
        ).then(Response => setBalance(Response.data.balance));

    },[navigate]);

    return <div>
        <Appbar />
        <div className="m-8">
            <Balance value={balance} />
            <Users />
        </div>
    </div>
}

export default Dashboard;