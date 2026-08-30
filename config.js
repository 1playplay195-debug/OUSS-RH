// ===== إعدادات الموقع =====

// نستخدم وسيط (CORS Proxy) لتجاوز حماية المتصفح والسماح بجلب بيانات Sofascore
// ===== إعدادات الموقع =====
// ===== إعدادات الموقع =====
const API_BASE = 'https://api.codetabs.com/v1/proxy?quest=';
const SOFASCORE_URL = 'https://api.sofascore.com/api/v1/sport/football/scheduled-events/';
// الدوريات المعروضة (معرفات ID الخاصة بـ Sofascore)
const LEAGUES = [
  { id: 17,  code: 'eng', arName: 'الدوري الإنجليزي',   flag: '🏴' },
  { id: 8,   code: 'esp', arName: 'الدوري الإسباني',    flag: '🇪🇸' },
  { id: 23,  code: 'ita', arName: 'الدوري الإيطالي',    flag: '🇮🇹' },
  { id: 35,  code: 'ger', arName: 'الدوري الألماني',    flag: '🇩🇪' },
  { id: 34,  code: 'fra', arName: 'الدوري الفرنسي',     flag: '🇫🇷' },
  { id: 297, code: 'sau', arName: 'دوري روشن السعودي',  flag: '🇸🇦' },
  { id: 7,   code: 'uefa', arName: 'دوري أبطال أوروبا', flag: '🏆' }
];

// مدة التحديث التلقائي بالميلي ثانية (60 ثانية)
const REFRESH_INTERVAL = 60000;

// ===== إعدادات التقويم =====
const DAY_NAMES = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const MONTH_NAMES = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
                     'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

// ترجمة حالات المباريات من Sofascore
const STATUS_AR = {
  'Ended':       'انتهت المباراة',
  'Halftime':    'بين الشوطين',
  '1st half':    'الشوط الأول',
  '2nd half':    'الشوط الثاني',
  'Not started': 'لم تبدأ',
  'Canceled':    'ملغاة',
  'Postponed':   'مؤجلة',
  'Extra time':  'وقت إضافي',
  'Penalties':   'ضربات جزاء'
};
