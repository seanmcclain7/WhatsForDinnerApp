import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  View,
  Text,
  Button,
  Image,
  TextInput,
  Touchable,
  ScrollView,
  FlatList,
  TouchableOpacity,
  SectionList,
} from 'react-native';
import { format, startOfWeek, addDays } from 'date-fns';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import auth, { firebase } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { UserInfo } from 'firebase-admin/lib/auth/user-record';
import { forHorizontalIOS } from '@react-navigation/stack/lib/typescript/src/TransitionConfigs/CardStyleInterpolators';

const Stack = createStackNavigator();

function Login({ navigation }) {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  async function login(email, password) {
    try {
      await auth().signInWithEmailAndPassword(email, password)
        .then(() => {
          console.log(`User ${email} logged in!`)
          navigation.navigate('WeeklySummary');
        })
    }
    catch (e) {
      console.log(e)
    }
  };

  const onPressHandler = () => {
    navigation.navigate('Register');
  }

  const onPressLogin = () => {
    login(email, password)
  }

  return (
    <View style={styles.body}>
      <Image style={styles.titleimage} source={require('./img/WhatsForDinner.png')} />
      <TextInput
        style={styles.usernameinput}
        placeholder='Email'
        value={email}
        onChangeText={text => setEmail(text)} />
      <TextInput
        style={styles.passwordinput}
        placeholder='Password'
        secureTextEntry
        value={password}
        onChangeText={text => setPassword(text)} />
      <Button onPress={onPressLogin}
        title='Log In'
        color='#833AB4'>
      </Button>
      <TouchableOpacity onPress={onPressHandler}>
        <Text
          style={styles.text}>
          Register
        </Text>
      </TouchableOpacity>

    </View >
  )
}

function Register({ navigation }) {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [confirmPassword, setconfirmPassword] = useState();
  const [username, setUserName] = useState();


  async function register(email, password) {
    try {
      await auth().createUserWithEmailAndPassword(email, password);
      firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).set({
        username: username,
      });
      firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).collection('days').doc('Sunday').set({ item: [], });
      firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).collection('days').doc('Monday').set({ item: [], });
      firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).collection('days').doc('Tuesday').set({ item: [], });
      firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).collection('days').doc('Wednesday').set({ item: [], });
      firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).collection('days').doc('Thursday').set({ item: [], });
      firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).collection('days').doc('Friday').set({ item: [], });
      firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).collection('days').doc('Saturday').set({ item: [], });
    } catch (e) {
      console.log(e)
    }
  }

  const onPressHandler = () => {
    navigation.navigate('Login');
  }

  const onPressRegister = () => {
    register(email, password)
  }

  return (
    <View style={styles.body}>
      <TextInput
        style={styles.registerinput}
        placeholder='Email'
        value={email}
        onChangeText={text => setEmail(text)} />
      <TextInput
        style={styles.registerinput}
        placeholder='Username'
        value={username}
        onChangeText={text => setUserName(text)} />
      <TextInput
        style={styles.registerinput}
        placeholder='Password'
        secureTextEntry
        value={password}
        onChangeText={text => setPassword(text)} />
      <TextInput
        style={styles.passwordinput}
        placeholder='Confirm Password'
        value={confirmPassword}
        onChangeText={text => setconfirmPassword(text)}
        secureTextEntry />
      <Button
        title='Register'
        onPress={onPressRegister}
        color='#833AB4'>
      </Button>
      <TouchableOpacity onPress={onPressHandler}>
        <Text
          style={styles.text}>
          Back to Login
        </Text>
      </TouchableOpacity>
    </View >
  )
}

