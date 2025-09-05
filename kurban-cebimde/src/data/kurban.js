export const regions = [
  { key: 'tr', name: 'Türkiye', animals: ['koç', 'koyun', 'keçi', 'büyükbaş'] },
  { key: 'afrika', name: 'Afrika', animals: ['koç', 'koyun', 'keçi', 'büyükbaş', 'deve'] },
  { key: 'afganistan', name: 'Afganistan', animals: ['koç', 'koyun', 'keçi', 'büyükbaş', 'tavuk'] },
  { key: 'filistin', name: 'Filistin', animals: ['koç', 'koyun', 'keçi'] },
  { key: 'arakan', name: 'Arakan', animals: ['koç', 'koyun', 'keçi', 'büyükbaş', 'tavuk', 'hindi'] },
];

export const animalMeta = {
  'koç': {
    icon: 'male', color: '#FDE68A', defaultAmount: 8500,
    prices: { Türkiye: 8500, Afrika: 8500, Afganistan: 8500, Filistin: 8500, Arakan: 8500 },
  },
  'koyun': {
    icon: 'leaf', color: '#DCFCE7', defaultAmount: 8500,
    prices: { Türkiye: 8500, Afrika: 8500, Afganistan: 8500, Filistin: 8500, Arakan: 8500 },
  },
  'keçi': {
    icon: 'nutrition', color: '#DBEAFE', defaultAmount: 7500,
    prices: { Türkiye: 7500, Afrika: 7500, Afganistan: 7500, Filistin: 7500, Arakan: 7500 },
  },
  'büyükbaş': {
    icon: 'calendar', color: '#EDE9FE', defaultAmount: 17000, // hisse fiyatı
    prices: { Türkiye: 17000, Afrika: 17000, Afganistan: 17000, Filistin: 17000, Arakan: 17000 },
  },
  'deve': {
    icon: 'bonfire', color: '#FFE4E6', defaultAmount: 35000,
    prices: { Türkiye: 35000, Afrika: 35000, Afganistan: 35000, Filistin: 35000, Arakan: 35000 },
  },
  'tavuk': {
    icon: 'egg', color: '#FFEFC7', defaultAmount: 300,
    prices: { Türkiye: 300, Afrika: 300, Afganistan: 300, Filistin: 300, Arakan: 300 },
  },
  'hindi': {
    icon: 'flag', color: '#E0F2FE', defaultAmount: 700,
    prices: { Türkiye: 700, Afrika: 700, Afganistan: 700, Filistin: 700, Arakan: 700 },
  },
};


