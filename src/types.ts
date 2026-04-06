export interface Lead {
  id: number;
  name: string;
  email?: string;
  phone: string;
  property_type: string;
  location_pref?: string;
  budget?: string;
  message?: string;
  status: 'pending' | 'contacted' | 'connected' | 'closed';
  assigned_broker_id?: number;
  assigned_broker_name?: string;
  last_connect_date?: string;
  claimed_offers?: string[];
  referral?: string;
  is_deleted_for_brokers?: boolean;
  is_hidden_for_admin?: boolean;
  created_at: string;
}

export type PropertyType = '2BHK' | '3BHK';

export interface PropertyDetails {
  type: PropertyType;
  size: string;
  price: string;
  features: string[];
  image: string;
}

export interface Broker {
  id: number;
  name: string;
  email: string;
  phone: string;
  area: string;
  is_active: boolean;
  created_at: string;
}

export interface Notice {
  id: number;
  title: string;
  message: string;
  target: 'all' | 'brokers' | 'clients' | 'everyone';
  created_by: string;
  created_at: string;
}

export interface LeaderboardEntry {
  broker_id: number;
  name: string;
  total_leads: number;
  connected: number;
  closed: number;
  conversion_rate: number;
  activity_score: number;
  score: number;
  rank: number;
}

export interface CMSEntry {
  key: string;
  value: string;
}

export type LeadStatus = 'pending' | 'contacted' | 'connected' | 'closed';

export interface UserDocument {
  id: string;
  name: string;
  url: string;
  type: string;
  size: string;
  created_at: string;
}
