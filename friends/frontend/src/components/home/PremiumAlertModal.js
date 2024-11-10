import React from 'react';
import '../../styles/Premium.css'; // Import CSS for styling
import { useDispatch } from 'react-redux';
import { updateUserStatus } from '../../redux/actions/userActions';

const PremiumAlertModal = ({ closeModal }) => {
    const dispatch = useDispatch();

    const handleSubscribe = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            alert("No token found, please log in again.");
            return;
        }
      
        // Decode the token to check expiration
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        
        if (currentTime >= payload.exp) {
            alert("Token has expired. Please log in again.");
            return;
        }
    
        try {
            const response = await fetch('http://localhost:8080/api/subscribe-premium', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${token}`
                }
            });
    
            if (response.ok) {
                const data = await response.json();
                dispatch(updateUserStatus(data.user));
                closeModal();
                window.location.reload();
            } else {
                const errorData = await response.json();
                alert(errorData.msg || 'Failed to subscribe.');
            }
        } catch (error) {
            console.error('Error subscribing to premium:', error);
            alert('An error occurred. Please try again later.');
        }
    };
    

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Premium Access Required</h2>
                <p>You need to be a premium member to post. Would you like to subscribe?</p>
                <button className="btn-12" onClick={handleSubscribe}>
                    Subscribe to Premium
                </button>
                <button className="close-button2" onClick={closeModal}>
                    Close
                </button>
            </div>
        </div> 
    );
};

export default PremiumAlertModal;
