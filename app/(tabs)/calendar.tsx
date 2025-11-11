import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { useTasks } from './TaskContext';
import MenuModal from '../../components/MenuModal';

export default function Calendar() {
  const { tasks, getCategoryColor } = useTasks();
  const [showMenu, setShowMenu] = useState(false);

  // Filter calendar/scheduled tasks
  const calendarTasks = tasks.filter(t => t.destination === 'calendar' && !t.completed);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>Calendar</Text>
        <TouchableOpacity onPress={() => setShowMenu(true)}>
          <Text style={styles.menuButton}>⋮</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scheduled Tasks</Text>
          <Text style={styles.sectionSubtitle}>{calendarTasks.length} tasks scheduled</Text>
        </View>

        <View style={styles.taskList}>
          {calendarTasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No scheduled tasks</Text>
              <Text style={styles.emptyStateSubtext}>
                Add tasks with due dates to see them here
              </Text>
            </View>
          ) : (
            calendarTasks.map((task) => (
              <View
                key={task.id}
                style={[
                  styles.taskItem,
                  { backgroundColor: task.category ? getCategoryColor(task.category) : 'white' }
                ]}
              >
                <View style={styles.taskContent}>
                  <Text style={styles.taskText}>{task.title}</Text>
                  {task.dueDateTime && (
                    <Text style={styles.taskDueDate}>🕐 {task.dueDateTime}</Text>
                  )}
                  {task.category && (
                    <Text style={styles.taskCategory}>📋 {task.category}</Text>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <MenuModal visible={showMenu} onClose={() => setShowMenu(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  menuButton: {
    fontSize: 24,
    color: '#333',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  taskList: {
    padding: 20,
  },
  taskItem: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  taskContent: {
    flex: 1,
  },
  taskText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 6,
    fontWeight: '500',
  },
  taskDueDate: {
    fontSize: 14,
    color: '#FF9800',
    marginBottom: 4,
  },
  taskCategory: {
    fontSize: 12,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#999',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#bbb',
    textAlign: 'center',
  },
});