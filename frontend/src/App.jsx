import React, { useState, useEffect } from "react";
import HomePage  from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import MainApp   from "./pages/MainApp";

export default function App() {
  const [screen, setScreen] = useState("home");
  const [user,   setUser]   = useState(null);
  const [dark,   setDark]   = useState(true);

  // Apply theme class to <body>
  useEffect(() => {
    document.body.classList.toggle("light", !dark);
  }, [dark]);

  const toggleTheme = () => setDark(d => !d);

  return (
    <>
      {screen === "home"  && (
        <HomePage
          onGetStarted={() => setScreen("login")}
          dark={dark}
          onToggleTheme={toggleTheme}
        />
      )}
      {screen === "login" && (
        <LoginPage
          onSuccess={u => { setUser(u); setScreen("app"); }}
          onBack={() => setScreen("home")}
          dark={dark}
          onToggleTheme={toggleTheme}
        />
      )}
      {screen === "app" && (
        <MainApp
          user={user}
          onLogout={() => { setUser(null); setScreen("home"); }}
          dark={dark}
          onToggleTheme={toggleTheme}
        />
      )}
    </>
  );
}
