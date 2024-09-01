import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useFollow = () => {
  const queryClient = useQueryClient();

  const { mutate: follow, isPending } = useMutation({
    mutationFn: async (userId) => {
      const res = await fetch(`/api/user/follow/${userId}`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] });
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onErrror: (error) => toast.error(error.message),
  });

  return {follow, isPending};
};
