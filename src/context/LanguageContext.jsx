import React, { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext();

const translations = {
  en: {
    dashboard: "Dashboard",
    scanner: "AI Scanner",
    qrScanner: "QR Scanner",
    pickup: "Schedule Pickup",
    donation: "Donate Electronics",
    rewards: "EcoRewards",
    certificate: "Green Certificate",
    awareness: "E-Waste Awareness",
    centers: "Collection Centers",
    history: "Disposal History",
    profile: "Profile",
    settings: "Settings",
    logout: "Logout",
    welcome: "Welcome back",
    ecoPoints: "EcoPoints",
    recycled: "E-Waste Recycled",
    co2Saved: "CO₂ Saved",
    greenLevel: "Green Level",
    quickActions: "Quick Actions",
    recentActivity: "Recent Activity",
    searchPlaceholder: "Search services, centers, items...",
    changeLanguage: "Language",
    toggleTheme: "Toggle Dark Mode",
    schedulePickupBtn: "Schedule Pickup",
    scanEwasteBtn: "Scan E-Waste",
    donateGadgetBtn: "Donate Electronics",
    viewAll: "View All"
  },
  te: {
    dashboard: "డాష్‌బోర్డ్",
    scanner: "AI స్కానర్",
    qrScanner: "QR స్కానర్",
    pickup: "పికప్ షెడ్యూల్",
    donation: "ఎలక్ట్రానిక్స్ విరాళం",
    rewards: "ఎకో రివార్డ్స్",
    certificate: "హరిత సర్టిఫికేట్",
    awareness: "ఇ-వ్యర్థాల అవగాహన",
    centers: "సేకరణ కేంద్రాలు",
    history: "డిస్పోజల్ చరిత్ర",
    profile: "ప్రొఫైల్",
    settings: "సెట్టింగ్స్",
    logout: "లాగ్ అవుట్",
    welcome: "స్వాగతం",
    ecoPoints: "ఎకో పాయింట్లు",
    recycled: "రీసైకిల్ చేసిన ఇ-వ్యర్థాలు",
    co2Saved: "ఆదా చేసిన CO₂",
    greenLevel: "గ్రీన్ లెవల్",
    quickActions: "త్వరిత చర్యలు",
    recentActivity: "ఇటీవలి కార్యకలాపాలు",
    searchPlaceholder: "శోధించండి...",
    changeLanguage: "భాష",
    toggleTheme: "డార్క్ మోడ్ మార్చండి",
    schedulePickupBtn: "పికప్ బుక్ చేయండి",
    scanEwasteBtn: "స్కానింగ్ ప్రారంభించండి",
    donateGadgetBtn: "విరాళం ఇవ్వండి",
    viewAll: "అన్నీ చూడండి"
  },
  hi: {
    dashboard: "डैशबोर्ड",
    scanner: "एआई स्कैनर",
    qrScanner: "क्यूआर स्कैनर",
    pickup: "पिकअप शेड्यूल करें",
    donation: "इलेक्ट्रॉनिक्स दान करें",
    rewards: "इको रिवार्ड्स",
    certificate: "ग्रीन प्रमाण पत्र",
    awareness: "ई-कचरा जागरूकता",
    centers: "संग्रह केंद्र",
    history: "निस्तारण इतिहास",
    profile: "प्रोफ़ाइल",
    settings: "सेटिंग्स",
    logout: "लॉग आउट",
    welcome: "वापसी पर स्वागत है",
    ecoPoints: "इको पॉइंट्स",
    recycled: "पुनर्चक्रित ई-कचरा",
    co2Saved: "बचाया गया CO₂",
    greenLevel: "ग्रीन स्तर",
    quickActions: "त्वरित कार्रवाई",
    recentActivity: "हाल की गतिविधि",
    searchPlaceholder: "खोजें...",
    changeLanguage: "भाषा",
    toggleTheme: "डार्क मोड बदलें",
    schedulePickupBtn: "पिकअप बुक करें",
    scanEwasteBtn: "ई-कचरा स्कैन करें",
    donateGadgetBtn: "उपकरण दान करें",
    viewAll: "सभी देखें"
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("econexis_lang") || "en";
  });

  useEffect(() => {
    localStorage.setItem("econexis_lang", language);
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || translations["en"]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
