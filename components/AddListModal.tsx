import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

interface AddListModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (listTitle: string, items: string[]) => void;
  initialTitle?: string;
  initialItems?: string[];
  title: string;
}

export default function AddListModal({ visible, onClose, onSave, initialTitle = '', initialItems = [], title }: AddListModalProps) {
  const [listTitle, setListTitle] = useState(initialTitle);
  const [items, setItems] = useState<string[]>(initialItems);
  const [newItem, setNewItem] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const newItemInputRef = useRef<TextInput>(null);

  // Update items and title when initialItems/initialTitle changes or modal opens
  useEffect(() => {
    if (visible) {
      setListTitle(initialTitle);
      setItems(initialItems);
    }
  }, [visible, initialTitle, initialItems]);

  const addItem = () => {
    if (newItem.trim()) {
      setItems([...items, newItem.trim()]);
      setNewItem('');
      // Scroll without animation
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      }, 50);
    }
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (listTitle.trim() && items.length > 0) {
      onSave(listTitle.trim(), items);
      setItems([]);
      setListTitle('');
      setNewItem('');
      onClose();
    } else if (!listTitle.trim()) {
      alert('Please enter a list title');
    } else if (items.length === 0) {
      alert('Please add at least one item to the list');
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingContainer}
        >
          <View style={styles.modalContainer}>
            <ScrollView
              contentContainerStyle={styles.modalContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.modalTitle}>{title}</Text>

              <View style={styles.titleSection}>
                <Text style={styles.label}>Title:</Text>
                <TextInput
                  style={styles.titleInput}
                  value={listTitle}
                  onChangeText={setListTitle}
                  placeholder="Enter list title"
                  placeholderTextColor="#999"
                  returnKeyType="next"
                  onSubmitEditing={() => newItemInputRef.current?.focus()}
                  blurOnSubmit={false}
                />
              </View>

              {items.length > 0 && (
                <ScrollView ref={scrollViewRef} style={styles.itemsList} nestedScrollEnabled>
                  {items.map((item, index) => (
                    <View key={index} style={styles.checkboxItem}>
                      <View style={styles.checkbox} />
                      <Text style={styles.itemText}>{item}</Text>
                      <TouchableOpacity onPress={() => removeItem(index)}>
                        <Text style={styles.removeButton}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}

              <View style={styles.addItemSection}>
                <TextInput
                  ref={newItemInputRef}
                  style={styles.newItemInput}
                  value={newItem}
                  onChangeText={setNewItem}
                  placeholder="Add new item..."
                  placeholderTextColor="#999"
                  returnKeyType="done"
                  onSubmitEditing={addItem}
                  blurOnSubmit={false}
                />
                <TouchableOpacity style={styles.addButton} onPress={addItem}>
                  <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardAvoidingContainer: {
    width: '85%',
    maxHeight: '85%',
  },
  modalContainer: {
    backgroundColor: '#D4C5E8',
    borderRadius: 20,
    maxHeight: '100%',
    overflow: 'hidden',
  },
  modalContent: {
    padding: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  titleSection: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  titleInput: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    fontSize: 14,
  },
  itemsList: {
    maxHeight: 120,
    marginBottom: 12,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    padding: 8,
    borderRadius: 6,
    marginBottom: 6,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 3,
    borderWidth: 2,
    borderColor: '#666',
    marginRight: 10,
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  removeButton: {
    fontSize: 18,
    color: '#ff5252',
    paddingHorizontal: 8,
  },
  addItemSection: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  newItemInput: {
    flex: 1,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    fontSize: 14,
  },
  addButton: {
    width: 40,
    height: 40,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#C7B5DA',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});