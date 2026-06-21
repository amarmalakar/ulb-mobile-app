import type { TFunction } from 'i18next';

import type { StaffInfo } from '@/features/staff-auth/types/index';

function coversAllWards(wards: number[], totalWards: number): boolean {
  if (totalWards <= 0 || wards.length < totalWards) {
    return false;
  }

  const assigned = new Set(wards);
  for (let ward = 1; ward <= totalWards; ward += 1) {
    if (!assigned.has(ward)) {
      return false;
    }
  }

  return true;
}

function hasAllZones(staffInfo: StaffInfo): boolean {
  const totalZones = staffInfo.ulbTotalZones ?? 0;
  return totalZones > 0 && staffInfo.zone.length >= totalZones;
}

function hasAllSelectedWards(staffInfo: StaffInfo): boolean {
  const totalWards = staffInfo.ulbTotalWards ?? 0;
  return coversAllWards(staffInfo.selectedWards ?? [], totalWards);
}

function getStaffScopeSuffix(staffInfo: StaffInfo, t: TFunction): string | null {
  const positionName = staffInfo.positionName.toLowerCase();

  if (positionName.includes('zone')) {
    if (hasAllZones(staffInfo)) {
      return t('staff.allWards');
    }

    const zoneNames = staffInfo.zone.map((zone) => zone.name.trim()).filter(Boolean);
    return zoneNames.length > 0 ? zoneNames.join(', ') : null;
  }

  if (positionName.includes('ward')) {
    if (hasAllSelectedWards(staffInfo)) {
      return t('staff.allWards');
    }

    const wardLabels = [...(staffInfo.selectedWards ?? [])]
      .sort((a, b) => a - b)
      .map((ward) => t('common.wardNumber', { ward }));
    return wardLabels.length > 0 ? wardLabels.join(', ') : null;
  }

  return null;
}

/** e.g. `Municipal Staff · Ward Coordinator · Ward 1, Ward 2` */
export function buildStaffRoleSummary(staffInfo: StaffInfo, t: TFunction): string {
  const staffTypeLabel = staffInfo.type
    ? t(`staff.type.${staffInfo.type}`)
    : null;

  const parts = [staffTypeLabel, staffInfo.positionName.trim()].filter(
    (part): part is string => Boolean(part),
  );

  const scopeSuffix = getStaffScopeSuffix(staffInfo, t);
  if (scopeSuffix) {
    parts.push(scopeSuffix);
  }

  return parts.join(' · ');
}
