import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './lab6';

const Stack = createStackNavigator();

export default function RootLayout() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="lab" component={HomeScreen} options={{ headerShown: false }}/>
    </Stack.Navigator>
  );
}
