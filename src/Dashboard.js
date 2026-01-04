import { useEffect, useState } from "react";
import { apiCall } from "./api";

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    apiCall("init").then(setData);
  }, []);

  if (!data) return <p>Loading...</p>;

  return (
    <div>
      <h2>Users</h2>
      {data.users.map(u => (
        <div key={u.id}>{u.name}</div>
      ))}
    </div>
  );
}
