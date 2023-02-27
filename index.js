/**
 * @format
 */
import firestore from '@react-native-firebase/firestore';
import { AppRegistry } from 'react-native';
import { panGestureHandlerCustomNativeProps } from 'react-native-gesture-handler/lib/typescript/handlers/PanGestureHandler';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);

firestore()
    .collection('users')
    .get()
    .then(querySnapshot => {
        console.log('Total users: ', querySnapshot.size);

        querySnapshot.forEach(documentSnapshot => {
            console.log('User ID: ', documentSnapshot.id, documentSnapshot.data());
        });
    });
