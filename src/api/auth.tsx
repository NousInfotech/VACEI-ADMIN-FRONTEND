const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

interface LoginResponse {
  token: string;
  username: string;
  user_id: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

export async function login({ email, password }: LoginPayload): Promise<LoginResponse> {
  const response = await fetch(`${backendUrl}auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "include",
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || "Failed to login");
  }

  return response.json();
}
