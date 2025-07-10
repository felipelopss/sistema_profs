# Database Migration Instructions

## Problem
The application is failing because the required database tables don't exist in your Supabase project.

## Solution
You need to execute the migration script in your Supabase project dashboard:

### Steps:

1. **Open your Supabase project dashboard**
   - Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project

2. **Navigate to SQL Editor**
   - In the left sidebar, click on "SQL Editor"

3. **Execute the migration**
   - Copy the entire content from `supabase/migrations/20250709194223_bold_lake.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute the script

4. **Verify tables were created**
   - Go to "Table Editor" in the sidebar
   - You should see all the tables: academic_years, users, subjects, segments, classes, classrooms, time_slots, class_subjects, schedules, teacher_restrictions, teacher_preferences

### What this migration creates:
- All required database tables with proper structure
- Row Level Security (RLS) policies
- Database indexes for performance
- A default admin user (admin@escola.com / 123456)

### After running the migration:
- Refresh your application
- The errors should be resolved
- You can log in with: admin@escola.com / 123456

## Alternative: Using Supabase CLI (if available)
If you have Supabase CLI installed locally:
```bash
supabase db push
```

But since this is a WebContainer environment, use the dashboard method above.