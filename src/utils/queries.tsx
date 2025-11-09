import {useMutation, UseMutationResult, useQuery, useQueryClient} from 'react-query';
import {CreateSnippet, PaginatedSnippets, Snippet, UpdateSnippet} from './snippet.ts';
import {SnippetOperations} from "./snippetOperations.ts";
import {PaginatedUsers} from "./users.ts";
import {TestCase} from "../types/TestCase.ts";
import {FileType} from "../types/FileType.ts";
import {Rule} from "../types/Rule.ts";
import {Auth0SnippetOperations} from "./adapter/Auth0SnippetOperations";
import {useAuth0} from "@auth0/auth0-react";
import {useEffect} from "react";


export const useSnippetsOperations = () => {
  const {getAccessTokenSilently} = useAuth0()

  useEffect(() => {
      getAccessTokenSilently()
          .then(token => {
              console.log(token)
          })
          .catch(error => console.error(error));
  });

  const snippetOperations: SnippetOperations = new Auth0SnippetOperations(getAccessTokenSilently);

  return snippetOperations
}

export const useGetSnippets = (page: number = 0, pageSize: number = 10, snippetName?: string) => {
  const snippetOperations = useSnippetsOperations()

  return useQuery<PaginatedSnippets, Error>(['listSnippets', page,pageSize,snippetName], () => snippetOperations.listSnippetDescriptors(page, pageSize,snippetName));
};

export const useGetSnippetById = (id: string) => {
  const snippetOperations = useSnippetsOperations()

  return useQuery<Snippet | undefined, Error>(['snippet', id], () => snippetOperations.getSnippetById(id), {
    enabled: !!id, // This query will not execute until the id is provided
  });
};

export const useCreateSnippet = ({onSuccess}: {onSuccess: () => void}): UseMutationResult<Snippet, Error, CreateSnippet> => {
  const snippetOperations = useSnippetsOperations()

  return useMutation<Snippet, Error, CreateSnippet>(createSnippet => snippetOperations.createSnippet(createSnippet), {onSuccess});
};

export const useUpdateSnippetById = ({onSuccess}: {onSuccess: () => void}): UseMutationResult<Snippet, Error, {
  id: string;
  updateSnippet: UpdateSnippet
}> => {
  const snippetOperations = useSnippetsOperations()

  return useMutation<Snippet, Error, { id: string; updateSnippet: UpdateSnippet }>(
      ({id, updateSnippet}) => snippetOperations.updateSnippetById(id, updateSnippet),{
        onSuccess,
    }
  );
};

export const useGetUsers = (name: string = "", page: number = 0, pageSize: number = 10) => {
  const snippetOperations = useSnippetsOperations()

  return useQuery<PaginatedUsers, Error>(['users',name,page,pageSize], () => snippetOperations.getUserFriends(name,page, pageSize));
};

export const useShareSnippet = () => {
    const snippetOperations = useSnippetsOperations()
    return useMutation<Snippet, Error, { snippetId: string; userId: string; permissionType: string }>(
        ({snippetId, userId, permissionType}) => snippetOperations.shareSnippet(snippetId, userId, permissionType)
    );
};


export const useGetTestCases = (snippetId: string) => {
    const ops = useSnippetsOperations();
    return useQuery<TestCase[], Error>(
        ['testCases', snippetId],
        () => ops.getTestCases(snippetId),
        { enabled: !!snippetId }
    );
};


export const usePostTestCase = (snippetId: string, { onSuccess }: { onSuccess?: () => void } = {}) => {
    const ops = useSnippetsOperations();
    const queryClient = useQueryClient();

    return useMutation<TestCase, Error, Partial<TestCase>>(
        (tc) => ops.postTestCase(snippetId, tc),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['testCases', snippetId]);
                onSuccess?.();
            },
        }
    );
};

export const useRemoveTestCase = (snippetId: string, { onSuccess }: { onSuccess?: () => void } = {}) => {
    const ops = useSnippetsOperations();
    const queryClient = useQueryClient();

    return useMutation<string, Error, string>(
        (testCaseId) => ops.removeTestCase(testCaseId),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['testCases', snippetId]);
                onSuccess?.();
            },
        }
    );
};

export type TestCaseResult = {
    status: "OK" | "MISMATCH" | "ERROR";
    actual?: string[] | null;
    expected: string[];
    mismatchAt?: number | null;
    diagnostic?: {
        code: string;
        message: string;
        line?: number | null;
        column?: number | null;
    } | null;
};

export const useTestSnippet = (snippetId: string) => {
    const ops = useSnippetsOperations();
    return useMutation<TestCaseResult, Error, { testCaseId: string }>(
        ({ testCaseId }) => ops.testSnippet(snippetId, testCaseId)
    );
};



export const useGetFormatRules = () => {
  const snippetOperations = useSnippetsOperations()

  return useQuery<Rule[], Error>('formatRules', () => snippetOperations.getFormatRules());
}

export const useModifyFormatRules = ({onSuccess}: {onSuccess: () => void}) => {
  const snippetOperations = useSnippetsOperations()

  return useMutation<Rule[], Error, Rule[]>(
      rule => snippetOperations.modifyFormatRule(rule),
      {onSuccess}
  );
}


export const useGetLintingRules = () => {
  const snippetOperations = useSnippetsOperations()

  return useQuery<Rule[], Error>('lintingRules', () => snippetOperations.getLintingRules());
}


export const useModifyLintingRules = ({onSuccess}: {onSuccess: () => void}) => {
  const snippetOperations = useSnippetsOperations()

  return useMutation<Rule[], Error, Rule[]>(
      rule => snippetOperations.modifyLintingRule(rule),
      {onSuccess}
  );
}

export const useFormatSnippet = (snippetId: string) => {
  const ops = useSnippetsOperations();
  const qc = useQueryClient();

  return useMutation<Snippet, Error, void>({
    mutationKey: ['format-snippet', snippetId],
    mutationFn: () => ops.formatSnippet(snippetId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['snippet', snippetId] });
      qc.invalidateQueries({ queryKey: ['listSnippets'] });
    },
  });
};

export const useDeleteSnippet = ({onSuccess}: {onSuccess: () => void}) => {
  const snippetOperations = useSnippetsOperations()

  return useMutation<string, Error, string>(
      id => snippetOperations.deleteSnippet(id),
      {
        onSuccess,
      }
  );
}


export const useGetFileTypes = () => {
  const snippetOperations = useSnippetsOperations()

  return useQuery<FileType[], Error>('fileTypes', () => snippetOperations.getFileTypes());
}