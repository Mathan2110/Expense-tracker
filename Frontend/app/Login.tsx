import { router, useRouter } from 'expo-router';
import { useState } from "react";
import { ImageBackground, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import { BASE_URL } from '../config.js'


// export default function testing(){
//   return <Redirect href="/dashboard" />;
// }

export default function Login(){
    const [email,setEmail] =  useState('');
    const [password,setPassword] = useState('');
    const [errormsg,setErrormsg] = useState('')
    const router = useRouter();

    const handleLogin = async() => {
        setErrormsg('')
        try{
            const user = await axios.post(`${BASE_URL}/login`, {
                email,
                password,
                role:'partner',
              })
            const msg = user.data.message
            if (msg === "success_partner"){
              router.push({
                pathname: '/Dashboard/dashboard',
                params: { email: email },
              })
            }else{
              setErrormsg("You are admin cant log as partner")
            }
             await AsyncStorage.setItem('userEmail', email);
          }catch(error:unknown){
             if (axios.isAxiosError(error)) {
                const msg = error.response?.data?.message || "Something went wrong.";
                setErrormsg(msg);
            } else {
                setErrormsg("Unexpected error occurred.");
            }
        }
            
    }

    return <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={false} hidden={false} />
        <ImageBackground style={styles.background} resizeMode="cover" source={require('../assets/expense.jpg')} >
        <View style={styles.background}>
            <View style={styles.role_container} >
                <Text style={styles.role} onPress={()=>router.push('/Authentication/LoginAdmin')} >Admin</Text>
                <Text style={styles.role_partner} >Partner</Text>
            </View>
            <Text style={styles.title}>Login</Text>
            <TextInput style={styles.inputField} placeholder="Email" onChangeText={setEmail} />
            <TextInput style={styles.inputField} placeholder="Passward" secureTextEntry onChangeText={setPassword} />
            {errormsg && <Text style={styles.errormsg} >{errormsg}</Text>}
            <View>
                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>
            </View>
            <Text style={styles.new_user} >New User ? <Text style={{color:"orange", fontWeight:"800",fontSize:18}} onPress={()=>router.push('/Authentication/Register')} >Register</Text> </Text>
        </View>
        </ImageBackground>
    </View>
}


const styles = StyleSheet.create({
  container: {   
    marginTop:40,
    justifyContent:'center',
    alignItems:'center',
    height:'100%',
    width:'100%',
  },
  role_partner:{
    color:'black',
    fontSize:20,
    fontWeight:700,
    borderRadius:50,
    backgroundColor:'white',
    paddingVertical:12,
    paddingHorizontal:27,

  },
  role:{
    color:'white',
    fontSize:20,
    fontWeight:700,
    borderRadius:50,
    paddingVertical:12,
    paddingHorizontal:27,

  },
  role_container:{
    flexDirection: 'row',
    gap:15,
    borderWidth:2,
    borderColor:'#fff',
    paddingVertical:3,
    paddingHorizontal:3,
    borderRadius:50,
  },
  background: {
    height:'100%',
    width:'100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', 
},
  title: {
    marginBottom:30,
    marginTop:20,
    fontSize: 34,
    fontWeight: 'bold',
    color: 'white',
  },
  inputField: {
    height: 50,
    width:250,
    borderColor: '#B0B0B0', 
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    fontSize: 16,
    color: '#0A0A23',
    marginBottom: 16,
  },
  btn:{
    paddingHorizontal:20,
    paddingVertical:10,
  },
  new_user:{
    marginTop:10,
    color:'white',
    fontSize:16,
  },
  button: {
    backgroundColor: '#2196F3',
    paddingVertical: 18,
    paddingHorizontal: 90,
    borderRadius: 50,
    marginVertical:20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  errormsg:{
    color:"red",
    fontWeight:'700',
  }
});
