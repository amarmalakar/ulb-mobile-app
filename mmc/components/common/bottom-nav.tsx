import { Pressable, View } from 'react-native';

import { cn } from "@/lib/utils";
import { router } from 'expo-router';
import { Text } from "@/components/ui/text";
import {
  ChartPieIcon,
  HistoryIcon,
  MapPinnedIcon,
  SchoolIcon,
  TicketSlashIcon,
  CalendarClockIcon,
  CircleUserRoundIcon,
  ChartScatterIcon,
  HouseIcon
} from 'lucide-react-native';
import { useAuthContext } from "@/components/provider/auth-provider";

const userItems = [
  { id: 'home', label: 'Home', icon: HouseIcon, route: '/user/home-screen' },
  // { id: 'near-me', label: 'Near me', icon: MapPinnedIcon, route: '/(user)/near-me-screen' },
  // { id: 'booking-list', label: 'Booking', icon: SchoolIcon, route: '/(user)/booking-list-screen' },
  // { id: 'analytics', label: 'Analytics', icon: ChartPieIcon, route: '/(user)/analytics-screen' },
  // { id: 'tickets', label: 'Tickets', icon: HistoryIcon, route: '/(user)/tickets-screen' },
  { id: 'account', label: 'Account', icon: CircleUserRoundIcon, route: '/user/user-account-screen' },
];

const staffItems = [
  { id: 'home', label: 'Home', icon: HouseIcon, route: '/staff/home-screen' },
  // { id: 'tickets', label: 'Tickets', icon: TicketSlashIcon, route: '/(staff)/ticket-screen' },
  // { id: 'attendance', label: 'Attendance', icon: CalendarClockIcon, route: '/(staff)/attendance-screen' },
  // { id: 'analytics', label: 'Analytics', icon: ChartScatterIcon, route: '/(staff)/analytics-screen' },
  { id: 'account', label: 'Account', icon: CircleUserRoundIcon, route: '/staff/staff-account-screen' },
];

export function BottomNav({ activeItemId }: {
  activeItemId?: string;
}) {
  const { authType } = useAuthContext();
  const items = authType === "User" ? userItems : staffItems;

  return (
    <View
      className="absolute bottom-0 left-0 right-0 px-4 pb-4"
      style={{ elevation: 14 }}
    >
      <View
        className="bg-card border-border flex-row items-center justify-between rounded-full border px-2 py-2 shadow-lg shadow-black/20 dark:shadow-white/20"
        style={{ elevation: 14 }}
      >
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === activeItemId;
          const route = item.route ?? '/';

          return (
            <Pressable
              key={item.id}
              className={cn(
                'h-12 flex-row items-center justify-center rounded-full',
                isActive ? 'bg-primary px-4' : 'w-12'
              )}
              onPress={() => router.push(route as never)}
            >
              <Icon size={20} color={isActive ? '#FFFFFF' : '#94A3B8'} />
              {isActive ? (
                <Text className="text-primary-foreground ml-2 text-sm font-semibold">
                  {item.label}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  )
}