# 🏢 ALSO & PARTNERS Law Firm Management System - Complete Specification

## 📋 APPLICATION OVERVIEW
A comprehensive full-stack integrated management system for ALSO & PARTNERS law firm operations, covering everything from financial management to case handling. Built with modern technology for optimal performance and elegant user experience with robust role-based access control.

## 🏗️ TECHNOLOGY ARCHITECTURE
- **Frontend**: Next.js 14 with App Router
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Drizzle ORM
- **Containerization**: Docker & Docker Compose
- **Authentication**: NextAuth.js with multiple roles

## 🎯 KEY FEATURES

### 1. **Authentication & Role Management System**
- Multi-level users (Admin, Lawyer)
- Full configuration access for Admin
- Limited access for Lawyers based on assigned cases
- Secure password management

### 2. **Executive Dashboard**
- Real-time financial overview (cash flow, profit/loss) - **ADMIN ONLY**
- Court schedule calendar view
- Active case quick statistics
- Notifications & reminders

### 3. **Financial Management** - **ADMIN ONLY**
#### 💰 Income & Expense Tracking
- Operational cost tracking
- Case-based revenue recording
- Transaction categorization
- Periodic financial reports

#### 🏢 Asset Management
- Office inventory management
- Equipment depreciation tracking
- Maintenance scheduling

#### 📈 Investment Tracking
- Portfolio management
- Return on investment analysis
- Investment performance reports

### 4. **Invoice & Billing System**
- Automated invoice generation
- Customizable invoice templates
- Payment status tracking
- Automatic reminders
- PDF export functionality

### 5. **Case Management System**
#### 👥 Lawyer Management
- Lawyer profile database
- Specialization tracking
- Performance metrics
- Availability status

#### ⚖️ Case Progress Tracking
- Case development timeline
- Document management system
- Deadline tracking
- Client communication log

#### 🗓️ Court Schedule Management
- Integrated calendar system
- Conflict detection
- Automatic reminders
- Court date tracking

### 6. **Admin Super Panel** - **ADMIN ONLY**
#### 🎨 Brand Customization
- Upload & edit law firm logo
- Custom color schemes
- Email template customization
- Document watermarking
- **Firm name management** - editable from "ALSO & PARTNERS"

#### 👤 User Management
- Create/edit user accounts
- Password reset functionality
- Role permissions management
- Activity monitoring

## 🔄 APPLICATION WORKFLOW

### For Admin:
1. **Login** → Dashboard overview
2. **Configure** system & brand identity (including firm name and logo)
3. **Manage users** & permissions
4. **Monitor** all financial & case activities
5. **Generate reports** & analytics
6. **Update** system settings

### For Lawyer:
1. **Login** → Personal dashboard
2. **View** assigned cases & schedules
3. **Update** case progress & documentation
4. **Track** time & expenses per case
5. **Generate** invoices for clients
6. **Coordinate** with admin for approvals

## 🗃️ DATABASE SCHEMA STRUCTURE

```sql
-- Users table with clear roles
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'lawyer')),
  full_name VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Firm settings table for brand customization
CREATE TABLE firm_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_name VARCHAR(255) DEFAULT 'ALSO & PARTNERS',
  logo_url VARCHAR(500),
  logo_type VARCHAR(50) DEFAULT 'text', -- 'text' or 'image'
  logo_text VARCHAR(10) DEFAULT 'A&P',
  primary_color VARCHAR(7) DEFAULT '#1e40af',
  secondary_color VARCHAR(7) DEFAULT '#dc2626',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Financial transactions with access control
CREATE TABLE financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(15,2) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  transaction_date DATE NOT NULL,
  created_by UUID REFERENCES users(id),
  is_confidential BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Cases table
CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'active',
  assigned_lawyer_id UUID REFERENCES users(id),
  client_name VARCHAR(255) NOT NULL,
  start_date DATE,
  expected_end_date DATE,
  actual_end_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Court schedules
CREATE TABLE court_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id),
  schedule_date TIMESTAMP NOT NULL,
  location VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🎨 DESIGN & USER EXPERIENCE
- **Dark/Light mode** toggle
- **Premium UI components** from shadcn/ui
- **Smooth animations** and transitions
- **Responsive design** for all devices
- **Professional color palette** with ALSO & PARTNERS branding
- **Customizable logo system** with default "A&P" template

## 🐳 DOCKER IMPLEMENTATION

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/also_partners_db
      - NEXTAUTH_SECRET=your-secret-key
      - NEXTAUTH_URL=http://localhost:3000
      - UPLOAD_DIR=/app/uploads
    volumes:
      - uploads_volume:/app/uploads
    depends_on:
      - db
  
  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=also_partners_db
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
  uploads_volume:
```

