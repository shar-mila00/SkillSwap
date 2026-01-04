const API_URL = "http://localhost/SkillSwap/api.php";

export async function apiCall(action, data = null) {
  const options = {
    method: data ? "POST" : "GET",
    headers: {
      "Content-Type": "application/json"
    }
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const res = await fetch(`${API_URL}?action=${action}`, options);
  return await res.json();
}
