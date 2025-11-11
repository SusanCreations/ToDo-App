import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  category?: string;
  reference?: string;
  dueDateTime?: string;
  addList?: string;
  repeat?: string;
  share?: string;
  subTasks?: string[];
  isRecurring?: boolean;
  recurringType?: 'daily' | 'weekly' | 'fortnightly' | 'monthly' | null;
  destination?: 'today' | 'top20' | 'general' | 'calendar';
}

export interface Category {
  name: string;
  color: string;
}

export const CATEGORIES: Category[] = [
  { name: 'No Reference', color: '#E0E0E0' },
  { name: 'Work', color: '#FF6B6B' },
  { name: 'Email', color: '#4ECDC4' },
  { name: '5 minute job', color: '#FFE66D' },
  { name: 'Daily', color: '#95E1D3' },
  { name: 'Weekly', color: '#A8E6CF' },
  { name: 'Shopping', color: '#FFD3B6' },
  { name: 'Phone call', color: '#FFAAA5' },
  { name: 'Sport', color: '#FF8B94' },
  { name: 'Kids', color: '#C7CEEA' },
  { name: 'Payments', color: '#FFDFD3' },
  { name: 'Social', color: '#FEC8D8' },
  { name: 'Appointment', color: '#D4A5A5' },
];

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'completed'>) => string;
  addTaskToTop: (task: Omit<Task, 'id' | 'completed'>) => string;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  isLoading: boolean;
  getCategoryColor: (categoryName: string) => string;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const STORAGE_KEY = '@adhd_todo_tasks';

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load tasks when app starts
  useEffect(() => {
    loadTasks();
  }, []);

  // Save tasks whenever they change
  useEffect(() => {
    if (!isLoading) {
      saveTasks();
    }
  }, [tasks, isLoading]);

  const loadTasks = async () => {
    try {
      // Temporarily clear storage to load dummy data
      await AsyncStorage.removeItem(STORAGE_KEY);

      const savedTasks = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedTasks !== null) {
        setTasks(JSON.parse(savedTasks));
      } else {
        // First time - add sample tasks with various categories and recurring types
        setTasks([
          { id: '1', title: 'Shower', completed: false, destination: 'today', category: 'Daily', isRecurring: true, recurringType: 'daily' },
          { id: '2', title: 'Dishes', completed: false, destination: 'today', category: 'Daily', isRecurring: true, recurringType: 'daily' },
          { id: '3', title: 'Cook Dinner', completed: false, destination: 'today', category: 'Daily', isRecurring: true, recurringType: 'daily' },
          { id: '4', title: 'Take vitamins', completed: false, destination: 'today', category: 'Daily', isRecurring: true, recurringType: 'daily' },
          { id: '5', title: 'Water Plants', completed: false, destination: 'today', category: 'Weekly', isRecurring: true, recurringType: 'weekly' },
          { id: '6', title: 'Laundry', completed: false, destination: 'today', category: 'Weekly', isRecurring: true, recurringType: 'weekly' },
          { id: '7', title: 'Clean Toilet', completed: false, destination: 'today', category: 'Weekly', isRecurring: true, recurringType: 'weekly' },
          { id: '8', title: 'Call Insurance', completed: false, destination: 'today', category: 'Appointment' },
          { id: '9', title: 'Order Hat', completed: false, destination: 'today', category: '5 minute job' },
          { id: '10', title: 'Finish Wireframes', completed: false, destination: 'today', category: 'Work' },
          { id: '11', title: '1 hr of Database', completed: false, destination: 'today', category: 'Work' },
          { id: '12', title: 'Groceries', completed: false, destination: 'today', category: 'Shopping', subTasks: ['Milk', 'Eggs'] },
          { id: '13', title: 'Go to Bunnings', completed: false, destination: 'today', category: 'Shopping', subTasks: ['Paint'] },
          { id: '14', title: 'Check builders email', completed: false, destination: 'today', category: '5 minute job' },
          { id: '15', title: 'Call dentist for appointment', completed: false, destination: 'today', category: 'Phone call' },
          { id: '16', title: 'Gym session', completed: false, destination: 'today', category: 'Sport' },
          { id: '17', title: 'Pick up kids from school', completed: false, destination: 'today', category: 'Kids', dueDateTime: '3:00 PM' },
          { id: '18', title: 'Pay electricity bill', completed: false, destination: 'today', category: 'Payments' },
          { id: '30', title: 'Reply to client email', completed: false, destination: 'today', category: 'Email' },
          { id: '31', title: 'Book car service', completed: false, destination: 'today', category: 'Appointment' },

          // General list tasks with times and subtasks
          { id: '19', title: 'Email Sharon', completed: false, destination: 'general', category: 'Email', dueDateTime: '1pm' },
          { id: '20', title: 'Email Insurance man', completed: false, destination: 'general', category: 'Email' },
          { id: '21', title: 'Check for builders email response', completed: false, destination: 'general', category: 'Email' },
          { id: '22', title: 'Call Insurance', completed: false, destination: 'general', category: 'Appointment', dueDateTime: '2pm' },
          { id: '23', title: 'Order Hat', completed: false, destination: 'general', category: 'Shopping' },
          { id: '24', title: 'Finish Wireframes', completed: false, destination: 'general', category: 'Work', dueDateTime: '3pm' },
          { id: '25', title: '1 hr of Database', completed: false, destination: 'general', category: 'Work', dueDateTime: '4pm' },
          { id: '26', title: 'Groceries', completed: false, destination: 'general', category: 'Shopping', subTasks: ['Milk', 'Bread', 'Butter'] },
          { id: '27', title: 'Go to Bunnings', completed: false, destination: 'general', category: 'Shopping', subTasks: ['Paint', 'Brushes', 'Sandpaper'] },
          { id: '28', title: 'Check builders email', completed: false, destination: 'general', category: 'Email' },
          { id: '29', title: 'Integrated Health appointment', completed: false, destination: 'general', category: 'Appointment', dueDateTime: '01/03/26' },
        ]);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveTasks = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  };

  const addTask = (taskData: Omit<Task, 'id' | 'completed'>) => {
    const newTask: Task = {
      id: Date.now().toString(),
      completed: false,
      ...taskData,
    };
    setTasks(prev => [...prev, newTask]);
    return newTask.id;
  };

  const addTaskToTop = (taskData: Omit<Task, 'id' | 'completed'>) => {
    const newTask: Task = {
      id: Date.now().toString(),
      completed: false,
      ...taskData,
    };
    setTasks(prev => [newTask, ...prev]);
    return newTask.id;
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev =>
      prev.map(task => (task.id === id ? { ...task, ...updates } : task))
    );
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const getCategoryColor = (categoryName: string) => {
    const category = CATEGORIES.find(cat => cat.name === categoryName);
    return category?.color || '#E0E0E0';
  };

  return (
    <TaskContext.Provider value={{ tasks, addTask, addTaskToTop, updateTask, deleteTask, isLoading, getCategoryColor }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}