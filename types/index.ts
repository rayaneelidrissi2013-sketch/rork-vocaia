export interface User {
  id: string;
  email: string;
  name: string;
  phoneNumber: string;
  vapiPhoneNumber?: string;
  countryCode?: string;
  language: string;
  timezone: string;
  createdAt: string;
  role?: 'user' | 'admin';
}

export interface Call {
  id: string;
  callerName: string;
  callerNumber: string;
  timestamp: string;
  duration: number;
  summary: string;
  transcription: string;
  audioUrl: string;
  status: 'completed' | 'missed' | 'ongoing';
  vapiCost?: number;
}

export interface AIAgentSettings {
  isEnabled: boolean;
  prompt: string;
  schedules: Schedule[];
  language: string;
  voiceType: string;
}

export interface Schedule {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  enabled: boolean;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  hasActivePlan: boolean;
  login: (email: string, password: string) => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, phoneNumber: string) => Promise<void>;
  logout: () => void;
  setPlanActive: () => Promise<void>;
  isLoading: boolean;
}

export interface CallsContextType {
  calls: Call[];
  isLoading: boolean;
  refreshCalls: () => Promise<void>;
}

export interface SettingsContextType {
  settings: AIAgentSettings;
  isLoading: boolean;
  updateSettings: (settings: Partial<AIAgentSettings>) => Promise<void>;
  toggleAIAgent: (minutesRemaining?: number, vapiPhoneNumber?: string, countryCode?: string) => Promise<void>;
}

export interface VirtualNumber {
  id: string;
  phoneNumber: string;
  country: string;
  countryCode: string;
  provider: string;
  status: 'active' | 'inactive';
  assignedUserId: string | null;
  webhookUrl: string;
  createdAt: string;
}

export interface APIKeys {
  vapiSecretKey: string;
  vapiWebhookSecret: string;
  cpaasAccountSid: string;
  cpaasAuthToken: string;
  cpaasProvider: string;
  cloudStorageKey: string;
  cloudStorageProvider: string;
}

export interface GlobalAgentSettings {
  defaultPrompt: string;
  defaultLanguage: string;
  defaultTemperature: number;
  defaultMaxTokens: number;
  defaultVoiceType: string;
}

export interface AdminUser extends User {
  vapiAgentId?: string;
  vapiPhoneNumberId?: string;
  customPromptTemplate?: string;
  isAgentActive?: boolean;
  profession?: string;
}

export interface AdminContextType {
  apiKeys: APIKeys;
  virtualNumbers: VirtualNumber[];
  globalSettings: GlobalAgentSettings;
  adminUsers: AdminUser[];
  isLoading: boolean;
  updateAPIKeys: (keys: Partial<APIKeys>) => Promise<void>;
  updateGlobalSettings: (settings: Partial<GlobalAgentSettings>) => Promise<void>;
  addVirtualNumber: (number: Omit<VirtualNumber, 'id' | 'createdAt'>) => Promise<void>;
  removeVirtualNumber: (id: string) => Promise<void>;
  assignNumberToUser: (numberId: string, userId: string | null) => Promise<void>;
  updateUserAgent: (userId: string, updates: Partial<AdminUser>) => Promise<void>;
  refreshData: () => Promise<void>;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  minutesIncluded: number;
  price: number;
  features: string[];
  isRecommended?: boolean;
  isEnterprise?: boolean;
  overagePolicy: 'upgrade' | 'charge' | 'block' | 'custom';
}

export interface UserSubscription {
  userId: string;
  planId: string;
  minutesUsed: number;
  minutesRemaining: number;
  startDate: string;
  renewalDate: string;
  status: 'active' | 'expired' | 'cancelled' | 'suspended';
  paymentMethod?: string;
}

export interface DBUser extends User {
  vapiAgentId?: string;
  vapiPhoneNumber?: string;
  userPersonalPhone?: string;
  isAgentActive: boolean;
  customPromptTemplate?: string;
  profession?: string;
  planId?: string;
  minutesIncluded: number;
  minutesRemaining: number;
  minutesConsumed: number;
  dateRenouvellement?: string;
  registrationDate: string;
}

export interface DBCall extends Call {
  userId: string;
  vapiCallId: string;
  durationSeconds: number;
  gcsRecordingUrl?: string;
  vapiCost?: number;
}

export interface VapiWebhookPayload {
  type: string;
  call: {
    id: string;
    status: string;
    endedReason?: string;
    duration?: number;
    startedAt?: string;
    endedAt?: string;
    transcript?: string;
    recordingUrl?: string;
    summary?: string;
    customer?: {
      number?: string;
      name?: string;
    };
  };
  phoneNumber?: {
    number?: string;
  };
}

export interface PayPalSubscriptionResponse {
  id: string;
  status: string;
  start_time: string;
  billing_info: {
    next_billing_time: string;
  };
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalCalls: number;
  totalMinutesConsumed: number;
  monthlyMinutesConsumed: number;
  currentMonthRevenue: number;
  previousMonthRevenue: number;
}

export interface UserDetails extends DBUser {
  totalCalls: number;
  paymentHistory: PaymentRecord[];
}

export interface PaymentRecord {
  id: string;
  userId: string;
  amount: number;
  type: 'subscription' | 'overage';
  status: 'completed' | 'pending' | 'failed';
  date: string;
  paypalTransactionId?: string;
}
