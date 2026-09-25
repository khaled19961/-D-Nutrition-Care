# Database Schema

## Core tables
- profiles
- nutritionists
- specialties
- nutritionist_specialties
- services
- availability_slots
- appointments
- nutrition_programs
- patient_programs
- meals
- progress_records
- goals
- reviews
- article_categories
- articles
- favorites
- notifications
- payments
- subscriptions

## Relationships
- profiles 1:1 nutritionists
- nutritionists N:N specialties
- nutritionists 1:N services
- nutritionists 1:N availability_slots
- patients 1:N appointments
- nutritionists 1:N appointments
- nutritionists 1:N nutrition_programs
- patients N:N programs through patient_programs
- programs 1:N meals
- patients 1:N progress_records
- patients 1:N goals
- nutritionists 1:N reviews
- categories 1:N articles
- patients N:N nutritionists through favorites

## Data rules
- UUID identifiers.
- timestamptz for timestamps.
- numeric for money.
- Foreign keys with explicit delete behavior.
- Index all major foreign keys and scheduling/search fields.
- RLS enabled on every private table.
