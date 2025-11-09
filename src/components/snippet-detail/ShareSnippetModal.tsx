import {
    Autocomplete,
    Box,
    Button,
    Divider,
    TextField,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from "@mui/material";
import {ModalWrapper} from "../common/ModalWrapper.tsx";
import { useState} from "react";
import {User} from "../../utils/users.ts";

const PERMISSION_TYPES = [
    { value: "READER", label: "Reader (View/Test)" },
    { value: "EDITOR", label: "Editor (Modify Code)" },
];


type ShareSnippetModalProps = {
    open: boolean
    onClose: () => void
    onShare: (userId: string, permissionType: string) => void
    loading: boolean
    users: User[] | undefined
    usersLoading: boolean
}

export const ShareSnippetModal = (props: ShareSnippetModalProps) => {
    const {open, onClose, onShare, loading, users, usersLoading} = props

    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [permission, setPermission] = useState(PERMISSION_TYPES[0].value)


    function handleSelectUser(newValue: User | null) {
        setSelectedUser(newValue)
    }

    const handleFinalShare = () => {
        if (selectedUser) {
            onShare(selectedUser.userId, permission);
            onClose();
            setSelectedUser(null);
            setPermission(PERMISSION_TYPES[0].value);
        }
    }

    return (
        <ModalWrapper open={open} onClose={onClose}>
            <Typography variant={"h5"}>Share your snippet</Typography>
            <Divider/>
            <Box mt={2}>
                <Autocomplete
                    renderInput={(params) => <TextField {...params} label="Select user to share with"/>}
                    options={users ?? []}
                    isOptionEqualToValue={(option, value) =>
                        option.userId === value.userId
                    }
                    getOptionLabel={(option) => `${option.name} (${option.email})`}
                    loading={loading || usersLoading}
                    value={selectedUser}
                    onChange={(_: unknown, newValue: User | null) => handleSelectUser(newValue)}
                />

                <FormControl fullWidth sx={{ marginTop: 3 }}>
                    <InputLabel id="permission-select-label">Access Type</InputLabel>
                    <Select
                        labelId="permission-select-label"
                        value={permission}
                        label="Access Type"
                        onChange={(e) => setPermission(e.target.value as string)}
                        disabled={!selectedUser}
                    >
                        {PERMISSION_TYPES.map(p => (
                            <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Box mt={4} display={"flex"} width={"100%"} justifyContent={"flex-end"}>
                    <Button onClick={onClose} variant={"outlined"}>Cancel</Button>

                    <Button
                        disabled={!selectedUser || loading || usersLoading}
                        onClick={handleFinalShare}
                        sx={{marginLeft: 2}}
                        variant={"contained"}
                    >
                        Share
                    </Button>
                </Box>
            </Box>
        </ModalWrapper>
    )
}