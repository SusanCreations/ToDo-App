import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
  Platform,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTasks, CATEGORIES } from './TaskContext';
import MenuModal from '../../components/MenuModal';
import AddListModal from '../../components/AddListModal';
import ShareModal from '../../components/ShareModal';

const REPEAT_OPTIONS = [
  { label: "Don't repeat", value: "Don't repeat" },
  { label: 'Every __ day', value: 'daily' },
  { label: 'Every __ week', value: 'weekly' },
  { label: 'Every __ month', value: 'monthly' },
  { label: 'Every __ year', value: 'yearly' },
];

export default function AddTask() {
  const { addTask, addTaskToTop, updateTask, tasks } = useTasks();
  const { id } = useLocalSearchParams();
  const [showMenu, setShowMenu] = useState(false);

  const [title, setTitle] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [dueTime, setDueTime] = useState<Date | null>(null);
  const [addList, setAddList] = useState<string[]>([]);
  const [repeat, setRepeat] = useState("Don't repeat");
  const [shareWith, setShareWith] = useState<string[]>([]);
  const [subTasks, setSubTasks] = useState<string[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<'top20' | 'general' | 'calendar'>('top20');

  // Check if we're in edit mode
  const isEditMode = !!id;
  const taskToEdit = isEditMode ? tasks.find(t => t.id === id) : null;

  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showRepeatDropdown, setShowRepeatDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showAddListModal, setShowAddListModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      if (taskToEdit.category) {
        setCategories(taskToEdit.category.split(', '));
      }
      setDescription(taskToEdit.description || '');

      // Parse due date/time from the formatted string
      if (taskToEdit.dueDateTime && taskToEdit.dueDateTime !== 'Select date/time') {
        const parts = taskToEdit.dueDateTime.split(' at ');
        if (parts[0]) {
          const date = new Date(parts[0]);
          if (!isNaN(date.getTime())) {
            setDueDate(date);
          }
        }
        if (parts[1]) {
          const today = new Date();
          const timeParts = parts[1].match(/(\d+):(\d+)\s*(AM|PM)/i);
          if (timeParts) {
            let hours = parseInt(timeParts[1]);
            const minutes = parseInt(timeParts[2]);
            const ampm = timeParts[3].toUpperCase();

            if (ampm === 'PM' && hours !== 12) hours += 12;
            if (ampm === 'AM' && hours === 12) hours = 0;

            today.setHours(hours, minutes, 0, 0);
            setDueTime(today);
          }
        }
      }

      if (taskToEdit.addList) {
        setAddList(taskToEdit.addList.split(', '));
      }
      setRepeat(taskToEdit.repeat || "Don't repeat");
      if (taskToEdit.share) {
        setShareWith(taskToEdit.share.split(', '));
      }
      setSubTasks(taskToEdit.subTasks || []);

      // Set destination tab
      if (taskToEdit.destination === 'today' || taskToEdit.destination === 'top20') {
        setSelectedDestination('top20');
      } else if (taskToEdit.destination === 'general') {
        setSelectedDestination('general');
      } else if (taskToEdit.destination === 'calendar') {
        setSelectedDestination('calendar');
      }
    }
  }, [taskToEdit]);

  const getCategoryColor = (categoryName: string) => {
    const cat = CATEGORIES.find(c => c.name === categoryName);
    return cat?.color || '#E0E0E0';
  };

  const toggleCategory = (categoryName: string) => {
    if (categories.includes(categoryName)) {
      setCategories(categories.filter(c => c !== categoryName));
    } else {
      setCategories([...categories, categoryName]);
    }
  };

  const formatDateTime = () => {
    let result = '';
    if (dueDate) {
      result = dueDate.toLocaleDateString();
    }
    if (dueTime) {
      result += (result ? ' at ' : '') + dueTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return result || 'Select date/time';
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setDueTime(selectedTime);
    }
  };

  const handleSave = (destination: 'today' | 'general') => {
    if (!title.trim()) {
      alert('Please enter a task title');
      return;
    }

    const taskData = {
      title: title.trim(),
      category: categories.length > 0 ? categories.join(', ') : undefined,
      description: description.trim() || undefined,
      dueDateTime: formatDateTime() !== 'Select date/time' ? formatDateTime() : undefined,
      addList: addList.length > 0 ? addList.join(', ') : undefined,
      repeat: repeat,
      share: shareWith.length > 0 ? shareWith.join(', ') : undefined,
      subTasks: subTasks.length > 0 ? subTasks : undefined,
      destination: destination,
    };

    // Check if trying to add to Top 20 when it's full
    if (!isEditMode && destination === 'today') {
      const todayTasks = tasks.filter(t => t.destination === 'today' && !t.completed);
      if (todayTasks.length >= 20) {
        const bottomTask = todayTasks[todayTasks.length - 1];
        Alert.alert(
          'Your Top 20 list is full. Would you like to:',
          '',
          [
            {
              text: 'Cancel',
              style: 'cancel'
            },
            {
              text: 'Add to top of General',
              onPress: () => {
                // Add task to top of general instead
                const generalTaskData = { ...taskData, destination: 'general' };
                const newTaskId = addTaskToTop(generalTaskData);
                // Navigate to General with highlighted new task
                router.replace(`/general?highlight=${newTaskId}`);
              }
            },
            {
              text: 'Bump last task to General',
              onPress: () => {
                // Add new task to Top 20
                const newTaskId = addTask(taskData);
                // Move bottom task to general
                updateTask(bottomTask.id, { destination: 'general' });
                // Navigate to Top 20 with highlighted new task
                router.replace(`/?highlight=${newTaskId}`);
              }
            }
          ]
        );
        return;
      }
    }

    if (isEditMode && id) {
      updateTask(id as string, taskData);
      // Navigate with highlighting for edited task
      if (destination === 'today') {
        router.replace(`/?highlight=${id}`);
      } else {
        router.replace(`/general?highlight=${id}`);
      }
    } else {
      // Capture the ID returned by addTask
      const newTaskId = addTask(taskData);

      // Navigate to the appropriate list with highlighting
      if (destination === 'today') {
        router.replace(`/?highlight=${newTaskId}`);
      } else {
        router.replace(`/general?highlight=${newTaskId}`);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollView}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollViewContent}
        >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isEditMode ? 'Edit Task' : 'Add A Task'}</Text>
          <TouchableOpacity onPress={() => setShowMenu(true)}>
            <Text style={styles.menuButton}>⋮</Text>
          </TouchableOpacity>
        </View>

        {/* Top Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, selectedDestination === 'top20' && styles.tabActive]}
            onPress={() => setSelectedDestination('top20')}
          >
            <Text style={[styles.tabText, selectedDestination === 'top20' && styles.tabTextActive]}>
              Top 20
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedDestination === 'general' && styles.tabActive]}
            onPress={() => setSelectedDestination('general')}
          >
            <Text style={[styles.tabText, selectedDestination === 'general' && styles.tabTextActive]}>
              General
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedDestination === 'calendar' && styles.tabActive]}
            onPress={() => setSelectedDestination('calendar')}
          >
            <Text style={[styles.tabText, selectedDestination === 'calendar' && styles.tabTextActive]}>
              Calendar
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
          {/* Title */}
          <View style={styles.field}>
            <Text style={styles.label}>Title: *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g., Liberty Market"
              placeholderTextColor="#999"
            />
          </View>

          {/* Add Categories (Multiple) */}
          <View style={styles.field}>
            <Text style={styles.label}>Add Category:</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowCategoryModal(true)}
            >
              <Text style={categories.length > 0 ? styles.inputText : styles.placeholderText}>
                {categories.length > 0 ? categories.join(', ') : 'Select categories'}
              </Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>
            {categories.length > 0 && (
              <View style={styles.categoryChips}>
                {categories.map((cat, index) => (
                  <View
                    key={index}
                    style={[styles.categoryChip, { backgroundColor: getCategoryColor(cat) }]}
                  >
                    <Text style={styles.categoryChipText}>{cat}</Text>
                    <TouchableOpacity onPress={() => toggleCategory(cat)}>
                      <Text style={styles.categoryChipRemove}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Description */}
          <View style={styles.field}>
            <Text style={styles.label}>Description:</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Add any notes or details..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Due Date/Time with Calendar Icon */}
          <View style={styles.field}>
            <Text style={styles.label}>Due Date/Time:</Text>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.inputText}>{formatDateTime()}</Text>
              <Text style={styles.calendarIcon}>📅</Text>
            </TouchableOpacity>
            {dueDate && (
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={styles.timeButtonText}>Set Time 🕐</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Add List */}
          <View style={styles.field}>
            <Text style={styles.label}>Add List:</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowAddListModal(true)}
            >
              <Text style={addList.length > 0 ? styles.inputText : styles.placeholderText}>
                {addList.length > 0 ? `${addList.length} items` : 'Create a list'}
              </Text>
              <Text style={styles.plusIcon}>+</Text>
            </TouchableOpacity>
            {addList.length > 0 && (
              <TouchableOpacity
                style={styles.listItemsContainer}
                onPress={() => setShowAddListModal(true)}
                activeOpacity={0.7}
              >
                {addList.map((item, index) => (
                  <Text key={index} style={styles.listItemText}>• {item}</Text>
                ))}
              </TouchableOpacity>
            )}
          </View>

          {/* Repeat Dropdown */}
          <View style={styles.field}>
            <Text style={styles.label}>Repeat:</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowRepeatDropdown(!showRepeatDropdown)}
            >
              <Text style={styles.inputText}>{repeat}</Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>
            {showRepeatDropdown && (
              <View style={styles.dropdown}>
                {REPEAT_OPTIONS.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setRepeat(option.label);
                      setShowRepeatDropdown(false);
                    }}
                  >
                    <View style={[
                      styles.radioButton,
                      repeat === option.label && styles.radioButtonSelected
                    ]}>
                      {repeat === option.label && (
                        <View style={styles.radioButtonInner} />
                      )}
                    </View>
                    <Text style={styles.dropdownItemText}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Share */}
          <View style={styles.field}>
            <Text style={styles.label}>Share:</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowShareModal(true)}
            >
              <Text style={shareWith.length > 0 ? styles.inputText : styles.placeholderText}>
                {shareWith.length > 0 ? shareWith.join(', ') : 'Share with...'}
              </Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>
          </View>

          {/* Sub Tasks - Opens as new screen */}
          <View style={styles.field}>
            <Text style={styles.label}>Add Sub Task:</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => {
                // TODO: Navigate to sub-task screen
                alert('Sub-task screen coming soon!');
              }}
            >
              <Text style={subTasks.length > 0 ? styles.inputText : styles.placeholderText}>
                {subTasks.length > 0 ? `${subTasks.length} sub-tasks` : 'Add sub-tasks'}
              </Text>
              <Text style={styles.plusIcon}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={() => handleSave('today')}
          >
            <Text style={styles.buttonText}>
              {isEditMode ? 'Save Changes' : 'Add to todays tasks'}
            </Text>
          </TouchableOpacity>

          {!isEditMode && (
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={() => handleSave('general')}
            >
              <Text style={styles.buttonText}>Add to General task list</Text>
            </TouchableOpacity>
          )}
        </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={dueDate || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={dueTime || new Date()}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}

      {/* Category Selection Modal (Multiple) */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showCategoryModal}
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Categories</Text>
            <Text style={styles.modalSubtitle}>You can select multiple</Text>
            <ScrollView style={styles.categoryList}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.name}
                  style={[
                    styles.categoryItem,
                    { backgroundColor: cat.color },
                  ]}
                  onPress={() => toggleCategory(cat.name)}
                >
                  <View style={[
                    styles.checkbox,
                    categories.includes(cat.name) && styles.checkboxChecked
                  ]}>
                    {categories.includes(cat.name) && (
                      <Text style={styles.checkIcon}>✓</Text>
                    )}
                  </View>
                  <Text style={styles.categoryText}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={() => setShowCategoryModal(false)}
            >
              <Text style={styles.modalSaveText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add List Modal */}
      <AddListModal
        visible={showAddListModal}
        onClose={() => setShowAddListModal(false)}
        onSave={(items) => setAddList(items)}
        initialItems={addList}
        title="Add List"
      />

      {/* Share Modal */}
      <ShareModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        onShare={(method, recipients) => {
          setShareWith(recipients);
          alert(`Sharing via ${method} to ${recipients.join(', ')}`);
        }}
      />

      <MenuModal visible={showMenu} onClose={() => setShowMenu(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
  },
  backButton: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
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
    borderColor: '#ddd',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  tabActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: 'white',
  },
  form: {
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
  input: {
    backgroundColor: 'white',
    padding: 14,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dropdownButton: {
    backgroundColor: 'white',
    padding: 14,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#666',
  },
  plusIcon: {
    fontSize: 20,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  inputText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
  },
  categoryChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  categoryChipText: {
    fontSize: 14,
    color: '#333',
  },
  categoryChipRemove: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  listItemsContainer: {
    marginTop: 10,
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  listItemText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
    lineHeight: 20,
  },
  dateTimeButton: {
    backgroundColor: 'white',
    padding: 14,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calendarIcon: {
    fontSize: 20,
  },
  timeButton: {
    marginTop: 10,
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  timeButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  dropdown: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    marginTop: 8,
    padding: 10,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#666',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#4CAF50',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
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
  buttonPrimary: {
    backgroundColor: '#4CAF50',
  },
  buttonSecondary: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  categoryList: {
    maxHeight: 400,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#666',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checkIcon: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  categoryText: {
    fontSize: 16,
    color: '#333',
  },
  modalSaveButton: {
    marginTop: 15,
    padding: 16,
    backgroundColor: '#D4A5A5',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});