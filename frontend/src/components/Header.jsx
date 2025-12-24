import React, { useEffect ,useState} from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Import Link
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import './Header.css';

function Header() {
    const navigate = useNavigate();
    const loggedInUser = localStorage.getItem('loggedInUser');
    const [loggedInUsername, setLoggedInUsername] = useState("");

   useEffect(() => {

     const headers = {};
                if (loggedInUser) {
                    headers['loggedInUserId'] = loggedInUser;
                }
        async function fetchUsername() {
            try {
                const res = await fetch(`https://mindweave-production-f1b6.up.railway.app/api/users/${loggedInUser}`,{headers});
                if(!res.ok){
                    throw new Error(`error occurred while getting username:${res.status}`);
                }
                const userData = await res.json();
                setLoggedInUsername(userData.username);
            }
            catch(err){
                console.log(err)
            }
        }

        if (loggedInUser) {
            fetchUsername();
        }
    }, [loggedInUser]);

    const handleLogout = () => {
        localStorage.clear("loggedInUser");
        navigate('/auth');
    };

    return (
        <header className="elegant-header">
            <div className="header-left">
                <Link to="/" className="logo"> {/* Link to the homepage */}
                    MindWeave
                </Link>
                {loggedInUsername && (
                    <span className="header-caption">
                        What's on your mind today, {loggedInUsername} ?
                    </span>
                )}
                {!loggedInUsername && (
                    <span className="header-caption">
                        What's on your mind today?
                    </span>
                )}
            </div>
            <button className="logout-button" onClick={handleLogout}>
                <FontAwesomeIcon icon={faSignOutAlt} /> Logout
            </button>
        </header>
    );
}

export default Header;