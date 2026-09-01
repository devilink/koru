import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import CompanionFace, { CompanionState } from './components/CompanionFace';

export default function App() {
  const [ipAddress, setIpAddress] = useState('172.20.10.5'); // Default hint
  const [isConnected, setIsConnected] = useState(false);
  const [state, setState] = useState<CompanionState>('idle');
  const [chatLog, setChatLog] = useState<{sender: string, text: string}[]>([]);
  const ws = useRef<WebSocket | null>(null);

  const connect = () => {
    if (!ipAddress) return;
    const WS_URL = `ws://${ipAddress}:8000/ws`;
    
    ws.current = new WebSocket(WS_URL);
    
    ws.current.onopen = () => {
      console.log('Connected to PC backend');
      setIsConnected(true);
    };
    
    ws.current.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload.type === 'telemetry') {
          const telemetry = payload.data;
          if (telemetry.moisture_level < 25) {
            setState('plant-thirsty');
          }
        } else if (payload.type === 'emotion') {
          setState(payload.data);
        } else if (payload.type === 'chat') {
          setChatLog(prev => {
            const newLog = [...prev, payload.data];
            return newLog.slice(-3);
          });
        }
      } catch (err) {
        console.error("Failed to parse WS msg", err);
      }
    };

    ws.current.onclose = () => {
      setIsConnected(false);
    };
  };

  useEffect(() => {
    return () => {
      ws.current?.close();
    };
  }, []);

  if (!isConnected) {
    return (
      <View style={styles.connectContainer}>
        <Text style={styles.title}>Companion Link</Text>
        <Text style={styles.subtitleText}>Enter the IP shown on your Laptop Launcher</Text>
        
        <TextInput 
          style={styles.ipInput}
          value={ipAddress}
          onChangeText={setIpAddress}
          placeholder="e.g. 192.168.1.5"
          placeholderTextColor="#7f8fa6"
          keyboardType="numeric"
        />
        
        <TouchableOpacity style={styles.connectButton} onPress={connect}>
          <Text style={styles.connectButtonText}>Connect</Text>
        </TouchableOpacity>
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Companion Link</Text>
      
      <View style={styles.faceContainer}>
        <CompanionFace state={state} />
      </View>

      <View style={styles.subtitleContainer}>
        {chatLog.length > 0 && (
          <View style={styles.subtitleBox}>
            <Text style={styles.subtitleSender}>
              {chatLog[chatLog.length - 1].sender}
            </Text>
            <Text style={styles.subtitleText}>
              {chatLog[chatLog.length - 1].text}
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity 
        style={styles.disconnectButton} 
        onPress={() => ws.current?.close()}
      >
        <Text style={{color: '#d63031', fontWeight: 'bold'}}>Disconnect</Text>
      </TouchableOpacity>

      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  connectContainer: {
    flex: 1,
    backgroundColor: '#1e272e',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  ipInput: {
    backgroundColor: '#f5f6fa',
    borderRadius: 10,
    width: '80%',
    padding: 15,
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 20,
  },
  connectButton: {
    backgroundColor: '#0fb9b1',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  connectButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disconnectButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 10,
  },
  container: {
    flex: 1,
    backgroundColor: '#1e272e',
    alignItems: 'center',
    paddingTop: 60,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#d2dae2',
    marginBottom: 20,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  faceContainer: {
    marginVertical: 40,
  },
  subtitleContainer: {
    width: '100%',
    padding: 20,
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 50,
  },
  subtitleBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 20,
    borderRadius: 15,
    borderLeftWidth: 5,
    borderColor: '#0fb9b1',
  },
  subtitleSender: {
    color: '#0fb9b1',
    fontWeight: '900',
    fontSize: 12,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  subtitleText: {
    color: '#d2dae2',
    fontSize: 20,
    lineHeight: 28,
  }
});
