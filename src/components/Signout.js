import { useAuth } from './auth';
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import '../pages/Login.css'

export default function Signout()
{
    const { logout } = useAuth();
    const navigate = useNavigate();
    const handleLogout = () =>
    {
        logout();
        navigate("/");

    }
    return (
        <div className='nav'>
            <Button onClick={handleLogout}>
            Logout
           </Button>
        </div>
        
    );
} 