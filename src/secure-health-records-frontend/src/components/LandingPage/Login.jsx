import './Login.css'; 
import { Send, Check, ArrowRight } from 'lucide-react';
import React, { useState } from 'react';

const ClickableButton = () => {
const [clicked, setClicked] = useState(false);}

const Login = () => {
  return (
    <div className="login-container">
      <div className="login-card">
        <p className="login-subheading">Log in or sign up</p>

        <div className="login-input">
            <input type="email" placeholder="your@email.com" />
          
            <button  onClick={() => setClicked(true)} className="submit-btn">
                <ArrowRight  />
            </button>
        </div>

        <div className="login-option google-login">
          <span>Google</span>
        </div>

        <div className="login-option wallet-login">
          <span>Continue with a wallet</span>
        </div>

        <a href="#" className="passkey-link">I have a passkey</a>

        <p className="protected-text">
          Protected by <span className="medichain-tag">🛡️ MediChain</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
