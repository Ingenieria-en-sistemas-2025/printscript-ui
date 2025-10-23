import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@mui/material";

const LogoutButton = () => {
    const { logout } = useAuth0();

    return (
        <Button
            onClick={() => {
                logout({ logoutParams: { returnTo: window.location.origin } });
            }}
            variant="text"
            color="error"
            size="small"
            sx={{ width: '100%', justifyContent: 'flex-start' }}
        >
            Log Out
        </Button>
    );
};

export default LogoutButton;