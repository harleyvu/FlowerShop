import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useState } from 'react';

type Flower = {
  id?: string;
  productId?: string;
  _id?: string;
  name: string;
  price: number;
  stock?: number;
  image?: string;
  category?: string;
};

type FavoritesContextType = {
  favorites: Flower[];
  addToFavorites: (flower: Flower) => void;
  removeFromFavorites: (flowerId: string) => void;
  isFavorite: (flowerId: string) => boolean;
};

const FavoritesContext = createContext<FavoritesContextType>({
  favorites: [],
  addToFavorites: () => {},
  removeFromFavorites: () => {},
  isFavorite: () => false,
});

export const useFavorites = () => useContext(FavoritesContext);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Flower[]>([]);

  // Load favorites from AsyncStorage when component mounts
  React.useEffect(() => {
    const loadFavorites = async () => {
      try {
        const savedFavorites = await AsyncStorage.getItem('favorites');
        if (savedFavorites) {
          setFavorites(JSON.parse(savedFavorites));
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    };
    loadFavorites();
  }, []);

  // Save favorites to AsyncStorage whenever it changes
  React.useEffect(() => {
    const saveFavorites = async () => {
      try {
        await AsyncStorage.setItem('favorites', JSON.stringify(favorites));
      } catch (error) {
        console.error('Error saving favorites:', error);
      }
    };
    saveFavorites();
  }, [favorites]);

  const addToFavorites = (flower: Flower) => {
    setFavorites((prevFavorites) => {
      const flowerId = flower.id || flower.productId || flower._id;
      if (!flowerId) return prevFavorites;
      
      // Check if already in favorites
      const exists = prevFavorites.some(
        (f) => (f.id || f.productId || f._id) === flowerId
      );
      
      if (exists) return prevFavorites;
      return [...prevFavorites, flower];
    });
  };

  const removeFromFavorites = (flowerId: string) => {
    setFavorites((prevFavorites) =>
      prevFavorites.filter(
        (f) => (f.id || f.productId || f._id) !== flowerId
      )
    );
  };

  const isFavorite = (flowerId: string) => {
    return favorites.some(
      (f) => (f.id || f.productId || f._id) === flowerId
    );
  };

  return (
    <FavoritesContext.Provider
      value={{ favorites, addToFavorites, removeFromFavorites, isFavorite }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}