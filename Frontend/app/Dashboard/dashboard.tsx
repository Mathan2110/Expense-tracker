import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Linking, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router } from 'expo-router';
import ExpenseForm from '../Expenseform/ExpenseForm';
import { BASE_URL } from '../../config.js'


export default function dashboard(){
    const [expenses, setExpenses] = useState<{ _id:String, category: string; amount: number; date: string; status: string;note:String;voucherPath:String;email:String }[]>([]);
    const [name,setName] = useState('');
    const [email,setEmail] = useState('')
    const [role,setRole] = useState('')
    const [showExpense,setShowExpense] = useState(false)
    const [note,setNote] = useState('')
    const [openMenu,setOpenMenu] = useState(false)

    useEffect(() => {
        if (showExpense) return;
        fetchExpenses();
        getUserDetails();
    }, [expenses,showExpense]);

    const fetchExpenses = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/expense`);
            setExpenses(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const getUserDetails = async () => {
            try {
                const stored_email = await AsyncStorage.getItem('userEmail');
                if (!stored_email) return;
                const res = await axios.get(`${BASE_URL}/user?email=${stored_email}`);
                setName(res.data.name);
                setEmail(res.data.email);
                setRole(res.data.role);

            } catch (error) {
                console.error('Fetch user failed:', error);
            }
        };
    
    
    const status_color = (status:String)=>{
        if (status === "Approved"){
            return {backgroundColor:"#3b82f6"}
        }else if (status === "Rejected"){
            return {backgroundColor:"#ef4444"}
        }else{
            return {backgroundColor:"#fbbf24"}
        }
    }

    const handleLogout = async () => {
            await AsyncStorage.clear();
            router.push('/Login')
    };
    const filteredExpenses = expenses.filter((item) => {
            const matchedEmail = email ? item.email === email : true;
            return matchedEmail;
        });

    return <>
        <View style={styles.menu_head} >
            <Text style={styles.welcome}>Hi {name} ,</Text>
            {openMenu ? <Text style={[styles.menu_text,{color:'white'}]} onPress={()=>setOpenMenu(false)} >Close</Text> : <Text style={[styles.menu_text,{color:'white'}]} onPress={()=>setOpenMenu(true)} >Menu</Text>}
        </View>
        <View style={styles.container}>
            {filteredExpenses.length === 0 ?
            (<View style={styles.container_new} >
                {openMenu && (
                <View style={styles.menu} >
                    <Text style={styles.menu_text} >Name : {name}</Text>
                    <Text style={styles.menu_text} >Email  : {email}</Text>
                    <Text style={styles.menu_text} >Role    : {role}</Text>
                    <TouchableOpacity onPress={handleLogout} >
                        <Text style={styles.logout_btn}  >Log out</Text>
                    </TouchableOpacity>
                </View>
                )}
                <Text style={styles.text_add} >No expenses submitted</Text>
                <Modal visible={showExpense} animationType='none' transparent >
                    <Text style={styles.cross} onPress={()=>setShowExpense(false)} >x</Text>
                    <ExpenseForm />
            </Modal>
            <TouchableOpacity style={styles.submitBtn} onPress={()=>setShowExpense(true)}>
                <Text style={styles.btnText} >+ Submit New Expense</Text>
            </TouchableOpacity>
            </View>) 
            :
            (<>
            {openMenu && (
                <View style={styles.menu} >
                    <Text style={styles.menu_text} >Name : {name}</Text>
                    <Text style={styles.menu_text} >Email  : {email}</Text>
                    <Text style={styles.menu_text} >Role    : {role}</Text>
                    <TouchableOpacity onPress={handleLogout} >
                        <Text style={styles.logout_btn} >Log out</Text>
                    </TouchableOpacity>
                </View>
            )}
            <View style={styles.tableHeader}>
                <Text style={styles.headerText}>Category</Text>
                <Text style={styles.headerText}>Amount</Text>
                <Text style={styles.headerText}>Status</Text>
            </View>

            <FlatList
                data={filteredExpenses}
                keyExtractor={(item) => item._id.toString()}
                renderItem={({ item }) => (
                    <>
                    <View style={styles.item}>
                        <Text style={styles.cell}>{item.category}</Text>
                        <Text style={styles.cell}>₹ {item.amount}</Text>
                        <Text style={[styles.cell,status_color(item.status)]} >{item.status}</Text>
                    </View>
                    {item.status === "Approved" ? (
                        <Text style={styles.link} onPress={()=>Linking.openURL(`http://192.168.129.243:3000${item.voucherPath}`)} >Download Voucher</Text>
                        ):<Text style={[styles.link,{color:'gray'}]} >{item.note}</Text>}
                        </>
                    )}
            />
            <Modal visible={showExpense} animationType='none' transparent >
                    <Text style={styles.cross} onPress={()=>setShowExpense(false)} >x</Text>
                    <ExpenseForm />
            </Modal>
            <TouchableOpacity style={styles.submitBtn} onPress={()=>setShowExpense(true)}>
                <Text style={styles.btnText} >+ Submit New Expense</Text>
            </TouchableOpacity>
            </>)
            }
        </View>
    </>
}

