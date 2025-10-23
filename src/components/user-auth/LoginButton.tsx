import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@mui/material";

const LoginButton = () => {
    const { loginWithRedirect } = useAuth0();

    return (
        <Button
            id={"login-button"}
            onClick={() => loginWithRedirect()}
            variant="contained"
            color="secondary"
            size="large"
        >
            Log In
        </Button>
    );
};

export default LoginButton;