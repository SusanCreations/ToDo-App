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

// Default categories that come preloaded with the app
export const DEFAULT_CATEGORIES: Category[] = [
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
  { name: 'Home', color: '#B5EAD7' },
  { name: 'Personal', color: '#C7CEEA' },
  { name: 'Health', color: '#E2F0CB' },
  { name: 'Finance', color: '#FFDAC1' },
  { name: 'Family', color: '#FFB7B2' },
  { name: 'Urgent', color: '#FF6F61' },
  { name: 'Important', color: '#FFD93D' },
];

// Helper function to generate random pastel color
const generateRandomColor = () => {
  const colors = [
    '#FFB7B2', '#FFDAC1', '#E2F0CB', '#B5EAD7', '#C7CEEA',
    '#FF9AA2', '#FFB7B2', '#FFDAC1', '#E2F0CB', '#B5EAD7',
    '#A8E6CF', '#FFD3B6', '#FFAAA5', '#FF8B94', '#FEC8D8',
    '#F8B195', '#F67280', '#C06C84', '#6C5B7B', '#355C7D'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

interface TaskContextType {
  tasks: Task[];
  categories: Category[];
  addTask: (task: Omit<Task, 'id' | 'completed'>) => string;
  addTaskToTop: (task: Omit<Task, 'id' | 'completed'>) => string;
  updateTask: (id: string, updates: Partial<Task>) => void;
  moveTaskToTop: (id: string, updates: Partial<Task>) => void;
  completeRecurringTask: (id: string) => void;
  deleteTask: (id: string) => void;
  addCategory: (name: string) => void;
  isLoading: boolean;
  getCategoryColor: (categoryName: string) => string;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const STORAGE_KEY = '@adhd_todo_tasks';
const CATEGORIES_STORAGE_KEY = '@adhd_todo_categories';

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [isLoading, setIsLoading] = useState(true);

  // Load tasks and categories when app starts
  useEffect(() => {
    loadTasks();
    loadCategories();
  }, []);

  // Save tasks whenever they change
  useEffect(() => {
    if (!isLoading) {
      saveTasks();
    }
  }, [tasks, isLoading]);

  // Save categories whenever they change
  useEffect(() => {
    if (!isLoading) {
      saveCategories();
    }
  }, [categories, isLoading]);

  const loadTasks = async () => {
    try {
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

  const loadCategories = async () => {
    try {
      const savedCategories = await AsyncStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (savedCategories !== null) {
        setCategories(JSON.parse(savedCategories));
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const saveCategories = async () => {
    try {
      await AsyncStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
    } catch (error) {
      console.error('Error saving categories:', error);
    }
  };

  const addCategory = (name: string) => {
    // Check if category already exists (case insensitive)
    const exists = categories.some(cat => cat.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      return;
    }

    const newCategory: Category = {
      name: name.trim(),
      color: generateRandomColor()
    };

    setCategories(prev => [...prev, newCategory]);
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

  const moveTaskToTop = (id: string, updates: Partial<Task>) => {
    setTasks(prev => {
      const taskIndex = prev.findIndex(task => task.id === id);
      if (taskIndex === -1) return prev;

      const updatedTask = { ...prev[taskIndex], ...updates };
      const newTasks = prev.filter(task => task.id !== id);
      return [updatedTask, ...newTasks];
    });
  };

  const completeRecurringTask = (id: string) => {
    setTasks(prev => {
      const task = prev.find(t => t.id === id);
      if (!task) return prev;

      // Mark original task as completed (kept as history)
      const completedTask = { ...task, completed: true };

      // Create new instance for next occurrence
      const newTask: Task = {
        id: Date.now().toString(),
        title: task.title,
        description: task.description,
        category: task.category,
        completed: false,
        destination: 'today',
        isRecurring: task.isRecurring,
        recurringType: task.recurringType,
        reference: task.reference,
        addList: task.addList,
        subTasks: task.subTasks,
      };

      // Replace old task with completed version and add new instance
      return prev.map(t => t.id === id ? completedTask : t).concat(newTask);
    });
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category?.color || '#E0E0E0';
  };

  return (
    <TaskContext.Provider value={{ tasks, categories, addTask, addTaskToTop, updateTask, moveTaskToTop, completeRecurringTask, deleteTask, addCategory, isLoading, getCategoryColor }}>
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