import React from "react";
import { Container, Card, CardContent, Typography, Button, Box } from "@mui/material";

const Login = () => {
    return (
        <Container maxWidth="sm" sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <Card sx={{ padding: 4, textAlign: "center", boxShadow: 3, borderRadius: 3 }}>
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        Welcome to Invoice Manager
                    </Typography>
                    <Typography variant="body1" color="textSecondary" sx={{ marginBottom: 2 }}>
                        Log in with your Google account!
                    </Typography>
                    <Box>
                        <Button 
                            variant="contained" 
                            color="primary" 
                            href="http://localhost:5000/auth/google"
                            sx={{ textTransform: "none", fontSize: "16px", padding: "10px 20px" }}
                        >
                            Login
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
};

export default Login;
