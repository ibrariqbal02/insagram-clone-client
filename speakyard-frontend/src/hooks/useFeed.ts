import { useQuery } from "@tanstack/react-query";
import { getFeed, getReels } from "../services/feed.service";

export const useFeed = () => {
  return useQuery({
    queryKey: ["feed"],
    queryFn: getFeed,
  });
};

export const useReels = () => {
  return useQuery({
    queryKey: ["reels"],
    queryFn: getReels,
  });
};
