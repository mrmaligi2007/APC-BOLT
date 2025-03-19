import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { supabase } from '@/lib/supabase';
import { Log } from '@/types';

export default function LogsScreen() {
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    loadLogs();
  }, []);

  async function loadLogs() {
    const { data, error } = await supabase
      .from('logs')
      .select(`
        *,
        devices (name)
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error loading logs:', error);
      return;
    }

    setLogs(data || []);
  }

  const renderLog = ({ item }: { item: Log }) => (
    <View style={styles.logCard}>
      <Text style={styles.logDevice}>{item.devices.name}</Text>
      <Text style={styles.logCommand}>{item.command}</Text>
      <Text style={styles.logDescription}>{item.description}</Text>
      <Text style={styles.logTime}>
        {new Date(item.created_at).toLocaleString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={logs}
        renderItem={renderLog}
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
  logCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logDevice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  logCommand: {
    fontSize: 14,
    color: '#0891b2',
    marginTop: 4,
    fontFamily: 'monospace',
  },
  logDescription: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  logTime: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 8,
  },
});