import React, { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { addUser, getUserById, updateUser } from "../service";
import {
  Box,
  Button,
  TextField,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Alert,
} from "@mui/material";
import type { UserProps } from "../types/type";

interface UserFormProps {
  isEdit: boolean;
  userId: string;
}

export const UserForm: React.FC<Partial<UserFormProps>> = ({
  isEdit = false,
  userId,
}) => {
  const queryClient = useQueryClient();

  const [userData, setUserData] = useState<UserProps>({
    id_user: "",
    nama_user: "",
    username: "",
    password: "",
    role: "",
    status: "published",
  });

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch user data when editing
  const { data: fetchedUserData, isLoading: isEditingLoading } = useQuery(
    ["user", userId],
    () => getUserById(userId || ""),
    {
      enabled: isEdit && !!userId,
      onSuccess: (data) => {
        if (data?.data) {
          setUserData(data.data);
        }
      },
    }
  );

  useEffect(() => {
    if (fetchedUserData?.data && isEdit) {
      setUserData(fetchedUserData.data);
    }
  }, [fetchedUserData, isEdit]);

  // Reset form after submission
  const resetForm = () => {
    setUserData({
      id_user: "",
      nama_user: "",
      username: "",
      password: "",
      role: "",
      status: "published",
    });
  };

  // Mutations
  const addMutation = useMutation(addUser, {
    onSuccess: () => {
      setSuccessMessage("User added successfully!");
      resetForm();
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    onError: (error) => {
      console.error("Error adding user:", error);
    },
  });

  const updateMutation = useMutation(
    (data: UserProps) => updateUser(userId || "", data),
    {
      onSuccess: () => {
        setSuccessMessage("User updated successfully!");
        resetForm();
        setTimeout(() => setSuccessMessage(null), 3000);
      },
      onError: (error) => {
        console.error("Error updating user:", error);
      },
    }
  );

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | React.ChangeEvent<{ name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name as string]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    isEdit ? updateMutation.mutate(userData) : addMutation.mutate(userData);
  };

  if (isEditingLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        padding: "35px",
        borderRadius: "15px",
        border: "1px solid #ddd",
        marginTop: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        maxWidth: "400px",
        margin: "auto",
      }}
    >
      <form onSubmit={handleSubmit} style={{ width: "100%" }}>
        <Typography variant="h6" gutterBottom>
          {isEdit ? "Edit User" : "Add User"}
        </Typography>
        <TextField
          label="Nama User"
          name="nama_user"
          value={userData.nama_user || ""}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          label="Username"
          name="username"
          value={userData.username || ""}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
        />
        {!isEdit && (
          <TextField
            label="Password"
            name="password"
            type="password"
            value={userData.password || ""}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
          />
        )}
        <FormControl fullWidth margin="normal">
          <InputLabel>Select Role</InputLabel>
          <Select
            name="role"
            value={userData.role || ""}
            onChange={handleChange}
          >
            <MenuItem value="">
              <em>Select Role</em>
            </MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="kasir">Kasir</MenuItem>
            <MenuItem value="manajer">Manajer</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={addMutation.isLoading || updateMutation.isLoading}
          sx={{ marginTop: "15px", width: "100%" }}
        >
          {isEdit
            ? updateMutation.isLoading
              ? "Updating..."
              : "Update User"
            : addMutation.isLoading
            ? "Adding..."
            : "Add User"}
        </Button>
        {(addMutation.isError || updateMutation.isError) && (
          <Alert severity="error" sx={{ marginTop: "15px" }}>
            Error {isEdit ? "updating" : "adding"} user.
          </Alert>
        )}
        {successMessage && (
          <Alert severity="success" sx={{ marginTop: "15px" }}>
            {successMessage}
          </Alert>
        )}
      </form>
    </Box>
  );
};
