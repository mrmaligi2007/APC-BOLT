import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, UserPlus } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { User, Device } from '@/types';

export default function UsersScreen() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  useEffect(() => {
    loadUsers();
  }, [selectedDevice]);

  async function loadUsers() {
    if (!selectedDevice) return;

    const { data, error } = await supabase
      .from('authorized_users')
      .select('*')
      .eq('device_id', selectedDevice.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading users:', error);
      return;
    }

    setUsers(data || []);
  }

  const renderUser = ({ item }: { item: User }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name || 'Unnamed User'}</Text>
        <Text style={styles.userNumber}>{item.phone_number}</Text>
        <Text style={styles.userValidity}>
          Valid until: {new Date(item.valid_until).toLocaleDateString()}
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => deleteUser(item.id)}>
        <Text style={styles.deleteButtonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  async function deleteUser(userId: string) {
    const { error } = await supabase
      .from('authorized_users')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Error deleting user:', error);
      return;
    }

    loadUsers();
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push('/user/new')}>
        <UserPlus size={24} color="#fff" />
        <Text style={styles.addButtonText}>Add User</Text>
      </TouchableOpacity>

      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f5',
  },
  list: {
    padding: 16,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  userNumber: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  userValidity: {
    fontSize: 14,
    color: '#0891b2',
    marginTop: 4,
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: '#0891b2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    margin: 16,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});