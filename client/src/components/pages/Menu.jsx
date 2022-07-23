import { useState, useEffect } from "react";
import { NavLink } from 'react-router-dom';
import useEth from "../../contexts/EthContext/useEth";

/*
The menu shows the navigation bar and shows the username, if logged in.
*/
const Menu = () => {
  const { state: { accounts, contractParticipantLookup } } = useEth();
  const [userLabel, setUserLabel] = useState("");
  const [activePage, setActivePage] = useState();

  useEffect(() => {
        const loadUserLabel = async () => {
          try {
            const res = await contractParticipantLookup.methods.getParticipant(accounts[0]).call();
            if(res.name === "") {
              setUserLabel("Participant not found!");
            }
            else {
              setUserLabel(<div>Logged in as: <i>{res.name}</i></div>);
            }
          } catch (err) {
            console.error("Could not load user label. Error message: " + err);
          }
        };
        if(contractParticipantLookup) { loadUserLabel(); }
      }, [contractParticipantLookup]);

  return (
      <ul className="menu">
        <li className="menuitem"><NavLink to="/">Home</NavLink></li>
        <li className="menuitem"><NavLink to="/register">Register Participant</NavLink></li>
        <li className="menuitem"><NavLink to="/participants">Add Product</NavLink></li>
        <li className="menuitem"><NavLink to="/products">Update Product</NavLink></li>
        <li className="menuitem info">{userLabel}</li>
      </ul>
  );
}

export default Menu;