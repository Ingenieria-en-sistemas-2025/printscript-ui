import {
    Box,
    Button,
    capitalize,
    CircularProgress,
    Input,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    Typography
} from "@mui/material";
import {highlight, languages} from "prismjs";
import {useEffect, useState} from "react";
import Editor from "react-simple-code-editor";

import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism-okaidia.css";
import {Save} from "@mui/icons-material";
import {CreateSnippet, SnippetDraft} from "../../utils/snippet.ts";
import {ModalWrapper} from "../common/ModalWrapper.tsx";
import {useCreateSnippet, useCreateSnippetFromFile, useGetFileTypes} from "../../utils/queries.tsx";
import {queryClient} from "../../App.tsx";

export const AddSnippetModal = ({open, onClose, defaultSnippet}: {
    open: boolean,
    onClose: () => void,
  defaultSnippet?: SnippetDraft
}) => {
    const [language, setLanguage] = useState(defaultSnippet?.language ?? "printscript");
    const [version, setVersion]   = useState(defaultSnippet?.version  ?? "1.1");
    const [code, setCode] = useState(defaultSnippet?.content ?? "");
    const [snippetName, setSnippetName] = useState(defaultSnippet?.name ?? "")
    const [validationError, setValidationError] = useState<string | null> (null);

    const {mutateAsync: createSnippet, isLoading: loadingSnippet} = useCreateSnippet({
        onSuccess: () => queryClient.invalidateQueries('listSnippets')
    })
    const {mutateAsync: createSnippetFromFile, isLoading: loadingFile} = useCreateSnippetFromFile({
      onSuccess: () => queryClient.invalidateQueries('listSnippets')
    })

    const {data: fileTypes} = useGetFileTypes();
    const saving = loadingSnippet || loadingFile;

    useEffect(() => {
        if (!fileTypes) return;
        const ft = fileTypes.find(f => f.language === language);
        if (ft?.versions?.length) {
            setVersion(prev => ft.versions.includes(prev) ? prev : ft.versions[0]);
        }
    }, [language, fileTypes]);

    useEffect(() => {
        if (defaultSnippet) {
            setCode(defaultSnippet.content);
            setLanguage(defaultSnippet.language);
            setSnippetName(defaultSnippet.name);
            if (defaultSnippet.version) setVersion(defaultSnippet.version);
        }
    }, [defaultSnippet]);

    const handleCreateSnippet = async () => {
        setValidationError(null)

        const newSnippet: CreateSnippet = {
            name: snippetName,
            content: code,
            language,
            version,
            extension: fileTypes?.find((f) => f.language === language)?.extension ?? "prs",
            source: defaultSnippet?.source ?? "INLINE"
        };
        try {
            if (defaultSnippet?.file && defaultSnippet.source === "FILE_UPLOAD") {
                await createSnippetFromFile({ meta: newSnippet, file: defaultSnippet.file });
            } else {
                await createSnippet(newSnippet);
            }
            onClose();

        } catch (err: any) {
            const diag = err?.diagnostics?.[0]
            if (diag) {
                setValidationError(
                    `Regla: ${diag.ruleId} – ${diag.message} (línea ${diag.line}, columna ${diag.col})`
                );
            } else {
                setValidationError(err?.message ?? "Error creando snippet");
            }
        }
      };


  return (
    <ModalWrapper open={open} onClose={onClose}>
      {
        <Box sx={{display: 'flex', flexDirection: "row", justifyContent: "space-between"}}>
          <Typography id="modal-modal-title" variant="h5" component="h2"
                      sx={{display: 'flex', alignItems: 'center'}}>
            Add Snippet
          </Typography>
          <Button
            disabled={!snippetName || !code || !language || saving}
            variant="contained"
            disableRipple
            sx={{boxShadow: 0}}
            onClick={handleCreateSnippet}
          >
            <Box pr={1} display={"flex"} alignItems={"center"} justifyContent={"center"}>
              {saving ? <CircularProgress size={24}/> : <Save/>}
            </Box>
            Save Snippet
          </Button>
        </Box>
      }

        {validationError && (
            <Box mt={2}>
                <Typography color="error" sx={{ fontWeight: "bold" }}>
                    {validationError}
                </Typography>
            </Box>
        )}

      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <InputLabel htmlFor="name">Name</InputLabel>
        <Input onChange={e => setSnippetName(e.target.value)} value={snippetName} id="name"
               sx={{width: '50%'}}/>
      </Box>
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <InputLabel htmlFor="name">Language</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={language}
          label="Age"
          onChange={(e: SelectChangeEvent<string>) => setLanguage(e.target.value)}
          sx={{width: '50%'}}
        >
          {
            fileTypes?.map(x => (
              <MenuItem data-testid={`menu-option-${x.language}`} key={x.language}
                        value={x.language}>{capitalize((x.language))}</MenuItem>
            ))
          }
        </Select>
      </Box>

      {/* Version */}
      <Box sx={{ display:'flex', flexDirection:'column', gap:'16px' }}>
        <InputLabel>Version</InputLabel>
        <Select
          value={version}
          onChange={(e: SelectChangeEvent<string>) => setVersion(e.target.value)}
          sx={{ width:'50%' }}
        >
          {(fileTypes?.find(f => f.language === language)?.versions ?? []).map(v => (
            <MenuItem key={v} value={v}>{v}</MenuItem>
          ))}
        </Select>
      </Box>

      <InputLabel>Code Snippet</InputLabel>
      <Box width={"100%"} sx={{
        backgroundColor: 'black', color: 'white', borderRadius: "8px",
      }}>
        <Editor
          value={code}
          padding={10}
          data-testid={"add-snippet-code-editor"}
          onValueChange={(code) => setCode(code)}
          highlight={(code) => highlight(code, languages.js, 'javascript')}
          style={{
            borderRadius: "8px",
            overflow: "auto",
            minHeight: "300px",
            maxHeight: "600px",
            width: "100%",
            fontFamily: "monospace",
            fontSize: 17,
          }}
        />
      </Box>
    </ModalWrapper>
  )
}

