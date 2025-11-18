import React, { useState } from 'react';
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
import MenuModal from '../../components/MenuModal';

export default function TaskView() {
  const { id } = useLocalSearchParams();
  const { tasks, updateTask, moveTaskToTop, deleteTask, getCategoryColor } = useTasks();
  const [showMenu, setShowMenu] = useState(false);

  const task = tasks.find(t => t.id === id);

  if (!task) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Task not found</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleEdit = () => {
    router.push(`/add-task?id=${task.id}`);
  };

  const handleClose = () => {
    router.back();
  };

  const handleMoveTask = () => {
    const isInGeneral = task.destination === 'general';
    const targetDestination = isInGeneral ? 'today' : 'general';
    const title = isInGeneral ? 'Move to Top 20' : 'Move to General';
    const message = isInGeneral
      ? 'Move this task to the Top 20 list?'
      : 'Move this task to the General task list?';

    Alert.alert(
      title,
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Move',
          onPress: () => {
            // Use moveTaskToTop when moving from General to Top 20 to place it at the top
            if (isInGeneral) {
              moveTaskToTop(task.id, { destination: targetDestination });
              // Navigate to Top 20 with highlighted task
              router.replace(`/?highlight=${task.id}`);
            } else {
              // Use regular updateTask when moving to General
              updateTask(task.id, { destination: targetDestination });
              // Navigate to General with highlighted task
              router.replace(`/general?highlight=${task.id}`);
            }
          }
        }
      ]
    );
  };

  const categories = task.category ? task.category.split(', ') : [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft} />
          <Text style={styles.headerTitle}>Task</Text>
          <TouchableOpacity onPress={() => setShowMenu(true)}>
            <Text style={styles.menuButton}>⋮</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <View style={[styles.tab, task.destination === 'today' && styles.tabActive]}>
            <Text style={[styles.tabText, task.destination === 'today' && styles.tabTextActive]}>
              Top 20
            </Text>
          </View>
          <View style={[styles.tab, task.destination === 'general' && styles.tabActive]}>
            <Text style={[styles.tabText, task.destination === 'general' && styles.tabTextActive]}>
              General
            </Text>
          </View>
          <View style={[styles.tab, task.destination === 'calendar' && styles.tabActive]}>
            <Text style={[styles.tabText, task.destination === 'calendar' && styles.tabTextActive]}>
              Calendar
            </Text>
          </View>
        </View>

        {/* Task Details */}
        <View style={styles.content}>
          {/* Title */}
          <View style={styles.field}>
            <Text style={styles.label}>Title:</Text>
            <Text style={styles.value}>{task.title}</Text>
          </View>

          {/* Reference (Categories) */}
          {categories.length > 0 && (
            <View style={styles.field}>
              <Text style={styles.label}>Reference:</Text>
              <View style={styles.categoryChips}>
                {categories.map((cat, index) => (
                  <View
                    key={index}
                    style={[
                      styles.categoryChip,
                      { backgroundColor: getCategoryColor(cat.trim()) }
                    ]}
                  >
                    <Text style={styles.categoryChipText}>{cat.trim()}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Description */}
          {task.description && (
            <View style={styles.field}>
              <Text style={styles.label}>Description:</Text>
              <Text style={styles.value}>{task.description}</Text>
            </View>
          )}

          {/* Date/Time */}
          {task.dueDateTime && (
            <View style={styles.field}>
              <Text style={styles.label}>Date/Time:</Text>
              <Text style={styles.value}>{task.dueDateTime}</Text>
            </View>
          )}

          {/* List */}
          {task.addList && (
            <View style={styles.field}>
              <Text style={styles.label}>List:</Text>
              <Text style={styles.value}>{task.addList}</Text>
            </View>
          )}

          {/* Repeat */}
          {task.repeat && task.repeat !== "Don't repeat" && (
            <View style={styles.field}>
              <Text style={styles.label}>Repeat:</Text>
              <Text style={styles.value}>{task.repeat}</Text>
            </View>
          )}

          {/* Shared with */}
          {task.share && (
            <View style={styles.field}>
              <Text style={styles.label}>Shared with:</Text>
              <Text style={styles.value}>{task.share}</Text>
            </View>
          )}

          {/* Sub Tasks */}
          {task.subTasks && task.subTasks.length > 0 && (
            <View style={styles.field}>
              <Text style={styles.label}>Sub Task:</Text>
              <View style={styles.subTasksList}>
                {task.subTasks.map((subTask, index) => (
                  <View key={index} style={styles.subTaskChip}>
                    <Text style={styles.subTaskText}>{subTask}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Bottom Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.buttonEdit]}
            onPress={handleEdit}
          >
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonClose]}
            onPress={handleClose}
          >
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonBump]}
            onPress={handleMoveTask}
          >
            <Text style={styles.buttonText}>
              {task.destination === 'general' ? 'Add to Top 20 List' : 'Bump to General task list'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <MenuModal visible={showMenu} onClose={() => setShowMenu(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8E8F0',
  },
  scrollView: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#999',
    marginBottom: 20,
  },
  backButton: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
  },
  headerLeft: {
    width: 30,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  menuButton: {
    fontSize: 24,
    color: '#333',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingBottom: 15,
    paddingTop: 10,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  tabActive: {
    backgroundColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  tabTextActive: {
    color: '#333',
  },
  content: {
    padding: 20,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  value: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  categoryChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryChipText: {
    fontSize: 14,
    color: '#333',
  },
  subTasksList: {
    gap: 8,
  },
  subTaskChip: {
    backgroundColor: '#D8D8E0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  subTaskText: {
    fontSize: 14,
    color: '#333',
  },
  buttonContainer: {
    padding: 20,
    gap: 12,
    paddingBottom: 40,
  },
  button: {
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonEdit: {
    backgroundColor: '#C8D8E8',
  },
  buttonClose: {
    backgroundColor: '#C8D8E8',
  },
  buttonBump: {
    backgroundColor: '#C8D8E8',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});