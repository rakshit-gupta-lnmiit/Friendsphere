import React, { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import { adminLogin, login } from "../redux/actions/authAction";
import { useDispatch, useSelector } from "react-redux";
import { authf, googleProvider } from './firebaseConfig';
import { signInWithPopup } from 'firebase/auth';
import { signOut } from 'firebase/auth';
import { GLOBALTYPES } from "../redux/actions/globalTypes";
const Login = () => {
  const initialState = { email: "", password: "" };
  const [userData, setUserData] = useState(initialState);
  const [userType, setUserType] = useState(false);
  const { email, password } = userData;

  const [typePass, setTypePass] = useState(false);

  const { auth } = useSelector((state) => state);

  const dispatch = useDispatch();
  const history = useHistory();

  useEffect(() => {
    if (auth.token) history.push("/");
  }, [auth.token, history]);

  const handleChangeInput = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };
  const handleGoogleLogin = async () => {
    try {
      await signOut(authf);
      console.log("User signed out");
      // Optionally, redirect the user or update the UI
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  
      try {
        const result = await signInWithPopup(authf, googleProvider);
        
        // Extract user information from the result
        const user = result.user;
        const uid = user.uid;
        const email = user.email;
        const displayName = user.displayName;
        const photoURL = user.photoURL;

        // Send this user information to your server
        const res = await fetch('http://localhost:8080/api/auth/google-login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ uid, email, displayName, photoURL }), // Sending the extracted data
        });
    
        const data = await res.json();
        if (res.ok) {
          console.log('Login successful:', data);
          localStorage.setItem("access_token", data.access_token); // Add this line
    console.log("Token stored:", localStorage.getItem("access_token"));
    dispatch({
      type: GLOBALTYPES.AUTH, 
      payload: { token: data.access_token, user: data.user },
    });

    dispatch({
      type: GLOBALTYPES.USER_TYPE,
      payload: data.user.role,
    });

    localStorage.setItem("firstLogin", true);
    dispatch({ type: GLOBALTYPES.ALERT, payload: { success: data.msg } });
        } else {
          console.error('Login failed:', data);
        }
      } catch (error) {
        console.error('Error during Google login:', error);

      }  
};

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userType) {
      dispatch(login(userData));
    } else {
      dispatch(adminLogin(userData));
    }
  };

  return (
    <div className="auth_page">
      <form onSubmit={handleSubmit} className="inner-shadow">
        <h3 className="text-uppercase text-center mb-4 auth-heading ">
          FRIENDSPHERE
        </h3>
        <div className="mb-3">
          <label htmlFor="exampleInputEmail1" className="form-label">
            Email address
          </label>
          <div className="outer-shadow hover-in-shadow form-input-wrap">
            <input
              type="email"
              className="form-control "
              id="exampleInputEmail1"
              aria-describedby="emailHelp"
              onChange={handleChangeInput}
              value={email}
              name="email"
            />
          </div>
          <div id="emailHelp" className="form-text">
            We'll never share your email with anyone else.
          </div>
        </div>
        <div className="mb-3">
          <label htmlFor="exampleInputPassword1" className="form-label">
            Password
          </label>
          <div className="pass">
            <div className="outer-shadow hover-in-shadow form-input-wrap">
              <input
                type={typePass ? "text" : "password"}
                className="form-control"
                id="exampleInputPassword1"
                onChange={handleChangeInput}
                value={password}
                name="password"
              />
              <small onClick={() => setTypePass(!typePass)}>
                {typePass ? "Hide" : "Show"}
              </small>
            </div>
            
          </div>
        </div>

        <div className="d-flex justify-content-evenly  mx-0 mb-4">
          <label htmlFor="User">
            User:
            <input
              type="radio"
              id="User"
              name="gender"
              value={userType}
              defaultChecked
              onClick={() => setUserType(false)}
            />
          </label>

          {/* <label htmlFor="Admin">
            Admin:
            <input
              type="radio"
              id="Admin"
              name="gender"
              value={userType}
              onClick={() => setUserType(true)}
            />  
          </label> */}
        </div>

        <button
          type="submit"
          className="btn-1 w-100 d-flex outer-shadow hover-in-shadow justify-content-center"
          disabled={email && password ? false : true}
        >
          Login
        </button>
        <button type="button" onClick={handleGoogleLogin}
        className="btn-1 w-100 d-flex outer-shadow hover-in-shadow justify-content-center">
            Sign in with Google
        </button>
        <p className="my-2">
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "crimson" }}>
            Register Now.
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
