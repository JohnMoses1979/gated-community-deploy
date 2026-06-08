/**
 * maintenanceStatus.js
 * Single source of truth for all maintenance status labels, colors, and flow order.
 * Used by resident, admin, vendor, and guard screens.
 */

// ─── Status Labels ─────────────────────────────────────────────────────────────
export const STATUS_LABELS = {
    submitted: 'Submitted',
    quote_requested: 'Quote Requested',
    assigned: 'Vendor Assigned',
    quoted: 'Quote Received',
    quote_sent_to_resident: 'Quote Sent',
    quote_accepted: 'Quote Accepted',
    quote_rejected: 'Quote Rejected',
    approved_to_start: 'Approved',
    work_in_progress: 'Work In Progress',
    work_completed: 'Work Completed',
    resident_work_approved: 'Resident Approved',
    payment_requested_to_admin: 'Awaiting Admin',
    payment_requested_to_resident: 'Payment Due',
    payment_received: 'Payment Received',
    paid_to_vendor: 'Closed & Paid',
    rejected: 'Rejected',
    closed: 'Closed',
};

// ─── Status Colors (teal #1A7A7A theme) ──────────────────────────────────────
export const STATUS_COLORS = {
    submitted: '#7B1FA2',
    quote_requested: '#0891B2',
    assigned: '#0277BD',
    quoted: '#E65100',
    quote_sent_to_resident: '#0D9488',
    quote_accepted: '#1A7A7A',
    quote_rejected: '#C62828',
    approved_to_start: '#7C3AED',
    work_in_progress: '#D97706',
    work_completed: '#15803D',
    resident_work_approved: '#1A7A7A',
    payment_requested_to_admin: '#EA580C',
    payment_requested_to_resident: '#7C3AED',
    payment_received: '#0891B2',
    paid_to_vendor: '#1A7A7A',
    rejected: '#DC2626',
    closed: '#64748B',
};

// ─── Priority Colors ──────────────────────────────────────────────────────────
export const PRIORITY_COLORS = {
    Low: { color: '#1A7A7A', bg: '#D1FAF0' },
    Medium: { color: '#B45309', bg: '#FEF3C7' },
    High: { color: '#C2410C', bg: '#FFEDD5' },
    Urgent: { color: '#B91C1C', bg: '#FEE2E2' },
};

// ─── Statuses where admin must take action ────────────────────────────────────
export const ADMIN_ACTION_REQUIRED = [
    'submitted',
    'quoted',
    'quote_accepted',
    'payment_requested_to_admin',
    'payment_received',
];

// ─── Statuses where resident must take action ─────────────────────────────────
export const RESIDENT_ACTION_REQUIRED = [
    'quote_sent_to_resident',
    'work_completed',
    'payment_requested_to_resident',
];

// ─── Full lifecycle ordered steps (for stepper UI) ───────────────────────────
export const STATUS_STEPS = [
    { key: 'submitted', label: 'Submitted', icon: '📋' },
    { key: 'quote_requested', label: 'Quote Sent', icon: '📩' },
    { key: 'quoted', label: 'Quoted', icon: '💰' },
    { key: 'quote_sent_to_resident', label: 'Quote Received', icon: '📨' },
    { key: 'quote_accepted', label: 'Accepted', icon: '✅' },
    { key: 'approved_to_start', label: 'Approved', icon: '🚀' },
    { key: 'work_in_progress', label: 'In Progress', icon: '🔨' },
    { key: 'work_completed', label: 'Work Done', icon: '🏁' },
    { key: 'resident_work_approved', label: 'You Approved', icon: '✅' },
    { key: 'payment_requested_to_admin', label: 'Pmt Admin', icon: '🏦' },
    { key: 'payment_requested_to_resident', label: 'Pmt Due', icon: '💳' },
    { key: 'payment_received', label: 'Pmt Received', icon: '💸' },
    { key: 'paid_to_vendor', label: 'Paid', icon: '✔️' },
];

// ─── Form constants ───────────────────────────────────────────────────────────
export const CATEGORIES = [
    'Plumbing', 'Electrical', 'HVAC', 'Carpentry', 'Painting',
    'Appliances', 'Structural', 'Pest Control', 'Landscaping', 'Other',
];

export const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

export const TIME_SLOTS = ['Morning (8–12)', 'Afternoon (12–4)', 'Evening (4–8)', 'Flexible'];

export const CONTACT_OPTIONS = ['Call', 'WhatsApp', 'In-App'];