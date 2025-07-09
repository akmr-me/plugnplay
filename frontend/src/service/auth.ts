export async function login(
  token: string | null,
  userInfo: Record<string, unknown>
) {
  const EndPoint = process.env.NEXT_PUBLIC_API_URL + "login";
  await fetch(EndPoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userInfo),
  });
}
