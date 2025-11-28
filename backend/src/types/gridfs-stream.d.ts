// backend/src/types/gridfs-stream.d.ts
declare module 'gridfs-stream' {
  import { Db } from 'mongodb';
  import { Readable, Writable } from 'stream';

  interface GridFSStream {
    collection(name?: string): void;
    createWriteStream(options: {
      filename: string;
      content_type?: string;
      metadata?: any;
    }): Writable;
    createReadStream(options: {
      _id: any;
    }): Readable;
    files: {
      findOne: (query: any, callback: (err: any, file: any) => void) => void;
    };
    remove: (options: { _id: any }, callback: (err: any) => void) => void;
  }

  interface Grid {
    (db: Db, mongo: any): GridFSStream;
  }

  const Grid: Grid;
  export = Grid;
}

// Update backend/tsconfig.json to include:
// "typeRoots": ["./src/types", "./node_modules/@types"]