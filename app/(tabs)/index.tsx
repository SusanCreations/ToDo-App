import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTasks } from './TaskContext';
import MenuModal from '../../components/MenuModal';

export default function Index() {
  const { tasks, updateTask, addTask, deleteTask, isLoading, getCategoryColor } = useTasks();
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
  
  // Modal states
  const [showFirstModal, setShowFirstModal] = useState(false);
  const [showRepeatModal, setShowRepeatModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [editedTaskTitle, setEditedTaskTitle] = useState('');
  const [selectedRepeatType, setSelectedRepeatType] = useState<'daily' | 'weekly' | 'fortnightly' | 'monthly' | null>(null);
  const [shouldEdit, setShouldEdit] = useState(false);

  // Filter to only show today's tasks
  const todayTasks = tasks.filter(task => task.destination === 'today');

  // Function to handle when a task checkbox is tapped
  const handleTaskComplete = (task: any) => {
    if (task.completed) {
      updateTask(task.id, { completed: false });
    } else {
      setSelectedTask(task);
      setShowFirstModal(true);
    }
  };

  // Swipe to delete handler
  const handleSwipeDelete = (task: any) => {
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${task.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteTask(task.id)
        }
      ]
    );
  };

  // Handle first modal options
  const handleFirstModalOption = (option: 'edit' | 'no-edit' | 'add-next' | 'no') => {
    if (!selectedTask) return;

    switch (option) {
      case 'edit':
        updateTask(selectedTask.id, { completed: true });
        setShouldEdit(true);
        setShowFirstModal(false);
        setShowRepeatModal(true);
        break;
        
      case 'no-edit':
        updateTask(selectedTask.id, { completed: true });
        setShouldEdit(false);
        setShowFirstModal(false);
        setShowRepeatModal(true);
        break;
        
      case 'add-next':
        updateTask(selectedTask.id, { completed: true });
        addTask({
          title: selectedTask.title,
          category: selectedTask.category,
          description: selectedTask.description,
          destination: 'today',
        });
        setShowFirstModal(false);
        setSelectedTask(null);
        break;
        
      case 'no':
        updateTask(selectedTask.id, { completed: true });
        setShowFirstModal(false);
        setSelectedTask(null);
        break;
    }
  };

  const handleRepeatSelection = (repeatType: 'none' | 'daily' | 'weekly' | 'fortnightly' | 'monthly') => {
    if (!selectedTask) return;

    if (repeatType === 'none') {
      setShowRepeatModal(false);
      setSelectedTask(null);
      setShouldEdit(false);
    } else {
      setSelectedRepeatType(repeatType);
      setShowRepeatModal(false);

      if (shouldEdit) {
        setEditedTaskTitle(selectedTask.title);
        setShowEditModal(true);
      } else {
        createRepeatedTask(selectedTask.title, repeatType);
        setSelectedTask(null);
        setShouldEdit(false);
      }
    }
  };

  const createRepeatedTask = (title: string, repeatType: 'daily' | 'weekly' | 'fortnightly' | 'monthly') => {
    addTask({
      title: title,
      destination: 'today',
      isRecurring: true,
      recurringType: repeatType,
    });
  };

  const saveRepeatedTask = () => {
    if (!selectedTask || !selectedRepeatType) return;
    createRepeatedTask(editedTaskTitle.trim() || selectedTask.title, selectedRepeatType);
    setShowEditModal(false);
    setSelectedTask(null);
    setSelectedRepeatType(null);
    setEditedTaskTitle('');
    setShouldEdit(false);
  };

  const cancelEditRepeatedTask = () => {
    setShowEditModal(false);
    setSelectedTask(null);
    setSelectedRepeatType(null);
    setEditedTaskTitle('');
    setShouldEdit(false);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading your tasks...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Top 20</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => setShowMenu(true)} style={styles.menuButtonContainer}>
            <Text style={styles.menuButton}>⋮</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Top Navigation Buttons */}
      <View style={styles.topNav}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push('/add-task')}
        >
          <Text style={styles.navButtonText}>Add a tasks</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push('/general')}
        >
          <Text style={styles.navButtonText}>General</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push('/calendar')}
        >
          <Text style={styles.navButtonText}>Calendar</Text>
        </TouchableOpacity>
      </View>

      {/* Task List */}
      <ScrollView style={styles.taskList}>
        {todayTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No tasks for today!</Text>
            <Text style={styles.emptyStateSubtext}>Tap "Add a tasks" to create your first task</Text>
          </View>
        ) : (
          todayTasks.map(task => {
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
                    handleTaskComplete(task);
                  }}
                  style={styles.checkboxTouchArea}
                  accessibilityLabel={`Mark ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: task.completed }}
                >
                  <View style={styles.checkbox}>
                    {task.completed && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.taskContent}
                  onPress={() => router.push(`/task-view?id=${task.id}`)}
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
          })
        )}
      </ScrollView>

      {/* First Modal */}
      <Modal animationType="fade" transparent={true} visible={showFirstModal} onRequestClose={() => setShowFirstModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Would you like to add this task to today or tomorrows list?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonPrimary]} onPress={() => handleFirstModalOption('edit')}>
                <Text style={[styles.modalButtonText, styles.modalButtonTextWhite]}>Yes. Continue with EDIT</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonPrimary]} onPress={() => handleFirstModalOption('no-edit')}>
                <Text style={[styles.modalButtonText, styles.modalButtonTextWhite]}>Yes. Continue without EDIT</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={() => handleFirstModalOption('add-next')}>
                <Text style={styles.modalButtonText}>Add next task</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={() => handleFirstModalOption('no')}>
                <Text style={styles.modalButtonText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Second Modal */}
      <Modal animationType="fade" transparent={true} visible={showRepeatModal} onRequestClose={() => setShowRepeatModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Would you like this task to repeat?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={() => handleRepeatSelection('none')}>
                <Text style={styles.modalButtonText}>Don't repeat</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonRepeat]} onPress={() => handleRepeatSelection('daily')}>
                <Text style={[styles.modalButtonText, styles.modalButtonTextWhite]}>Every day</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonRepeat]} onPress={() => handleRepeatSelection('weekly')}>
                <Text style={[styles.modalButtonText, styles.modalButtonTextWhite]}>Every week</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonRepeat]} onPress={() => handleRepeatSelection('fortnightly')}>
                <Text style={[styles.modalButtonText, styles.modalButtonTextWhite]}>Every fortnight</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonRepeat]} onPress={() => handleRepeatSelection('monthly')}>
                <Text style={[styles.modalButtonText, styles.modalButtonTextWhite]}>Every month</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => { setShowRepeatModal(false); setSelectedTask(null); setShouldEdit(false); }}>
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Task Modal */}
      <Modal animationType="slide" transparent={true} visible={showEditModal} onRequestClose={cancelEditRepeatedTask}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Task</Text>
            <Text style={styles.modalSubtitle}>Adjust the task before scheduling it {selectedRepeatType}</Text>
            <TextInput style={styles.editInput} value={editedTaskTitle} onChangeText={setEditedTaskTitle} placeholder="Task title" multiline />
            <View style={styles.editModalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonRepeat]} onPress={saveRepeatedTask}>
                <Text style={[styles.modalButtonText, styles.modalButtonTextWhite]}>Save & Schedule</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={cancelEditRepeatedTask}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <MenuModal visible={showMenu} onClose={() => setShowMenu(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  headerText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: 0.3
  },
  headerRight: {
    position: 'absolute',
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15
  },
  counter: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600'
  },
  menuButtonContainer: {
    padding: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center'
  },
  menuButton: {
    fontSize: 24,
    color: '#1A1A1A',
    fontWeight: '700'
  },
  topNav: {
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
  navButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50'
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333'
  },
  navButtonTextActive: {
    color: 'white'
  },
  taskList: {
    flex: 1,
    backgroundColor: '#FAFAFA'
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
  taskWrapper: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'center'
  },
  taskItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  deleteButton: {
    marginLeft: 10,
    backgroundColor: '#ff5252',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12
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
  recurringIndicator: {
    fontSize: 11,
    fontWeight: '700',
    color: '#757575',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden'
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#333',
    backgroundColor: 'white',
    minWidth: 60,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center'
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333'
  },
  taskCategory: {
    fontSize: 12,
    color: '#666',
    marginTop: 2
  },
  taskDueDate: {
    fontSize: 12,
    color: '#FF9800',
    marginTop: 2
  },
  recurringBadge: {
    fontSize: 12,
    color: '#1976D2',
    marginTop: 2
  },
  subTaskCount: {
    fontSize: 12,
    color: '#9C27B0',
    marginTop: 2
  },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalContent: { 
    backgroundColor: 'white', 
    borderRadius: 20, 
    padding: 25, 
    width: '85%', 
    maxWidth: 400 
  },
  modalTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#333', 
    textAlign: 'center', 
    marginBottom: 20 
  },
  modalSubtitle: { 
    fontSize: 16, 
    color: '#666', 
    textAlign: 'center', 
    marginBottom: 20 
  },
  modalButtons: { 
    gap: 12 
  },
  modalButton: { 
    backgroundColor: '#f0f0f0', 
    padding: 16, 
    borderRadius: 10, 
    alignItems: 'center' 
  },
  modalButtonPrimary: { 
    backgroundColor: '#E8F5E9' 
  },
  modalButtonRepeat: { 
    backgroundColor: '#4CAF50' 
  },
  modalButtonText: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#333' 
  },
  modalButtonTextWhite: { 
    color: 'white' 
  },
  modalCloseButton: { 
    marginTop: 15, 
    padding: 12, 
    alignItems: 'center' 
  },
  modalCloseText: { 
    fontSize: 16, 
    color: '#999' 
  },
  editInput: { 
    backgroundColor: '#f5f5f5', 
    padding: 15, 
    borderRadius: 10, 
    fontSize: 16, 
    marginBottom: 20, 
    minHeight: 60 
  },
  editModalButtons: { 
    gap: 12 
  },
});