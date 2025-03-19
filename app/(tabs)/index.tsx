import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Power, Settings, Users as UsersIcon } from 'lucide-react-native';
import { Device } from '@/types';
import { getDevices, addLog } from '@/lib/database';

export default function DevicesScreen() {
  const router = useRouter();
  const [devices, setDevices] = useState<Device[]>([]);
  const [activeDevices, setActiveDevices] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadDevices();
  }, []);

  async function loadDevices() {
    try {
      const deviceList = await getDevices();
      setDevices(deviceList);
    } catch (error) {
      console.error('Error loading devices:', error);
    }
  }

  const renderDevice = ({ item }: { item: Device }) => {
    const isActive = activeDevices.has(item.id);

    return (
      <View style={styles.deviceCard}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1596973502010-fde7c0402206?q=80&w=200&auto=format' }}
          style={styles.deviceImage}
        />
        <View style={styles.deviceContent}>
          <View style={styles.deviceInfo}>
            <Text style={styles.deviceName}>{item.name}</Text>
            <Text style={styles.deviceNumber}>{item.phone_number}</Text>
            <Text style={[styles.deviceStatus, isActive ? styles.statusActive : styles.statusInactive]}>
              {isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push(`/device/${item.id}/users`)}>
              <UsersIcon size={20} color="#64748b" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push(`/device/${item.id}/settings`)}>
              <Settings size={20} color="#64748b" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.powerButton, isActive && styles.powerButtonActive]}
              onPress={() => toggleRelay(item.id)}>
              <Power size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  async function toggleRelay(deviceId: string) {
    setActiveDevices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(deviceId)) {
        newSet.delete(deviceId);
      } else {
        newSet.add(deviceId);
      }
      return newSet;
    });

    // Log the command
    await addLog({
      device_id: deviceId,
      command: activeDevices.has(deviceId) ? 'DEACTIVATE' : 'ACTIVATE',
      description: `Gate ${activeDevices.has(deviceId) ? 'closed' : 'opened'}`
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Devices</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/device/new')}>
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={devices}
        renderItem={renderDevice}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
  },
  list: {
    padding: 16,
  },
  deviceCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  deviceImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#f1f5f9',
  },
  deviceContent: {
    padding: 16,
  },
  deviceInfo: {
    marginBottom: 16,
  },
  deviceName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  deviceNumber: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  deviceStatus: {
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusActive: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  statusInactive: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  powerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  powerButtonActive: {
    backgroundColor: '#22c55e',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0891b2',
    justifyContent: 'center',
    alignItems: 'center',
  },
});