const styles = StyleSheet.create({
    container: { 
        padding: 16, 
        backgroundColor: '#111827',
        flex: 1
    },
    container_new:{
        display:'flex',
        flex:1,
        justifyContent:'center',
        alignItems:'center',
        gap:70
    },
    text_add:{
        color:'gray',
        fontSize:20,
        fontWeight:600
        
    },
    heading: { 
        color: 'white', 
        fontSize: 16, 
        marginBottom: 12 
    },
    welcome: { 
        fontSize: 20, 
        color: 'white', 
        marginBottom: 10 
    },
    menu_head:{
        marginTop:40,
        display:'flex',
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        color:'white',
        fontSize:20,
        backgroundColor:'#3d4160',
        padding:20
    },

    menu_text:{
        fontSize:20,
    },

    menu:{
        backgroundColor:'white',
        padding:15,
        borderRadius:10,
        gap:10,
        position:'absolute',
        top:0,
        right:0,
        height:200,
        zIndex:2
    },
    logout_btn:{
        fontSize:18,
        backgroundColor:'red',
        width:100,
        textAlign:'center',
        color:'white',
        paddingVertical:10,
        borderRadius:10,
        marginTop:10
    },
    cross:{
        color:'white',
        position:'absolute',
        top:118,
        right:60,
        fontSize:33,
        zIndex:1
    },
    submitBtn: { 
        backgroundColor: '#2563eb', 
        padding: 12, 
        borderRadius: 8, 
        marginBottom:20,
    },
    btnText: { 
        color: 'white', 
        textAlign: 'center', 
        fontWeight: 'bold' 
    },
    tableHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 35,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderColor: '#2c2f4a',
        padding:20,
        
    },
    headerText: {
        color: '#ccc',
        fontWeight: 'bold',
        fontSize: 13
    },

    item: {
        backgroundColor: '#1f2937',
        padding: 10,
        paddingVertical:10,
        borderRadius: 8,
        marginTop: 10,
        display:'flex',
        flexDirection:'row',
        justifyContent:'space-between',
    },
    cell: { 
        color: 'white',
        width:125,
        paddingVertical:10,
        fontSize:14,
        textAlign:'center'
     },
    status: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        color: 'white',
        marginTop: 4,
        alignSelf: 'flex-start',
    },
    link: { 
      color: '#60a5fa',
       marginTop: 4,
       textAlign:'right',
    },
    filter: {
        marginTop: 20,
        padding: 12,
        backgroundColor: '#1d4ed8',
        borderRadius: 8,
    },
    filterText: { 
        textAlign: 'center', 
        color: 'white' 
    },
});
