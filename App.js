import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { NativeBaseProvider, extendTheme } from 'native-base';


import Navigation from './Navigation';


export default function App() {
  // extend theme with custom colorScheme
  const theme = extendTheme({
    colors: {
      custom: {
        50: '#e32f45',
        100: '#e32f45',
        200: '#e32f45',
        300: '#e32f45',
        400: '#e32f45',
        500: '#e32f45',
        600: '#e32f45',
        700: '#e32f45',
        800: '#e32f45',
        900: '#e32f45',
      }
    },
  });
  return (
    <NativeBaseProvider theme={theme}>
      <NavigationContainer>
        <Navigation />
      </NavigationContainer>
    </NativeBaseProvider>
  );
}
