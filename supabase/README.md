# Covenant Motors — Supabase Database

This folder contains the PostgreSQL/Supabase database foundation for moving the current Version 1 application from browser `localStorage` to a persistent multi-user backend.

## Migration files

Run migrations in order:

1. `migrations/001_covenant_motors_core.sql`
2. `migrations/002_security_hardening.sql`

The first migration creates the complete business schema, relationships, indexes, audit trail, RLS policies and private document-storage bucket. The second migration hardens reporting views and business-setting access.

## Database modules

### Business and users
- `businesses` — Covenant Motors company details used by the application and printable documents.
- `profiles` — Supabase Auth users assigned to the business and a role.
- `id_counters` — transaction-safe generators for Stock IDs, Customer IDs, Sale IDs, Driver IDs, Trip IDs and Quotation IDs.

### Inventory / Deal Jacket
- `suppliers`
- `vehicles`
- `vehicle_status_history`
- `vehicle_expenses`
- `vehicle_documents`
- `vehicle_cost_analysis`

### Sales
- `customers`
- `quotations`
- `sales`

Receipts/invoices are generated from `sales`, `customers`, `vehicles` and business details; a separate receipt table is not required for Version 1.

### Operations
- `drivers`
- `collection_trips`
- `trip_expenses`

### Finance
- `finance_accounts`
- `finance_entries`
- `account_balances` view

Cash, Bank and Mobile Money remain distinct account types. Reversals are represented by `reversal_of_entry_id` instead of deleting the original transaction.

### Compliance
- `tax_settings`
- `tax_returns`

### Reporting / audit
- `vehicle_financial_summary` view
- `account_balances` view
- `audit_logs`

## Current localStorage → Supabase mapping

| Current application store | Supabase destination |
| --- | --- |
| `covenant-motors-vehicles` | `vehicles`, `vehicle_status_history` |
| `covenant-motors-customers` | `customers` |
| `covenant-motors-sales` | `sales` |
| `covenant-motors-quotations` | `quotations` |
| `covenant-motors-vehicle-expenses` | `vehicle_expenses` |
| `covenant-motors-vehicle-documents` | `vehicle_documents` + Storage bucket |
| `cm_vehicle_cost_analysis_v1` | `vehicle_cost_analysis` |
| `cm_drivers_v1` | `drivers` |
| `cm_trips_v1` | `collection_trips`, `trip_expenses` |
| `cm_finance_accounts_v1` | `finance_accounts` |
| `cm_finance_entries_v1` | `finance_entries` |
| `cm_tax_settings_v1` | `tax_settings` |
| `cm_tax_returns_v1` | `tax_returns` |

## Important field conversions

The database is intentionally ZMW-only for monetary records in Version 1. Legacy currency/exchange-rate fields are not required in the Supabase tables.

### Vehicles
- `year` → `manufacture_year`
- `purchasePriceZmw` / `purchasePrice` → `cost_price`
- `estimatedSellingPriceZmw` / `estimatedSellingPrice` → `estimated_selling_price`
- `currentLocation` → `current_location`
- `purchaseDate` → `purchase_date`
- `supplier` → `supplier_name` and, where possible, `supplier_id`

### Customers
- `customerId` → `customer_id`
- `nrcOrTpin` → `nrc_or_tpin`

### Sales
- `saleId` → `sale_id`
- `sellingPriceZmw` / `sellingPrice` → `selling_price`
- `amountPaidZmw` / `amountPaid` → `amount_paid`
- `balanceZmw` / `balance` → `outstanding_balance`
- `vehicleCost` → `vehicle_cost`
- `profit` → `gross_profit`
- `status` → `payment_status`

### Finance
The old `relatedId` field must be split during migration:
- Customer Payment → `related_sale_id`
- Supplier Payment → `related_vehicle_id`

Legacy reversal records whose `reference` begins with `REV-` should be linked to the original row through `reversal_of_entry_id` during import.

### Vehicle documents
The current app can store file data in browser storage (`fileData`). That base64 content must **not** be copied into PostgreSQL. During migration the binary file should be uploaded to the private `covenant-documents` Storage bucket and only `storage_path`, filename, type and size should be stored in `vehicle_documents`.

## Recommended data import order

Foreign keys require the following order:

1. Business record (already seeded as `covenant-motors`)
2. Suppliers
3. Customers
4. Drivers
5. Vehicles
6. Vehicle status history
7. Vehicle expenses
8. Vehicle documents / Storage uploads
9. Vehicle cost analysis
10. Quotations without `converted_sale_id`
11. Sales
12. Update converted quotations with their `converted_sale_id`
13. Collection trips
14. Trip expenses
15. Finance accounts
16. Finance entries (original transactions first, reversals second)
17. Tax settings
18. Tax returns

## Authentication setup

The database does not automatically assign every newly registered account to Covenant Motors. This is deliberate so a public signup cannot automatically obtain access to dealership data.

After creating the first user in Supabase Authentication, assign that user manually:

```sql
insert into public.profiles (id,business_id,full_name,role)
values ('AUTH-USER-UUID','covenant-motors','Administrator','admin');
```

Once the application has an admin/invitation workflow, profile creation can be automated safely.

## Storage convention

Deal Jacket files should use this private path structure:

```text
covenant-motors/vehicles/<vehicle-id>/<filename>
```

The RLS policies on `storage.objects` only allow authenticated members of the matching business to access those files.

## Frontend migration strategy

Do **not** replace every localStorage module at once. The safe sequence is:

1. Add Supabase client configuration and authentication.
2. Build typed database service functions.
3. Migrate Vehicle Stock + Deal Jacket first.
4. Migrate Customers and Quotations.
5. Migrate Sales and receipt/invoice reads.
6. Migrate Expenses and Cost Analysis.
7. Migrate Drivers and Collection Trips.
8. Migrate Finance last because it depends on Sales, Vehicles and Accounts.
9. Migrate Tax Centre and Reports.
10. Remove localStorage fallback only after the full regression passes.

This keeps the existing Version 1 UI intact while the storage layer is replaced underneath it.
