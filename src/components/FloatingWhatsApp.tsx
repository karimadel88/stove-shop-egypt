import { MessageCircle } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";

const FloatingWhatsApp = () => {
  const { settings } = useSettings();
  
  // Get WhatsApp number from settings
  const whatsappNumber = settings?.contactInfo?.whatsapp;
  
  // Don't render if no WhatsApp number is configured
  if (!whatsappNumber) return null;

  // Format WhatsApp link - remove any non-numeric characters
  const cleanNumber = whatsappNumber.replace(/\D/g, '');
  const whatsappLink = `https://wa.me/${cleanNumber}`;

  return (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105"
      aria-label="تواصل معنا عبر WhatsApp"
    >
      <MessageCircle className="w-6 h-6 fill-current" />
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">
        تواصل معنا
      </span>
    </a>
  );
};

export default FloatingWhatsApp;
