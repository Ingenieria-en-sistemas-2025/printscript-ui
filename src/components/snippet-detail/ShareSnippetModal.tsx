import {Autocomplete, Box, Button, Divider, TextField, Typography} from "@mui/material";
import {ModalWrapper} from "../common/ModalWrapper.tsx";
import { useState} from "react";
import {User} from "../../utils/users.ts";

type ShareSnippetModalProps = {
    open: boolean
    onClose: () => void
    onShare: (userId: string) => void
    loading: boolean
    users: User[] | undefined
    usersLoading: boolean
}

export const ShareSnippetModal = (props: ShareSnippetModalProps) => {
    const {open, onClose, onShare, loading, users, usersLoading} = props

    const [selectedUser, setSelectedUser] = useState<User | null>(null)


    function handleSelectUser(newValue: User | null) {
        setSelectedUser(newValue)
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
              <Box mt={4} display={"flex"} width={"100%"} justifyContent={"flex-end"}>
                  <Button onClick={onClose} variant={"outlined"}>Cancel</Button>
                  <Button disabled={!selectedUser || loading || usersLoading} onClick={() => selectedUser && onShare(selectedUser.userId)} sx={{marginLeft: 2}} variant={"contained"}>Share</Button>
              </Box>
          </Box>
      </ModalWrapper>
    )
}