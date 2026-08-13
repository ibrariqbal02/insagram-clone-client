import { useQuery } from "@tanstack/react-query";
import { getFeed } from "../services/feed.service";

export const useFeed = () => {
  return useQuery({
    queryKey: ["feed"],
    queryFn: getFeed,
  });
};