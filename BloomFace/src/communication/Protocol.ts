export type PingMessage = {
  type: 'PING';
  timestamp: number;
};

export type PongMessage = {
  type: 'PONG';
  timestamp: number;
};

export type DeviceInfoMessage = {
  type: 'DEVICE_INFO';
  device: string;
  firmware: string;
};

export type CommandMessage = {
  type: 'COMMAND';
  command: string;
};

export type CommandAckMessage = {
  type: 'COMMAND_ACK';
  command: string;
};

export type SensorStateMessage = {
  type: 'SENSOR_STATE';
  timestamp: number;
  data: Record<string, any>;
};

export type RobotMessage =
  | PingMessage
  | PongMessage
  | DeviceInfoMessage
  | CommandMessage
  | CommandAckMessage
  | SensorStateMessage;

// Utility type guard to ensure valid base structure
export function isRobotMessage(msg: any): msg is RobotMessage {
  return msg && typeof msg === 'object' && typeof msg.type === 'string';
}
