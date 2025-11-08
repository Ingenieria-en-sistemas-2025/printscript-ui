import { SnippetOperations } from "../snippetOperations.ts";
import { CreateSnippet, PaginatedSnippets, Snippet, UpdateSnippet } from "../snippet.ts";
import { PaginatedUsers } from "../users.ts";
import { TestCase } from "../../types/TestCase.ts";
import { TestCaseResult } from "../queries.tsx";
import { FileType } from "../../types/FileType.ts";
import { Rule } from "../../types/Rule.ts";
import type { GetTokenSilentlyOptions } from '@auth0/auth0-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/";
const AUD = import.meta.env.VITE_AUTH0_AUDIENCE;
const SCOPE = import.meta.env.VITE_AUTH0_SCOPE ?? "";

export class Auth0SnippetOperations implements SnippetOperations {
    private getAccessTokenSilently: (opts?: GetTokenSilentlyOptions) => Promise<string>;

    constructor(getAccessTokenSilently: (opts?: GetTokenSilentlyOptions) => Promise<string>) {
        this.getAccessTokenSilently = getAccessTokenSilently;
    }

    private async fetchWithAuth(path: string, options: RequestInit = {}): Promise<Response> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string>),
        };

        try {
            const token = await this.getAccessTokenSilently({
                authorizationParams: { audience: AUD, scope: SCOPE },
            });
            if (token && token !== 'undefined' && token !== 'null') {
                headers['Authorization'] = `Bearer ${token}`;
            }
        } catch {
        }

        const url = path.startsWith('http')
            ? path
            : `${(import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')}${path.startsWith('/') ? '' : '/'}${path}`;

        const res = await fetch(url, { ...options, headers });
        if (!res.ok) {
            const t = await res.text().catch(() => '');
            throw new Error(`HTTP ${res.status} ${url} -> ${t}`);
        }
        return res;
    }

    async listSnippetDescriptors(
        page: number,
        pageSize: number,
        snippetName?: string
    ): Promise<PaginatedSnippets> {
        const params = new URLSearchParams({
            page: page.toString(),
            size: pageSize.toString(),
        });

        if (snippetName) {
            params.append('name', snippetName);
        }

        const response = await this.fetchWithAuth(
            `${API_BASE_URL}/snippets/all?${params.toString()}`
        );
        return response.json();
    }

    async createSnippet(createSnippet: CreateSnippet): Promise<Snippet> {
        const response = await this.fetchWithAuth(
            `${API_BASE_URL}/snippets`,
            {
                method: 'POST',
                body: JSON.stringify(createSnippet),
            }
        );
        return response.json();
    }

    async getSnippetById(id: string): Promise<Snippet | undefined> {
        try {
            const response = await this.fetchWithAuth(
                `${API_BASE_URL}/snippets/${id}`
            );
            return response.json();
        } catch (error) {
            console.error('Error fetching snippet:', error);
            return undefined;
        }
    }

    async updateSnippetById(id: string, updateSnippet: UpdateSnippet): Promise<Snippet> {
        const response = await this.fetchWithAuth(
            `${API_BASE_URL}/snippets/${id}`,
            {
                method: 'PUT',
                body: JSON.stringify(updateSnippet),
            }
        );
        return response.json();
    }

    async getUserFriends(
        name?: string,
        page?: number,
        pageSize?: number
    ): Promise<PaginatedUsers> {
        const params = new URLSearchParams();

        if (name) params.append('name', name);
        if (page !== undefined) params.append('page', page.toString());
        if (pageSize !== undefined) params.append('pageSize', pageSize.toString());

        const response = await this.fetchWithAuth(
            `${API_BASE_URL}/api/users?${params.toString()}`
        );
        return response.json();
    }

    async shareSnippet(snippetId: string, userId: string): Promise<Snippet> {
        const response = await this.fetchWithAuth(
            `${API_BASE_URL}/snippets/share`,
            {
                method: 'POST',
                body: JSON.stringify({ snippetId, userId }),
            }
        );
        return response.json();
    }

    async getFormatRules(): Promise<Rule[]> {
        const response = await this.fetchWithAuth(
            `${API_BASE_URL}/snippets/rules/format`
        );
        return response.json();
    }

    async getLintingRules(): Promise<Rule[]> {
        const response = await this.fetchWithAuth(
            `${API_BASE_URL}/snippets/rules/linting`
        );
        return response.json();
    }

    async modifyFormatRule(newRules: Rule[]): Promise<Rule[]> {
        const response = await this.fetchWithAuth(
            `${API_BASE_URL}/snippets/rules`,
            {
                method: 'PUT',
                body: JSON.stringify({ type: 'format', rules: newRules }),
            }
        );
        return response.json();
    }

    async modifyLintingRule(newRules: Rule[]): Promise<Rule[]> {
        const response = await this.fetchWithAuth(
            `${API_BASE_URL}/snippets/rules`,
            {
                method: 'PUT',
                body: JSON.stringify({ type: 'linting', rules: newRules }),
            }
        );
        return response.json();
    }

    async getFileTypes(): Promise<FileType[]> {
        const response = await this.fetchWithAuth(
            `${API_BASE_URL}/snippets/config/filetypes`
        );
        return response.json();
    }

    async getTestCases(snippetId: string): Promise<TestCase[]> {
        const res = await this.fetchWithAuth(
            `${API_BASE_URL}/snippets/${snippetId}/tests`
        );
        return res.json();
    }

    async postTestCase(snippetId: string, tc: Partial<TestCase>) {
        const body = JSON.stringify({
            name: tc.name ?? "",
            inputs: tc.inputs ?? [],
            expectedOutputs: tc.expectedOutputs ?? [],
            targetVersionNumber: tc.targetVersionNumber ?? null,
        });
        const res = await this.fetchWithAuth(`${API_BASE_URL}/snippets/${snippetId}/tests`, {
            method: 'POST',
            body,
        });
        return res.json();
    }


    async removeTestCase(testCaseId: string): Promise<string> {
        await this.fetchWithAuth(
            `${API_BASE_URL}/snippets/tests/${testCaseId}`,
            { method: 'DELETE' }
        );
        return testCaseId;
    }

    async deleteSnippet(id: string): Promise<string> {
        await this.fetchWithAuth(
            `${API_BASE_URL}/snippets/${id}`,
            {
                method: 'DELETE',
            }
        );
        return id;
    }

    async formatSnippet(snippet: string): Promise<string> {
        const response = await this.fetchWithAuth(
            `${API_BASE_URL}/snippets/run/format`,
            {
                method: 'POST',
                body: JSON.stringify({ content: snippet }),
            }
        );
        const data = await response.json();
        return data.formattedContent || data.content || snippet;
    }

    async testSnippet(snippetId: string, testCaseId: string): Promise<TestCaseResult> {
        const res = await this.fetchWithAuth(
            `${API_BASE_URL}/snippets/${snippetId}/tests/${testCaseId}/run`,
            { method: 'POST' },
        );
        return res.json();
    }
}