// ===================================================================
// GymFlow — Multi-Tenant & Role Data Scoping Layer
// ===================================================================

import {
  AttendanceRecord,
  Branch,
  Equipment,
  Expense,
  FitnessClass,
  Invoice,
  Lead,
  Member,
  Payment,
  Trainer,
  User,
} from '@/types';
import { StorageService } from './StorageService';

export const DataScopeService = {
  /**
   * Retrieves members scoped to the current user's role and tenancy:
   * - SUPER_ADMIN: sees all members across all clubs
   * - MEMBER: strictly sees only their own profile record
   * - BRANCH_MANAGER: sees members registered to their assigned branch
   * - TRAINER: sees athletes assigned to their personal training roster or branch
   * - GYM staff (Owner, Admin, Receptionist, Accountant): sees all members in their gym
   */
  getMembers(user: User | null | undefined): Member[] {
    const all = StorageService.getCollection<Member>('members');
    if (!user) return [];

    if (user.role === 'SUPER_ADMIN') {
      return all;
    }

    if (user.role === 'MEMBER') {
      return all.filter((m) => m.id === user.id || m.email.toLowerCase() === user.email.toLowerCase());
    }

    const tenantGymId = user.gymId || 'gym_1';
    let gymMembers = all.filter((m) => m.gymId === tenantGymId);

    if (user.role === 'BRANCH_MANAGER' && user.branchId) {
      return gymMembers.filter((m) => m.branchId === user.branchId);
    }

    if (user.role === 'TRAINER') {
      return gymMembers.filter(
        (m) =>
          m.assignedTrainerId === user.id ||
          (user.name && m.assignedTrainerName?.toLowerCase().includes(user.name.toLowerCase())) ||
          (user.branchId && m.branchId === user.branchId)
      );
    }

    return gymMembers;
  },

  /**
   * Retrieves invoices scoped to role and tenancy:
   * - SUPER_ADMIN: all platform invoices
   * - MEMBER: only invoices addressed to this member
   * - TRAINER: empty list (trainers have no access to financial billing records)
   * - BRANCH_MANAGER: invoices for athletes enrolled in their branch
   * - ACCOUNTANT / GYM_OWNER / GYM_ADMIN: all invoices for the tenant gym
   */
  getInvoices(user: User | null | undefined): Invoice[] {
    const all = StorageService.getCollection<Invoice>('invoices');
    if (!user) return [];

    if (user.role === 'SUPER_ADMIN') {
      return all;
    }

    if (user.role === 'MEMBER') {
      return all.filter((inv) => inv.memberId === user.id || inv.memberEmail?.toLowerCase() === user.email.toLowerCase());
    }

    // Least privilege: Trainers do not have access to financial records
    if (user.role === 'TRAINER') {
      return [];
    }

    const tenantGymId = user.gymId || 'gym_1';
    let gymInvoices = all.filter((inv) => inv.gymId === tenantGymId);

    if (user.role === 'BRANCH_MANAGER' && user.branchId) {
      const branchMembers = this.getMembers(user);
      const branchMemberIds = new Set(branchMembers.map((m) => m.id));
      return gymInvoices.filter((inv) => branchMemberIds.has(inv.memberId));
    }

    return gymInvoices;
  },

  /**
   * Retrieves payments scoped to role and tenancy:
   * - SUPER_ADMIN: all payments
   * - MEMBER: only payments made by this member
   * - TRAINER: empty list (trainers have no access to transaction records)
   * - BRANCH_MANAGER: payments from members in their branch
   * - ACCOUNTANT / RECEPTIONIST / GYM_OWNER / GYM_ADMIN: payments for the tenant gym
   */
  getPayments(user: User | null | undefined): Payment[] {
    const all = StorageService.getCollection<Payment>('payments');
    if (!user) return [];

    if (user.role === 'SUPER_ADMIN') {
      return all;
    }

    if (user.role === 'MEMBER') {
      return all.filter((p) => p.memberId === user.id);
    }

    // Least privilege: Trainers do not have access to financial payments
    if (user.role === 'TRAINER') {
      return [];
    }

    const tenantGymId = user.gymId || 'gym_1';
    let gymPayments = all.filter((p) => p.gymId === tenantGymId);

    if (user.role === 'BRANCH_MANAGER' && user.branchId) {
      const branchMembers = this.getMembers(user);
      const branchMemberIds = new Set(branchMembers.map((m) => m.id));
      return gymPayments.filter((p) => branchMemberIds.has(p.memberId));
    }

    return gymPayments;
  },

  /**
   * Retrieves operating expenses scoped to role and tenancy:
   * - Only ACCOUNTANT, GYM_OWNER, GYM_ADMIN, and SUPER_ADMIN have operational expense visibility
   * - TRAINER, RECEPTIONIST, MEMBER: empty list
   */
  getExpenses(user: User | null | undefined): Expense[] {
    const all = StorageService.getCollection<Expense>('expenses');
    if (!user) return [];

    if (user.role === 'SUPER_ADMIN') {
      return all;
    }

    // Least privilege: Members, Trainers, and Receptionists do not access operational expenditures
    if (user.role === 'MEMBER' || user.role === 'TRAINER' || user.role === 'RECEPTIONIST') {
      return [];
    }

    const tenantGymId = user.gymId || 'gym_1';
    return all.filter((e) => e.gymId === tenantGymId);
  },

  /**
   * Retrieves classes scoped to role, branch, and trainer assignment:
   * - SUPER_ADMIN: all classes
   * - TRAINER: classes assigned to this trainer or in their branch
   * - BRANCH_MANAGER: classes hosted in their branch
   * - Others: classes in tenant gym
   */
  getClasses(user: User | null | undefined): FitnessClass[] {
    const all = StorageService.getCollection<FitnessClass>('classes');
    if (!user) return [];

    if (user.role === 'SUPER_ADMIN') {
      return all;
    }

    const tenantGymId = user.gymId || 'gym_1';
    let gymClasses = all.filter((c) => c.gymId === tenantGymId);

    if (user.role === 'BRANCH_MANAGER' && user.branchId) {
      return gymClasses.filter((c) => c.branchId === user.branchId);
    }

    if (user.role === 'TRAINER') {
      return gymClasses.filter(
        (c) =>
          c.trainerId === user.id ||
          (user.name && c.trainerName?.toLowerCase().includes(user.name.toLowerCase())) ||
          (user.branchId && c.branchId === user.branchId)
      );
    }

    return gymClasses;
  },

  /**
   * Retrieves attendance records scoped to role and branch:
   * - SUPER_ADMIN: all attendance
   * - MEMBER: only their own attendance history
   * - BRANCH_MANAGER: attendance at their branch
   * - Others: attendance for tenant gym
   */
  getAttendance(user: User | null | undefined): AttendanceRecord[] {
    const all = StorageService.getCollection<AttendanceRecord>('attendance');
    if (!user) return [];

    if (user.role === 'SUPER_ADMIN') {
      return all;
    }

    if (user.role === 'MEMBER') {
      return all.filter((a) => a.memberId === user.id);
    }

    const tenantGymId = user.gymId || 'gym_1';
    let gymAttendance = all.filter((a) => a.gymId === tenantGymId);

    if (user.role === 'BRANCH_MANAGER' && user.branchId) {
      return gymAttendance.filter((a) => a.branchId === user.branchId);
    }

    return gymAttendance;
  },

  /**
   * Retrieves branches scoped to role:
   * - SUPER_ADMIN: all platform branches
   * - BRANCH_MANAGER: only their assigned branch
   * - Others: branches belonging to their gym
   */
  getBranches(user: User | null | undefined): Branch[] {
    const all = StorageService.getCollection<Branch>('branches');
    if (!user) return [];

    if (user.role === 'SUPER_ADMIN') {
      return all;
    }

    const tenantGymId = user.gymId || 'gym_1';
    let gymBranches = all.filter((b) => b.gymId === tenantGymId);

    if (user.role === 'BRANCH_MANAGER' && user.branchId) {
      return gymBranches.filter((b) => b.id === user.branchId);
    }

    return gymBranches;
  },

  /**
   * Retrieves trainers scoped to role and branch
   */
  getTrainers(user: User | null | undefined): Trainer[] {
    const all = StorageService.getCollection<Trainer>('trainers');
    if (!user) return [];

    if (user.role === 'SUPER_ADMIN') {
      return all;
    }

    const tenantGymId = user.gymId || 'gym_1';
    let gymTrainers = all.filter((t) => t.gymId === tenantGymId);

    if (user.role === 'BRANCH_MANAGER' && user.branchId) {
      return gymTrainers.filter((t) => t.branchId === user.branchId);
    }

    return gymTrainers;
  },

  /**
   * Retrieves sales CRM leads scoped to role:
   * - Least privilege: Athletes, Trainers, and Accountants do not have CRM lead pipeline access
   */
  getLeads(user: User | null | undefined): Lead[] {
    const all = StorageService.getCollection<Lead>('leads');
    if (!user) return [];

    if (user.role === 'SUPER_ADMIN') {
      return all;
    }

    if (user.role === 'MEMBER' || user.role === 'TRAINER' || user.role === 'ACCOUNTANT') {
      return [];
    }

    const tenantGymId = user.gymId || 'gym_1';
    let gymLeads = all.filter((l) => l.gymId === tenantGymId);

    if (user.role === 'BRANCH_MANAGER' && user.branchId) {
      return gymLeads.filter((l) => l.branchId === user.branchId);
    }

    return gymLeads;
  },

  /**
   * Retrieves equipment inventory scoped to branch
   */
  getEquipment(user: User | null | undefined): Equipment[] {
    const all = StorageService.getCollection<Equipment>('equipment');
    if (!user) return [];

    if (user.role === 'SUPER_ADMIN') {
      return all;
    }

    if (user.role === 'MEMBER' || user.role === 'ACCOUNTANT') {
      return [];
    }

    const tenantGymId = user.gymId || 'gym_1';
    let gymEquipment = all.filter((e) => e.gymId === tenantGymId);

    if (user.role === 'BRANCH_MANAGER' && user.branchId) {
      return gymEquipment.filter((e) => e.branchId === user.branchId);
    }

    return gymEquipment;
  },
};
