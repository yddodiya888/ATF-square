const api = {
  GetMenuItems: async () => {
    const response = await fetch(
      "https://atfsquare.com/api/services/menu_items/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          location_id: 3,
        }),
      }
    );

    const data = await response.json();

    return data;
  },
};

export default api;