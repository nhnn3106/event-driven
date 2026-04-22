export interface UserRegisteredPayload {
  userId: string;
  email: string;
  fullName: string;
}

export interface UserRegisteredEvent {
  eventId: string;
  eventType: 'USER_REGISTERED';
  timestamp: string;
  payload: UserRegisteredPayload;
}

export interface UserEventsPublisher {
  publishUserRegistered(payload: UserRegisteredPayload): Promise<void>;
}
