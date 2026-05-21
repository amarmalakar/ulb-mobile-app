import { useUserAuth } from '@/components/provider/user-auth-provider';
import { Stack } from 'expo-router';
import { View } from 'react-native';
import { HomeBanner } from '@/features/home-banner';
import { BottomNav } from '@/components/common/bottom-nav';

export default function UserHomeScreen() {
  const { userInfo } = useUserAuth();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="bg-background flex-1">
        <HomeBanner userName={userInfo?.name ?? 'User'} />

        <BottomNav activeItemId="home" />
      </View>
    </>
  );

  // return (
  //   <>
  //     <Stack.Screen options={{ headerShown: false }} />

  //     <View className="flex-1 bg-background px-6 pb-8 pt-16">
  //       <View className="flex-row items-center justify-between">
  //         <View>
  //           <Text className="text-xl font-extrabold text-foreground">Home</Text>
  //           {ulb?.name ? (
  //             <Text className="text-sm text-muted-foreground">{ulb.name}</Text>
  //           ) : null}
  //         </View>
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
  //         {isUserInfoLoading ? (
  //           <Text className="text-muted-foreground">Loading profile…</Text>
  //         ) : (
  //           <>
  //             <Text className="text-2xl font-bold text-foreground">
  //               Welcome, {userInfo?.name ?? 'User'}
  //             </Text>
  //             {userInfo?.phone ? (
  //               <Text className="text-base text-muted-foreground">
  //                 {formatPhone(userInfo.phone)}
  //               </Text>
  //             ) : null}
  //             {userInfo?.email ? (
  //               <Text className="text-sm text-muted-foreground">{userInfo.email}</Text>
  //             ) : null}
  //             {userInfo?.wardNumber != null ? (
  //               <Text className="text-sm text-muted-foreground">
  //                 Ward {userInfo.wardNumber}
  //               </Text>
  //             ) : null}
  //             {userInfo?.holdingNumber ? (
  //               <Text className="text-sm text-muted-foreground">
  //                 Holding {userInfo.holdingNumber}
  //               </Text>
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
