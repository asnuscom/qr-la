import { Platform } from 'react-native';
import { VCardData } from '@/types';

export function buildVCardString(card: VCardData): string {
  const nameParts = card.fullName.trim().split(' ');
  const lastName = nameParts.length > 1 ? nameParts.pop() || '' : '';
  const firstName = nameParts.join(' ');

  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N;CHARSET=UTF-8:${lastName};${firstName};;;`,
    `FN;CHARSET=UTF-8:${card.fullName}`,
    `ORG;CHARSET=UTF-8:${card.company}`,
    `TITLE;CHARSET=UTF-8:${card.jobTitle}`,
  ];

  if (card.phone) {
    const cleanPhone = card.phone.replace(/[^\d+]/g, '');
    lines.push(`TEL;TYPE=CELL,VOICE,PREF:${cleanPhone}`);
  }

  if (card.phoneSecondary) {
    const cleanSec = card.phoneSecondary.replace(/[^\d+]/g, '');
    lines.push(`TEL;TYPE=WORK,VOICE:${cleanSec}`);
  }

  if (card.email) {
    lines.push(`EMAIL;TYPE=INTERNET,PREF:${card.email}`);
  }

  if (card.emailSecondary) {
    lines.push(`EMAIL;TYPE=INTERNET:${card.emailSecondary}`);
  }

  if (card.website) {
    lines.push(`URL;TYPE=WORK:${card.website}`);
  } else {
    lines.push(`URL;TYPE=PROFILE:https://qr-la.com/${card.slug}`);
  }

  if (card.location) {
    lines.push(`ADR;TYPE=WORK;CHARSET=UTF-8:;;${card.location};;;;`);
  }

  const notes: string[] = [];
  if (card.bio) notes.push(card.bio);
  if (card.socials?.linkedin) notes.push(`LinkedIn: ${card.socials.linkedin}`);
  if (card.socials?.instagram) notes.push(`Instagram: ${card.socials.instagram}`);
  if (card.socials?.github) notes.push(`GitHub: ${card.socials.github}`);

  if (notes.length > 0) {
    const noteText = notes.join(' | ').replace(/\n/g, ' ');
    lines.push(`NOTE;CHARSET=UTF-8:${noteText}`);
  }

  // Social profile fields supported by Apple Contacts & Google Contacts
  if (card.socials?.linkedin) {
    lines.push(`X-SOCIALPROFILE;type=linkedin:${card.socials.linkedin}`);
  }
  if (card.socials?.instagram) {
    lines.push(`X-SOCIALPROFILE;type=instagram:${card.socials.instagram}`);
  }
  if (card.socials?.twitter) {
    lines.push(`X-SOCIALPROFILE;type=twitter:${card.socials.twitter}`);
  }
  if (card.socials?.github) {
    lines.push(`X-SOCIALPROFILE;type=github:${card.socials.github}`);
  }

  lines.push(`REV:${new Date().toISOString()}`);
  lines.push('END:VCARD');

  return lines.join('\r\n');
}

/**
 * Downloads .vcf file to phone or desktop
 */
export function downloadVCard(card: VCardData): void {
  const vcfContent = buildVCardString(card);
  const fileName = `${card.slug || 'kartvizit'}.vcf`;

  if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof document !== 'undefined') {
    const blob = new Blob([vcfContent], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
