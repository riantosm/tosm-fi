import { useCallback } from "react";
import { userApprovalService } from "@/services/user-approval.service";
import {
  setUserApprovalList,
  setUserApprovalListLoading,
  updateUserApprovalUser,
  useAppDispatch,
  useAppSelector,
} from "@/redux";

export function useUserApproval() {
  const dispatch = useAppDispatch();
  const users = useAppSelector((state) => state.userApproval.users);
  const status = useAppSelector((state) => state.userApproval.status);

  const loadUsers = useCallback(async () => {
    dispatch(setUserApprovalListLoading());
    const data = await userApprovalService.getList();
    dispatch(setUserApprovalList(data));
  }, [dispatch]);

  const acceptUser = useCallback(
    async (idUser: string) => {
      const updated = await userApprovalService.acceptUser(idUser);
      dispatch(updateUserApprovalUser(updated));
    },
    [dispatch],
  );

  return { users, status, loadUsers, acceptUser };
}
