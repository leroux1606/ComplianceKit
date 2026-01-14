# Supabase Setup Guide - Finding Connection String

## Step-by-Step Instructions

### Method 1: Via Project Settings
1. Look at the **bottom left** of your Supabase dashboard
2. Click the **⚙️ Gear Icon** (Project Settings)
3. In the left menu, click **"Database"**
4. Scroll down to find **"Connection string"** section
5. You'll see tabs: **URI**, **JDBC**, **Nodejs**, etc.
6. Click the **"URI"** tab
7. Copy the connection string (it starts with `postgresql://`)

### Method 2: Via Database Menu
1. Click **"Database"** in the left sidebar
2. Click **"Settings"** (or look for "Configuration")
3. Look for **"Connection string"** or **"Connection pooling"**
4. Select **"URI"** tab
5. Copy the connection string

### Method 3: Direct URL
If you know your project reference ID, you can construct it manually:
```
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

To find your PROJECT-REF:
- Look at your Supabase project URL: `https://[PROJECT-REF].supabase.co`
- Or check Project Settings → General → Reference ID

### What the Connection String Looks Like
```
postgresql://postgres.abcdefghijklmnop:[YOUR-PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres
```

**Important:** 
- Replace `[YOUR-PASSWORD]` with the database password you set when creating the project
- If you forgot your password, you can reset it in Project Settings → Database → Database password

### Alternative: Use Connection Pooling (Recommended)
For better performance, use the **"Connection pooling"** connection string instead of direct connection:
- Look for **"Connection pooling"** section
- Use port **6543** (pooler) instead of **5432** (direct)
- This is better for serverless environments like Vercel







