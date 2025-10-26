import { useAuth0 } from "@auth0/auth0-react";
import { Avatar, Typography, Menu, Box, ButtonBase } from "@mui/material";
import React from "react";

const Profile = () => {
    const { user, isAuthenticated } = useAuth0();

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    if (!isAuthenticated || !user) {
        return null;
    }

    return (
        <>
            <ButtonBase
                onClick={handleClick}
                aria-controls={open ? 'profile-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                sx={{ borderRadius: '50%', cursor: 'pointer' }}
            >
                <Avatar
                    src={user.picture}
                    alt={user.name}
                    sx={{ width: 40, height: 40 }}
                />
            </ButtonBase>

            <Menu
                id="profile-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                        mt: 1.5,
                        '&::before': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            top: 0,
                            right: 14,
                            width: 10,
                            height: 10,
                            bgcolor: 'background.paper',
                            transform: 'translateY(-50%) rotate(45deg)',
                            zIndex: 0,
                        },
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Avatar
                        src={user.picture}
                        alt={user.name}
                        sx={{ width: 56, height: 56, mx: 'auto', mb: 1 }}
                    />
                    <Typography fontWeight={500} variant="body1">{user.name}</Typography>
                    <Typography color="text.secondary" variant="body2">{user.email}</Typography>
                </Box>
            </Menu>
        </>
    );
};

export default Profile;