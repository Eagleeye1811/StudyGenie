import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
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
      <div className="logo">StudyGenie</div>
     

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
    </nav>
  );
};

export default Navbar;
