import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import DrawScreen from './components/DrawScreen';
import GalleryStack from './components/GalleryScreen';
import ExploreScreen from './components/ExploreScreen';

const Tab = createBottomTabNavigator();

const Routes = {
  Gallery: GalleryStack,
  Art: DrawScreen,
  Explore: ExploreScreen
};

function Navigation() {
  return (
    <Tab.Navigator
      initialRouteName="Main"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#e32f45',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShadowVisible: false,
        tabBarStyle: {
          ...style.navigation,
          //top shadow
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 0,
          },
          shadowOpacity: 0.1,
          shadowRadius: 10.5,
        }
      }}
    >
      <Tab.Screen
        name="Main"
        component={Routes.Gallery}
        options={
          {
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <View style={style.tabView}>
                <Image
                  source={require('./assets/gallery.png')}
                  resizeMode="contain"
                  style={style.tabIcon(focused)}
                />
              </View>
            ),
            tabBarLabel: ({ focused }) => (
              <Text style={style.tabText(focused)}>Gallery</Text>
            )
          }
        }

      />
      <Tab.Screen
        name="Art"
        component={Routes.Art}
        options={
          {
            unmountOnBlur: true,
            tabBarStyle: { display: "none" },
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <Image
                source={require('./assets/paint.png')}
                resizeMode="contain"
                style={{ ...style.tabIcon(focused), ...style.mainButtonIcon }}

              />
            ),
            tabBarLabel: () => null,
            tabBarButton: ({ children, onPress }) => (
              <TouchableOpacity
                style={style.mainButton}
                onPress={onPress}
              >
                <View style={{ ...style.mainButtonView, ...style.shadow }}>
                  {children}
                </View>
              </TouchableOpacity>
            ),
          }
        }
      />
      <Tab.Screen
        name="Explore"
        component={Routes.Explore}
        options={
          {
            tabBarIcon: ({ focused }) => (
              <View style={style.tabView}>
                <Image
                  source={require('./assets/explore.png')}
                  resizeMode="contain"
                  style={style.tabIcon(focused)}
                />
              </View>
            ),
            tabBarLabel: ({ focused }) => (
              <Text style={style.tabText(focused)}>Explore</Text>
            )
          }
        }
      />
    </Tab.Navigator>
  );
}



const style = StyleSheet.create({
  shadow: {
    shadowColor: 'grey',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
  },
  tabView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    top: 10,
  },
  tabIcon(focused) {
    return {
      width: 25,
      height: 25,
      tintColor: focused ? '#e32f45' : '#748c94',
      marginBottom: 10
    };
  },
  tabText(focused) {
    return {
      color: focused ? '#e32f45' : '#748c94',
      fontSize: 12
    };
  },
  mainButton: {
    justifyContent: 'center',
    alignItems: 'center',
    top: -15,
  },
  mainButtonView: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#e32f45'
  },
  mainButtonIcon: {
    tintColor: '#ffffff',
    marginBottom: 0,
    width: 25,
    height: 25
  },
  navigation: {
    position: 'absolute',
    elevation: 0,
    backgroundColor: '#ffffff',
    height: 90,
    borderTopColor: 'transparent'
  },
});

export default Navigation;