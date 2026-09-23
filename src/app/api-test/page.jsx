"use client";

import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    async function getMenuItems() {
      try {
        console.log("API CALL STARTED");

        const response = await fetch(
          "https://atfsquare.com/api/services/menu_items/"
        );

        console.log("STATUS:", response.status);
        console.log("OK:", response.ok);

        const data = await response.json();

       console.log("API RESULT:", JSON.stringify(data, null, 2));
      } catch (error) {
        console.error("API ERROR:", error);
      }
    }

    getMenuItems();
  }, []);

  return (
    <div>
      <h1>Food App</h1>
    </div>
  );
}