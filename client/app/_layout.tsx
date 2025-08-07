import { Stack } from 'expo-router';
import { NavigationContainer } from '@react-navigation/native';
import { ChatProvider } from '../src/contexts/ChatContext';

export default function RootLayout() {
  return (
    <NavigationContainer>
      <ChatProvider>
        <Stack>
          <Stack.Screen 
            name="index" 
            options={{
              title: 'Grace Mobile',
              headerShown: false,
            }} 
          />
        </Stack>
      </ChatProvider>
    </NavigationContainer>
  );
}
