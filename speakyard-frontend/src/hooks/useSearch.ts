import { useQuery } from "@tanstack/react-query";
import {
  searchUsers,
  searchPosts,
} from "../services/search.service";

export const useSearchUsers = (keyword: string) => {
  return useQuery({
    queryKey: ["search-users", keyword],
    queryFn: () => searchUsers(keyword),
    enabled: keyword.trim().length > 0,
  });
};

export const useSearchPosts = (keyword: string) => {
  return useQuery({
    queryKey: ["search-posts", keyword],
    queryFn: () => searchPosts(keyword),
    enabled: keyword.trim().length > 0,
  });
};