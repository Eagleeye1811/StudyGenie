import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Ensure that the Google Translate widget is initialized
    if (window.google && window.google.translate) {
      window.googleTranslateElementInit();
    }
  }, []);

  const handleLanguageChange = (event) => {
    const selectedLanguage = event.target.value;

    try {
      if (
        window.google &&
        window.google.translate &&
        window.google.translate.TranslateElement
      ) {
        const translateSelect = document.querySelector(".goog-te-combo");
        if (translateSelect) {
          translateSelect.value = selectedLanguage;
          translateSelect.dispatchEvent(new Event("change"));
        } else {
          console.error("Google Translate dropdown not found.");
        }
      } else {
        console.error("Google Translate library is not loaded.");
      }
    } catch (error) {
      console.error("Error changing language: ", error);
    }
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        StudyGenie
      </Link>

      {/* Language Selector */}
      <div className="lang">
        <select id="languageSelect" onChange={handleLanguageChange}>
          <option value="en">English</option>
          <option value="mr">Marathi</option>
          <option value="hi">Hindi</option>
          <option value="ta">Tamil</option>
          <option value="bn">Bengali</option>
          <option value="te">Telugu</option>
          <option value="ml">Malayalam</option>
          <option value="gu">Gujarati</option>
          <option value="kn">Kannada</option>
        </select>
      </div>

      {/* Authentication Section */}
      <div className="auth-section">
        {currentUser ? (
          <div className="user-dropdown" ref={dropdownRef}>
            <button className="user-button" onClick={toggleDropdown}>
              <span className="user-name">{currentUser.name}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="dropdown-arrow"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {isDropdownOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-content">
                  <Link
                    to="/dashboard"
                    className="dropdown-item"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      handleLogout();
                    }}
                    className="dropdown-item logout-btn"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="auth-buttons">
            <Link to="/login" className="auth-btn login-btn">
              Login
            </Link>
            <Link to="/register" className="auth-btn register-btn">
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
