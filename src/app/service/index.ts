import type { UserProps } from "../types/type";
import { baseURL, headers, url_user } from "../utils";

// Fetch users with pagination
export const getUser = async (page: number, limit: number) => {
  try {
    const res = await fetch(
      `${baseURL}${url_user}?filter[_and][0][status][_eq]=published&page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: headers,
      }
    );

    if (!res.ok) {
      throw new Error(`Error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

// Add a new user
export const addUser = async (data: UserProps) => {
  try {
    const res = await fetch(`${baseURL}${url_user}`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorResponse = await res.json();
      console.error("Error response:", errorResponse);
      throw new Error(
        `Error: ${res.status} ${res.statusText} - ${errorResponse.message}`
      );
    }

    return await res.json(); // Return added user data
  } catch (error) {
    console.error("Error adding user:", error);
    throw error;
  }
};

// Update an existing user
export const updateUser = async (id: string, data: UserProps) => {
  try {
    const res = await fetch(`${baseURL}${url_user}/${id}`, {
      method: "PATCH",
      headers: headers,
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error(`Error: ${res.status} ${res.statusText}`);
    }

    return await res.json(); // Return updated user data
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

// Soft delete a user
export const deleteUser = async (id: string) => {
  try {
    const deletedAt = new Date().toISOString();
    const res = await fetch(`${baseURL}${url_user}/${id}`, {
      method: "PATCH",
      headers: headers,
      body: JSON.stringify({ date_deleted: deletedAt, status: "archived" }),
    });

    if (!res.ok) {
      throw new Error(`Error: ${res.status} ${res.statusText}`);
    }

    console.log(`User with ID ${id} archived successfully.`);
    return await res.json(); // Return confirmation
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

// Get a user by ID
export const getUserById = async (id: string): Promise<UserProps | null> => {
  try {
    const response = await fetch(`${baseURL}${url_user}/${id}`, {
      method: "GET",
      headers: headers,
    });

    console.log("Response status:", response.status); // Log response status

    if (!response.ok) {
      console.error(
        "Failed to fetch user data",
        response.status,
        response.statusText
      );
      throw new Error(
        `Failed to fetch user: ${response.status} ${response.statusText}`
      );
    }

    const data: UserProps = await response.json();
    console.log("Fetched user data:", data); // Log user data for debugging
    return data;
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    return null; // Return null if an error occurs
  }
};
