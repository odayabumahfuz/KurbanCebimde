// Hayvan ismine göre yerel görseli döndürür
export function getAnimalImage(name) {
  switch (name) {
    case 'koç':
      return require('../../assets/ram.png');
    case 'koyun':
      return require('../../assets/sheep.png');
    case 'keçi':
      return require('../../assets/goat.png');
    case 'büyükbaş':
      return require('../../assets/cattle.png');
    case 'deve':
      return require('../../assets/camel.png');
    case 'tavuk':
      return require('../../assets/chicken.png');
    case 'hindi':
      return require('../../assets/turkey.png');
    default:
      return require('../../assets/icon.png');
  }
}