function WeeklySummary({ navigation }) {

  function SetDates() {
    const Sunday = startOfWeek(new Date())
    const Monday = addDays(startOfWeek(new Date()), 1)
    const Tuesday = addDays(startOfWeek(new Date()), 2)
    const Wednesday = addDays(startOfWeek(new Date()), 3)
    const Thursday = addDays(startOfWeek(new Date()), 4)
    const Friday = addDays(startOfWeek(new Date()), 5)
    const Saturday = addDays(startOfWeek(new Date()), 6)

    arr = [
      { key: 'Sunday', description: format(Sunday, 'PP'), order: 1 },
      { key: 'Monday', description: format(Monday, 'PP'), order: 2 },
      { key: 'Tuesday', description: format(Tuesday, 'PP'), order: 3 },
      { key: 'Wednesday', description: format(Wednesday, 'PP'), order: 4 },
      { key: 'Thursday', description: format(Thursday, 'PP'), order: 5 },
      { key: 'Friday', description: format(Friday, 'PP'), order: 6 },
      { key: 'Saturday', description: format(Saturday, 'PP'), order: 7 }
    ]
  }
  SetDates()

  const [loading, setLoading] = useState(true); // Set loading to true on component mount
  const [days, setDays] = useState([]); // Initial empty array of days

  useEffect(() => {
    const days = firestore()
      .collection('users')
      .doc(firebase.auth().currentUser.uid)
      .collection('days')
      .onSnapshot(querySnapshot => {
        const days = [];

        querySnapshot.forEach(documentSnapshot => {
          days.push({
            ...documentSnapshot.data(),
            key: documentSnapshot.id,
          });
        });

        setDays(days);
        setLoading(false);
      });

    // Unsubscribe from events when no longer in use
    return () => days();
  }, []);

  const combinedDays = days.map((item) => {
    let data = arr.find(x => x.key === item.key);
    return { ...item, ...data };
  });

  combinedDays.sort(function (a, b) {
    return a.order - b.order
  })

  console.log(combinedDays);

  function onPressClearWeek() {
    try {
      firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).collection('days').doc('Sunday').set({ item: [], });
      firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).collection('days').doc('Monday').set({ item: [], });
      firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).collection('days').doc('Tuesday').set({ item: [], });
      firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).collection('days').doc('Wednesday').set({ item: [], });
      firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).collection('days').doc('Thursday').set({ item: [], });
      firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).collection('days').doc('Friday').set({ item: [], });
      firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).collection('days').doc('Saturday').set({ item: [], });
    } catch (e) {
      console.log(e)
    }
  }

  function onPressClearDay(item) {
    try {
      firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).collection('days').doc(item.key).set({ item: [], });
    } catch (e) {
      console.log(e)
    }
  }

  function onPressLogout() {
    try {
      auth()
        .signOut()
        .then(() => console.log('User signed out!'));
      navigation.navigate('Login');
    } catch (e) {
      console.log(e)
    }
  }

  function onPressMealList() {
    navigation.navigate('MealList');
  }

  const onPressWeekView = () => {
    navigation.navigate('WeeklySummary');
  }

  const onPressNewMeal = () => {
    navigation.navigate('NewMeal');
  }

  const onPressMealDetail = (item) => {
    if (!item.item.name) {
      navigation.navigate('MealList');
    } else {
      navigation.navigate('MealDetail', { data: item });
      console.log("Item data: ", item);
    }
  }

  return (
    <>
      <View style={styles.body}>
        <Image style={styles.headingimage} source={require('./img/This-Week.png')} />
        <View style={styles.container}>
          <View style={{ margin: 10 }}>
            <Button
              title='Clear Week'
              onPress={onPressClearWeek}
            >
            </Button>
          </View>
          <FlatList
            data={combinedDays}
            keyExtractor={item => item.key.toString()}
            renderItem={({ item }) =>
              <TouchableOpacity style={{ margin: 5, backgroundColor: '#FFF', borderRadius: 10, elevation: 3 }}
                onPress={() => onPressMealDetail(item)}>
                <View style={{ flex: 0.4, flexDirection: 'row', maxHeight: 200 }}>
                  <View style={{ flex: 1, flexDirection: 'column' }}>
                    <Text style={styles.itemkey}>{item.key}</Text>
                    <Text style={styles.itemdesc}>{item.description}</Text>
                    <Text style={styles.itemdesc}>{item.item.name}</Text>
                  </View>
                  <View style={{ margin: 15, justifyContent: 'center' }}>
                    <Button
                      title='X'
                      onPress={() => onPressClearDay(item)}>
                    </Button>
                  </View>
                </View>
              </TouchableOpacity>
            }
          />
        </View>
      </View>
      <View style={{ flex: 0.05, flexDirection: 'row', margin: 15, alignContent: 'space-between', justifyContent: 'space-evenly' }}>
        <Button onPress={onPressWeekView}
          title='Week View'
          color='#833AB4'>
        </Button>
        <View style={{ flex: 0.30 }}>

        </View>
        <Button onPress={onPressMealList}
          title='Recipes'
          color='#833AB4'>
        </Button>
        <View style={{ flex: 0.30 }}>

        </View>
        <Button onPress={onPressNewMeal}
          title='New Meal'
          color='#833AB4'>
        </Button>
        <View style={{ flex: 0.30 }}>

        </View>
        <Button onPress={onPressLogout}
          title='Logout'
          color='#833AB4'>
        </Button>
      </View>
    </>
  )
}

