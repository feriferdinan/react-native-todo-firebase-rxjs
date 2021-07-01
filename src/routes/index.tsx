import 'react-native-gesture-handler';

import React, {useEffect} from 'react';
import {createStackNavigator, TransitionPresets} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';

import NetInfo from '@react-native-community/netinfo';

import Home from '@screens/home';
import {Splash, Login, Register} from '@screens/auth';

import {useDispatch, useSelector} from 'react-redux';
import {setOffline, setOnline} from 'store/actions/apps';
import {useNetInfo} from '@react-native-community/netinfo';
import {syncTodo} from 'store/actions/todos';

function Routes() {
  const StackNav = createStackNavigator();
  const SplashStack = createStackNavigator();
  const AuthStack = createStackNavigator();
  const netInfo = useNetInfo();
  const dispatch = useDispatch();

  const {user} = useSelector((state: any) => state.auth);
  const {isSplashing} = useSelector((state: any) => state.apps);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        dispatch(setOnline());
        dispatch(syncTodo());
      } else {
        dispatch(setOffline());
      }
    });
    return unsubscribe;
  }, []);

  if (isSplashing) {
    return (
      <NavigationContainer>
        <SplashStack.Navigator initialRouteName="Splash" headerMode="none">
          <SplashStack.Screen name="Splash" component={Splash} />
        </SplashStack.Navigator>
      </NavigationContainer>
    );
  }

  if (!user) {
    return (
      <NavigationContainer>
        <AuthStack.Navigator
          screenOptions={TransitionPresets.ScaleFromCenterAndroid}
          headerMode="none"
          initialRouteName="Login">
          <AuthStack.Screen name="Login" component={Login} />
          <AuthStack.Screen name="Register" component={Register} />
        </AuthStack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <StackNav.Navigator
        screenOptions={TransitionPresets.SlideFromRightIOS}
        initialRouteName="Home">
        <StackNav.Screen
          name="Home"
          component={Home}
          options={{
            headerTitle: 'All Tasks',
            headerStyle: {
              elevation: 0,
              shadowOpacity: 0,
            },
          }}
        />
      </StackNav.Navigator>
    </NavigationContainer>
  );
}

export default Routes;
