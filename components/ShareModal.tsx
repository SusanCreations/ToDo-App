import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  onShare: (method: 'email' | 'txt', recipients: string[]) => void;
}

export default function ShareModal({ visible, onClose, onShare }: ShareModalProps) {
  const [savedNames] = useState(['Gary', 'Shelly']);
  const [newName, setNewName] = useState('');
  const [emailPhone, setEmailPhone] = useState('');
  const [quickName, setQuickName] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);

  const toggleRecipient = (name: string) => {
    if (selectedRecipients.includes(name)) {
      setSelectedRecipients(selectedRecipients.filter(n => n !== name));
    } else {
      setSelectedRecipients([...selectedRecipients, name]);
    }
  };

  const handleShare = (method: 'email' | 'txt') => {
    onShare(method, selectedRecipients);
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Share with</Text>

          <Text style={styles.subtitle}>Drop down menu of saved names</Text>

          <ScrollView style={styles.namesList}>
            {savedNames.map((name, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.nameItem,
                  selectedRecipients.includes(name) && styles.nameItemSelected
                ]}
                onPress={() => toggleRecipient(name)}
              >
                <View style={[
                  styles.radioButton,
                  selectedRecipients.includes(name) && styles.radioButtonSelected
                ]}>
                  {selectedRecipients.includes(name) && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
                <Text style={styles.nameText}>{name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.addNewSection}>
            <Text style={styles.addNewText}>+ Add new</Text>
          </TouchableOpacity>

          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Email / Phone number</Text>
            <TextInput
              style={styles.input}
              value={emailPhone}
              onChangeText={setEmailPhone}
              placeholder="___________"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Quick name</Text>
            <TextInput
              style={styles.input}
              value={quickName}
              onChangeText={setQuickName}
              placeholder="___________"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={() => handleShare('email')}
            >
              <Text style={styles.buttonText}>Email</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={() => handleShare('txt')}
            >
              <Text style={styles.buttonText}>Txt</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
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
  modalContainer: {
    backgroundColor: '#E8F5E9',
    borderRadius: 20,
    padding: 20,
    width: '85%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 14,
    color: '#C62828',
    marginBottom: 10,
  },
  namesList: {
    maxHeight: 120,
    marginBottom: 15,
  },
  nameItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 8,
  },
  nameItemSelected: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 8,
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
  nameText: {
    fontSize: 16,
    color: '#333',
  },
  addNewSection: {
    paddingVertical: 10,
    marginBottom: 15,
  },
  addNewText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  inputSection: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  input: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    marginBottom: 15,
  },
  shareButton: {
    flex: 1,
    backgroundColor: '#F5F5DC',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
  },
});