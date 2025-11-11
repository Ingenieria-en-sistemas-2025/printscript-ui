import { useEffect, useState } from "react";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism-okaidia.css";
import {Alert, Box, CircularProgress, IconButton, TextField, Tooltip, Typography} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {useUpdateSnippetById, useGetUsers, useSnippetsOperations, useRunSnippet} from "../utils/queries.tsx";
import { useFormatSnippet, useGetSnippetById, useShareSnippet } from "../utils/queries.tsx";
import { Bòx } from "../components/snippet-table/SnippetBox.tsx";
import {BugReport, Delete, Download, PlayArrow, Save, Share} from "@mui/icons-material";
import { ShareSnippetModal } from "../components/snippet-detail/ShareSnippetModal.tsx";
import { TestSnippetModal } from "../components/snippet-test/TestSnippetModal.tsx";
import { Snippet } from "../utils/snippet.ts";
import ReadMoreIcon from "@mui/icons-material/ReadMore";
import { queryClient } from "../App.tsx";
import { DeleteConfirmationModal } from "../components/snippet-detail/DeleteConfirmationModal.tsx";

type SnippetDetailProps = {
  id: string;
  handleCloseModal: () => void;
};

const DownloadButton = ({ snippet }: { snippet?: Snippet }) => {
  const snippetOps = useSnippetsOperations();

  if (!snippet) return null;

  const handleDownload = async () => {
    try {
      await snippetOps.downloadSnippet(snippet.id, false); // usa tu endpoint /download
    } catch (err) {
      console.error("Error downloading snippet:", err);
      alert("No tenés permisos para descargar este snippet o ocurrió un error.");
    }
  };

  return (
    <Tooltip title="Download">
      <IconButton sx={{ cursor: "pointer" }} onClick={handleDownload}>
        <Download />
      </IconButton>
    </Tooltip>
  );
};

