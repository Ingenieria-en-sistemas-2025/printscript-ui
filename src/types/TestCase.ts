export type TestCase = {
    id: string;
    name: string;
    inputs?: string[];
    expectedOutputs: string[];
    targetVersionNumber?: number | null;
};