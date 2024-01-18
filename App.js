
import { Button, SafeAreaView, ScrollView, StyleSheet, TextInput, Text, View, KeyboardAvoidingView } from 'react-native';
import { firestore, collection, addDoc, MESSAGES, serverTimestamp } from './Firebase/Config';
import { useEffect, useState } from 'react';
import { onSnapshot, query, orderBy } from 'firebase/firestore';
import { convertFireBaseTimeStampToJS } from './helpers/Functions';
import React, {useRef} from 'react';

export default function App() {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const scrollRef = useRef(null);

  useEffect(() => {
    const q = query(collection(firestore, MESSAGES), orderBy('created', 'desc'))

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const tempMessages = []

      querySnapshot.forEach((doc) => {
        const messageObject = {
          id: doc.id,
          text: doc.data().text,
          created: convertFireBaseTimeStampToJS(doc.data().created)
        }
        tempMessages.unshift(messageObject);
      })
      setMessages(tempMessages);
    });
    return () => {
      unsubscribe()
    }
  }, [])

  const save = async () => {
    if (newMessage.trim().length > 0) {
      const docRef = await addDoc(collection(firestore, MESSAGES), {
        text: newMessage,
        created: serverTimestamp()
      }).catch(error => console.log(error))
      setNewMessage('')
      console.log('Message saved.')
      handleScrollEnd()
    }
  }

  const handleScrollEnd = () => {
    scrollRef.current.scrollToEnd({ animated: true });
  };


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
       ref={scrollRef}
       contentContainerStyle={styles.scrollContainer}>
        {
          messages.map((message) => (
            <View style={styles.message} key={message.id}>
              <Text style={styles.messageInfo}>{message.created}</Text>
              <Text>{message.text}</Text>
            </View>
          ))
        }
      </ScrollView>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.textInput}
          placeholder='Send message...'
          value={newMessage}
          onChangeText={text => setNewMessage(text)}
        />
        <Button title="Send" onPress={save} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    padding: 10,
  },
  message: {
    padding: 10,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: '#f5f5f5',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
  },
  messageInfo: {
    fontSize: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  textInput: {
    flex: 1,
    marginRight: 10,
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10
  },
});