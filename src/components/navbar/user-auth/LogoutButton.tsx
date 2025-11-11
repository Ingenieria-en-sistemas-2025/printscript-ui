import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@mui/material";

const LogoutButton = () => {
    const { logout } = useAuth0();

    return (
        <Button
            onClick={() => {
                logout({ logoutParams: { returnTo: window.location.origin } });
            }}
            variant="contained"
            size="small"
            sx={{
                backgroundColor: '#f8bbd0',
                color: '#f48fb1',
                fontWeight: 600,
                textTransform: 'none',
                "&:hover": {
                    backgroundColor: '#ad1457',
                },
            }}
        >
            LOG OUT
        </Button>
    );
};

export default LogoutButton;
