import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { GLOBALTYPES } from '../../redux/actions/globalTypes';
import { addUser, getConversations } from "../../redux/actions/messageAction";
import { getDataAPI } from '../../utils/fetchData';
import UserCard from "../UserCard";

const LeftSide = () => {
    const { auth, message } = useSelector((state) => state);
    const dispatch = useDispatch();
    const history = useHistory(); 
    const { id } = useParams();
    const pageEnd = useRef();
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState('');  // Initialize search state
    const [searchUsers, setSearchUsers] = useState([]);

    // Fetch all conversations and users on initial load
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await getDataAPI('search?username=', auth.token); // Fetch all users with empty search
                setSearchUsers(res.data.users); // Set initial users
                dispatch(getConversations({ auth })); // Fetch conversations
            } catch (err) {
                dispatch({
                    type: GLOBALTYPES.ALERT,
                    payload: { error: err.response.data.msg },
                });
            }
        };

        fetchUsers();
    }, [dispatch, auth]);

    // Search functionality
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!search) {
            // If search is empty, fetch all users again
            try {
                const res = await getDataAPI('search?username=', auth.token);
                setSearchUsers(res.data.users);
            } catch (err) {
                dispatch({
                    type: GLOBALTYPES.ALERT,
                    payload: { error: err.response.data.msg },
                });
            }
            return;
        }

        // Search for users based on the input
        try {
            const res = await getDataAPI(`search?username=${search}`, auth.token);
            setSearchUsers(res.data.users);
        } catch (err) {
            dispatch({
                type: GLOBALTYPES.ALERT,
                payload: { error: err.response.data.msg },
            });
        }
    };

    const handleAddUser = (user) => {
        setSearch('');
        setSearchUsers([]);
        dispatch(addUser({ user, message }));
        return history.push(`/message/${user._id}`);
    };

    const isActive = (user) => {
        if (id === user._id) return 'active';
        return '';
    }

    // Load more conversations when scrolling down
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setPage((p) => p + 1);
                }
            },
            {
                threshold: 0.1,
            }
        );
        observer.observe(pageEnd.current);
    }, [setPage]);

    useEffect(() => {
        if (message.resultUsers >= (page - 1) * 9 && page > 1) {
            dispatch(getConversations({ auth, page }));
        }
    }, [message.resultUsers, page, auth, dispatch]);

    return (
        <>
            <form className="message_header" onSubmit={handleSearch}>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="search..."
                />
                <button style={{ display: "none" }} type="submit" id="search">
                    Search
                </button>
            </form>

            <div className="message_chat_list">
                {searchUsers.length !== 0 ? (
                    <>
                        {searchUsers.map((user) => (
                            user.hasOwnProperty('avatar') && ( // Check for avatar property
                                <div
                                    key={user._id}
                                    className={`message_user ${isActive(user)}`}
                                    onClick={() => handleAddUser(user)}
                                >
                                    <UserCard user={user} />
                                </div>
                            )
                        ))}
                    </>
                ) : (
                    <>
                        {message.users.map((user) => (
                            user.hasOwnProperty('avatar') && ( // Check for avatar property
                                <div
                                    key={user._id}
                                    className={`message_user ${isActive(user)}`}
                                    onClick={() => handleAddUser(user)}
                                >
                                    <UserCard user={user} msg={true}>
                                        <i className="fas fa-circle" />
                                    </UserCard>
                                </div>
                            )
                        ))}
                    </>
                )}
                <button style={{ opacity: 0 }} ref={pageEnd}>Load more..</button>
            </div>
        </>
    );
}

export default LeftSide;
