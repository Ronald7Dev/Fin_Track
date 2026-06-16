import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../routes';
import { AuthService } from '../services/AuthService';
import * as LocalAuthentication from 'expo-local-authentication';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

type Props = {
  navigation: LoginScreenNavigationProp;
};

export default function LoginScreen({ navigation }: Props) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('usuario@email.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);

  const authService = new AuthService();

  useEffect(() => {
    const checkBiometricSupport = async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setIsBiometricSupported(compatible && enrolled);
    };

    checkBiometricSupport();
  }, []);

  const handleAuth = async () => {
    if (email.trim() === '' || password.trim() === '') {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (!isLoginMode && name.trim() === '') {
      Alert.alert('Erro', 'Por favor, informe seu nome para o cadastro.');
      return;
    }

    setLoading(true);

    try {
      if (isLoginMode) {
        await authService.login(email, password);
      } else {
        await authService.register(name, email, password);
      }
      navigation.replace('Home');
    } catch (error: any) {
      Alert.alert('Erro de Autenticação', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      const biometricAuth = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Login no FinTrack',
        cancelLabel: 'Cancelar',
        disableDeviceFallback: false,
      });

      if (biometricAuth.success) {
        navigation.replace('Home');
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao tentar autenticar pela biometria.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestão Financeira</Text>
      <Text style={styles.subtitle}>
        {isLoginMode ? 'Faça login para continuar' : 'Crie sua conta para começar'}
      </Text>

      {!isLoginMode && (
        <TextInput
          style={styles.input}
          placeholder="Nome"
          placeholderTextColor="#888"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          autoCorrect={false}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <TouchableOpacity style={styles.button} onPress={handleAuth} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{isLoginMode ? 'Entrar' : 'Cadastrar'}</Text>
        )}
      </TouchableOpacity>

      {isLoginMode && isBiometricSupported && (
        <TouchableOpacity style={styles.biometricButton} onPress={handleBiometricLogin}>
          <Text style={styles.biometricButtonText}>Entrar com Biometria / Face ID</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity 
        style={styles.toggleContainer} 
        onPress={() => setIsLoginMode(!isLoginMode)}
      >
        <Text style={styles.toggleText}>
          {isLoginMode 
            ? 'Ainda não tem conta? Cadastre-se' 
            : 'Já tem conta? Faça login'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8b8b8d',
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    backgroundColor: '#202024',
    color: '#fff',
    padding: 16,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#323238',
  },
  button: {
    backgroundColor: '#00875f',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    height: 56,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  biometricButton: {
    backgroundColor: 'transparent',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#00875f',
    height: 56,
  },
  biometricButtonText: {
    color: '#00875f',
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleContainer: {
    marginTop: 32,
    alignItems: 'center',
  },
  toggleText: {
    color: '#00875f',
    fontSize: 14,
    fontWeight: 'bold',
  },
});