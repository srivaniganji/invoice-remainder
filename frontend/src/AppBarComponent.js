import React, { useEffect, useState } from "react";
import { AppBar, Toolbar, Typography, IconButton, Avatar, Menu, MenuItem, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

const AppBarComponent = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        handleMenuClose();
        navigate("/");
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    Invoice Remainder
                </Typography>

                {user && (
                    <Box display="flex" alignItems="center">
                        {/* Display User Name */}
                        <Typography variant="body1" sx={{ marginRight: 1 }}>
                            {user.name}
                        </Typography>

                        {/* Avatar Button to Open Menu */}
                        <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
                            <Avatar src={user.picture} alt={user.name} />
                        </IconButton>

                        {/* Dropdown Menu */}
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                            sx={{ mt: 1 }}
                        >
                            <MenuItem>{user.email}</MenuItem>
                            <MenuItem onClick={handleLogout}>Logout</MenuItem>
                        </Menu>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default AppBarComponent;