export const SnippetDetail = (props: SnippetDetailProps) => {
  const { id, handleCloseModal } = props;

  const [code, setCode] = useState("");
  const [inputsText, setInputsText] = useState("");
  const [outputs, setOutputs] = useState<string[]>([]);

  const [shareModalOppened, setShareModalOppened] = useState(false);
  const [deleteConfirmationModalOpen, setDeleteConfirmationModalOpen] = useState(false);
  const [testModalOpened, setTestModalOpened] = useState(false);

  const { data: snippet, isLoading } = useGetSnippetById(id);
  const { mutate: shareSnippet, isLoading: loadingShare } = useShareSnippet();
  const runMutation = useRunSnippet(id);


  const {
    mutate: formatSnippet,
    isLoading: isFormatLoading,
    data: formatSnippetData,
  } = useFormatSnippet(id);

  const { mutate: updateSnippet, isLoading: isUpdateSnippetLoading } = useUpdateSnippetById({
    onSuccess: () => queryClient.invalidateQueries(["snippet", id]),
  });

  const { data: usersData, isLoading: loadingUsers } = useGetUsers();

  useEffect(() => {
    if (snippet) {
      setCode(snippet.content ?? "");
    }
  }, [snippet]);

  useEffect(() => {
    if (formatSnippetData?.content != null) {
      setCode(formatSnippetData.content);
    }
  }, [formatSnippetData]);

    async function handleShareSnippet(userId: string, permissionType: string) {
        shareSnippet({
            snippetId: id,
            userId: userId,
            permissionType: permissionType
        })
    }

  const handleRun = () => {
    const inputs = inputsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    runMutation.mutate(
      { inputs },
      {
        onSuccess: (res) => setOutputs(res.outputs ?? []),
        onError: (e) => {
          console.error(e);
          setOutputs([`<error> ${(e as Error).message}`]);
        },
      }
    );
  };

  return (
    <Box p={4} minWidth={"60vw"}>
      <Box width={"100%"} p={2} display={"flex"} justifyContent={"flex-end"}>
        <CloseIcon style={{ cursor: "pointer" }} onClick={handleCloseModal} />
      </Box>
      {isLoading || loadingUsers ? (
        <>
          <Typography fontWeight={"bold"} mb={2} variant="h4">
            Loading...
          </Typography>
          <CircularProgress />
        </>
      ) : (
        <>
          <Typography variant="h4" fontWeight={"bold"}>
            {snippet?.name ?? "Snippet"}
          </Typography>
          <Box display="flex" flexDirection="row" gap="8px" padding="8px">
            <Tooltip title={"Share"}>
              <IconButton onClick={() => setShareModalOppened(true)}>
                <Share />
              </IconButton>
            </Tooltip>
            <Tooltip title={"Test"}>
              <IconButton onClick={() => setTestModalOpened(true)}>
                <BugReport />
              </IconButton>
            </Tooltip>
            <DownloadButton snippet={snippet} />

            <Tooltip title={"Format"}>
              <IconButton onClick={() => formatSnippet()} disabled={isFormatLoading}>
                <ReadMoreIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title={"Run"}>
              <IconButton onClick={handleRun} disabled={runMutation.isLoading}>
                {runMutation.isLoading ? <CircularProgress size={20} /> : <PlayArrow />}
              </IconButton>
            </Tooltip>

            <Tooltip title={"Save changes"}>
              <IconButton
                color={"primary"}
                onClick={() => updateSnippet({ id: id, updateSnippet: { content: code } })}
                disabled={isUpdateSnippetLoading || snippet?.content === code}
              >
                <Save />
              </IconButton>
            </Tooltip>
            <Tooltip title={"Delete"}>
              <IconButton onClick={() => setDeleteConfirmationModalOpen(true)}>
                <Delete color={"error"} />
              </IconButton>
            </Tooltip>
          </Box>

          <Box display={"flex"} gap={2}>
            <Bòx
              flex={1}
              height={"fit-content"}
              overflow={"none"}
              minHeight={"500px"}
              bgcolor={"black"}
              color={"white"}
              code={code}
            >
              <Editor
                value={code}
                padding={10}
                onValueChange={(code) => setCode(code)}
                highlight={(code) => highlight(code, languages.js, "javascript")}
                maxLength={1000}
                style={{
                  minHeight: "500px",
                  fontFamily: "monospace",
                  fontSize: 17,
                }}
              />
            </Bòx>
          </Box>

          <Box pt={1} flex={1} marginTop={2}>
            <Alert severity="info">Output</Alert>

            <Box
              flex={1}
              height={"fit-content"}
              minHeight={"140px"}
              bgcolor={"black"}
              color={"white"}
              sx={{ p: 2, whiteSpace: "pre-wrap", fontFamily: "monospace" }}
            >
              {outputs.length ? (
                outputs.join("\n")
              ) : (
                <span style={{ opacity: 0.5 }}>—</span>
              )}
            </Box>

            <TextField
              placeholder="Type your inputs here"
              value={inputsText}
              onChange={(e) => setInputsText(e.target.value)}
              fullWidth
              multiline
              minRows={2}
              sx={{ mt: 1 }}
              helperText="Cada línea se envía como un input separado"
            />
          </Box>
        </>
      )}

      <ShareSnippetModal
        loading={loadingShare}
        open={shareModalOppened}
        onClose={() => setShareModalOppened(false)}
        onShare={handleShareSnippet}
        users={usersData?.items}
        usersLoading={loadingUsers}
      />

      <TestSnippetModal
        open={testModalOpened}
        onClose={() => setTestModalOpened(false)}
        snippetId={id}
      />

      <DeleteConfirmationModal
        open={deleteConfirmationModalOpen}
        onClose={() => setDeleteConfirmationModalOpen(false)}
        id={snippet?.id ?? ""}
        setCloseDetails={handleCloseModal}
      />
    </Box>
  );
};