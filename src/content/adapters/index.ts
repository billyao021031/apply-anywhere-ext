import { SiteType, FieldProposal } from '../../types';
import { linkedinEasyApply } from './linkedin-easy';
import { greenhouse } from './greenhouse';
import { lever } from './lever';
import { workday } from './workday';

/**
 * Detect the site type based on hostname
 */
export function detectSite(): SiteType {
  const hostname = window.location.hostname.toLowerCase();
  
  if (hostname.includes('linkedin.com')) {
    return 'linkedin';
  }
  
  if (hostname.includes('greenhouse.io') || hostname.includes('boards.greenhouse.io')) {
    return 'greenhouse';
  }
  
  if (hostname.includes('lever.co') || hostname.includes('jobs.lever.co')) {
    return 'lever';
  }
  
  if (hostname.includes('workday.com') || hostname.includes('myworkdayjobs.com')) {
    return 'workday';
  }
  
  return 'generic';
}

/**
 * Apply site-specific tweaks to field proposals
 */
export async function applySiteTweaks(
  siteType: SiteType,
  proposals: FieldProposal[]
): Promise<FieldProposal[]> {
  switch (siteType) {
    case 'linkedin':
      return await linkedinEasyApply(proposals);
    case 'greenhouse':
      return await greenhouse(proposals);
    case 'lever':
      return await lever(proposals);
    case 'workday':
      return await workday(proposals);
    default:
      return proposals;
  }
}

/**
 * Get site-specific delay for dynamic content loading
 */
export function getSiteDelay(siteType: SiteType): number {
  switch (siteType) {
    case 'workday':
      return 2000; // Workday often has dynamic tiles
    case 'linkedin':
      return 1000; // LinkedIn Easy Apply modals
    case 'greenhouse':
    case 'lever':
    default:
      return 500; // Generic delay
  }
}
