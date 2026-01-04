import { useState } from "react";
import { apiCall } from "./api";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    const res = await apiCall("login", { email, password });

    if (res.error) {
      alert(res.error);
    } else {
      sessionStorage.setItem("user", JSON.stringify(res));
      onLogin(res);
    }
  }

  return (
    <div>
      <h2>Login</h2>
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
