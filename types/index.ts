export type UserRole =
  | 'PHC_STAFF'
  | 'PHC_IN_CHARGE'
  | 'DISTRICT_OFFICER'
  | 'WAREHOUSE_OFFICER'
  | 'STATE_VIEWER';

export type District = 'Meerut District' | 'Baghpat District';

export type FacilityRisk = 'Safe' | 'Monitoring' | 'High Risk' | 'Critical' | 'Expiry Opportunity' | 'Needs Verification';

export type MedicineUnit = 'tablet' | 'sachet' | 'vial' | 'capsule' | 'bottle';

export interface Facility {
  id: string;
  name: string;
  code: string; // e.g. "PHC A"
  district: District;
  block: string;
  coordinates: { x: number; y: number }; // SVG map grid coordinates (0-100 scale)
  geoCoordinates?: { lat: number; lng: number }; // Real-world GPS coordinates for Google Maps Platform
  bedsTotal: number;
  bedsOccupied: number;
  staffOnDuty: number;
  staffRequired: number;
  footfallDaily: number;
  feverFootfallChange: number; // e.g. +46%
  dataTrustScore: number; // 0-100
  trustCategory: 'Reliable' | 'Usable with caution' | 'Needs verification' | 'Unreliable';
  trustBreakdown: {
    freshness: number; // 30%
    completeness: number; // 25%
    verification: number; // 20%
    consistency: number; // 15%
    syncStatus: number; // 10%
  };
  lastSyncTime: string;
  isPhysicallyVerifiedToday: boolean;
  status: FacilityRisk;
}

export interface InventoryBatch {
  id: string;
  facilityId: string;
  medicineId: string;
  medicineName: string;
  category: 'Essential Analgesic' | 'Electrolyte / Rehydration' | 'Hormone' | 'Antibiotic' | 'Intravenous';
  batchNumber: string;
  quantity: number;
  unit: MedicineUnit;
  dailyConsumption: number;
  daysRemaining: number;
  expiryDate: string; // e.g. "2026-11-10"
  expiryDaysRemaining: number;
  isNearExpiry: boolean;
  lastVerifiedDate: string;
  costPerUnitInInr: number;
}

export interface AlertItem {
  id: string;
  facilityId: string;
  facilityName: string;
  medicineName: string;
  severity: 'Critical' | 'High' | 'Moderate' | 'Low';
  predictedStockOutDate: string;
  daysRemaining: number;
  currentStock: number;
  dailyUsage: number;
  forecastConfidence: number; // e.g. 88%
  dataTrustScore: number;
  title: string;
  summary: string;
  keyDrivers: string[];
  recommendedAction: string;
  sourceFacilityId?: string;
  sourceFacilityName?: string;
  transferQuantity?: number;
  status: 'Open' | 'Under Review' | 'Approved' | 'Resolved';
  actionTaken?: string;
  createdAt: string;
}

export interface TransferRecommendation {
  id: string; // e.g. "TR-2026-0042"
  medicineName: string;
  batchNumber: string;
  quantity: number;
  unit: MedicineUnit;
  sourceFacilityId: string;
  sourceFacilityName: string;
  sourceStockBefore: number;
  sourceStockAfter: number;
  sourceBufferDaysAfter: number;
  destinationFacilityId: string;
  destinationFacilityName: string;
  destinationStockBefore: number;
  destinationStockAfter: number;
  destinationDaysBefore: number;
  destinationDaysAfter: number;
  distanceKm: number;
  travelTimeMins: number;
  transportMode: string;
  priority: 'Critical' | 'High' | 'Normal';
  status: 'Awaiting District Approval' | 'Approved' | 'In Transit' | 'Completed' | 'Rejected';
  explanation: {
    whySourceSelected: string;
    whySafeForSource: string;
    routeDetails: string;
  };
  alternatives: Array<{
    facilityId: string;
    facilityName: string;
    distanceKm: number;
    surplus: number;
    score: number;
  }>;
  approvedBy?: string;
  approvedAt?: string;
  dispatchedBy?: string;
  dispatchedAt?: string;
  receivedBy?: string;
  receivedAt?: string;
  rejectionReason?: string;
}

export interface ExpiryRescueOpportunity {
  id: string;
  sourceFacilityId: string;
  sourceFacilityName: string;
  medicineName: string;
  batchNumber: string;
  expiryDaysRemaining: number;
  expiryDate: string;
  availableQuantity: number;
  unit: MedicineUnit;
  suggestedReceiverId: string;
  suggestedReceiverName: string;
  estimatedDemandBeforeExpiry: number;
  recommendedTransfer: number;
  valueRecoverableInr: number;
  status: 'Identified' | 'Approved' | 'Dispatched' | 'Completed';
  riskExplanation: string;
  actionRequired: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  role: UserRole;
  action: string;
  record: string;
  facility: string;
  status: 'Success' | 'Pending' | 'Flagged';
  details: string;
}

export interface EmergencyModeState {
  isActive: boolean;
  scenarioType: 'Fever/Dengue surge' | 'Heatwave' | 'Flood or transport disruption' | 'Diarrhoea outbreak' | 'Mass gathering' | 'Other';
  affectedBlock: string;
  affectedDistrict: District;
  activatedAt?: string;
  activatedBy?: string;
  expectedDurationDays: number;
  surgeMultiplier: number; // e.g. 1.4 for +40%
  preparedness: {
    paracetamolReadiness: number; // e.g. 63%
    orsReadiness: number; // e.g. 71%
    ivFluidsReadiness: number; // e.g. 55%
    feverBedOccupancy: number; // e.g. 78%
    staffCoverage: 'High' | 'Moderate' | 'Low';
    dataReportingRate: number; // e.g. 68%
  };
  next24hActions: string[];
}

export interface StockExtractionResult {
  medicineName: string;
  quantity: number;
  unit: MedicineUnit;
  transactionType: 'received' | 'dispensed' | 'damaged' | 'expired' | 'transferred';
  batchNumber: string | null;
  expiryDate: string | null;
  confidence: number;
  needsConfirmation: boolean;
}
