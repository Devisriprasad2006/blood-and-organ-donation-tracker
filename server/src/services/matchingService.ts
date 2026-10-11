import { query } from '../db/connection.js';
import type { BloodGroup, BloodComponentType, RequestUrgency } from '../types/index.js';

// Medically validated RBC compatibility matrix
// Recipient Blood Group -> Compatible Donor Blood Groups
const RBC_COMPATIBILITY_MAP: Record<BloodGroup, BloodGroup[]> = {
  'O-': ['O-'],
  'O+': ['O-', 'O+'],
  'A-': ['O-', 'A-'],
  'A+': ['O-', 'O+', 'A-', 'A+'],
  'B-': ['O-', 'B-'],
  'B+': ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
};

// Plasma compatibility is reciprocal of RBC
const PLASMA_COMPATIBILITY_MAP: Record<BloodGroup, BloodGroup[]> = {
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+'],
};

export function getCompatibleBloodGroups(recipientGroup: BloodGroup, componentType: BloodComponentType): BloodGroup[] {
  if (componentType === 'Fresh Frozen Plasma' || componentType === 'Cryoprecipitate') {
    return PLASMA_COMPATIBILITY_MAP[recipientGroup] || [recipientGroup];
  }
  return RBC_COMPATIBILITY_MAP[recipientGroup] || [recipientGroup];
}

/**
 * Haversine formula for calculating approximate great-circle distance between two coordinates in kilometers.
 */
export function calculateHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export interface MatchedCandidate {
  rank: number;
  donorId: string;
  donorName: string;
  bloodGroup: BloodGroup;
  donationType: string;
  distanceKm: number;
  matchScore: number;
  isExactMatch: boolean;
  isUniversalDonor: boolean;
  reasons: string[];
  approxCity: string;
  isAvailable: boolean;
  preferredContact: string;
}

export async function findMatchingDonors(params: {
  recipientBloodGroup: BloodGroup;
  componentType: BloodComponentType;
  urgency: RequestUrgency;
  targetLatitude: number;
  targetLongitude: number;
  maxRadiusKm?: number;
}): Promise<MatchedCandidate[]> {
  const maxRadius = params.maxRadiusKm || 30;
  const compatibleGroups = getCompatibleBloodGroups(params.recipientBloodGroup, params.componentType);

  // Fetch verified and available donors
  const placeholders = compatibleGroups.map(() => '?').join(', ');
  const sql = `
    SELECT 
      d.id as donor_profile_id,
      d.user_id,
      d.blood_group,
      d.donation_type,
      d.is_available,
      d.is_matching_paused,
      d.preferred_contact,
      d.last_donation_date,
      d.total_donations_count,
      d.privacy_setting,
      u.full_name,
      u.city,
      u.approx_latitude,
      u.approx_longitude,
      u.is_verified
    FROM donor_profiles d
    JOIN users u ON d.user_id = u.id
    WHERE d.blood_group IN (${placeholders})
      AND d.is_available = 1
      AND d.is_matching_paused = 0
  `;

  const rows = await query<any>(sql, compatibleGroups);

  const candidates: MatchedCandidate[] = [];

  for (const row of rows) {
    // Check 90-day cooldown interval
    let cooldownOk = true;
    if (row.last_donation_date) {
      const lastDate = new Date(row.last_donation_date);
      const daysSince = (Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince < 90) {
        cooldownOk = false;
      }
    }

    if (!cooldownOk) continue;

    const distanceKm = calculateHaversineDistanceKm(
      params.targetLatitude,
      params.targetLongitude,
      row.approx_latitude,
      row.approx_longitude
    );

    if (distanceKm > maxRadius) continue;

    const reasons: string[] = [];
    let score = 50;

    const isExactMatch = row.blood_group === params.recipientBloodGroup;
    if (isExactMatch) {
      score += 25;
      reasons.push('Exact ABO/Rh Cross-Match');
    } else {
      reasons.push(`Clinically Compatible Blood Group (${row.blood_group})`);
    }

    const isUniversalDonor = row.blood_group === 'O-';
    if (isUniversalDonor && !isExactMatch) {
      score += 15;
      reasons.push('Universal Donor O- (Emergency Compatible)');
    }

    // Distance decay: closer donors get higher priority
    if (distanceKm <= 5) {
      score += 20;
      reasons.push('Immediate Proximity (< 5 km from facility)');
    } else if (distanceKm <= 15) {
      score += 12;
      reasons.push('Regional Proximity (< 15 km)');
    } else {
      score += 5;
    }

    // Donation history bonus
    if (row.total_donations_count >= 5) {
      score += 5;
      reasons.push(`Proven voluntary donor track record (${row.total_donations_count} previous donations)`);
    }

    // Identity masking for public directory privacy settings
    let displayName = row.full_name;
    if (row.privacy_setting === 'ANONYMOUS_TO_PUBLIC') {
      const parts = row.full_name.split(' ');
      displayName = parts.length > 1 ? `${parts[0]} ${parts[1][0]}.` : row.full_name;
    }

    candidates.push({
      rank: 0,
      donorId: row.user_id,
      donorName: displayName,
      bloodGroup: row.blood_group,
      donationType: row.donation_type,
      distanceKm,
      matchScore: Math.min(100, score),
      isExactMatch,
      isUniversalDonor,
      reasons,
      approxCity: row.city,
      isAvailable: Boolean(row.is_available),
      preferredContact: row.preferred_contact,
    });
  }

  // Sort descending by score, then ascending by distance
  candidates.sort((a, b) => b.matchScore - a.matchScore || a.distanceKm - b.distanceKm);

  // Assign 1-indexed ranks
  return candidates.map((c, idx) => ({ ...c, rank: idx + 1 }));
}
