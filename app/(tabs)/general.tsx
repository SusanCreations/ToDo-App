import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTasks } from './TaskContext';
import MenuModal from '../../components/MenuModal'

export default function General() {
  const { tasks, updateTask, deleteTask, getCategoryColor } = useTasks();
  const [showMenu, setShowMenu] = useState(false);
  const { highlight } = useLocalSearchParams();
  const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(
    typeof highlight === 'string' ? highlight : null
  );

  // Clear highlight when component unmounts or when navigating away
  useEffect(() => {
    return () => {
      setHighlightedTaskId(null);
    };
  }, []);

  // Filter tasks - only show general tasks in this view
  const generalTasks = tasks.filter(t => t.destination === 'general' && !t.completed);

  const handleCheckboxPress = (task: any) => {
    const top20Tasks = tasks.filter(t => t.destination === 'today' && !t.completed);

    if (top20Tasks.length >= 20) {
      // Show alert about bumping bottom task
      const bottomTask = top20Tasks[top20Tasks.length - 1];
      Alert.alert(
        'Move to Top 20',
        `This will move "${task.title}" to Top 20 and bump "${bottomTask.title}" to the top of General list. Confirm?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Confirm',
            onPress: () => {
              updateTask(task.id, { destination: 'today' });
              updateTask(bottomTask.id, { destination: 'general' });
            }
          }
        ]
      );
    } else {
      updateTask(task.id, { destination: 'today' });
    }
  };

  const handleTaskPress = (task: any) => {
    router.push(`/task-view?id=${task.id}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>General List</Text>
        <TouchableOpacity onPress={() => setShowMenu(true)}>
          <Text style={styles.menuButton}>⋮</Text>
        </TouchableOpacity>
      </View>

      {/* Navigation Buttons */}
      <View style={styles.navButtons}>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navButtonText}>Add a tasks</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => router.push('/')}>
          <Text style={styles.navButtonText}>Top 20</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navButtonText}>Calendar</Text>
        </TouchableOpacity>
      </View>

      {/* General Tasks Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>General List</Text>
        <Text style={styles.sectionSubtitle}>{generalTasks.length} tasks</Text>
      </View>

      <ScrollView style={styles.taskList}>
        {generalTasks.map((task) => {
          const isHighlighted = highlightedTaskId === task.id;
          return (
            <View
              key={task.id}
              style={[
                styles.taskRow,
                isHighlighted && styles.taskRowHighlighted
              ]}
            >
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  handleCheckboxPress(task);
                }}
                style={styles.checkboxTouchArea}
                accessibilityLabel={`Mark ${task.title} as complete`}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: task.completed }}
              >
                <View style={styles.checkbox}>
                  {task.completed && <Text style={styles.checkmark}>✓</Text>}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.taskContent}
                onPress={() => handleTaskPress(task)}
                accessibilityLabel={`View details for ${task.title}`}
                accessibilityRole="button"
              >
                <Text style={[
                  styles.taskText,
                  task.completed && styles.taskTextCompleted
                ]}>
                  {task.title}
                </Text>
              </TouchableOpacity>

              <View style={styles.taskMeta}>
                {task.category && (
                  <View style={[styles.categoryTag, { backgroundColor: getCategoryColor(task.category) }]}>
                    <Text style={styles.categoryText}>{task.category}</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}

        {generalTasks.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No tasks yet!</Text>
            <Text style={styles.emptyStateSubtext}>Add tasks to see them here</Text>
          </View>
        )}
      </ScrollView>

      <MenuModal visible={showMenu} onClose={() => setShowMenu(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: 0.3
  },
  menuButton: {
    fontSize: 24,
    color: '#1A1A1A',
    fontWeight: '700'
  },
  navButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  navButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#333',
    alignItems: 'center',
    backgroundColor: 'white',
    minHeight: 44
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333'
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
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
    flex: 1,
    backgroundColor: '#FAFAFA'
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    minHeight: 56
  },
  taskRowHighlighted: {
    backgroundColor: '#E8F5E9',
  },
  checkboxTouchArea: {
    padding: 8,
    marginRight: 12,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#757575',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white'
  },
  checkmark: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold'
  },
  taskContent: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 4
  },
  taskText: {
    fontSize: 16,
    color: '#1A1A1A',
    lineHeight: 22,
    fontWeight: '400'
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#9E9E9E'
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 12
  },
  categoryTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    maxWidth: 120
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1A1A1A',
    opacity: 0.8
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 20
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginBottom: 8
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center'
  },
});