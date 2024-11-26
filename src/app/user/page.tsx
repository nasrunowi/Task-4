import React, { useState } from "react";
import { useQuery, useMutation } from "react-query";
import { getUser, deleteUser } from "../service";

import { UserForm } from "./addUser";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Typography,
  Modal,
} from "@mui/material";
import type { UserProps } from "../types/type";

const USERS_PER_PAGE = 3;

export const User = () => {
  const [isEdit, setIsEdit] = useState(false);
  const [userToEdit, setUserToEdit] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [openForm, setOpenForm] = useState(false);

  const { data, isLoading, error, refetch } = useQuery(
    ["user_telkom_malang", currentPage],
    () => getUser(currentPage, USERS_PER_PAGE),
    {
      refetchInterval: 3000,
      retry: 3,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
    }
  );

  const mutation = useMutation(deleteUser, {
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      console.error("Error deleting user:", error);
    },
  });

  const handleDelete = (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      mutation.mutate(userId);
    }
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Typography color="error">Error: {error.message}</Typography>;
  }

  return (
    <Box
      sx={{
        padding: "25px",
        maxWidth: "800px",
        margin: "auto",
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: "bold", color: "#3f51b5" }}
        >
          User Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setIsEdit(false);
            setUserToEdit("");
            setOpenForm(true);
          }}
          sx={{ textTransform: "capitalize" }}
        >
          Add User
        </Button>
      </Box>

      {data.data.map((user: UserProps) => (
        <Card
          key={user.id_user}
          sx={{
            margin: "10px 0",
            padding: "15px",
            backgroundColor: "white",
            border: "1px solid #e0e0e0",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
            borderRadius: "8px",
          }}
        >
          <CardContent
            sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
          >
            <Typography variant="body1" sx={{ color: "#555" }}>
              {user.nama_user}
            </Typography>
            <div>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => {
                  setIsEdit(true);
                  setUserToEdit(user.id_user);
                  setOpenForm(true);
                }}
                sx={{ textTransform: "capitalize", marginRight: "10px" }}
              >
                Edit
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleDelete(user.id_user)}
                sx={{ textTransform: "capitalize" }}
              >
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <Box sx={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
        <Button
          variant="outlined"
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          sx={{ textTransform: "capitalize", marginRight: "10px" }}
        >
          Previous
        </Button>
        <Typography variant="body2" sx={{ alignSelf: "center", color: "#757575" }}>
          Page {currentPage}
        </Typography>
        <Button
          variant="outlined"
          onClick={handleNextPage}
          disabled={data.data.length < USERS_PER_PAGE}
          sx={{ textTransform: "capitalize", marginLeft: "10px" }}
        >
          Next
        </Button>
      </Box>

      <Modal open={openForm} onClose={() => setOpenForm(false)}>
        <Box
          sx={{
            width: "400px",
            padding: "25px",
            borderRadius: "12px",
            backgroundColor: "white",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
            margin: "100px auto",
          }}
        >
          <UserForm isEdit={isEdit} userId={userToEdit} />
        </Box>
      </Modal>
    </Box>
  );
};
