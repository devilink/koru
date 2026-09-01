import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import CompanionFace, { CompanionState } from './components/CompanionFace';
import axios from 'axios';

// The PC's local IP on the WiFi network. 
// We are hardcoding this for the prototype, but it should be configurable.
const PC_IP = '172.20.10.5';
const API_URL = `http://${PC_IP}:8000/api`;
const WS_URL = `ws://${PC_IP}:8000/ws`;

export default function App() {
  const [state, setState] = useState<CompanionState>('idle');
  const [chatInput, setChatInput] = useState('');
  const [chatLog, setChatLog] = useState<{sender: string, text: string}[]>([]);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Setup Websocket
    ws.current = new WebSocket(WS_URL);
    
    ws.current.onopen = () => {
      console.log('Mobile App connected to PC backend');
    };
    
    ws.current.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload.type === 'telemetry') {
          // Determine face state from hardware sensors (like the React dashboard does)
          // For simplicity in mobile app, if moisture is low, show thirsty
          const telemetry = payload.data;
          if (telemetry.moisture_level < 25) {
            setState('plant-thirsty');
          } else {
            setState('idle'); // or keep current state
          }
        }
      } catch (err) {
        console.error("Failed to parse WS msg", err);
      }
    };

    return () => {
      ws.current?.close();
    };
  }, []);

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    
    const userText = chatInput;
    setChatInput('');
    setChatLog(prev => [...prev, { sender: 'You', text: userText }]);
    setState('curious');
    
    try {
      const res = await axios.post(`${API_URL}/chat`, { message: userText });
      const companionText = res.data.response;
      setChatLog(prev => [...prev, { sender: 'Bot', text: companionText }]);
      setState('happy');
      
      setTimeout(() => setState('idle'), 3000);
    } catch (e) {
      console.error(e);
      setChatLog(prev => [...prev, { sender: 'System', text: 'Error connecting to PC backend.' }]);
      setState('gentle-concern');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Companion Bot Mobile</Text>
      
      <View style={styles.faceContainer}>
        <CompanionFace state={state} />
      </View>

      <View style={styles.controls}>
        <Text style={styles.subtitle}>Test States:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stateButtons}>
          {['idle', 'happy', 'curious', 'gentle-concern', 'sleepy', 'plant-thirsty'].map(s => (
            <TouchableOpacity key={s} style={styles.button} onPress={() => setState(s as CompanionState)}>
              <Text style={styles.buttonText}>{s}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.chatSection}>
        <ScrollView style={styles.chatLog}>
          {chatLog.map((msg, idx) => (
            <Text key={idx} style={msg.sender === 'You' ? styles.userMsg : styles.botMsg}>
              <Text style={{fontWeight: 'bold'}}>{msg.sender}: </Text>
              {msg.text}
            </Text>
          ))}
        </ScrollView>
        <View style={styles.chatInputRow}>
          <TextInput 
            style={styles.input} 
            value={chatInput}
            onChangeText={setChatInput}
            placeholder="Say something to the bot..."
            placeholderTextColor="#7f8fa6"
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSendChat}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>

      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2f3640',
    alignItems: 'center',
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f5f6fa',
    marginBottom: 20,
  },
  faceContainer: {
    marginVertical: 20,
  },
  controls: {
    width: '100%',
    height: 80,
    paddingHorizontal: 15,
  },
  subtitle: {
    color: '#dcdde1',
    marginBottom: 10,
    fontWeight: '600'
  },
  stateButtons: {
    flexDirection: 'row',
  },
  button: {
    backgroundColor: '#353b48',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#4cd137',
  },
  buttonText: {
    color: '#f5f6fa',
    fontSize: 14,
  },
  chatSection: {
    flex: 1,
    width: '100%',
    padding: 15,
  },
  chatLog: {
    flex: 1,
    backgroundColor: '#353b48',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  userMsg: {
    color: '#00a8ff',
    marginBottom: 8,
    fontSize: 16,
  },
  botMsg: {
    color: '#4cd137',
    marginBottom: 8,
    fontSize: 16,
  },
  chatInputRow: {
    flexDirection: 'row',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
    height: 50,
  },
  sendButton: {
    backgroundColor: '#4cd137',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderRadius: 25,
    marginLeft: 10,
  },
  sendButtonText: {
    color: '#2f3640',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
