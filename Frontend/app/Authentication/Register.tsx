import { useRouter } from 'expo-router';
import { useState } from "react";
import { ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../config.js'

export default function Register(){
    const [email,setEmail] =  useState('');
    const [password,setPassword] = useState(''); 
    const [errormsg,setErrormsg] = useState('')
    const [name,setName] = useState('')
    const router = useRouter();

    

    const handleRegister = async() => {
        setErrormsg('')
        
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!regex.test(email)){
            setErrormsg('Enter valid email!!')
            return 
        }

        try{
          const user = await axios.post(`${BASE_URL}/register`, {
              name,
              email,
              password,
              role:"partner"
            })
            router.push({
                pathname: '/Dashboard/dashboard',
                params: { email: email },
              })
            await AsyncStorage.setItem('userEmail', email);
          }catch(error:unknown){
            setErrormsg("Email already exists")
        }

        }

    return (<View style={styles.container}>
                <ImageBackground style={styles.background} resizeMode="cover" source={require('../../assets/expense.jpg')} >
                <View style={styles.background}>
            <View style={styles.role_container} >
                <Text style={styles.role} onPress={()=>router.push('/Authentication/RegisterAdmin')} >Admin</Text>
                <Text style={styles.role_partner} >Partner</Text>
            </View>
            <Text style={styles.title}>Register</Text>
            <TextInput style={styles.inputField} placeholder="Name" onChangeText={setName} />
            <TextInput style={styles.inputField} placeholder="Email" onChangeText={setEmail} />
            <TextInput style={styles.inputField} placeholder="Passward" secureTextEntry onChangeText={setPassword} />
            {errormsg && <Text style={styles.errormsg} >{errormsg}</Text>}
            <View>
                <TouchableOpacity style={styles.button} onPress={handleRegister}>
                    <Text style={styles.buttonText}>Register</Text>
                </TouchableOpacity>
            </View>
        <Text style={styles.new_user} >Already have an account ? <Text style={{color:"orange",fontSize:18, fontWeight:"800"}} onPress={()=>router.push('/Login')} >Login</Text> </Text>
        </View>
        </ImageBackground>
    </View>)
}

const styles = StyleSheet.create({
  container: {   
    justifyContent:'center',
    alignItems:'center',
    marginTop:40,
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
  button: {
    backgroundColor: '#2196F3',
    paddingVertical: 18,
    paddingHorizontal: 80,
    borderRadius: 50,
    marginVertical:20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  new_user:{
    marginTop:10,
    color:'white',
    fontSize:16,
  },
  errormsg:{
    color:"red",
    fontWeight:'700',
  }
});