function MealList({ navigation }) {

  const [loading, setLoading] = useState(true); //Set loading to true on Component Mount
  const [recipes, setRecipes] = useState([]); //Initial empty array of recipes

  useEffect(() => {
    const subscriber = firestore()
      .collection('recipes')
      .onSnapshot(querySnapshot => {
        const recipes = [];

        querySnapshot.forEach(documentSnapshot => {
          recipes.push({
            ...documentSnapshot.data(),
            key: documentSnapshot.id,
          });
        });

        setRecipes(recipes);
        setLoading(false);
      });

    return () => subscriber();
  }, []);

  function onPressLogout() {
    try {
      auth()
        .signOut()
        .then(() => console.log('User signed out!'));
      navigation.navigate('Login');
    } catch (e) {
      console.log(e)
    }
  }

  function onPressMealList() {
    navigation.navigate('MealList');
  }

  const onPressWeekView = () => {
    navigation.navigate('WeeklySummary');
  }

  const onPressNewMeal = () => {
    navigation.navigate('NewMeal');
  }

  const AddtoSunday = (item) => {
    firestore()
      .collection('users')
      .doc(firebase.auth().currentUser.uid)
      .collection('days')
      .doc('Sunday')
      .get()
      .then(documentSnapshot => {
        if (!documentSnapshot.data().item.name) {
          firestore()
            .collection('users')
            .doc(firebase.auth().currentUser.uid)
            .collection('days')
            .doc('Sunday')
            .set({
              item
            })
            .then(() => {
              console.log('Recipe added!');
            });
        } else {
          console.log('Day already exists!')
        }
      })
      .catch(error => {
        console.log("Error getting document:", error);
      });
  }

  const AddtoMonday = (item) => {
    firestore()
      .collection('users')
      .doc(firebase.auth().currentUser.uid)
      .collection('days')
      .doc('Monday')
      .get()
      .then(documentSnapshot => {
        if (!documentSnapshot.data().item.name) {
          firestore()
            .collection('users')
            .doc(firebase.auth().currentUser.uid)
            .collection('days')
            .doc('Monday')
            .set({
              item
            })
            .then(() => {
              console.log('Recipe added!');
            });
        } else {
          console.log('Day already exists!')
        }
      })
      .catch(error => {
        console.log("Error getting document:", error);
      });
  }

  const AddtoTuesday = (item) => {
    firestore()
      .collection('users')
      .doc(firebase.auth().currentUser.uid)
      .collection('days')
      .doc('Tuesday')
      .get()
      .then(documentSnapshot => {
        if (!documentSnapshot.data().item.name) {
          firestore()
            .collection('users')
            .doc(firebase.auth().currentUser.uid)
            .collection('days')
            .doc('Tuesday')
            .set({
              item
            })
            .then(() => {
              console.log('Recipe added!');
            });
        } else {
          console.log('Day already exists!')
        }
      })
      .catch(error => {
        console.log("Error getting document:", error);
      });
  }

  const AddtoWednesday = (item) => {
    firestore()
      .collection('users')
      .doc(firebase.auth().currentUser.uid)
      .collection('days')
      .doc('Wednesday')
      .get()
      .then(documentSnapshot => {
        if (!documentSnapshot.data().item.name) {
          firestore()
            .collection('users')
            .doc(firebase.auth().currentUser.uid)
            .collection('days')
            .doc('Wednesday')
            .set({
              item
            })
            .then(() => {
              console.log('Recipe added!');
            });
        } else {
          console.log('Day already exists!')
        }
      })
      .catch(error => {
        console.log("Error getting document:", error);
      });
  }

  const AddtoThursday = (item) => {
    firestore()
      .collection('users')
      .doc(firebase.auth().currentUser.uid)
      .collection('days')
      .doc('Thursday')
      .get()
      .then(documentSnapshot => {
        if (!documentSnapshot.data().item.name) {
          firestore()
            .collection('users')
            .doc(firebase.auth().currentUser.uid)
            .collection('days')
            .doc('Thursday')
            .set({
              item
            })
            .then(() => {
              console.log('Recipe added!');
            });
        } else {
          console.log('Day already exists!')
        }
      })
      .catch(error => {
        console.log("Error getting document:", error);
      });
  }

  const AddtoFriday = (item) => {
    firestore()
      .collection('users')
      .doc(firebase.auth().currentUser.uid)
      .collection('days')
      .doc('Friday')
      .get()
      .then(documentSnapshot => {
        if (!documentSnapshot.data().item.name) {
          firestore()
            .collection('users')
            .doc(firebase.auth().currentUser.uid)
            .collection('days')
            .doc('Friday')
            .set({
              item
            })
            .then(() => {
              console.log('Recipe added!');
            });
        } else {
          console.log('Day already exists!')
        }
      })
      .catch(error => {
        console.log("Error getting document:", error);
      });
  }

  const AddtoSaturday = (item) => {
    firestore()
      .collection('users')
      .doc(firebase.auth().currentUser.uid)
      .collection('days')
      .doc('Saturday')
      .get()
      .then(documentSnapshot => {
        if (!documentSnapshot.data().item.name) {
          firestore()
            .collection('users')
            .doc(firebase.auth().currentUser.uid)
            .collection('days')
            .doc('Saturday')
            .set({
              item
            })
            .then(() => {
              console.log('Recipe added!');
            });
        } else {
          console.log('Day already exists!')
        }
      })
      .catch(error => {
        console.log("Error getting document:", error);
      });
  }

  return (
    <>
      <View style={styles.body}>
        <Image style={styles.headingimage} source={require('./img/Recipes.png')} />
        <View style={styles.container}>
          <FlatList
            data={recipes}
            renderItem={({ item }) =>
              <View style={{ margin: 5, backgroundColor: '#FFF', borderRadius: 10, elevation: 3 }}>
                <View style={{ flex: 0.5, flexDirection: 'row', maxHeight: 150 }}>
                  <TouchableOpacity style={{ flex: 1, flexDirection: 'column', minHeight: 50 }}>
                    <Text style={styles.RecipeListName}>{item.name}</Text>
                  </TouchableOpacity>
                  <View style={{ flex: 0.4, flexDirection: 'column', justifyContent: 'center', alignContent: 'center', marginRight: 10 }}>
                  </View>
                </View>
                <View style={{ margin: 5, flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 10, justifyContent: 'center', alignContent: 'center', }}>
                  <Button
                    title='Sun'
                    onPress={() => AddtoSunday(item)}
                  >
                  </Button>
                  <View style={{ flex: 0.1 }}>

                  </View>
                  <Button
                    title='Mon'
                    onPress={() => AddtoMonday(item)}
                  >
                  </Button>
                  <View style={{ flex: 0.1 }}>

                  </View>
                  <Button
                    title='Tues'
                    onPress={() => AddtoTuesday(item)}
                  >
                  </Button>
                  <View style={{ flex: 0.1 }}>

                  </View>
                  <Button
                    title='Wed'
                    onPress={() => AddtoWednesday(item)}
                  >
                  </Button>
                  <View style={{ flex: 0.1 }}>

                  </View>
                  <Button
                    title='Thur'
                    onPress={() => AddtoThursday(item)}
                  >
                  </Button>
                  <View style={{ flex: 0.1 }}>

                  </View>
                  <Button
                    title='Fri'
                    onPress={() => AddtoFriday(item)}
                  >
                  </Button>
                  <View style={{ flex: 0.1 }}>

                  </View>
                  <Button
                    title='Sat'
                    onPress={() => AddtoSaturday(item)}
                  >
                  </Button>
                  <View style={{ flex: 0.1 }}>

                  </View>
                </View>
              </View>
            }
          />
        </View>
      </View>
      <View style={{ flex: 0.05, flexDirection: 'row', margin: 15, alignContent: 'space-between', justifyContent: 'space-evenly' }}>
        <Button onPress={onPressWeekView}
          title='Week View'
          color='#833AB4'>
        </Button>
        <View style={{ flex: 0.30 }}>

        </View>
        <Button onPress={onPressMealList}
          title='Recipes'
          color='#833AB4'>
        </Button>
        <View style={{ flex: 0.30 }}>

        </View>
        <Button onPress={onPressNewMeal}
          title='New Meal'
          color='#833AB4'>
        </Button>
        <View style={{ flex: 0.30 }}>

        </View>
        <Button onPress={onPressLogout}
          title='Logout'
          color='#833AB4'>
        </Button>
      </View>
    </>
  );
}

