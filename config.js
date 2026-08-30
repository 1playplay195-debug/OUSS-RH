// ===== إعدادات الموقع =====
// استخدام مصدر بيانات مجاني ومباشر لا يحتاج إلى وسطاء CORS
const API_BASE = 'https://raw.githubusercontent.com/openfootball/football.json/master/';

// الدوريات المتاحة في هذا المصدر (مثال: الدوري الإنجليزي والممتاز)
const LEAGUES = [
  { code: 'en.1', arName: 'الدوري الإنجليزي الممتاز', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', file: '2025-26/en.1.json' },
  { code: 'es.1', arName: 'الدوري الإسباني', flag: '🇪🇸', file: '2025-26/es.1.json' },
  { code: 'it.1', arName: 'الدوري الإيطالي', flag: '🇮🇹', file: '2025-26/it.1.json' },
  { code: 'de.1', arName: 'الدوري الألماني', flag: '🇩🇪', file: '2025-26/de.1.json' },
  { code: 'fr.1', arName: 'الدوري الفرنسي', flag: '🇫🇷', file: '2025-26/fr.1.json' }
];

const REFRESH_INTERVAL = 60000;

const DAY_NAMES = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const MONTH_NAMES = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
                     'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

const STATUS_AR = {
  'Played': 'انتهت المباراة',
  'Scheduled': 'لم تبدأ',
  'InProgress': 'جارية الآن'
};
