const BASE_URL = "http://localhost:8080/api/auth";

async function post(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || "Request failed");
  }
  return text;
}

async function postJson(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Request failed");
  }
  return data;
}

export function signupInit({ name, email, password }) {
  return post("/signup/init", { name, email, password });
}

export function signupVerify({ email, otp }) {
  return post("/signup/verify", { email, otp });
}

export function loginInit({ email, password }) {
  return post("/login/init", { email, password });
}

export function loginVerify({ email, otp }) {
  return post("/login/verify", { email, otp });
}

export function forgotPasswordInit({ email }) {
  return post("/forgot-password/init", { email });
}

export function forgotPasswordVerify({ email, otp, newPassword }) {
  return post("/forgot-password/verify", { email, otp, newPassword });
}

export function fetchMe({ email }) {
  return postJson("/me", { email });
}

export async function loginToken({ email, password }) {
  const res = await fetch(`${BASE_URL}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Login failed");
  }
  return data; // { token }
}