function NewMeal({ navigation }) {

  function onPressLogout() {
    try {
      auth()
        .signOut()
        .then(() => console.log('User signed out!'));
      navigation.navigate('Login');
    } catch (e) {
      console.log(e)
    }
  }

  function onPressMealList() {
    navigation.navigate('MealList');
  }

  const onPressWeekView = () => {
    navigation.navigate('WeeklySummary');
  }

  const onPressNewMeal = () => {
    navigation.navigate('NewMeal');
  }

  const [ingredients, setingredients] = useState([{ key: 0, value: '' }]);

  const addTextInput = () => {
    let newTextInputs = [...ingredients];
    newTextInputs.push({ key: ingredients.length, value: '' });
    setingredients(newTextInputs);
  }

  const removeTextInput = () => {
    let newTextInputs = [...ingredients];
    newTextInputs.splice(-1, 1);
    setingredients(newTextInputs);
  }

  const [instructions, setinstructions] = useState([{ key: 0, value: '' }]);

  const addInstructionInput = () => {
    let newTextInputs = [...instructions];
    newTextInputs.push({ key: instructions.length, value: '' });
    setinstructions(newTextInputs);
  }

  const removeInstructionInput = () => {
    let newTextInputs = [...instructions];
    newTextInputs.splice(-1, 1);
    setinstructions(newTextInputs);
  }

  const [Recipename, setRecipename] = useState('');

  const CreateNewRecipe = () => {
    const db = firebase.firestore();
    const ingredientsValues = ingredients.map(obj => obj.value);
    const instructionsValues = instructions.map(obj => obj.value);
    const myArrayRef = db.collection('recipes').doc();
    myArrayRef.set({
      ingredients: ingredientsValues,
      instructions: instructionsValues,
      name: Recipename,
    })
    console.log('ingredients', ingredientsValues)
    console.log('instructions', instructionsValues)
    console.log('RecipeName', Recipename)

  }

  return (
    <>

      <View style={styles.body}>
        <Image style={styles.headingimage} source={require('./img/New-Recipe.png')} />
        <ScrollView style={styles.scrollviewcontainer}>
          <View>
            <TextInput
              style={{ margin: 5, backgroundColor: '#FFF', borderRadius: 10, elevation: 3 }}
              value={Recipename}
              placeholder='Recipe Name'
              maxLength={40}
              onChangeText={textValue => setRecipename(textValue)}
            />
          </View>
          <View>
            <Text style={{ margin: 5, elevation: 0, fontSize: 20, }}>
              Ingredients:
            </Text>
          </View>
          <View>
            {ingredients.map((text) => (
              <TextInput
                style={{ margin: 5, backgroundColor: '#FFF', borderRadius: 10, elevation: 3 }}
                key={text.key}
                value={text.value}
                onChangeText={(textValue) => {
                  let newTextInputs = [...ingredients];
                  newTextInputs[text.key].value = textValue;
                  setingredients(newTextInputs);
                }}
                placeholder="Enter ingredients here"
              />
            ))}
            <View style={{ flexDirection: "row", flex: 1 }}>
              <TouchableOpacity style={{ margin: 10, backgroundColor: '#833AB4', borderRadius: 5, elevation: 3, minHeight: 30, minWidth: 50, maxWidth: 150, }} onPress={addTextInput}>
                <Text style={{ color: '#FFF', margin: 5, alignContent: 'center', justifyContent: 'center', alignSelf: 'center' }}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ margin: 10, backgroundColor: '#833AB4', borderRadius: 5, elevation: 3, minHeight: 30, minWidth: 50, maxWidth: 150, }} onPress={removeTextInput}>
                <Text style={{ color: '#FFF', margin: 5, alignContent: 'center', justifyContent: 'center', alignSelf: 'center' }}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View>
            <Text style={{ margin: 5, elevation: 0, fontSize: 20, }}>
              Instructions:
            </Text>
          </View>
          <View>
            {instructions.map((text) => (
              <TextInput
                style={{ margin: 5, backgroundColor: '#FFF', borderRadius: 10, elevation: 3 }}
                key={text.key}
                value={text.value}
                onChangeText={(textValue) => {
                  let newTextInputs = [...instructions];
                  newTextInputs[text.key].value = textValue;
                  setinstructions(newTextInputs);
                }}
                placeholder="Enter instructions here (Example: 1. Cut the cheese.)"
              />
            ))}
            <View style={{ flexDirection: "row", flex: 1 }}>
              <TouchableOpacity style={{ margin: 10, backgroundColor: '#833AB4', borderRadius: 5, elevation: 3, minHeight: 30, minWidth: 50, maxWidth: 150, }} onPress={addInstructionInput}>
                <Text style={{ color: '#FFF', margin: 5, alignContent: 'center', justifyContent: 'center', alignSelf: 'center' }}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ margin: 10, backgroundColor: '#833AB4', borderRadius: 5, elevation: 3, minHeight: 30, minWidth: 50, maxWidth: 150, }} onPress={removeInstructionInput}>
                <Text style={{ color: '#FFF', margin: 5, alignContent: 'center', justifyContent: 'center', alignSelf: 'center' }}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ margin: 20, backgroundColor: '#833AB4', borderRadius: 5, elevation: 3, minHeight: 30, minWidth: 50, maxWidth: 300, alignContent: 'center', justifyContent: 'center', alignSelf: 'center' }}>
            <Button
              onPress={CreateNewRecipe}
              title='Create New Recipe'
            />
          </View>
        </ScrollView>
      </View >
      <View style={{ flex: 0.05, flexDirection: 'row', margin: 15, alignContent: 'space-between', justifyContent: 'space-evenly' }}>
        <Button onPress={onPressWeekView}
          title='Week View'
          color='#833AB4'>
        </Button>
        <View style={{ flex: 0.30 }}>

        </View>
        <Button onPress={onPressMealList}
          title='Recipes'
          color='#833AB4'>
        </Button>
        <View style={{ flex: 0.30 }}>

        </View>
        <Button onPress={onPressNewMeal}
          title='New Meal'
          color='#833AB4'>
        </Button>
        <View style={{ flex: 0.30 }}>

        </View>
        <Button onPress={onPressLogout}
          title='Logout'
          color='#833AB4'>
        </Button>
      </View>
    </>
  )
}

