import { useEffect, useState } from 'react';
import { settingsApi, mediaApi } from '@/lib/api';
import { Settings as SettingsType, Media } from '@/types/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { getMediaUrl } from '@/lib/utils';
import { Settings as SettingsIcon, Loader2, Store, DollarSign, Phone, Globe, Upload, X, Image as ImageIcon, MessageCircle } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  useEffect(() => {
    settingsApi.get()
      .then((res) => setSettings(res.data))
      .catch(() => toast.error('فشل في تحميل الإعدادات'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !settings) return;

    setIsUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await mediaApi.upload(formData);
      const uploadedMedia: Media = response.data;
      
      setSettings({
        ...settings,
        logoId: uploadedMedia._id,
        logo: uploadedMedia,
      });
      toast.success('تم رفع الشعار بنجاح');
    } catch (error) {
      toast.error('فشل في رفع الشعار');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleRemoveLogo = () => {
    if (!settings) return;
    setSettings({
      ...settings,
      logoId: undefined,
      logo: undefined,
    });
  };

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

  // Helper to get logo URL from either logoId (populated) or logo field
  const getLogoUrl = (): string | undefined => {
    if (settings.logoId && typeof settings.logoId === 'object' && 'url' in settings.logoId) {
      return settings.logoId.url;
    }
    return settings.logo?.url;
  };

  const logoUrl = getLogoUrl();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2"><SettingsIcon className="h-7 w-7 sm:h-8 sm:w-8" />الإعدادات</h1>
        <p className="text-muted-foreground text-sm">إعداد خيارات المتجر</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Store className="h-5 w-5" />معلومات المتجر</CardTitle>
          </CardHeader>
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

        {/* Logo Upload Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ImageIcon className="h-5 w-5" />شعار المتجر</CardTitle>
            <CardDescription>يظهر الشعار في رأس الموقع والفواتير</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-6">
              {/* Logo Preview */}
              <div className="relative w-32 h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center bg-muted/50 overflow-hidden">
                {logoUrl ? (
                  <>
                    <img 
                      src={getMediaUrl(logoUrl)} 
                      alt="شعار المتجر" 
                      className="w-full h-full object-contain" 
                    />
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="absolute top-1 right-1 p-1 bg-destructive text-white rounded-full hover:bg-destructive/90"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </>
                ) : (
                  <ImageIcon className="w-12 h-12 text-muted-foreground/50" />
                )}
              </div>

              {/* Upload Button */}
              <div className="flex-1 space-y-2">
                <Label htmlFor="logo-upload" className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted transition-colors w-fit">
                    {isUploadingLogo ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    <span>{isUploadingLogo ? 'جاري الرفع...' : 'رفع شعار جديد'}</span>
                  </div>
                </Label>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  disabled={isUploadingLogo}
                />
                <p className="text-xs text-muted-foreground">PNG, JPG أو SVG. الحد الأقصى 2MB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5" />الضريبة</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>البريد الإلكتروني</Label>
                <Input value={settings.contactInfo?.email || ''} onChange={(e) => setSettings({ ...settings, contactInfo: { ...settings.contactInfo, email: e.target.value } })} dir="ltr" />
              </div>
              <div className="space-y-2">
                <Label>الهاتف</Label>
                <Input value={settings.contactInfo?.phone || ''} onChange={(e) => setSettings({ ...settings, contactInfo: { ...settings.contactInfo, phone: e.target.value } })} dir="ltr" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-green-500" />
                رقم واتساب
              </Label>
              <Input 
                value={settings.contactInfo?.whatsapp || ''} 
                onChange={(e) => setSettings({ ...settings, contactInfo: { ...settings.contactInfo, whatsapp: e.target.value } })} 
                placeholder="201234567890"
                dir="ltr" 
              />
              <p className="text-xs text-muted-foreground">رقم الهاتف الدولي بدون + أو 00 (مثال: 201234567890)</p>
            </div>
            <div className="space-y-2">
              <Label>العنوان</Label>
              <Input value={settings.contactInfo?.address || ''} onChange={(e) => setSettings({ ...settings, contactInfo: { ...settings.contactInfo, address: e.target.value } })} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" />التواصل الاجتماعي</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

