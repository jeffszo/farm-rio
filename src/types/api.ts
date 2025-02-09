
export interface User {
    id: string;
    name: string;
    email: string;
    userType: 'cliente' | 'atacado' | 'credito' | 'csc';
  }
  
  export interface AuthAPI {
    signUp(name: string, email: string, password: string, userType: User['userType']): Promise<User>;
    signIn(email: string, password: string): Promise<User>;
    signOut(): Promise<void>;
    getCurrentUser(): Promise<User | null>;
  }