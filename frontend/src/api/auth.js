import client from "./client";

// Signup
export const signupInit = ({ name, email, password }) =>
  client.post("/api/auth/signup/init", { name, email, password });

export const signupVerify = ({ email, otp }) =>
  client.post("/api/auth/signup/verify", { email, otp });

// Login
export const loginInit = ({ email, password }) =>
  client.post("/api/auth/login/init", { email, password });

export const loginVerify = ({ email, otp }) =>
  client.post("/api/auth/login/verify", { email, otp });

// Forgot Password
export const forgotPasswordInit = ({ email }) =>
  client.post("/api/auth/forgot-password/init", { email });

export const forgotPasswordVerify = ({ email, otp, newPassword }) =>
  client.post("/api/auth/forgot-password/verify", {
    email,
    otp,
    newPassword,
  });

// Fetch user
export const fetchMe = ({ email }) =>
  client.post("/api/auth/me", { email });

// Token login
export const loginToken = ({ email, password }) =>
  client.post("/api/auth/token", { email, password });
