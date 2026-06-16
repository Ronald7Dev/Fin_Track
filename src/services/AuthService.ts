import { auth } from '../config/firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { User } from '../models/User';

export class AuthService {
  public async login(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      return new User(
        firebaseUser.uid,
        firebaseUser.displayName || 'Usuário',
        firebaseUser.email || email
      );
    } catch (error: any) {
      throw new Error(this.mapFirebaseError(error.code));
    }
  }

  public async register(name: string, email: string, password: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      await updateProfile(firebaseUser, { displayName: name });

      return new User(
        firebaseUser.uid,
        name,
        firebaseUser.email || email
      );
    } catch (error: any) {
      throw new Error(this.mapFirebaseError(error.code));
    }
  }

  private mapFirebaseError(code: string): string {
    switch (code) {
      case 'auth/invalid-email':
        return 'O e-mail informado é inválido.';
      case 'auth/user-disabled':
        return 'Este usuário foi desativado.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'E-mail ou senha incorretos.';
      case 'auth/email-already-in-use':
        return 'Este e-mail já está em uso.';
      case 'auth/weak-password':
        return 'A senha deve ter pelo menos 6 caracteres.';
      default:
        return 'Ocorreu um erro na autenticação. Tente novamente.';
    }
  }
}