function MealDetail({ route, navigation }) {
  const { data } = route.params;
  console.log(data);


  function onPressLogin() {
    navigation.navigate('Login');
  }

  function onPressMealList() {
    navigation.navigate('MealList');
  }

  const onPressWeekView = () => {
    navigation.navigate('WeeklySummary');
  }

  const onPressNewMeal = () => {
    navigation.navigate('NewMeal');
  }

  return (
    <>
      <View style={styles.body}>
        <Text style={styles.title}>
          {data.item.name}
        </Text>
        <View style={styles.mealdetailcontainer}>
          <SectionList
            sections={[
              { title: 'Ingredients:', data: data.item.ingredients },
              { title: 'Instructions:', data: data.item.instructions },
            ]}
            renderItem={({ item }) => <Text style={styles.itemdesc}>{item}</Text>}
            renderSectionHeader={({ section }) => (
              <Text style={styles.itemkey}>{section.title}</Text>
            )} />
        </View>
      </View>
      <View style={{ flex: 0.05, flexDirection: 'row', margin: 15, alignContent: 'space-between', justifyContent: 'space-evenly' }}>
        <Button onPress={onPressWeekView}
          title='Week View'
          color='#833AB4'>
        </Button>
        <View style={{ flex: 0.30 }}>

        </View>
        <Button onPress={onPressMealList}
          title='Recipes'
          color='#833AB4'>
        </Button>
        <View style={{ flex: 0.30 }}>

        </View>
        <Button onPress={onPressNewMeal}
          title='New Meal'
          color='#833AB4'>
        </Button>
        <View style={{ flex: 0.30 }}>

        </View>
        <Button onPress={onPressLogin}
          title='Login'
          color='#833AB4'>
        </Button>
      </View>
    </>
  )
}

