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

  console.log(userData);

  const formRef = React.useRef<HTMLFormElement>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { data: fetchedUserData, isLoading: isEditingLoading } =
    useQuery(
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
      setTimeout(() => setSuccessMessage(null), 2000); // Clear message after 2 seconds
    },
    onError: (error) => {
      console.error("Error adding user:", error);
    },
  });

  const updateMutation = useMutation(
    (data: UserProps) => updateUser(userId || "", data),
    {
      onMutate: async (newData) => {
        await queryClient.cancelQueries(["user", userId]);

        const previousUserData = queryClient.getQueryData(["user", userId]);

        queryClient.setQueryData(["user", userId], newData);

        return { previousUserData };
      },

      onError: (_, __, context) => {
        queryClient.setQueryData(["user", userId], context.previousUserData);
      },
      onSettled: () => {
        queryClient.invalidateQueries(["user", userId]);
      },
      onSuccess: () => {
        setSuccessMessage("User updated successfully!");
        resetForm();
        
        setTimeout(() => setSuccessMessage(null), 2000); // Clear message after 2 seconds
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
    return <CircularProgress />;
  }

  return (
    <Box
      sx={{
        padding: "35px",
        borderRadius: "15px",
        border: "1px solid black",
        marginTop: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <form ref={formRef} onSubmit={handleSubmit} style={{ width: "300px" }}>
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
        <TextField
          label="Password"
          name="password"
          type="password"
          value={""}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
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
          sx={{ marginTop: "15px" }}
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
          <Typography color="error" marginTop={2}>
            Error {isEdit ? "updating" : "adding"} user:{" "}
            {isEdit
              ? updateMutation.error?.message
              : addMutation.error?.message}
          </Typography>
        )}
        {successMessage && (
          <Typography color="success.main" marginTop={2}>
            {successMessage}
          </Typography>
        )}
      </form>
    </Box>
  );
};