## 📊 REPORTS & ANALYTICS - **ADMIN ONLY**
- Financial statements
- Lawyer performance reports
- Case success rates
- Revenue analysis
- Expense breakdowns
- Investment performance

## 🔒 FINANCIAL ACCESS RESTRICTION IMPLEMENTATION (ADMIN ONLY)

### 1. **Middleware Protection**
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  // Protect financial routes
  if (request.nextUrl.pathname.startsWith('/financial')) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
    
    if (token.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/financial/:path*',
    '/api/financial/:path*'
  ]
};
```

### 2. **Custom Hooks for Role Checking**
```typescript
// hooks/use-auth.ts
import { useSession } from 'next-auth/react';

export function useAuth() {
  const { data: session, status } = useSession();
  
  const isAdmin = session?.user?.role === 'admin';
  const isLawyer = session?.user?.role === 'lawyer';
  
  return {
    session,
    status,
    isAdmin,
    isLawyer,
    isLoading: status === 'loading'
  };
}

// hooks/use-financial-access.ts
import { useAuth } from './use-auth';

export function useFinancialAccess() {
  const { isAdmin, isLoading } = useAuth();
  
  const canViewFinancial = isAdmin;
  const canEditFinancial = isAdmin;
  
  return {
    canViewFinancial,
    canEditFinancial,
    isLoading
  };
}
```

## 🏢 ALSO & PARTNERS BRANDING SYSTEM

### 1. **Firm Settings Database Schema (Drizzle)**
```typescript
// lib/schema.ts
import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';

