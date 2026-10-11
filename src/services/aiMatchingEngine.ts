// =============================================================================
// LifeLink: Rule-Based Intelligent Donor Matching & Spatial Distance Service
// Note: Preliminary matching criteria only. Not a substitute for clinical verification.
// =============================================================================

import type { 
  BloodGroup, 
  BloodComponentType,
  RequestUrgency, 
  DonorProfile, 
  AiDonorMatch 
} from '../types';

// Standard ABO & Rh Compatibility Matrix
export const BLOOD_COMPATIBILITY_RULES: Record<BloodGroup, BloodGroup[]> = {
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'A-': ['A-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], // Universal Recipient
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'O+': ['O+', 'O-'],
  'O-': ['O-'], // Universal Donor
};

// Component-specific plasma compatibility
export const PLASMA_COMPATIBILITY_RULES: Record<BloodGroup, BloodGroup[]> = {
  'O+': ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'], // Universal recipient for plasma
  'O-': ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'],
  'A+': ['A+', 'AB+', 'A-', 'AB-'],
  'A-': ['A+', 'AB+', 'A-', 'AB-'],
  'B+': ['B+', 'AB+', 'B-', 'AB-'],
  'B-': ['B+', 'AB+', 'B-', 'AB-'],
  'AB+': ['AB+', 'AB-'], // AB is universal plasma donor
  'AB-': ['AB+', 'AB-'],
};

export function isBloodCompatible(
  recipientBg: BloodGroup, 
  donorBg: BloodGroup, 
  component?: BloodComponentType
): boolean {
  if (component === 'Fresh Frozen Plasma') {
    const allowed = PLASMA_COMPATIBILITY_RULES[recipientBg] || [];
    return allowed.includes(donorBg);
  }
  const allowed = BLOOD_COMPATIBILITY_RULES[recipientBg] || [];
  return allowed.includes(donorBg);
}

// Haversine Geospatial Distance Formula (Kilometers)
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371; // Earth radius in km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export interface MatchScoringParams {
  targetLatitude: number;
  targetLongitude: number;
  recipientBloodGroup: BloodGroup;
  componentType?: BloodComponentType;
  urgency: RequestUrgency;
  maxRadiusKm?: number;
  donors: DonorProfile[];
}

/**
 * Intelligent Rule-Based Donor Ranking
 * Computes an explainable score (0-100) based on:
 * 1. Blood group match & cross-match compatibility
 * 2. Active availability & non-paused status
 * 3. Proximity distance decay
 * 4. Safe donation interval eligibility (90-day cooldown)
 * 5. Urgency weighting
 */
export function rankDonorsIntelligently(params: MatchScoringParams): AiDonorMatch[] {
  const {
    targetLatitude,
    targetLongitude,
    recipientBloodGroup,
    componentType,
    urgency,
    maxRadiusKm = 50,
    donors,
  } = params;

  const results: AiDonorMatch[] = [];

  donors.forEach((donor) => {
    // 1. Must be available and matching not paused
    if (!donor.isAvailable || donor.isMatchingPaused) return;

    // 2. Compatibility check
    const compatible = isBloodCompatible(recipientBloodGroup, donor.bloodGroup, componentType);
    if (!compatible) return;

    // 3. Approximate distance
    const distanceKm = calculateHaversineDistanceKm(
      targetLatitude,
      targetLongitude,
      donor.user.approxLatitude,
      donor.user.approxLongitude
    );

    if (distanceKm > maxRadiusKm) return;

    let score = 50;
    const reasons: string[] = [];

    // Exact blood match vs cross-match
    if (donor.bloodGroup === recipientBloodGroup) {
      score += 25;
      reasons.push(`Exact blood group match (${donor.bloodGroup})`);
    } else {
      score += 15;
      reasons.push(`Clinically compatible cross-match (${donor.bloodGroup} → ${recipientBloodGroup})`);
    }

    // Distance factor (inverse decay: up to 20 points within 10km)
    const distanceScore = Math.max(0, 20 - distanceKm * 0.4);
    score += distanceScore;
    reasons.push(`Within approximate perimeter (${distanceKm} km from hospital)`);

    // Donation cooldown evaluation (safe 90 days interval)
    if (donor.lastDonationDate) {
      const daysSince = Math.floor(
        (Date.now() - new Date(donor.lastDonationDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSince >= 90) {
        score += 5;
        reasons.push(`Eligible donation interval verified (${daysSince} days since last donation)`);
      } else {
        score -= 15;
        reasons.push(`Recent donation noted (${daysSince} days ago; cooldown recommended)`);
      }
    } else {
      score += 5;
      reasons.push('New registered voluntary donor');
    }

    // Urgency prioritization
    if (urgency === 'CRITICAL_EMERGENCY') {
      score = Math.min(100, score * 1.15);
      reasons.push('Elevated prioritization for critical emergency requirement');
    }

    const finalScore = Math.min(100, Math.round(score));

    results.push({
      donorId: donor.id,
      donorName: donor.privacySetting === 'ANONYMOUS_TO_PUBLIC' ? 'Verified Voluntary Donor' : donor.user.fullName,
      bloodGroup: donor.bloodGroup,
      approxDistanceKm: distanceKm,
      compatibilityScore: finalScore,
      isAvailable: donor.isAvailable,
      lastDonationDate: donor.lastDonationDate,
      reasons,
      contactMethod: donor.preferredContact,
    });
  });

  // Sort descending by explainable compatibility score
  return results.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
}
