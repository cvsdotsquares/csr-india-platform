'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  getSiteSettings,
  updateSiteSettings,
} from '@/lib/actions/admin-actions';
import { Loader2 } from 'lucide-react';

interface Setting {
  id: string;
  key: string;
  value: string;
  description?: string;
}

interface GroupedSettings {
  [category: string]: Setting[];
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<GroupedSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedSettings, setEditedSettings] = useState<
    Record<string, string>
  >({});
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    try {
      const result = (await getSiteSettings()) as {
        success?: boolean;
        error?: string;
        data?: GroupedSettings;
      };
      if (result.success) {
        const groupedSettings = result.data || {};
        setSettings(groupedSettings);
        // Initialize edited settings with current values
        const initial: Record<string, string> = {};
        Object.values(groupedSettings).forEach((categorySettings) => {
          categorySettings.forEach(setting => {
            initial[setting.key] = setting.value;
          });
        });
        setEditedSettings(initial);
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleValueChange = (key: string, value: string) => {
    setEditedSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage('');

    try {
      const settingsArray = Object.entries(editedSettings).map(
        ([key, value]) => ({
          key,
          value,
        })
      );

      const result = (await updateSiteSettings(settingsArray)) as {
        success?: boolean;
        error?: string;
      };
      if (result.error) {
        setSaveMessage(`Error: ${result.error}`);
      } else {
        setSaveMessage('Settings saved successfully!');
        loadSettings();
        setTimeout(() => setSaveMessage(''), 3000);
      }
    } catch (err) {
      setSaveMessage('Failed to save settings');
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#1B3A5C]" />
      </div>
    );
  }

  const categoryLabels: Record<string, string> = {
    general: 'General Settings',
    contact: 'Contact Information',
    social: 'Social Media',
    seo: 'SEO Settings',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Site Settings
        </h1>
        <p className="text-gray-600 mt-1">
          Manage general site configuration and settings
        </p>
      </div>

      {saveMessage && (
        <div
          className={`p-4 rounded-lg ${
            saveMessage.startsWith('Error')
              ? 'bg-red-50 text-red-800 border border-red-200'
              : 'bg-green-50 text-green-800 border border-green-200'
          }`}
        >
          {saveMessage}
        </div>
      )}

      <div className="space-y-6">
        {Object.entries(settings).map(([category, categorySettings]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="text-lg">
                {categoryLabels[category] || category}
              </CardTitle>
              {categorySettings[0]?.description && (
                <CardDescription>
                  {categorySettings[0].description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {categorySettings.map(setting => (
                <div key={setting.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {setting.key
                      .split('_')
                      .slice(1)
                      .map(
                        word =>
                          word.charAt(0).toUpperCase() +
                          word.slice(1)
                      )
                      .join(' ')}
                  </label>
                  {setting.description && (
                    <p className="text-xs text-gray-500 mb-1">
                      {setting.description}
                    </p>
                  )}
                  <Input
                    type={
                      setting.key.includes('email')
                        ? 'email'
                        : setting.key.includes('phone')
                          ? 'tel'
                          : 'text'
                    }
                    value={
                      editedSettings[setting.key] || ''
                    }
                    onChange={e =>
                      handleValueChange(
                        setting.key,
                        e.target.value
                      )
                    }
                    className="w-full"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#1B3A5C] hover:bg-[#152a47]"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save All Changes'
          )}
        </Button>
      </div>
    </div>
  );
}
