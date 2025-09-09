declare global {
  namespace NodeJS {
    interface ProcessEnv {
      JWT_SECRET: string;  
      API_KEY: string;
      DATABASE_URL: string;
      PORT: string;
      ADMIN_CODE: string;
    }
  }
}

export {};
