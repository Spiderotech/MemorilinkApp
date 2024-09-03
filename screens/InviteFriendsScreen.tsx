import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, TextInput, SafeAreaView, Alert, Share, FlatList, Dimensions, StyleSheet, Linking } from 'react-native';
import { ArrowLeftIcon, ChevronRightIcon, MagnifyingGlassIcon, ChatBubbleLeftRightIcon, PlusCircleIcon, LinkIcon, UserIcon } from 'react-native-heroicons/solid';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Clipboard from '@react-native-clipboard/clipboard';
import Contacts from 'react-native-contacts';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get('window');

const InviteFriendsScreen = () => {
    const navigation = useNavigation();
    const [contacts, setContacts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const inviteLink = "https://www.memorilink.com";  // invitation link 
// get permission for device contact
    useEffect(() => {
        const requestContactsPermission = async () => {
            try {
                const result = await request(PERMISSIONS.ANDROID.READ_CONTACTS);
                if (result === RESULTS.GRANTED) {
                    loadContacts();
                } else {
                    Alert.alert(
                        'Contacts Permission Denied',
                        'This app needs access to your contacts to invite friends. Please enable contacts permission in the app settings.',
                        [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'OK', onPress: () => requestContactsPermission() },
                        ]
                    );
                }
            } catch (err) {
                console.warn(err);
            }
        };

        requestContactsPermission();
    }, []);
// load user device contact 
    const loadContacts = () => {
        Contacts.getAll()
            .then(contacts => {
                setContacts(contacts);
            })
            .catch(e => {
                console.log(e);
            });
    };
// invite link cpoy function 
    const copyToClipboard = () => {
        Clipboard.setString(inviteLink);
        Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Link copied to clipboard!',
            visibilityTime: 3000,
        });
    };

    const handleWhatsAppShare = async () => {
        try {
            const url = `whatsapp://send?text=Join me on this awesome app!: ${inviteLink}`;
            await Linking.openURL(url);
        } catch (error) {
            console.error('Error opening WhatsApp:', error);
            Alert.alert(
                'WhatsApp Not Installed',
                'WhatsApp is not installed on your device.',
                [{ text: 'OK' }]
            );
        }
    };
    
    const handleMessageShare = async () => {
        try {
            const url = `sms:?body=Join me on this awesome app!: ${inviteLink}`;
            await Linking.openURL(url);
        } catch (error) {
            console.error('Error opening Messaging app:', error);
            Alert.alert(
                'Messaging App Not Found',
                'Could not open the messaging app on your device.',
                [{ text: 'OK' }]
            );
        }
    };
    
// invite link sharing function 
    const handleShare = async () => {
        try {
            await Share.share({
                message: `Join me on this awesome app!: ${inviteLink}`,
            });
        } catch (error) {
            console.error('Error sharing link:', error);
        }
    };
//function for contact invitaion 
const handleContactInvite = (contact) => {
    const phoneNumber = contact.phoneNumbers[0]?.number; // Get the first phone number from the contact
    if (phoneNumber) {
        const smsUrl = `sms:${phoneNumber}?body=Join me on this awesome app!: ${inviteLink}`;
        Linking.openURL(smsUrl).catch((error) => {
            console.error('Error opening SMS app:', error);
            Alert.alert(
                'Messaging App Not Found',
                'Could not open the messaging app on your device.',
                [{ text: 'OK' }]
            );
        });
    } else {
        Toast.show({ 
            type: 'error',
            text1: 'No Phone Number',
            text2: 'This contact does not have a phone number.',
            visibilityTime: 4000,
        });
    }
};

// render user contact with name and image  
    const renderContact = ({ item }) => (
        <TouchableOpacity onPress={() => handleContactInvite(item)} style={styles.contactItem}>
            <UserIcon size={30} color="#828287" />
            <Text style={styles.contactName}>{item.givenName} {item.familyName}</Text>
        </TouchableOpacity>
    );
// contact seacrch function 
    const filteredContacts = contacts.filter(contact => 
        contact.givenName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        contact.familyName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerContainer}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <ArrowLeftIcon size={25} color="black" />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Invite friends</Text>
                </View>
            </View>
            <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                    <MagnifyingGlassIcon size={22} color="#828287" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search"
                        placeholderTextColor="#828287"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    <ChevronRightIcon size={22} color="#828287" />
                </View>
            </View>
            <View style={styles.buttonRow}>
                <TouchableOpacity onPress={copyToClipboard}>
                    <LinearGradient colors={['#18426D', '#286EB5', '#64D2FF']} style={styles.inviteButton}>
                        <LinkIcon size={30} color="white" />
                        <Text style={styles.buttonText}>Copy link</Text>
                    </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleWhatsAppShare}>
                    <LinearGradient colors={['#18426D', '#286EB5', '#64D2FF']} style={styles.inviteButton}>
                        <Image
                            source={require('../assets/icons8-whatsapp-100.png')}
                            style={styles.icon}
                        />
                        <Text style={styles.buttonText}>WhatsApp</Text>
                    </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleMessageShare}>
                    <LinearGradient colors={['#18426D', '#286EB5', '#64D2FF']} style={styles.inviteButton}>
                        <ChatBubbleLeftRightIcon size={30} color="white" />
                        <Text style={styles.buttonText}>Message</Text>
                    </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleShare}>
                    <LinearGradient colors={['#18426D', '#286EB5', '#64D2FF']} style={styles.inviteButton}>
                        <PlusCircleIcon size={30} color="white" />
                        <Text style={styles.buttonText}>More</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            <FlatList
                data={filteredContacts}
                renderItem={renderContact}
                keyExtractor={item => item.recordID}
                ListHeaderComponent={() => (
                    <View style={styles.listHeader}>
                        <Text style={styles.listHeaderText}>Contacts</Text>
                    </View>
                )}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        paddingHorizontal: width * 0.05,
        marginTop: height * 0.03,
    },
    backButton: {
        marginRight: width * 0.03,
        marginTop: height * 0.01,
        justifyContent: 'center',
    },
    headerTitleContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: width * 0.2,
    },
    headerTitle: {
        color: 'black',
        fontSize: width * 0.05,
        fontWeight: '300',
        textAlign: 'center',
        letterSpacing: width * 0.005,
    },
    searchContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: height * 0.04,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        width: width * 0.9,
        height: height * 0.05,
        backgroundColor: '#EFEFF0',
        borderRadius: width * 0.025,
        paddingHorizontal: width * 0.025,
    },
    searchInput: {
        flex: 1,
        marginLeft: width * 0.03,
        fontSize: width * 0.045,
        color: '#828287',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: height * 0.03,
        marginBottom: height * 0.05,
        gap: width * 0.02,
    },
    inviteButton: {
        width: width * 0.22,
        height: height * 0.1,
        borderRadius: width * 0.02,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        fontSize: width * 0.03,
        fontWeight: '500',
        color: 'white',
        marginTop: height * 0.01,
        textAlign: 'center',
    },
    icon: {
        width: width * 0.08,
        height: height * 0.04,
    },
    listHeader: {
        paddingHorizontal: width * 0.05,
    },
    listHeaderText: {
        fontSize: width * 0.045,
        color: '#828287',
        marginBottom: height * 0.01,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: height * 0.015,
        borderBottomWidth: 1,
        borderBottomColor: '#D1D1D1',
    },
    contactName: {
        marginLeft: width * 0.03,
        fontSize: width * 0.045,
        color: '#828287',
    },
});

export default InviteFriendsScreen;
