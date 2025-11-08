import {useState, useEffect} from "react";
import {TestCase} from "../../types/TestCase.ts";
import {Autocomplete, Box, Button, Chip, TextField, Typography} from "@mui/material";
import {BugReport, Delete, Save} from "@mui/icons-material";
import {useTestSnippet} from "../../utils/queries.tsx";

type TabPanelProps = {
    index: number;
    value: number;
    snippetId: string;
    test?: TestCase;
    setTestCase: (test: Partial<TestCase>) => void;
    removeTestCase?: (testIndex: string) => void;
}

export const TabPanel = ({value, index, snippetId, test: initialTest, setTestCase, removeTestCase}: TabPanelProps) => {
    const [testData, setTestData] = useState<Partial<TestCase> | undefined>(initialTest);

    useEffect(() => setTestData(initialTest), [initialTest?.id]);

    const { mutateAsync: runSingleTest, data: runResult } = useTestSnippet(snippetId);
    const status = runResult?.status?.toUpperCase?.();
    const isPass = status === "OK" || status === "PASS" || status === "SUCCESS";
    const isMismatch = status === "MISMATCH" || status === "FAIL";

    const onSave = () =>
        setTestCase({
            id: testData?.id,
            name: testData?.name ?? "",
            inputs: (testData?.inputs ?? []) as string[],
            expectedOutputs: (testData?.expectedOutputs ?? []) as string[],
            targetVersionNumber: testData?.targetVersionNumber ?? null,
        });

    const onRun = async () => {
        if (!testData?.id) return;
        await runSingleTest({ testCaseId: testData.id });
    };


    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`vertical-tabpanel-${index}`}
            aria-labelledby={`vertical-tab-${index}`}
            style={{ width: "100%", height: "100%" }}
        >
            {value === index && (
                <Box sx={{ px: 3 }} display="flex" flexDirection="column" gap={2}>
                    <Box display="flex" flexDirection="column" gap={1}>
                        <Typography fontWeight="bold">Name</Typography>
                        <TextField
                            size="small"
                            value={testData?.name ?? ""}
                            onChange={(e) => setTestData({ ...testData, name: e.target.value })}
                        />
                    </Box>

                    <Box display="flex" flexDirection="column" gap={1}>
                        <Typography fontWeight="bold">Inputs</Typography>
                        <Autocomplete
                            multiple
                            size="small"
                            id="inputs"
                            freeSolo
                            value={(testData?.inputs ?? []) as string[]}
                            onChange={(_, value) => setTestData({ ...testData, inputs: value })}
                            renderTags={(tagValue, getTagProps) =>
                                tagValue.map((option, index) => {
                                    const tagProps = getTagProps({ index });
                                    return (
                                        <Chip
                                            {...tagProps}
                                            variant="outlined"
                                            label={option}
                                        />
                                    );
                                })
                            }
                            renderInput={(params) => <TextField {...params} />}
                            options={[]}
                        />
                    </Box>

                    <Box display="flex" flexDirection="column" gap={1}>
                        <Typography fontWeight="bold">Expected outputs</Typography>
                        <Autocomplete
                            multiple
                            size="small"
                            id="expected-outputs"
                            freeSolo
                            value={(testData?.expectedOutputs ?? []) as string[]}
                            onChange={(_, value) => setTestData({ ...testData, expectedOutputs: value })}
                            renderTags={(tagValue, getTagProps) =>
                                tagValue.map((option, index) => {
                                    const tagProps = getTagProps({ index });
                                    return (
                                        <Chip
                                            {...tagProps}
                                            variant="outlined"
                                            label={option}
                                        />
                                    );
                                })
                            }
                            renderInput={(params) => <TextField {...params} />}
                            options={[]}
                        />
                    </Box>

                    <Box display="flex" flexDirection="row" gap={1} alignItems="center">
                        {testData?.id && removeTestCase && (
                            <Button onClick={() => removeTestCase(testData.id!)} variant="outlined" color="error" startIcon={<Delete />}>
                                Remove
                            </Button>
                        )}
                        <Button disabled={!testData?.name} onClick={onSave} variant="outlined" startIcon={<Save />}>
                            Save
                        </Button>
                        <Button
                            disabled={!testData?.id}
                            onClick={onRun}
                            variant="contained"
                            startIcon={<BugReport />}
                            disableElevation
                        >
                            Test
                        </Button>


                        {runResult && (
                            <>
                                {isPass && <Chip label="Pass" color="success" />}
                                {isMismatch && (
                                    <Chip
                                        label={`Fail${typeof runResult.mismatchAt === "number" ? ` @ ${runResult.mismatchAt}` : ""}`}
                                        color="error"
                                    />
                                )}
                                {status === "ERROR" && (
                                    <Chip
                                        label={runResult.diagnostic?.message ? `Error: ${runResult.diagnostic.message}` : "Error"}
                                        color="warning"
                                    />
                                )}
                            </>
                        )}
                    </Box>
                </Box>
            )}
        </div>
    );
};