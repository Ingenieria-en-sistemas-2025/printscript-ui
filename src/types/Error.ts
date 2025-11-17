export type DiagnosticDto = {
    ruleId: string;
    message: string;
    line: number;
    col: number;
};

export type ApiErrorWithDiagnostics = Error & {
    status?: number;
    code?: string;
    diagnostics?: DiagnosticDto[];
};