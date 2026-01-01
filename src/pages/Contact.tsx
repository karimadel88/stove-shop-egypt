import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send,
  MessageCircle,
  CheckCircle
} from "lucide-react";
import { useSettings } from "@/context/SettingsContext";

const Contact = () => {
  const { settings } = useSettings();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.message) {
      toast.error("يرجى ملء الحقول المطلوبة");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { shopApi } = await import("@/lib/api");
      await shopApi.submitContactForm(formData);
      
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast.success("تم إرسال رسالتك بنجاح!");
    } catch (error: any) {
      setIsSubmitting(false);
      toast.error(error.response?.data?.message || "فشل في إرسال الرسالة");
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center py-16">
          <div className="text-center max-w-md mx-auto px-4 animate-fade-up">
            <div className="w-24 h-24 rounded-full gradient-gold flex items-center justify-center mx-auto mb-6 shadow-gold">
              <CheckCircle className="w-12 h-12 text-primary-foreground" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">شكراً لتواصلك معنا!</h2>
            <p className="text-muted-foreground mb-8">
              تم استلام رسالتك بنجاح وسيتم الرد عليك في أقرب وقت ممكن.
            </p>
            <Button variant="gold" onClick={() => setIsSubmitted(false)}>
              إرسال رسالة أخرى
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">تواصل معنا</h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              نحن هنا لمساعدتك! تواصل معنا لأي استفسار أو مساعدة
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-card rounded-xl p-6 shadow-soft">
                <h3 className="text-xl font-bold text-foreground mb-6">معلومات التواصل</h3>
                
                <div className="space-y-6">
                  {[
                    { 
                      icon: Phone, 
                      title: "الهاتف", 
                      value: settings?.contactInfo?.phone || "+20 123 456 7890",
                      dir: "ltr" 
                    },
                    { 
                      icon: Mail, 
                      title: "البريد الإلكتروني", 
                      value: settings?.contactInfo?.email || "info@egygas.com",
                      dir: "ltr" 
                    },
                    { 
                      icon: MapPin, 
                      title: "العنوان", 
                      value: settings?.contactInfo?.address || "القاهرة، مصر - شارع التحرير",
                      dir: "rtl" 
                    },
                    { 
                      icon: Clock, 
                      title: "ساعات العمل", 
                      value: "السبت - الخميس: 9 ص - 9 م",
                      dir: "rtl" 
                    },
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <item.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{item.title}</h4>
                        <p 
                          className="text-muted-foreground" 
                          dir={item.dir as "ltr" | "rtl"}
                        >
                          {item.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* WhatsApp */}

              {/* WhatsApp */}
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <MessageCircle className="w-6 h-6 text-green-600" />
                  <h3 className="font-bold text-foreground">واتساب</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  تواصل معنا مباشرة عبر واتساب للرد السريع
                </p>
                <a
                  href={`https://wa.me/${(settings?.contactInfo?.whatsapp || '').replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                    <MessageCircle className="w-5 h-5" />
                    تواصل عبر واتساب
                  </Button>
                </a>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-xl p-8 shadow-soft">
                <h3 className="text-xl font-bold text-foreground mb-6">أرسل لنا رسالة</h3>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">الاسم *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="أدخل اسمك"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">رقم الهاتف *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="01xxxxxxxxx"
                        required
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">البريد الإلكتروني</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="example@email.com"
                        dir="ltr"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">الموضوع</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="موضوع الرسالة"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">الرسالة *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="اكتب رسالتك هنا..."
                      rows={6}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="gold"
                    size="lg"
                    className="w-full md:w-auto"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      "جاري الإرسال..."
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        إرسال الرسالة
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="mt-12">
            <div className="bg-muted rounded-xl h-64 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">خريطة الموقع</p>
                <p className="text-sm text-muted-foreground">القاهرة، مصر</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
