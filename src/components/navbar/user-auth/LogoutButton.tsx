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
                backgroundColor: '#e91e63',
                color: 'white',
                fontWeight: 600,
                textTransform: 'none',
                "&:hover": {
                    backgroundColor: '#ad1457',
                },
            }}
        >
            Log Out
        </Button>
    );
};

export default LogoutButton;
