import { register } from 'ts-node';

register({
  transpileOnly: true,
  compilerOptions: {
    module: 'esnext',
    moduleResolution: 'node',
    target: 'es2020',
    esModuleInterop: true,
  },
});

process.env.NODE_ENV = process.env.NODE_ENV ?? 'test';
