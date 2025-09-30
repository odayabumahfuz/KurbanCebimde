// Hayvan ismine göre yerel görseli döndürür
export function getAnimalImage(name) {
  switch (name) {
    case 'koç':
      return require('../../assets/koç.png');
    case 'koyun':
      return require('../../assets/koyun.png');
    case 'keçi':
      return require('../../assets/keçi.png');
    case 'büyükbaş':
      return require('../../assets/büyükbaş.png');
    case 'deve':
      return require('../../assets/deve.png');
    case 'tavuk':
      return require('../../assets/tavuk.png');
    case 'hindi':
      return require('../../assets/hindi.png');
    default:
      return require('../../assets/koç.png');
  }
}


