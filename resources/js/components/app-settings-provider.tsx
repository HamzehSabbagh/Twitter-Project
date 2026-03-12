import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type ThemeMode = 'light' | 'dark';
type LanguageCode = 'en' | 'ar';

type AppSettingsContextValue = {
    theme: ThemeMode;
    language: LanguageCode;
    setTheme: (theme: ThemeMode) => void;
    setLanguage: (language: LanguageCode) => void;
    t: (key: string, fallback?: string) => string;
};

const STORAGE_THEME_KEY = 'twitter_theme';
const STORAGE_LANGUAGE_KEY = 'twitter_language';

const translations: Record<LanguageCode, Record<string, string>> = {
    en: {
        profile: 'Profile',
        settings: 'Settings',
        logout: 'Log out',
        navigation: 'Navigation',
        home: 'Home',
        explore: 'Explore',
        notifications: 'Notifications',
        timeline: 'Timeline',
        timeline_description: 'Share updates, media, and threaded conversations from one place.',
        create_post: 'Create a post',
        create_post_description: 'Open the composer to add text, pictures, videos, and audio.',
        new_post: 'New post',
        discover: 'Discover',
        no_hashtags: 'No hashtags yet.',
        unread: 'unread',
        mark_all_read: 'Mark all read',
        notifications_title: 'Your activity inbox',
        notifications_description: 'Follow events, likes, replies, reposts, and mentions all land here.',
        quick_return: 'Quick return',
        settings_title: 'App settings',
        settings_description: 'Choose how the interface looks and which language to use for the app shell.',
        theme: 'Theme',
        language: 'Language',
        light: 'Light',
        dark: 'Dark',
        english: 'English',
        arabic: 'Arabic',
        preview: 'Preview',
        settings_saved_local: 'These settings are stored locally in this browser for now.',
    },
    ar: {
        profile: 'الملف الشخصي',
        settings: 'الإعدادات',
        logout: 'تسجيل الخروج',
        navigation: 'التنقل',
        home: 'الرئيسية',
        explore: 'استكشاف',
        notifications: 'الإشعارات',
        timeline: 'الخط الزمني',
        timeline_description: 'شارك التحديثات والوسائط والمحادثات المتسلسلة من مكان واحد.',
        create_post: 'إنشاء منشور',
        create_post_description: 'افتح أداة النشر لإضافة نصوص وصور وفيديو وصوت.',
        new_post: 'منشور جديد',
        discover: 'اكتشف',
        no_hashtags: 'لا توجد وسوم حتى الآن.',
        unread: 'غير مقروء',
        mark_all_read: 'تحديد الكل كمقروء',
        notifications_title: 'صندوق نشاطك',
        notifications_description: 'تظهر هنا المتابعات والإعجابات والردود وإعادات النشر والإشارات.',
        quick_return: 'عودة سريعة',
        settings_title: 'إعدادات التطبيق',
        settings_description: 'اختر شكل الواجهة واللغة المستخدمة في أجزاء التطبيق الأساسية.',
        theme: 'المظهر',
        language: 'اللغة',
        light: 'فاتح',
        dark: 'داكن',
        english: 'الإنجليزية',
        arabic: 'العربية',
        preview: 'معاينة',
        settings_saved_local: 'يتم حفظ هذه الإعدادات محلياً في هذا المتصفح حالياً.',
    },
};

const AppSettingsContext = createContext<AppSettingsContextValue | null>(null);

function applyDocumentSettings(theme: ThemeMode, language: LanguageCode) {
    if (typeof document === 'undefined') {
        return;
    }

    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
}

export function AppSettingsProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<ThemeMode>('dark');
    const [language, setLanguageState] = useState<LanguageCode>('en');

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const storedTheme = window.localStorage.getItem(STORAGE_THEME_KEY) as ThemeMode | null;
        const storedLanguage = window.localStorage.getItem(STORAGE_LANGUAGE_KEY) as LanguageCode | null;

        const nextTheme = storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : 'dark';
        const nextLanguage = storedLanguage === 'en' || storedLanguage === 'ar' ? storedLanguage : 'en';

        setThemeState(nextTheme);
        setLanguageState(nextLanguage);
        applyDocumentSettings(nextTheme, nextLanguage);
    }, []);

    const value = useMemo<AppSettingsContextValue>(
        () => ({
            theme,
            language,
            setTheme: (nextTheme) => {
                setThemeState(nextTheme);
                if (typeof window !== 'undefined') {
                    window.localStorage.setItem(STORAGE_THEME_KEY, nextTheme);
                }
                applyDocumentSettings(nextTheme, language);
            },
            setLanguage: (nextLanguage) => {
                setLanguageState(nextLanguage);
                if (typeof window !== 'undefined') {
                    window.localStorage.setItem(STORAGE_LANGUAGE_KEY, nextLanguage);
                }
                applyDocumentSettings(theme, nextLanguage);
            },
            t: (key, fallback) => translations[language][key] ?? fallback ?? key,
        }),
        [theme, language],
    );

    return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>;
}

export function useAppSettings() {
    const context = useContext(AppSettingsContext);

    if (! context) {
        throw new Error('useAppSettings must be used inside AppSettingsProvider');
    }

    return context;
}
