import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

// For development, use a mock database connection
// In production, you would use a proper PostgreSQL connection string
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/turfbooker';

let db: any;

try {
  if (process.env.DATABASE_URL) {
    const sql = neon(DATABASE_URL);
    db = drizzle(sql, { schema });
  } else {
    // Mock database for development
    db = {
      select: () => ({ 
        from: () => ({ 
          where: () => [],
          leftJoin: () => ({ where: () => [] })
        })
      }),
      insert: () => ({ 
        values: () => ({ 
          returning: () => [{ id: 1, name: 'Mock Court' }] 
        }) 
      }),
      update: () => ({ 
        set: () => ({ 
          where: () => ({ 
            returning: () => [{ id: 1 }] 
          }) 
        }) 
      }),
      delete: () => ({ 
        where: () => ({ 
          returning: () => [{ id: 1 }] 
        }) 
      })
    };
  }
} catch (error) {
  console.warn('Database connection failed, using mock database');
  // Mock database for development
  db = {
    select: () => ({ 
      from: () => ({ 
        where: () => [],
        leftJoin: () => ({ where: () => [] })
      })
    }),
    insert: () => ({ 
      values: () => ({ 
        returning: () => [{ id: 1, name: 'Mock Court' }] 
      }) 
    }),
    update: () => ({ 
      set: () => ({ 
        where: () => ({ 
          returning: () => [{ id: 1 }] 
        }) 
      }) 
    }),
    delete: () => ({ 
      where: () => ({ 
        returning: () => [{ id: 1 }] 
      }) 
    })
  };
}

export { db };

// Export schema for external use
export { schema };