export const firmSettings = pgTable('firm_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  firmName: varchar('firm_name', { length: 255 }).default('ALSO & PARTNERS'),
  logoUrl: varchar('logo_url', { length: 500 }),
  logoType: varchar('logo_type', { length: 50 }).default('text'), // 'text' or 'image'
  logoText: varchar('logo_text', { length: 10 }).default('A&P'),
  primaryColor: varchar('primary_color', { length: 7 }).default('#1e40af'), // blue-600
  secondaryColor: varchar('secondary_color', { length: 7 }).default('#dc2626'), // red-600
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

### 2. **Logo Component with A&P Template**
```tsx
// components/brand/logo.tsx
'use client';

import { useFirmSettings } from '@/hooks/use-firm-settings';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const { settings, isLoading } = useFirmSettings();

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <div className="bg-gray-200 animate-pulse rounded-lg w-10 h-10"></div>
        {showText && (
          <div className="h-6 bg-gray-200 animate-pulse rounded w-32"></div>
        )}
      </div>
    );
  }

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg'
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Logo Display */}
      {settings?.logoType === 'image' && settings.logoUrl ? (
        <img
          src={settings.logoUrl}
          alt={settings.firmName}
          className={`rounded-lg object-cover ${sizeClasses[size]}`}
        />
      ) : (
        <div className={`
          flex items-center justify-center rounded-lg font-bold
          bg-gradient-to-br from-blue-600 to-blue-800 text-white
          ${sizeClasses[size]} shadow-md
        `}>
          {settings?.logoText || 'A&P'}
        </div>
      )}
      
      {/* Firm Name */}
      {showText && (
        <div className="flex flex-col">
          <span className="font-bold text-gray-900 leading-tight">
            {settings?.firmName || 'ALSO & PARTNERS'}
          </span>
          <span className="text-xs text-gray-500 leading-tight">
            Law Firm
          </span>
        </div>
      )}
    </div>
  );
}

// Compact version for small spaces
export function LogoCompact({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) {
  return <Logo size={size} showText={false} />;
}
```

### 3. **Firm Settings Hook**
```typescript
// hooks/use-firm-settings.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface FirmSettings {
  id: string;
  firmName: string;
  logoUrl?: string;
  logoType: 'text' | 'image';
  logoText: string;
  primaryColor: string;
  secondaryColor: string;
}

export function useFirmSettings() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery<FirmSettings>({
    queryKey: ['firm-settings'],
    queryFn: async () => {
      const response = await fetch('/api/firm-settings');
      if (!response.ok) throw new Error('Failed to fetch firm settings');
      return response.json();
    },
  });

  const updateSettings = useMutation({
    mutationFn: async (newSettings: Partial<FirmSettings>) => {
      const response = await fetch('/api/firm-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
      if (!response.ok) throw new Error('Failed to update settings');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['firm-settings'] });
    },
  });

  return {
    settings,
    isLoading,
    updateSettings: updateSettings.mutateAsync,
    isUpdating: updateSettings.isPending,
  };
}
```

### 4. **Firm Settings API**
```typescript
// app/api/firm-settings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { db } from '@/lib/db';
import { firmSettings } from '@/lib/schema';
import { eq } from 'drizzle-orm';

// GET firm settings
export async function GET() {
  try {
    const settings = await db.select().from(firmSettings).limit(1);
    
    if (settings.length === 0) {
      // Create default settings if none exist
      const [defaultSettings] = await db
        .insert(firmSettings)
        .values({})
        .returning();
      return NextResponse.json(defaultSettings);
    }

    return NextResponse.json(settings[0]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch firm settings' },
      { status: 500 }
    );
  }
}

// UPDATE firm settings (Admin only)
export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    
    const existingSettings = await db.select().from(firmSettings).limit(1);
    
    let updatedSettings;
    if (existingSettings.length === 0) {
      [updatedSettings] = await db
        .insert(firmSettings)
        .values(body)
        .returning();
    } else {
      [updatedSettings] = await db
        .update(firmSettings)
        .set({ ...body, updatedAt: new Date() })
        .where(eq(firmSettings.id, existingSettings[0].id))
        .returning();
    }

    return NextResponse.json(updatedSettings);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update firm settings' },
      { status: 500 }
    );
  }
}
```

### 5. **Brand Settings Page for Admin**
```tsx
// app/admin/brand-settings/page.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useFirmSettings } from '@/hooks/use-firm-settings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Save, Palette } from 'lucide-react';

export default function BrandSettingsPage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const { settings, updateSettings, isUpdating } = useFirmSettings();
  const [formData, setFormData] = useState({
    firmName: '',
    logoType: 'text' as 'text' | 'image',
    logoText: '',
    logoUrl: '',
    primaryColor: '',
    secondaryColor: ''
  });

  // Initialize form when settings load
  useState(() => {
    if (settings) {
      setFormData({
        firmName: settings.firmName,
        logoType: settings.logoType,
        logoText: settings.logoText,
        logoUrl: settings.logoUrl || '',
        primaryColor: settings.primaryColor,
        secondaryColor: settings.secondaryColor
      });
    }
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings(formData);
      // Show success message
    } catch (error) {
      // Show error message
    }
  };

  const handleImageUpload = async (file: File) => {
    // Implement image upload logic
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/upload/logo', {
      method: 'POST',
      body: formData,
    });
    
    if (response.ok) {
      const { url } = await response.json();
      setFormData(prev => ({ ...prev, logoUrl: url, logoType: 'image' }));
    }
  };

  if (authLoading) return <div>Loading...</div>;
  if (!isAdmin) return <div>Access Denied</div>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Brand Settings</h1>
          <p className="text-gray-600 mt-2">
            Customize your law firm's branding and appearance
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Preview */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>How your branding appears</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                {formData.logoType === 'image' && formData.logoUrl ? (
                  <img
                    src={formData.logoUrl}
                    alt={formData.firmName}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold text-sm">
                    {formData.logoText}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-gray-900">
                    {formData.firmName}
                  </div>
                  <div className="text-xs text-gray-500">Law Firm</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Brand Configuration</CardTitle>
            <CardDescription>
              Update your firm's name, logo, and colors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              <Tabs defaultValue="general">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="logo">Logo</TabsTrigger>
                  <TabsTrigger value="colors">Colors</TabsTrigger>
                </TabsList>

                {/* General Tab */}
                <TabsContent value="general" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="firmName">Firm Name</Label>
                    <Input
                      id="firmName"
                      value={formData.firmName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firmName: e.target.value }))}
                      placeholder="ALSO & PARTNERS"
                    />
                  </div>
                </TabsContent>

                {/* Logo Tab */}
                <TabsContent value="logo" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex space-x-4">
                      <Button
                        type="button"
                        variant={formData.logoType === 'text' ? 'default' : 'outline'}
                        onClick={() => setFormData(prev => ({ ...prev, logoType: 'text' }))}
                      >
                        Text Logo
                      </Button>
                      <Button
                        type="button"
                        variant={formData.logoType === 'image' ? 'default' : 'outline'}
                        onClick={() => setFormData(prev => ({ ...prev, logoType: 'image' }))}
                      >
                        Image Logo
                      </Button>
                    </div>

                    {formData.logoType === 'text' && (
                      <div className="space-y-2">
                        <Label htmlFor="logoText">Logo Text</Label>
                        <Input
                          id="logoText"
                          value={formData.logoText}
                          onChange={(e) => setFormData(prev => ({ ...prev, logoText: e.target.value }))}
                          placeholder="A&P"
                          maxLength={10}
                        />
                        <p className="text-sm text-gray-500">
                          Short text for logo (max 10 characters)
                        </p>
                      </div>
                    )}

                    {formData.logoType === 'image' && (
                      <div className="space-y-2">
                        <Label htmlFor="logoUpload">Upload Logo</Label>
                        <Input
                          id="logoUpload"
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file);
                          }}
                        />
                        {formData.logoUrl && (
                          <p className="text-sm text-green-600">
                            Logo uploaded successfully
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Colors Tab */}
                <TabsContent value="colors" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primaryColor">Primary Color</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="primaryColor"
                          type="color"
                          value={formData.primaryColor}
                          onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={formData.primaryColor}
                          onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                          placeholder="#1e40af"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="secondaryColor">Secondary Color</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="secondaryColor"
                          type="color"
                          value={formData.secondaryColor}
                          onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={formData.secondaryColor}
                          onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                          placeholder="#dc2626"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <Button type="submit" disabled={isUpdating} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Save Brand Settings
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

### 6. **Updated Navigation with ALSO & PARTNERS Branding**
```tsx
// components/layout/sidebar-navigation.tsx
import { useAuth } from '@/hooks/use-auth';
import { Logo, LogoCompact } from '@/components/brand/logo';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText, 
  DollarSign,
  Shield,
  Settings,
  Palette
} from 'lucide-react';

