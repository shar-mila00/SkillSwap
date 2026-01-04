import { useState } from "react";
import Login from "./Login";
import Dashboard from "./Dashboard";

import { useEffect } from "react";
import { apiCall } from "./api";

function App() {

  useEffect(() => {
    apiCall("init")
      .then(data => {
        console.log("API CONNECTED:", data);
        alert("API Connected! Check console");
      })
      .catch(err => {
        console.error("API FAILED:", err);
        alert("API NOT connected");
      });
  }, []);

  return <h1>SkillSwap</h1>;
}

export default App;



