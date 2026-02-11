import client from "./client";

export async function fetchProfile() {
  const res = await client.get("/api/users/me");
  return res.data;
}

export async function updateProfile({ data }) {
  const res = await client.put("/api/users/me", data);
  return res.data;
}

export async function uploadPhoto({ file }) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await client.post("/api/users/me/photo", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}