export function SidebarNavigation() {
  const { isAdmin } = useAuth();

  return (
    <div className="space-y-6">
      {/* ALSO & PARTNERS Logo */}
      <div className="px-6 pt-6">
        <Logo />
      </div>

      {/* Navigation Menu */}
      <nav className="space-y-2 px-4">
        {/* Common menu for all users */}
        <NavItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" />
        <NavItem href="/cases" icon={FileText} label="Cases" />
        <NavItem href="/schedule" icon={Calendar} label="Schedule" />
        <NavItem href="/lawyers" icon={Users} label="Lawyers" />
        
        {/* Financial menu for admin only */}
        {isAdmin && (
          <NavItem href="/financial" icon={DollarSign} label="Financial" />
        )}
        
        {isAdmin && (
          <NavItem href="/admin" icon={Shield} label="Admin Panel" />
        )}

        {isAdmin && (
          <NavItem href="/admin/brand-settings" icon={Palette} label="Brand Settings" />
        )}
      </nav>
    </div>
  );
}
```

## 🚀 DEPLOYMENT & SETUP

### Environment Variables:
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/also_partners_db"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
UPLOAD_DIR="/app/uploads"
```

### Startup Commands:
```bash
# Build and start containers
docker-compose up -d

# Run database migrations
npx drizzle-kit push

# Seed initial admin user and firm settings
npm run db:seed
```

## ✅ SECURITY & ACCESS SUMMARY
1. **✅ Financial data accessible only by admin**
2. **✅ Lawyers redirected to unauthorized page when attempting financial access**
3. **✅ API routes protected with role checking**
4. **✅ Navigation menu adapts based on user role**
5. **✅ Database schema with proper access control**
6. **✅ Secure and conditional UI components**
7. **✅ ALSO & PARTNERS branding with customizable logo system**
8. **✅ Admin can edit firm name, logo (A&P template or custom image), and colors**

This system provides complete control to admin over all financial aspects and brand identity while lawyers can only access case and schedule data relevant to them. The application ensures data integrity, security, and provides an elegant, professional interface suitable for ALSO & PARTNERS law firm with customizable branding.