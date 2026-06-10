import { pgTable, text, timestamp, uuid, integer, numeric, date, boolean } from 'drizzle-orm/pg-core'
import type {
  ClientStatus,
  SessionStatus,
  TxType,
  TxScope,
  InvoiceStatus,
  PaymentMethod,
  NoteKind,
  Mood,
} from './constants'

// ─── Users (ileride auth için — şimdilik kullanılmıyor) ─────────────────────
export const users = pgTable('users', {
  id:        uuid('id').primaryKey().defaultRandom(),
  email:     text('email').notNull().unique(),
  name:      text('name'),
  image:     text('image'),
  role:      text('role').notNull().default('user'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ─── Clients (danışan) ──────────────────────────────────────────────────────
export const clients = pgTable('clients', {
  id:         uuid('id').primaryKey().defaultRandom(),
  name:       text('name').notNull(),
  email:      text('email'),
  phone:      text('phone'),
  status:     text('status').$type<ClientStatus>().notNull().default('active'),
  startDate:  date('start_date').notNull().defaultNow(),
  sessionFee: numeric('session_fee', { precision: 12, scale: 2 }).notNull().default('0'),
  colorTag:   text('color_tag').notNull().default('indigo'), // avatar/etiket rengi
  avatarUrl:  text('avatar_url'), // küçük data-URI fotoğraf (istemcide ~128px'e küçültülür)
  tags:       text('tags').array().notNull().default([]),
  notes:      text('notes'), // kısa özet (detaylı notlar clientNotes'ta)
  createdAt:  timestamp('created_at').defaultNow().notNull(),
  updatedAt:  timestamp('updated_at').defaultNow().notNull(),
})

// ─── Sessions (seans) ───────────────────────────────────────────────────────
export const sessions = pgTable('sessions', {
  id:          uuid('id').primaryKey().defaultRandom(),
  clientId:    uuid('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  date:        timestamp('date').notNull(),
  durationMin: integer('duration_min').notNull().default(50),
  status:      text('status').$type<SessionStatus>().notNull().default('scheduled'),
  fee:         numeric('fee', { precision: 12, scale: 2 }).notNull().default('0'),
  note:        text('note'),
  createdAt:   timestamp('created_at').defaultNow().notNull(),
})

// ─── Client notes (danışan notları) ─────────────────────────────────────────
export const clientNotes = pgTable('client_notes', {
  id:        uuid('id').primaryKey().defaultRandom(),
  clientId:  uuid('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  title:     text('title'),
  body:      text('body').notNull(),
  kind:      text('kind').$type<NoteKind>().notNull().default('session'),   // seans/gözlem/ödev/önemli
  mood:      text('mood').$type<Mood>(),                                    // danışanın seans duygu durumu
  pinned:    boolean('pinned').notNull().default(false),                    // sabitlenmiş not
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ─── Transactions (gelir/gider) ─────────────────────────────────────────────
export const transactions = pgTable('transactions', {
  id:          uuid('id').primaryKey().defaultRandom(),
  type:        text('type').$type<TxType>().notNull(),   // 'income' | 'expense'
  scope:       text('scope').$type<TxScope>().notNull().default('business'), // 'business' | 'personal'
  amount:      numeric('amount', { precision: 12, scale: 2 }).notNull(),
  category:    text('category').notNull(),
  description: text('description'),
  date:        date('date').notNull().defaultNow(),
  clientId:    uuid('client_id').references(() => clients.id, { onDelete: 'set null' }),
  createdAt:   timestamp('created_at').defaultNow().notNull(),
})

// ─── Invoices (fatura) ──────────────────────────────────────────────────────
export const invoices = pgTable('invoices', {
  id:         uuid('id').primaryKey().defaultRandom(),
  number:     text('number').notNull().unique(),
  clientId:   uuid('client_id').references(() => clients.id, { onDelete: 'set null' }),
  issueDate:  date('issue_date').notNull().defaultNow(),
  dueDate:    date('due_date'),
  subtotal:   numeric('subtotal', { precision: 12, scale: 2 }).notNull(),
  kdvRate:    integer('kdv_rate').notNull().default(20), // %
  kdvAmount:  numeric('kdv_amount', { precision: 12, scale: 2 }).notNull(),
  total:      numeric('total', { precision: 12, scale: 2 }).notNull(),
  status:     text('status').$type<InvoiceStatus>().notNull().default('draft'),
  note:       text('note'),
  createdAt:  timestamp('created_at').defaultNow().notNull(),
})

// ─── Payments (ödeme) ───────────────────────────────────────────────────────
export const payments = pgTable('payments', {
  id:        uuid('id').primaryKey().defaultRandom(),
  clientId:  uuid('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  invoiceId: uuid('invoice_id').references(() => invoices.id, { onDelete: 'set null' }),
  amount:    numeric('amount', { precision: 12, scale: 2 }).notNull(),
  date:      date('date').notNull().defaultNow(),
  method:    text('method').$type<PaymentMethod>().notNull().default('transfer'),
  note:      text('note'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ─── Tip çıkarımı ───────────────────────────────────────────────────────────
export type User           = typeof users.$inferSelect
export type Client         = typeof clients.$inferSelect
export type NewClient      = typeof clients.$inferInsert
export type Session        = typeof sessions.$inferSelect
export type NewSession     = typeof sessions.$inferInsert
export type ClientNote     = typeof clientNotes.$inferSelect
export type NewClientNote  = typeof clientNotes.$inferInsert
export type Transaction    = typeof transactions.$inferSelect
export type NewTransaction = typeof transactions.$inferInsert
export type Invoice        = typeof invoices.$inferSelect
export type NewInvoice     = typeof invoices.$inferInsert
export type Payment        = typeof payments.$inferSelect
export type NewPayment     = typeof payments.$inferInsert