function App() {

  // Set an initializing state whilst Firebase connects
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();

  // Handle user state changes
  function onAuthStateChanged(user) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  if (initializing) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ header: () => null }}
      >
        <Stack.Screen
          name="Login"
          component={Login}
        />
        <Stack.Screen
          name="Register"
          component={Register}
        />
        <Stack.Screen
          name="WeeklySummary"
          component={WeeklySummary}
        />
        <Stack.Screen
          name="MealList"
          component={MealList}
        />
        <Stack.Screen
          name="NewMeal"
          component={NewMeal}
        />
        <Stack.Screen
          name="MealDetail"
          component={MealDetail}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: '#F56040',
    alignItems: 'center',
    justifyContent: 'center',

  },
  title: {
    color: 'white',
    fontSize: 20,
    fontStyle: 'italic',
    margin: 20,
  },
  text: {
    color: 'white',
    fontSize: 15,
    fontStyle: 'bold',
    margin: 20,
  },
  image: {
    maxWidth: 75,
    maxHeight: 75,
    alignSelf: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 30,
    fontSize: 40,
  },
  headingimage: {
    width: 150,
    height: 25,
    alignSelf: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  titleimage: {
    maxWidth: 300,
    maxHeight: 300,
    alignSelf: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  usernameinput: {
    width: 200,
    borderWidth: 0,
    borderColor: '#555',
    borderRadius: 5,
    marginTop: 20,
    marginBottom: 10,
    fontSize: 15,
    backgroundColor: '#FCF5E5',
    shadowColor: 'black',
    shadowRadius: 3,
    elevation: 3,
  },
  passwordinput: {
    width: 200,
    borderWidth: 0,
    borderColor: '#555',
    borderRadius: 5,
    marginTop: 10,
    marginBottom: 20,
    fontSize: 15,
    backgroundColor: '#FCF5E5',
    shadowColor: 'black',
    shadowRadius: 3,
    elevation: 3,
  },
  registerinput: {
    width: 200,
    borderWidth: 0,
    borderColor: '#555',
    borderRadius: 5,
    marginTop: 10,
    marginBottom: 10,
    fontSize: 15,
    backgroundColor: '#FCF5E5',
    shadowColor: 'black',
    shadowRadius: 3,
    elevation: 3,
  },
  weekday: {
    width: 300,
    height: 100,
    borderWidth: 0,
    borderColor: '#555',
    borderRadius: 10,
    marginTop: 5,
    marginBottom: 5,
    fontSize: 15,
    backgroundColor: '#FCF5E5',
    shadowColor: 'black',
    shadowRadius: 3,
    elevation: 3,
  },
  weekdaytext: {
    color: '#555',
    fontSize: 15,
    fontStyle: 'bold',
    margin: 5,
  },
  weekdaytexttitle: {
    color: 'white',
    fontSize: 20,
    fontStyle: 'bold',
    margin: 5,
  },
  weekdaybuttonplus: {
    marginLeft: 50,
    marginRight: 50,
  },
  container: {
    flex: 0.95,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#FCF5E5',
    width: 375,
    shadowColor: 'black',
    shadowRadius: 3,
    elevation: 3,
    borderRadius: 10,
  },
  mealdetailcontainer: {
    flex: 0.95,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    width: 375,
    shadowColor: 'black',
    shadowRadius: 3,
    elevation: 3,
    borderRadius: 10,
  },
  scrollviewcontainer: {
    flex: 1,
    marginBottom: 20,
    paddingTop: 15,
    paddingBottom: 15,
    backgroundColor: '#FCF5E5',
    width: 375,
    shadowColor: 'black',
    shadowRadius: 3,
    elevation: 3,
    borderRadius: 10,
  },
  itemkey: {
    paddingTop: 20,
    paddingLeft: 10,
    fontSize: 15,
    height: 50,
  },
  itemdesc: {
    paddingLeft: 20,
    fontSize: 12,
    minimumheight: 30,
    paddingBottom: 10,
  },
  newcrecipename: {
    width: 300,
    minHeight: 40,
    borderWidth: 0,
    borderColor: '#555',
    borderRadius: 5,
    marginTop: 20,
    marginBottom: 10,
    fontSize: 15,
    backgroundColor: '#FCF5E5',
    shadowColor: 'black',
    shadowRadius: 3,
    elevation: 3,
  },
  newcrecipeinput: {
    width: 300,
    minHeight: 40,
    borderWidth: 0,
    borderColor: '#555',
    borderRadius: 5,
    marginTop: 5,
    marginBottom: 5,
    fontSize: 15,
    backgroundColor: '#FCF5E5',
    shadowColor: 'black',
    shadowRadius: 3,
    elevation: 3,
  },
  RecipeListName: {
    paddingTop: 20,
    paddingLeft: 10,
    fontSize: 15,
    minimumheight: 75,
  },
});

export default App;

