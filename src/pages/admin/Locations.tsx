import { useEffect, useState } from 'react';
import { countriesApi, citiesApi } from '@/lib/api';
import { Country, City } from '@/types/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, MapPin, Loader2, Globe, Building } from 'lucide-react';

export default function Locations() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isCountryFormOpen, setIsCountryFormOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);
  const [countryData, setCountryData] = useState({ name: '', code: '', isActive: true });

  const [isCityFormOpen, setIsCityFormOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [cityData, setCityData] = useState({ name: '', countryId: '', isActive: true });

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<{ type: 'country' | 'city'; item: Country | City } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [countriesRes, citiesRes] = await Promise.all([
        countriesApi.list(true),
        citiesApi.list(),
      ]);
      setCountries(countriesRes.data || []);
      setCities(citiesRes.data || []);
    } catch (error: any) {
      toast.error('فشل في تحميل المواقع');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCountryCreate = () => {
    setEditingCountry(null);
    setCountryData({ name: '', code: '', isActive: true });
    setIsCountryFormOpen(true);
  };

  const openCountryEdit = (country: Country) => {
    setEditingCountry(country);
    setCountryData({ name: country.name, code: country.code, isActive: country.isActive });
    setIsCountryFormOpen(true);
  };

  const handleCountrySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingCountry) {
        await countriesApi.update(editingCountry._id, countryData);
        toast.success('تم تحديث الدولة');
      } else {
        await countriesApi.create(countryData);
        toast.success('تم إضافة الدولة');
      }
      setIsCountryFormOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في حفظ الدولة');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCityCreate = () => {
    setEditingCity(null);
    setCityData({ name: '', countryId: countries[0]?._id || '', isActive: true });
    setIsCityFormOpen(true);
  };

  const openCityEdit = (city: City) => {
    setEditingCity(city);
    setCityData({ name: city.name, countryId: city.countryId, isActive: city.isActive });
    setIsCityFormOpen(true);
  };

  const handleCitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingCity) {
        await citiesApi.update(editingCity._id, cityData);
        toast.success('تم تحديث المدينة');
      } else {
        await citiesApi.create(cityData);
        toast.success('تم إضافة المدينة');
      }
      setIsCityFormOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في حفظ المدينة');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    try {
      if (deletingItem.type === 'country') {
        await countriesApi.delete(deletingItem.item._id);
        toast.success('تم حذف الدولة');
      } else {
        await citiesApi.delete(deletingItem.item._id);
        toast.success('تم حذف المدينة');
      }
      setIsDeleteOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في الحذف');
    }
  };

  const getCountryName = (countryId: string) => {
    return countries.find((c) => c._id === countryId)?.name || 'غير معروف';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <MapPin className="h-8 w-8" />
          المواقع
        </h1>
        <p className="text-muted-foreground">إدارة الدول والمدن للشحن</p>
      </div>

      <Tabs defaultValue="countries">
        <TabsList>
          <TabsTrigger value="countries" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            الدول ({countries.length})
          </TabsTrigger>
          <TabsTrigger value="cities" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            المدن ({cities.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="countries">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>الدول</CardTitle>
              <Button onClick={openCountryCreate} className="shadow-sm">
                <Plus className="ml-2 h-4 w-4" />
                إضافة دولة جديدة
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
              ) : countries.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">لا توجد دول</p>
              ) : (
                <div className="space-y-2">
                  {countries.map((country) => (
                    <div key={country._id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm bg-muted px-2 py-1 rounded">{country.code}</span>
                        <span className="font-medium">{country.name}</span>
                        <Badge variant={country.isActive ? 'default' : 'secondary'}>
                          {country.isActive ? 'نشط' : 'غير نشط'}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() => openCountryEdit(country)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => { setDeletingItem({ type: 'country', item: country }); setIsDeleteOpen(true); }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cities">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>المدن</CardTitle>
              <Button onClick={openCityCreate} disabled={countries.length === 0} className="shadow-sm">
                <Plus className="ml-2 h-4 w-4" />
                إضافة مدينة جديدة
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
              ) : cities.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">لا توجد مدن</p>
              ) : (
                <div className="space-y-2">
                  {cities.map((city) => (
                    <div key={city._id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{city.name}</span>
                        <Badge variant="outline">{city.country?.name || getCountryName(city.countryId)}</Badge>
                        <Badge variant={city.isActive ? 'default' : 'secondary'}>
                          {city.isActive ? 'نشط' : 'غير نشط'}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() => openCityEdit(city)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => { setDeletingItem({ type: 'city', item: city }); setIsDeleteOpen(true); }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Country Form */}
      <Dialog open={isCountryFormOpen} onOpenChange={setIsCountryFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCountry ? 'تعديل الدولة' : 'إضافة دولة'}</DialogTitle>
            <DialogDescription>إدارة بيانات الدولة</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCountrySubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>الاسم *</Label>
                <Input value={countryData.name} onChange={(e) => setCountryData({ ...countryData, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>الكود * (مثال: EG)</Label>
                <Input value={countryData.code} onChange={(e) => setCountryData({ ...countryData, code: e.target.value.toUpperCase() })} maxLength={3} required dir="ltr" />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={countryData.isActive} onCheckedChange={(checked) => setCountryData({ ...countryData, isActive: checked })} />
                <Label>نشط</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCountryFormOpen(false)}>إلغاء</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                {editingCountry ? 'تحديث' : 'إضافة'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* City Form */}
      <Dialog open={isCityFormOpen} onOpenChange={setIsCityFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCity ? 'تعديل المدينة' : 'إضافة مدينة'}</DialogTitle>
            <DialogDescription>إدارة بيانات المدينة</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCitySubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>الاسم *</Label>
                <Input value={cityData.name} onChange={(e) => setCityData({ ...cityData, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>الدولة *</Label>
                <Select value={cityData.countryId} onValueChange={(v) => setCityData({ ...cityData, countryId: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {countries.map((c) => (
                      <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={cityData.isActive} onCheckedChange={(checked) => setCityData({ ...cityData, isActive: checked })} />
                <Label>نشط</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCityFormOpen(false)}>إلغاء</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                {editingCity ? 'تحديث' : 'إضافة'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف {deletingItem?.type === 'country' ? 'الدولة' : 'المدينة'}</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف "{(deletingItem?.item as any)?.name}"؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
