import { SnippetOperations } from "../snippetOperations.ts";
import { CreateSnippet, PaginatedSnippets, Snippet, UpdateSnippet } from "../snippet.ts";
import { PaginatedUsers } from "../users.ts";
import { TestCase } from "../../types/TestCase.ts";
import { TestCaseResult } from "../queries.tsx";
import { FileType } from "../../types/FileType.ts";
import { Rule } from "../../types/Rule.ts";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export class Auth0SnippetOperations implements SnippetOperations {
    private getAccessTokenSilently: () => Promise<string>;

    constructor(getAccessTokenSilently: () => Promise<string>) {
        this.getAccessTokenSilently = getAccessTokenSilently;
    }

    private async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
        const token = await this.getAccessTokenSilently();

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers,
        };

        const response = await fetch(url, {
            ...options,
            headers,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response;
    }

    async listSnippetDescriptors(
        page: number,
        pageSize: number,
        snippetName?: string
    ): Promise<PaginatedSnippets> {
        const params = new URLSearchParams({
            page: page.toString(),
            pageSize: pageSize.toString(),
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
            `${API_BASE_URL}/snippets/create`,
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
            `${API_BASE_URL}/snippets/users?${params.toString()}`
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

    async getTestCases(): Promise<TestCase[]> {
        const response = await this.fetchWithAuth(
            `${API_BASE_URL}/snippets/cases/all`
        );
        return response.json();
    }

    async postTestCase(testCase: Partial<TestCase>): Promise<TestCase> {
        const response = await this.fetchWithAuth(
            `${API_BASE_URL}/snippets/cases`,
            {
                method: 'POST',
                body: JSON.stringify(testCase),
            }
        );
        return response.json();
    }

    async removeTestCase(id: string): Promise<string> {
        await this.fetchWithAuth(
            `${API_BASE_URL}/snippets/cases/${id}`,
            {
                method: 'DELETE',
            }
        );
        return id;
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

    async testSnippet(testCase: Partial<TestCase>): Promise<TestCaseResult> {
        const testCaseId = testCase.id;
        if (!testCaseId) {
            throw new Error('Test case ID is required');
        }

        const response = await this.fetchWithAuth(
            `${API_BASE_URL}/snippets/run/case/${testCaseId}`,
            {
                method: 'POST',
                body: JSON.stringify(testCase),
            }
        );
        const data = await response.json();
        return data.result === 'success' ? 'success' : 'fail';
    }
}