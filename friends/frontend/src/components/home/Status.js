import React, { useState } from 'react';
import Avatar from '../Avatar';
import { useSelector, useDispatch } from "react-redux";
import { GLOBALTYPES } from '../../redux/actions/globalTypes';
import PremiumAlertModal from './PremiumAlertModal'; // Import your modal component

const Status = () => {
    const { auth } = useSelector(state => state);
    const dispatch = useDispatch();
    
    // State to control the modal visibility
    const [showModal, setShowModal] = useState(false);

    const handleStatusClick = () => {
        // Check if user is premium before showing the status modal
        if (auth.user.isPremium) {
            dispatch({ type: GLOBALTYPES.STATUS, payload: true });
        } else {
            setShowModal(true); // Show the premium subscription modal if user is not premium
        }
    };

    const handleCloseModal = () => setShowModal(false);

    return (
        <>
            <div className="status my-3 d-flex">
                <div className="outer-shadow big-avatar-cover">
                    <Avatar src={auth.user.avatar} size="big-avatar" />
                </div>
                <button
                    onClick={handleStatusClick}
                    className="btn-1 outer-shadow hover-in-shadow statusBtn flex-fill"
                    style={{ marginLeft: "7px" }}
                >
                    <span style={{ textShadow: "var(--outer-shadow)" }}>
                        {auth.user.username}, What's on your mind?
                    </span>
                </button>
            </div>

            {/* Render the PremiumAlertModal if showModal is true */}
            {showModal && (
                <PremiumAlertModal closeModal={handleCloseModal} />
            )}
        </>
    );
}

export default Status;
