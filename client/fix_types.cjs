const fs = require('fs');

function replaceTypeImport(file, types, modulePath) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    const regex = new RegExp(`import \\{([^}]*)\\b(${types.join('|')})\\b([^}]*)\\} from ['"]${modulePath}['"];?`, 'g');
    content = content.replace(regex, `import type { $1$2$3 } from '${modulePath}';`);
    fs.writeFileSync(file, content);
  }
}

replaceTypeImport('src/store/api/sharingApi.ts', ['Trip'], '../../types/trip.types');
replaceTypeImport('src/components/sharing/PublicItinerary.tsx', ['Trip', 'Stop'], '../../types/trip.types');
replaceTypeImport('src/store/api/usersApi.ts', ['User', 'City'], '../../types/user.types');
replaceTypeImport('src/store/api/usersApi.ts', ['User', 'City'], '../../types/trip.types');

// Also fix useGetTripQuery
let sdContent = fs.readFileSync('src/components/sharing/ShareDialog.tsx', 'utf8');
sdContent = sdContent.replace('useGetTripQuery', 'useGetTripsQuery');
fs.writeFileSync('src/components/sharing/ShareDialog.tsx', sdContent);

console.log('Fixed type imports.');
