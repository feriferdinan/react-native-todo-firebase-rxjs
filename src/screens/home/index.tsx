import React from 'react';
import {
  TextInput as ReactTextInput,
  KeyboardAvoidingView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  FlatList,
  Platform,
  View,
  Image,
  Alert,
} from 'react-native';

import {widthPercentageToDP as wp} from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import AntDesign from 'react-native-vector-icons/AntDesign';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import CheckBox from '@react-native-community/checkbox';
import Feather from 'react-native-vector-icons/Feather';
import {useSelector, useDispatch} from 'react-redux';
import {v4 as uuidv4} from 'react-native-uuid';

import RNRestart from 'react-native-restart';
import {persistor} from 'store/store';
import {theme} from '@utils/theme';

import TextInput from '@components/TextInput';
import Button from '@components/Button';
import Text from '@components/Text';

import {
  deleteTodo,
  editTodo,
  getTodos,
  addTodo,
  syncTodo,
} from '@store/actions/todos';

export default function Home({navigation}: any) {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const todos = useSelector((state: any) => state.todos);
  const apps = useSelector((state: any) => state.apps);

  const inputRef = React.useRef<ReactTextInput>(null);

  const [todo, setTodo] = React.useState<{
    id?: string;
    title: string;
    isDone?: boolean;
    createAt?: Date;
    createBy?: string;
  }>({title: ''});

  const [_, forceUpdate] = React.useState(false);

  const onAddOrUpdateTodo = (): void => {
    const title = todo.title.trim();
    if (title == '') {
      return;
    }
    if (todo.id == null) {
      Object.assign(todo, {
        title,
        id: uuidv4(),
        isDone: false,
        createAt: Date.now(),
      });
      dispatch(addTodo(todo));
    } else {
      Object.assign(todo, {
        title,
        updateAt: Date.now(),
      });
      dispatch(editTodo(todo));
      inputRef?.current?.blur();
    }
    setTodo({title: ''});
  };

  const logout = () => {
    Alert.alert(
      'Logout?',
      'You will back to login screen.',
      [
        {
          text: 'Cancel',
        },
        {
          text: 'Logout',
          onPress: async () => {
            await persistor.purge();
            await AsyncStorage.clear();
            // try {
            //     await GoogleSignin.revokeAccess();
            //     await GoogleSignin.signOut();
            //     await auth().signOut()
            // } finally {}
            RNRestart.Restart();
          },
        },
      ],
      {
        cancelable: true,
      },
    );
  };

  React.useEffect(() => {
    dispatch(getTodos(''));
  }, []);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={logout} style={{marginRight: 10}}>
          <AntDesign name="right" size={24} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const renderItem = ({item}: any) => (
    <TouchableOpacity
      key={item.id}
      activeOpacity={0.5}
      onLongPress={(): void => {
        setTodo(item);
        inputRef?.current?.focus();
      }}
      onPress={() => {
        dispatch(editTodo({...item, isDone: !item?.isDone}));
      }}
      style={styles.listItem}>
      <CheckBox
        style={styles.checkBox}
        tintColors={{true: theme.colors.grey2}}
        onTintColor={theme.colors.grey2}
        onFillColor={theme.colors.grey2}
        onCheckColor={theme.colors.white}
        animationDuration={0.2}
        lineWidth={1.5}
        boxType="circle"
        value={item?.isDone}
        onValueChange={(isDone: boolean) => {
          dispatch(editTodo({...item, isDone}));
          forceUpdate(n => !n);
        }}
      />
      <Text
        //@ts-ignore
        style={styles.textItem(item?.isDone)}
        maxLines={2}>
        {item.title} {item?.isPendingAdd ? ' isPendingAdd' : ''}{' '}
        {item?.isPendingEdit ? ' isPendingEdit' : ''}
      </Text>
      {item?.isDone ? (
        <TouchableOpacity
          style={{flex: 0.05}}
          onPress={() => dispatch(deleteTodo(item))}>
          <AntDesign name="closecircle" color="#88939E" size={16} />
        </TouchableOpacity>
      ) : (
        <View style={{flex: 0.05}} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      //@ts-ignore
      forceInsets={{top: 'never'}}
      style={styles.container}>
      <Text type="semibold">isOffline :{apps.isOffline.toString()}</Text>
      <Button onPress={() => dispatch(syncTodo())}>
        <Text type="semibold" color="white">
          SYNC
        </Text>
      </Button>
      <KeyboardAvoidingView
        enabled={Platform.OS === 'ios'}
        behavior={Platform.select({ios: 'padding'})}
        keyboardVerticalOffset={Platform.select({ios: 62 + insets.bottom})}
        style={{flex: 1}}>
        <View style={{flex: 95}}>
          <FlatList
            data={todos.data}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={EmptyComponent}
            keyboardShouldPersistTaps="handled"
          />
        </View>
        <View style={styles.compose}>
          <TextInput
            ref={inputRef}
            type="round"
            value={todo.title}
            style={styles.input}
            onChangeText={title => setTodo(prev => ({...prev, title}))}
            placeholder="I want to..."
          />
          <Button style={styles.buttonCircle} onPress={onAddOrUpdateTodo}>
            {todo?.id == null ? (
              <Feather name="plus" size={20} color="white" />
            ) : (
              <EvilIcons name="pencil" size={20} color="white" />
            )}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const EmptyComponent = () => (
  <View style={{alignItems: 'center'}}>
    <Image
      source={require('../../../assets/images/undraw_empty.png')}
      style={{
        resizeMode: 'contain',
        width: wp(70),
        height: wp(70),
      }}
    />
    <Text type="semibold" size={10}>
      There are no tasks today
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    justifyContent: 'space-between',
    flexDirection: 'column',
    flex: 1,
  },
  buttonCircle: {
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
    paddingVertical: 0,
    paddingHorizontal: 0,
    borderRadius: 20,
    height: 40,
    width: 40,
  },
  listItem: {
    borderBottomColor: theme.colors.defaultBorderColor,
    justifyContent: 'space-between',
    borderBottomWidth: 0.3,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 50,
  },
  compose: {
    borderTopColor: theme.colors.defaultBorderColor,
    justifyContent: 'space-between',
    backgroundColor: 'white',
    paddingHorizontal: 8,
    borderTopWidth: 0.5,
    flexDirection: 'row',
    alignSelf: 'center',
  },
  input: {
    width: wp(84),
    marginRight: 6,
    height: 40,
  },
  //@ts-ignore
  textItem: (isDone: boolean) => {
    return {
      flex: 0.9,
      textDecorationLine: isDone ? 'line-through' : 'none',
      color: isDone ? theme.colors.grey2 : '#333333',
    };
  },
  checkBox: {
    height: 16,
    width: 16,
    marginRight: 4,
  },
});
