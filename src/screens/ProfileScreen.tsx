import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../routes';
import { auth } from '../config/firebaseConfig';
import { signOut } from 'firebase/auth';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

type Props = {
  navigation: ProfileScreenNavigationProp;
};

export default function ProfileScreen({ navigation }: Props) {
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const user = auth.currentUser;
  const userName = user?.displayName || 'Usuário';
  const userEmail = user?.email || 'Sem e-mail cadastrado';

  useFocusEffect(
    useCallback(() => {
      const loadAvatar = async () => {
        try {
          const storedAvatar = await AsyncStorage.getItem('@fintrack_avatar');
          if (storedAvatar) {
            setAvatarUri(storedAvatar);
          }
        } catch (error) {
          console.error('Erro ao carregar avatar:', error);
        }
      };
      loadAvatar();
    }, [])
  );

  const handleOpenCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permissão Negada', 'Você precisa permitir o acesso à câmera para tirar uma foto.');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setAvatarUri(uri);
        await AsyncStorage.setItem('@fintrack_avatar', uri);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível abrir a câmera.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace('Login');
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meu Perfil</Text>
        <View style={{ width: 48 }} />
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatarWrapper}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <TouchableOpacity style={styles.cameraBadge} onPress={handleOpenCamera}>
            <Ionicons name="camera" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.userName}>{userName}</Text>
        <Text style={styles.userEmail}>{userEmail}</Text>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => navigation.navigate('Statistics')}
        >
          <View style={styles.menuItemLeft}>
            <Ionicons name="bar-chart-outline" size={24} color="#00875f" />
            <Text style={styles.menuItemText}>Estatísticas</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#8b8b8d" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => navigation.navigate('Settings')}
        >
          <View style={styles.menuItemLeft}>
            <Ionicons name="settings-outline" size={24} color="#00875f" />
            <Text style={styles.menuItemText}>Configurações</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#8b8b8d" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Sair da Conta</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: {
    color: '#00875f',
    fontSize: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileCard: {
    backgroundColor: '#202024',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#00875f',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  cameraBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#323238',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#202024',
  },
  userName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  userEmail: {
    color: '#8b8b8d',
    fontSize: 16,
  },
  menuContainer: {
    marginBottom: 32,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#202024',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 16,
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: 'transparent',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f75a68',
  },
  logoutButtonText: {
    color: '#f75a68',
    fontSize: 16,
    fontWeight: 'bold',
  },
});