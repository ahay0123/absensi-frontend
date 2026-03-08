export const getUser = () => {
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    try {
        return JSON.parse(userStr);
    } catch {
        return null;
    }
};

export const getRole = () => {
    const user = getUser();
    return user?.role || null;
};

export const isAdmin = () => {
    return getRole() === "admin";
};

export const isKepsek = () => {
    return getRole() === "kepala-sekolah";
};

export const isGuru = () => {
    return getRole() === "guru";
};

export const logout = () => {
    if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
    }
};
