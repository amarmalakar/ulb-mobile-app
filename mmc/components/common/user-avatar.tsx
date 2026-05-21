import { Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Text } from "../ui/text";
import { useAuthContext } from "../provider/auth-provider";

export function UserAvatar({
  userName,
}: {
  userName: string;
}) {
  const { authType } = useAuthContext();
  const router = useRouter();

  const onAvatarPress = () => {
    const path = authType === 'Staff' ? '/staff/staff-account-screen' : '/user/user-account-screen';
    router.push(path)
  }

  return (
    <Pressable onPress={onAvatarPress} className='shadow-lg'>
      <Avatar alt={`${userName} avatar`}>
        <AvatarFallback className="rounded-xl bg-white/90">
          <Text className="text-xs font-bold text-[#007A3D]">
            {userName.slice(0, 2).toUpperCase()}
          </Text>
        </AvatarFallback>
      </Avatar>
    </Pressable>
  );
}