import { Stack } from 'expo-router';
import { TaskProvider } from './TaskContext';

export default function RootLayout() {
  return (
    <TaskProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="add-task" />
        <Stack.Screen name="general" />
        <Stack.Screen name="calendar" />
        <Stack.Screen name="task-view" />
      </Stack>
    </TaskProvider>
  );
}