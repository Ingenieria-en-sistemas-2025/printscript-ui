import React, { useEffect, useState } from "react";
import {
    Button,
    Card,
    Checkbox,
    List,
    ListItem,
    ListItemText,
    TextField,
    Typography,
} from "@mui/material";
import {
    useGetLintingRules,
    useModifyLintingRules,
} from "../../utils/queries.tsx";
import { queryClient } from "../../App.tsx";
import { Rule } from "../../types/Rule.ts";

const LintingRulesList = () => {
    const [rules, setRules] = useState<Rule[] | undefined>([]);

    const { data, isLoading } = useGetLintingRules();
    const { mutateAsync, isLoading: isLoadingMutate } = useModifyLintingRules({
        onSuccess: () => queryClient.invalidateQueries("lintingRules"),
    });

    useEffect(() => {
        setRules(data);
    }, [data]);

    const handleValueChange = (rule: Rule, newValue: string | number) => {
        const newRules = rules?.map((r) =>
            r.name === rule.name ? { ...r, value: newValue } : r
        );
        setRules(newRules);
    };

    const handleNumberChange =
        (rule: Rule) => (event: React.ChangeEvent<HTMLInputElement>) => {
            const value = parseInt(event.target.value, 10);
            handleValueChange(rule, isNaN(value) ? 0 : value);
        };

    const toggleRule = (rule: Rule) => () => {
        const newRules = rules?.map((r) =>
            r.name === rule.name ? { ...r, isActive: !r.isActive } : r
        );
        setRules(newRules);
    };

    return (
        <Card style={{ padding: 16, margin: 16 }}>
            <Typography variant="h6">Linting rules</Typography>
            <List sx={{ width: "100%", bgcolor: "background.paper" }}>
                {isLoading || isLoadingMutate ? (
                    <Typography style={{ height: 80 }}>Loading...</Typography>
                ) : (
                    rules?.map((rule) => {
                        const isIdentifierRule = rule.id === "IdentifierStyleRuleStreaming";
                        return (
                            <ListItem
                                key={rule.name}
                                disablePadding
                                style={{ height: "auto", alignItems: "center" }}
                            >
                                <Checkbox
                                    edge="start"
                                    checked={rule.isActive}
                                    disableRipple
                                    onChange={toggleRule(rule)}
                                />
                                <ListItemText primary={rule.name} />

                                {/* Identifiers rule → show dropdown only if active */}
                                {isIdentifierRule && rule.isActive ? (
                                    <TextField
                                        select
                                        variant="standard"
                                        value={rule.value || "CAMEL_CASE"}
                                        onChange={(e) =>
                                            handleValueChange(rule, e.target.value.toUpperCase())
                                        }
                                        SelectProps={{ native: true }}
                                        sx={{ width: 160, ml: 2 }}
                                    >
                                        <option value="CAMEL_CASE">CAMEL_CASE</option>
                                        <option value="SNAKE_CASE">SNAKE_CASE</option>
                                    </TextField>
                                ) : typeof rule.value === "number" ? (
                                    <TextField
                                        type="number"
                                        variant="standard"
                                        value={rule.value}
                                        onChange={handleNumberChange(rule)}
                                        sx={{ width: 80, ml: 2 }}
                                    />
                                ) : typeof rule.value === "string" && rule.value ? (
                                    <TextField
                                        variant="standard"
                                        value={rule.value}
                                        onChange={(e) =>
                                            handleValueChange(rule, e.target.value.toUpperCase())
                                        }
                                        sx={{ width: 160, ml: 2 }}
                                    />
                                ) : null}
                            </ListItem>
                        );
                    })
                )}
            </List>

            <Button
                disabled={isLoading || isLoadingMutate}
                variant="contained"
                onClick={() => mutateAsync(rules ?? [])}
            >
                Save
            </Button>
        </Card>
    );
};

export default LintingRulesList;
