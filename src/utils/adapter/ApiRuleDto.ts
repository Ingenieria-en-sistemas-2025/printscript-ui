import { Rule } from "../../types/Rule";

export type ApiRuleDto = { id: string; enabled: boolean; value?: number | string | null };

const prettifyId = (s: string) =>
  s.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export const toUiRule = (r: ApiRuleDto): Rule => ({
  id: r.id,
  name: prettifyId(r.id),
  isActive: !!r.enabled,
  value: r.value ?? null,
});

export const toApiRules = (rules: Rule[]): ApiRuleDto[] =>
  rules.map((r) => ({
    id: r.id,
    enabled: !!r.isActive,
    value:
      typeof r.value === "number"
        ? r.value
        : typeof r.value === "string" && r.value.trim() !== ""
          ? Number(r.value)
          : undefined,
  }));