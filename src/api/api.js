export const API_URL = "http://localhost:5000";
export async function fetchData(endpoint) {
    const res = await fetch(`${API_URL}/${endpoint}`);
    if (!res.ok)
        throw new Error("Lỗi API");
    return res.json();
}
