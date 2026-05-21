import { useStaffAuth } from '@/components/provider/staff-auth-provider';
import { Stack } from 'expo-router';
import { View } from 'react-native';
import { HomeBanner } from '@/features/home-banner';
import { BottomNav } from '@/components/common/bottom-nav';

export default function StaffHomeScreen() {
  const { staffInfo } = useStaffAuth();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="bg-background flex-1">
        <HomeBanner userName={staffInfo?.name ?? 'Staff'} />

        <BottomNav activeItemId="home" />
      </View>
    </>
  );

  // return (
  //   <>
  //     <Stack.Screen options={{ headerShown: false }} />

  //     <View className="flex-1 bg-background px-6 pb-8 pt-16">
  //       <View className="flex-row items-center justify-between">
  //         <Text className="text-xl font-extrabold text-foreground">Staff Home</Text>
  //         <Button
  //           variant="ghost"
  //           size="icon"
  //           className="rounded-full bg-primary/10"
  //           onPress={() => void handleLogout()}
  //         >
  //           <LogOutIcon size={20} className="text-primary" />
  //         </Button>
  //       </View>

  //       <View className="mt-10 flex-1 gap-4">
  //         {isStaffInfoLoading ? (
  //           <Text className="text-muted-foreground">Loading profile…</Text>
  //         ) : (
  //           <>
  //             <Text className="text-2xl font-bold text-foreground">
  //               Welcome, {staffInfo?.name ?? 'Staff'}
  //             </Text>
  //             {staffInfo?.positionName ? (
  //               <Text className="text-muted-foreground text-base">{staffInfo.positionName}</Text>
  //             ) : null}
  //             {staffInfo?.email ? (
  //               <Text className="text-muted-foreground text-sm">{staffInfo.email}</Text>
  //             ) : null}
  //           </>
  //         )}
  //       </View>

  //       <Button
  //         variant="outline"
  //         className="h-14 rounded-2xl border-primary"
  //         onPress={() => void handleLogout()}
  //       >
  //         <Text className="font-semibold text-primary">Log out</Text>
  //       </Button>
  //     </View>
  //   </>
  // );
}
