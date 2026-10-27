// ===================================================================
// GymFlow — Email Templates & Safe Preview Service
// ===================================================================

import { EmailTemplate } from '@/types';
import { StorageService } from './StorageService';
import { formatINR } from '@/lib/formatters';

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export const EmailTemplateService = {
  getAll(): EmailTemplate[] {
    return StorageService.getCollection<EmailTemplate>('emailTemplates');
  },

  getById(id: string): EmailTemplate | null {
    return StorageService.getItemById<EmailTemplate>('emailTemplates', id);
  },

  getByKey(key: string): EmailTemplate | null {
    const list = this.getAll();
    return list.find((t) => t.templateKey === key) || null;
  },

  save(template: Partial<EmailTemplate>): EmailTemplate {
    const full: EmailTemplate = {
      id: template.id || `tpl_${Date.now()}`,
      gymId: template.gymId ?? null,
      name: template.name || 'Custom Email Template',
      templateKey: template.templateKey || `custom_${Date.now()}`,
      category: template.category || 'marketing',
      subject: template.subject || 'Notice from GymFlow',
      htmlBody: template.htmlBody || '<p>Hello {{memberName}}</p>',
      plainTextBody: template.plainTextBody || 'Hello {{memberName}}',
      availablePlaceholders: template.availablePlaceholders || ['{{memberName}}', '{{gymName}}'],
      status: template.status || 'active',
      lastModified: new Date().toISOString().split('T')[0],
    };

    return StorageService.saveItem<EmailTemplate>('emailTemplates', full);
  },

  delete(id: string): boolean {
    return StorageService.deleteItem('emailTemplates', id);
  },

  renderPreview(
    template: EmailTemplate,
    sampleData: Record<string, string> = {
      memberName: 'Alex Morgan',
      gymName: 'IronPulse Fitness Club',
      membershipPlan: 'Annual VIP Pass',
      membershipEndDate: '2026-12-31',
      amount: '18,761.17',
      invoiceNumber: 'INV-2026-001',
      className: 'Morning HIIT Blast',
      bookingDate: 'Tomorrow at 07:00 AM',
      discountCode: 'SUMMER30',
      discountAmount: formatINR(6599.70),
      supportTicketId: 'TCK-4821',
    }
  ): { subject: string; htmlBody: string; plainTextBody: string } {
    let subject = template.subject;
    let html = template.htmlBody;
    let text = template.plainTextBody;

    Object.entries(sampleData).forEach(([key, val]) => {
      const escapedVal = escapeHtml(String(val));
      const placeholderRegex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      subject = subject.replace(placeholderRegex, val);
      html = html.replace(placeholderRegex, escapedVal);
      text = text.replace(placeholderRegex, val);
    });

    return { subject, htmlBody: html, plainTextBody: text };
  },
};
