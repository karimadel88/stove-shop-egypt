import { useEffect, useState } from 'react';
import { settingsApi } from '@/lib/api';
import { Settings as SettingsType } from '@/types/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Settings as SettingsIcon, Loader2, Store, DollarSign, Phone, Globe } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    settingsApi.get()
      .then((res) => setSettings(res.data))
      .catch(() => toast.error('فشل في تحميل الإعدادات'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setIsSaving(true);
    try {
      await settingsApi.update(settings);
      toast.success('تم حفظ الإعدادات');
    } catch {
      toast.error('فشل في حفظ الإعدادات');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="space-y-6"><Skeleton className="h-10 w-48" /><Skeleton className="h-64 w-full" /></div>;
  if (!settings) return <p className="text-center py-12 text-muted-foreground">فشل في تحميل الإعدادات</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2"><SettingsIcon className="h-8 w-8" />الإعدادات</h1>
        <p className="text-muted-foreground">إعداد خيارات المتجر</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Store className="h-5 w-5" />معلومات المتجر</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>اسم المتجر</Label>
              <Input value={settings.storeName} onChange={(e) => setSettings({ ...settings, storeName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>العملة</Label>
              <Input value={settings.currency} onChange={(e) => setSettings({ ...settings, currency: e.target.value })} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5" />الضريبة</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>اسم الضريبة</Label>
              <Input value={settings.taxName} onChange={(e) => setSettings({ ...settings, taxName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>النسبة (%)</Label>
              <Input type="number" value={settings.taxRate} onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) || 0 })} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Phone className="h-5 w-5" />التواصل</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>البريد الإلكتروني</Label>
              <Input value={settings.contactInfo?.email || ''} onChange={(e) => setSettings({ ...settings, contactInfo: { ...settings.contactInfo, email: e.target.value } })} dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label>الهاتف</Label>
              <Input value={settings.contactInfo?.phone || ''} onChange={(e) => setSettings({ ...settings, contactInfo: { ...settings.contactInfo, phone: e.target.value } })} dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label>العنوان</Label>
              <Input value={settings.contactInfo?.address || ''} onChange={(e) => setSettings({ ...settings, contactInfo: { ...settings.contactInfo, address: e.target.value } })} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" />التواصل الاجتماعي</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>فيسبوك</Label>
              <Input value={settings.socialLinks?.facebook || ''} onChange={(e) => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, facebook: e.target.value } })} dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label>انستجرام</Label>
              <Input value={settings.socialLinks?.instagram || ''} onChange={(e) => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, instagram: e.target.value } })} dir="ltr" />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            حفظ الإعدادات
          </Button>
        </div>
      </form>
    </div>
  );
}
