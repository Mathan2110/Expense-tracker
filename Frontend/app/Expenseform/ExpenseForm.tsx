import { Text, TextInput, View, StyleSheet, TouchableOpacity,Image } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker , { DateTimePickerEvent }  from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../config.js'

export default function ExpenseForm(){
    const [date, setDate] = useState(new Date());
    const [formatedDate,setFormatedDate] = useState(format(new Date(), 'dd/MM/yyyy'))
    const [showDate,setShowDate] = useState(false)
    const [error,setError] =  useState('')
    const [selectedCategory, setSelectedCategory] = useState('');
    const [receiptUri, setReceiptUri] = useState<string | null>(null);
    const [amount,setAmount] = useState(0);
    const [name,setName] = useState('');
    const [email,setEmail] = useState('')
    const [submitted,setSubmitted] = useState('')
    const [receiptUpload,setReceiptUpload] =useState('')

    useEffect(()=>{
        getUserDetails()
    },[])

    const getUserDetails = async () => {
            try {
                const email = await AsyncStorage.getItem('userEmail');
                if (!email) return;

                const res = await axios.get(`${BASE_URL}/user?email=${email}`);
                setName(res.data.name);
                setEmail(res.data.email);

            } catch (error) {
                console.error('Fetch user failed:', error);
            }
        };

    const handleSubmit = async() => {
        setError('')
        setSubmitted('')
        setReceiptUpload('')
        try{
          if (amount === 0 || !receiptUri){
            setError("Enter amount and receipt")
          }else{
                setSubmitted("Expense submitted successfully")
                
                if (!email) return;
                
                const expense = await axios.post(`${BASE_URL}/expense`, {
                    email,
                    name,
                    amount,
                    date:formatedDate,
                    category:selectedCategory || 'Other',
                    receiptUri,
                    status:"Pending",
                    voucherPath:''
            })
          }
        }catch(error){
          console.log(error)
        }
            
    }

    const handleDate = (event: DateTimePickerEvent, selectedDate?: Date)=>{
        if (event.type === 'set' && selectedDate) {
            const formatDate = format(selectedDate, 'dd/MM/yyyy');
            setDate(selectedDate)
            setFormatedDate(()=>formatDate);
            setShowDate(false)
            }
            setShowDate(false);
    }

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        base64: false, 
        quality: 1,
        });

        if (!result.canceled) {
        const uri = result.assets[0].uri;
        setReceiptUri(uri);
        const formData = new FormData();
        formData.append('receipt', {
            uri,
            name: 'receipt.jpg',
            type: 'image/jpeg',
        } as any); 

        await fetch(`${BASE_URL}/upload`, {
            method: 'POST',
            headers: {
            'Content-Type': 'multipart/form-data',
            },
            body: formData,
        });
    }
  };



return <View style={styles.outer_container}>
            <View style={styles.container}>
                <Text style={styles.title}>ADD EXPENSE</Text>
                <View style={styles.form_container}>
                    <Text style={styles.labels} >Amount</Text>
                    <TextInput placeholder="Enter the  amount" placeholderTextColor="white" style={styles.input} onChangeText={(text)=>{
                        const value = parseInt(text) || 0;
                        setAmount(value)
                    }}  keyboardType="numeric" />
                    <Text style={styles.labels} >Date</Text>
                    <Text style={styles.input} onPress={()=>setShowDate(true)} >{format(date, 'dd/MM/yyyy')}</Text>
                    {showDate && <DateTimePicker value={date} mode="date" style={styles.input} display="default" onChange={handleDate} />}
                    <Text style={styles.labels} >Category</Text>
                    <View style={styles.dropdown} >
                    <Picker
                        selectedValue={selectedCategory}
                        onValueChange={(itemValue) => setSelectedCategory(itemValue)}
                        style={{ color: 'white', fontSize: 16 }}>
                        <Picker.Item label="-- Select Category --" value="" enabled={true} />
                        <Picker.Item label="Travel" value="Travel" />
                        <Picker.Item label="Fuel" value="Fuel" />
                        <Picker.Item label="Accommodation" value="Accommodation" />
                        <Picker.Item label="Client Meeting" value="Client_meeting" />
                        <Picker.Item label="Office Supplies" value="Office_supplies" />
                        <Picker.Item label="Software Subscription" value="Software" />
                        <Picker.Item label="Marketing" value="Marketing" />
                        <Picker.Item label="Salary" value="Salary" />
                        <Picker.Item label="Tax" value="Tax" />
                        <Picker.Item label="Other" value="Other" />
                    </Picker>
                    </View>
                    <TouchableOpacity  onPress={pickImage} style={styles.receipt_container}>
                        {receiptUri ? <Image source={{ uri:receiptUri}} style={styles.receipt} />:<Text style={styles.receipt}  >Upload receipt</Text>}
                    </TouchableOpacity>
                    {receiptUpload && <Text style={styles.receipt_msg} >{receiptUpload}</Text>}
                    {submitted && <Text style={styles.receipt_msg} >{submitted}</Text>}
                    {error && <Text style={styles.error} >{error}</Text>}
                    <View style={{alignItems:'center'}} >
                        <TouchableOpacity style={styles.submit_btn} onPress={handleSubmit}>
                            <Text style={styles.sub_text}>Submit</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
    </View>
}

const styles = StyleSheet.create({
    outer_container:{
        paddingTop:10,
        height:'100%',
        backgroundColor:'rgba(0, 0, 0, 0.2)',
        elevation:200,
    },
    container:{
        margin:25,
        marginTop:100,
        borderRadius:20,
        overflow:'hidden',
        backgroundColor:'#111827'
    },
    title:{
        textAlign:'center',
        backgroundColor:'#2563eb',
        color:'white',
        padding:20,
        fontSize:18,
        fontWeight:700,
    },
    form_container:{
        padding:15
    },
    labels:{
        color:'white',
        marginTop:20,
        marginLeft:10,
    },
    input:{
        borderWidth:2,
        marginHorizontal:10,
        padding:10,
        marginTop:5,
        borderRadius:5,
        borderColor:'#2c2f4a',
        color:'white'
    },
    dropdown:{
        borderWidth:2,
        marginHorizontal:10,
        marginTop:5,
        borderRadius:5,
        borderColor:'#2c2f4a',
        color:'white'
    },
    receipt_container:{
        marginHorizontal:55,
        marginVertical:20,
    },
    receipt:{
        margin:10,
        borderWidth:2,
        borderColor:'#2c2f4a',
        borderRadius:5,
        color:'white',
        width:200,
        height:100,
        textAlign:'center',
        paddingVertical:35,
        fontSize:18,
        fontWeight:600,
    },
    receipt_msg:{
        textAlign:'center',
        marginBottom:20,
        fontSize:14,
        fontWeight:700,
        color:'green'
    },
    error:{
        textAlign:'center',
        marginBottom:20,
        fontSize:14,
        fontWeight:700,
        color:'red'
    },
    sub_text:{
        textAlign:'center',
        fontSize:16,
        fontWeight:700,
        color:'white'
    },
    submit_btn:{
        textAlign:'center',
        backgroundColor:'#1d4ed8',
        marginBottom:20,
        marginHorizontal:10,
        width:200,
        paddingVertical:20,
        borderRadius:30,
        fontSize:18,
        fontWeight:600,
        color:'white'
    },
    back_btn:{
        backgroundColor:'white',
        textAlign:'center',
        marginBottom:20,
        marginHorizontal:10,
        width:200,
        paddingVertical:20,
        borderRadius:30,
        fontSize:18,
        fontWeight:600,
    }
})