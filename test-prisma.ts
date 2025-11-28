import db from './lib/db';

// This file is just to test what properties are available on the Prisma client
const test = async () => {
  console.log('Prisma client properties:');
  console.log(Object.getOwnPropertyNames(db).filter(k => !k.startsWith('_') && !k.startsWith('$')).sort());
};

test();
