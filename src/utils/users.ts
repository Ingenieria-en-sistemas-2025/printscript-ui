import {Pagination} from "./pagination.ts";

export type PaginatedUsers = Pagination & {
  items: User[]
}

export type User = {
  userId: string;
  name: string;
  email: string;
}