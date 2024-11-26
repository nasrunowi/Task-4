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
        bgcolor="#f7f9fc"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        padding: "30px",
        borderRadius: "12px",
        background: "white",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        maxWidth: "400px",
        margin: "auto",
        marginTop: "50px",
        border: "1px solid #e0e0e0",
        bgcolor: "#f7f9fc",
      }}
    >
      <form onSubmit={handleSubmit} style={{ width: "100%" }}>
        <Typography
          variant="h5"
          gutterBottom
          sx={{
            fontWeight: "bold",
            color: "#3f51b5",
            textAlign: "center",
          }}
        >
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
          variant="outlined"
        />
        <TextField
          label="Username"
          name="username"
          value={userData.username || ""}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
          variant="outlined"
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
            variant="outlined"
          />
        )}
        <FormControl fullWidth margin="normal">
          <InputLabel>Role</InputLabel>
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
          sx={{
            marginTop: "15px",
            width: "100%",
            borderRadius: "8px",
            textTransform: "capitalize",
            padding: "10px 0",
            backgroundColor: "#3f51b5",
            "&:hover": {
              backgroundColor: "#2c387e",
            },
          }}
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
