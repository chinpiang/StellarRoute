'use client';

import { useState } from 'react';
import { useSettings } from '@/components/providers/settings-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ThemeSetting } from '@/types/settings';
import { toast } from 'sonner';
import { LocaleSelector } from '@/components/settings/LocaleSelector';
import { AccentColorPicker } from '@/components/settings/AccentColorPicker';
import { FontScaleControl } from '@/components/settings/FontScaleControl';
import { HighContrastToggle } from '@/components/settings/HighContrastToggle';
import { BrowserNotificationSettings } from '@/components/settings/BrowserNotificationSettings';
import { useBrowserNotifications } from '@/hooks/useBrowserNotifications';
import { useSwapI18n } from '@/lib/swap-i18n';

export default function SettingsPage() {
  return <SettingsPageClient />;
}
