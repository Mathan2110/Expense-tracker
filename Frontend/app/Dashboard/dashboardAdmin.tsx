import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, View,StyleSheet,TouchableOpacity,TextInput,FlatList,Image,Modal,Linking } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState,useEffect } from "react";
import { Picker } from '@react-native-picker/picker';
import { format } from 'date-fns';
import { router } from 'expo-router';
import { BASE_URL } from '../../config.js'


export default function dashboard(){
    const [status, setStatus] = useState('');
    const [name,setName] = useState('');
    const [email,setEmail] = useState('')
    const [role,setRole] = useState('')
    const [openMenu,setOpenMenu] = useState(false)
    const [pickedDate,setPickedDate] = useState(new Date())
    const [date,setDate] = useState('')
    const [category, setCategory] = useState('');
    const [search, setSearch] = useState('');
    const [showDate,setShowDate] = useState(false);
    const [selectedUri,setSelectedUri] = useState<string | null>(null)
    const [showReceipt,setShowReceipt] = useState(false)
    const [showNote,setShowNote] = useState(false)
    const [note,setNote] = useState("")
    const [showExport,setShowExport] = useState(false)
    const [expenses, setExpenses] = useState<{ _id:String, category: string; amount: number; name:String; date: String; status: string; receiptUri:string }[]>([]);
    
    
    
    useEffect(() => {
        if (showNote) return;
        fetchExpenses();
        getUserDetails();
        }, []);
        
        const fetchExpenses = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/expense`);
                setExpenses(res.data);
            } catch (error) {
                console.error(error);
            }
        }

        const getUserDetails = async () => {
            try {
                const email = await AsyncStorage.getItem('userEmail');
                if (!email) return;

                const res = await axios.get(`${BASE_URL}/user?email=${email}`);
                setName(res.data.name);
                setEmail(res.data.email);
                setRole(res.data.role);

            } catch (error) {
                console.error('Fetch user failed:', error);
            }
        };

         const updateStatus = async (id:String, newStatus:String) => {
            try {
                const res = await axios.put(`${BASE_URL}/${id}`, {
                status: newStatus,
                note
            });
            setShowNote(false)
            if (newStatus === "Approved"){
                await axios.put(`${BASE_URL}/generate/expense/${id}`);
                setNote("")
            }
            fetchExpenses(); 
        } catch (err) {
            console.error('Error updating status:', err);
            }
        };

        const updateReject = async(newStatus:String) => {
            try {
                const id = await AsyncStorage.getItem('itemId')
                const res = await axios.put(`${BASE_URL}/${id}`, {
                status: newStatus,
                note
            });
            setShowNote(false)
            fetchExpenses();
            } catch (err) {
            console.error('Error updating status:', err);
            }
        }

        const updateNote = async(itemId:string) =>{
            await AsyncStorage.setItem('itemId', itemId);
            setShowNote(true)
        }
        
        

        const openReceipt = (uri: string) => {
            setSelectedUri(uri);
            setShowReceipt(true);
        };

        const closeReceipt = () => {
            setSelectedUri(null);
            setShowReceipt(false);
        };

        const exportCsv = ()=>{
            setShowExport(false)
            Linking.openURL(`${BASE_URL}/export/csv`)
        }

        const exportPdf = ()=>{
            setShowExport(false)
            Linking.openURL(`${BASE_URL}/export/pdf`)
        }

        const handleLogout = async () => {
            await AsyncStorage.clear();
            router.push('/Login')
        };

        const handleDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
            if (event.type === 'set' && selectedDate) {
            const formatDate = format(selectedDate,'dd/MM/yyyy');
            setPickedDate(selectedDate)
            setDate(formatDate);
            setShowDate(false)
            }
            setShowDate(false);
        };
        
        
         const filteredExpenses = expenses.filter((item) => {
            const matchesStatus = status ? item.status === status : true;
            const matchesCategory = category ? item.category === category : true;
            const matchesDate = date ? item.date === date : true;
            const matchesName = search ? item.name.toLowerCase().includes(search.toLowerCase()): true;
            return matchesStatus && matchesCategory && matchesName && matchesDate;
        });
            
    return (
        <>
        {openMenu ? <Text style={styles.menu_head} onPress={()=>setOpenMenu(false)} >Close</Text> : <Text style={styles.menu_head} onPress={()=>setOpenMenu(true)} >Menu</Text>}
        <View style={styles.container}>
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
            {showDate && <DateTimePicker value={pickedDate} mode="date" display="default" onChange={handleDate} />}
            <View style={styles.head_container} >
                <Text style={styles.filterText} >Filters</Text>
                <TouchableOpacity onPress={()=>setShowExport(true)}>
                    <Text style={[styles.filterText,{backgroundColor:'green', paddingHorizontal:20,paddingVertical:5,borderRadius:10}]}  >Export CSV/PDF</Text>
                </TouchableOpacity>
                <Modal visible={showExport} animationType='none' transparent >
                    <View style={styles.note_background} >
                            <Text style={[styles.cross,{backgroundColor:'transparent',textAlign:'right',width:'85%'}]} onPress={()=>setShowExport(false)}>X</Text>
                        <View style={styles.note}>
                            <TouchableOpacity onPress={exportCsv} >
                                <Text style={[styles.filterText,{backgroundColor:'white',color:'black', paddingHorizontal:20,paddingVertical:5,borderRadius:10}]} >Export as CSV</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={exportPdf} >
                                <Text style={[styles.filterText,{backgroundColor:'red', paddingHorizontal:20,paddingVertical:5,borderRadius:10}]} >Export as PDf</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
            <View style={styles.filter_container} >
                {/* Status filter */}
                <View style={styles.filterBox} >
                    <Picker
                        selectedValue={status}
                        onValueChange={(val) => setStatus(val)}
                        style={[styles.filter]}
                        dropdownIconColor="white"
                        >
                        <Picker.Item label="All" value="" />
                        <Picker.Item label="Pending" value="Pending" />
                        <Picker.Item label="Rejected" value="Rejected" />
                        <Picker.Item label="Approved" value="Approved" />
                    </Picker>
                </View>
                {/* Category filter */}
                <View style={styles.filterBox} >
                    <Picker
                        selectedValue={category}
                        onValueChange={(val) => setCategory(val)}
                        style={styles.filter}
                        dropdownIconColor="white"
                        >
                        <Picker.Item label="Category" value="" />
                        <Picker.Item label="Travel" value="Travel" />
                        <Picker.Item label="Fuel" value="Fuel" />
                        <Picker.Item label="Accommodation" value="Accommodation" />
                        <Picker.Item label="Client Meeting" value="Client meeting" />
                        <Picker.Item label="Office Supplies" value="Office suplies" />
                        <Picker.Item label="Software Subscription" value="Software subscription" />
                        <Picker.Item label="Marketing" value="Marketing" />
                        <Picker.Item label="Salary" value="Salary" />
                        <Picker.Item label="Tax" value="Tax" />
                        <Picker.Item label="Other" value="Other" />
                    </Picker>
                </View>
            </View>

            <View style={styles.search_filter} >
                <TextInput
                    placeholder="Search partner name "
                    placeholderTextColor={'white'}
                    value={search}
                    onChangeText={setSearch}
                    style={styles.input}
                />

                <Text style={styles.date_filter} onPress={()=>setShowDate(true)} >Date</Text>
            </View>

            {/* Expense List */}
            <Text style={styles.expense_text} >Expenses</Text>
            {filteredExpenses.length === 0 
            ?<Text style={styles.not_found} >No expenses found</Text>
            :<FlatList
                data={filteredExpenses.reverse()}
                keyExtractor={item => item._id.toString()}
                renderItem={({ item }) => (
                <View style={styles.card} >
                    <TouchableOpacity onPress={()=>openReceipt(item.receiptUri)} >
                        <Image source={{ uri: item.receiptUri}} style={styles.receipt} />
                    </TouchableOpacity>
                    {/* showing receipt */}
                    <Modal visible={showReceipt} animationType="slide">
                        <View style={{ flex: 1, backgroundColor: 'black', justifyContent: 'center' }}>
                        <Text style={styles.cross} onPress={closeReceipt} >✖</Text>
                        <Image
                            source={{ uri: selectedUri ?? '' }}
                            style={{ width: '100%', height: '85%', resizeMode: 'contain' }}
                        />
                        </View>
                    </Modal>
                    <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.date}>{item.date}</Text>
                    <Text style={styles.date}>{item.category}</Text>
                    </View>
                    <View >
                    <Text style={styles.amount}>₹{item.amount}</Text>
                    {item.status === 'Pending'? (
                    <View style={styles.actionButtons}>
                        <TouchableOpacity onPress={()=>updateStatus(item._id,"Approved")} style={[styles.actionButton,{backgroundColor:'#34D399'}]}><Text style={{color:'white'}}  >Approve</Text></TouchableOpacity>
                        <TouchableOpacity onPress={()=>updateNote(String(item._id))} style={[styles.actionButton,{ backgroundColor:'#EF4444' }]}><Text style={{color:'white'}}  >Reject</Text></TouchableOpacity>

                        {/* showing notes */}
                        
                        <Modal visible={showNote} animationType='none' transparent >
                            <View style={styles.note_background} >
                                <View style={styles.note}>
                                <Text style={{fontSize:20,textAlign:'center',color:'white'}} >Enter note</Text>
                                    <TextInput
                                        value={note}
                                        onChangeText={setNote}
                                        placeholder="Enter reason"
                                        placeholderTextColor={"white"}
                                        style={[styles.input,{height:150,width:250,color:'white'},]}
                                        textAlignVertical='top'
                                    />
                                    <TouchableOpacity style={[styles.actionButton,{ backgroundColor:'#EF4444',height:50,width:150 }]} onPress={()=>updateReject("Rejected")}><Text style={{color:'white',fontWeight:600,textAlignVertical:'center',height:'100%'}}  >Reject</Text></TouchableOpacity>
                            </View>
                            </View>
                        </Modal>
                    </View>
                    ):(
                        <View style={item.status === "Approved" ? [styles.actionButton,{backgroundColor:'#008000'}]:[styles.actionButton,{backgroundColor:'#8B0000'}]}>
                            <Text style={[styles.statusText,{color:'white'}]}>{item.status}</Text>
                        </View>
                    )}
                    </View>
                    
                </View>
                )}
            />
            }
        </View>
        </>
    )
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        padding: 16,
        backgroundColor: '#111827',
        position:'relative' 
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
    menu_head:{
        marginTop:40, 
        textAlign:'right'
        ,color:'white'
        ,fontSize:20,
        backgroundColor:'#3d4160'
        ,padding:20
    },
    menu_text:{
        fontSize:18
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
    head_container:{
        display:'flex',
        flexDirection:'row',
        justifyContent:'space-between'
    },
    filterText:{
        color:'white',
        margin:10,
        fontSize:20,
    },
    filterBox: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 8,
    overflow: 'hidden', 
  },
  filter: {
    width:180,
    color: 'white',
  },
  search_filter:{
    display:'flex',
    flexDirection:'row',
    borderBottomColor:'#999',
    borderBottomWidth:2,
  },
  date_filter:{
    width:180,
    padding:15,
    color:'white',
    borderRadius:10,
    height:50,
    marginLeft:12,
    marginTop:16,
    borderWidth:1,
    borderColor:'#999'
  },
  filter_container: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
},
    cross:{
        color:'white',
        backgroundColor:'black',
        marginVertical:20,
        fontSize:30,
        textAlign:'right',
        marginRight:20
    },
    // receiptClosebtn:{
    //     backgroundColor:'red',
    //     padding:10,
    //     borderRadius:10,
    //     fontSize:20,
    //     fontWeight:600,
    //     textAlign:'center',
    //     color:'white',
    //     width:100
    // },
    expense_text:{
        color:"white",
        marginVertical:10,
        marginHorizontal:5,
        fontSize:20
    },
//   filterButton: {
//     borderRadius: 5,
//     width:90,
//     height:40,
//     display:'flex',
//     justifyContent:'center',
//     alignItems:'center',
//     backgroundColor: '#111827',
//   },
//   activeFilter: { 
//     backgroundColor: '#34D399'
//  },
  input: {
    color:'white',
    fontSize:14,
    width:180,
    fontWeight:800,
    borderWidth:1,
    borderColor:'#999',
    borderRadius: 10,
    padding:15,
    marginVertical: 15
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2c2f4a',
    padding: 10,
    borderRadius: 12,
    marginVertical: 6
  },
  receipt: { 
    width: 40, 
    height: 40, 
    marginRight: 10 
},
  name: { 
    fontWeight: '100',
    color:'white' 
},
  date: { 
    fontSize: 12, 
    color: 'white' 
},
  amount: { 
    fontWeight: 'bold',
    marginLeft: 10 ,
    textAlign:'right',
    paddingRight:20,
    color:'white'
},
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 4
  },
  statusText: { 
    fontSize: 12
 },
  actionButtons: { 
    flexDirection: 'row',
    gap:10,
    marginLeft: 10 
    },
  actionButton: {
    padding: 6,
    paddingHorizontal:12,
    borderWidth: 1,
    borderRadius: 6,
    marginTop: 4,
    alignItems: 'center'
  },
  note:{
    display:'flex',
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:'#2c3e50',
    padding:20,
    width:350,
    borderRadius:15,
  },
  note_background:{
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)', 
    justifyContent: 'center',      
    alignItems: 'center',
  },
  not_found:{
    color:'white',
    width:'100%',
    height:'100%',
    marginVertical:160,
    textAlign:'center'
  }
})