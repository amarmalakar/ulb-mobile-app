import { useAppInitContext } from '@/components/provider/app-init-provider';
import { useAuthContext } from '@/components/provider/auth-provider';
import { useStaffAuth } from '@/components/provider/staff-auth-provider';
import { useUserAuth } from '@/components/provider/user-auth-provider';

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return value;
}

export function useAccountProfile() {
  const { authType } = useAuthContext();
  const { ulb } = useAppInitContext();
  const {
    userInfo,
    isUserInfoLoading,
    userInfoError,
  } = useUserAuth();
  const {
    staffInfo,
    isStaffInfoLoading,
    staffInfoError,
  } = useStaffAuth();

  const isStaff = authType === 'Staff';
  const isUser = authType === 'User';

  const name = isStaff
    ? staffInfo?.name
    : userInfo?.name;

  const email = isStaff
    ? staffInfo?.email
    : userInfo?.email;

  const phone = isStaff
    ? staffInfo?.phoneNumber
    : userInfo?.phone;

  const subtitle = isStaff
    ? staffInfo?.positionName
    : userInfo?.wardNumber != null
      ? `Ward ${userInfo.wardNumber}`
      : null;

  const isLoading = isStaff ? isStaffInfoLoading : isUserInfoLoading;
  const error = isStaff ? staffInfoError : userInfoError;

  return {
    authType,
    ulb,
    name: name ?? (isStaff ? 'Staff' : 'User'),
    email: email ?? null,
    phone: phone ? formatPhone(phone) : null,
    subtitle,
    isLoading,
    error,
    isStaff,
    isUser,
  };
}
