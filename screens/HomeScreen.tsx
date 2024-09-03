import React, { useState, useCallback } from 'react';
import { Text, TouchableOpacity, View, Modal, Pressable, SafeAreaView, ScrollView, RefreshControl, StyleSheet, Dimensions } from 'react-native';
import StoryList from '../components/StoryList';
import HomepostCard from '../components/HomepostCard';
import MemoriesCard from '../components/MemoriesCard';
import FamilyListCard from '../components/FamilyListCard';
import { BellAlertIcon, Bars3Icon, Cog8ToothIcon, CalendarDaysIcon, UsersIcon } from 'react-native-heroicons/outline';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const HomeScreen = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const navigation = useNavigation();
// dropdown navigation 
    const handleNavigation = (screen) => {
        setModalVisible(false);
        navigation.navigate(screen);
    };

    // on refresh get the componet data function calling 

    const onRefresh = useCallback(async () => {    
        setRefreshing(true);
        await fetchStories();
        await fetchUserData();
        await fetchMemoriesData();
        setRefreshing(false);
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.welcomeText}>
                    Welcome back, friend!
                </Text>
                <View style={styles.headerIcons}>
                    <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Notification')}>
                        <BellAlertIcon size={width * 0.06} color="black" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setModalVisible(true)}>
                        <Bars3Icon size={width * 0.08} color="black" />
                    </TouchableOpacity>
                </View>
            </View>
  {/* navigation modale */}
            <Modal
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <Pressable
                    style={styles.modalBackground}
                    onPress={() => setModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation('Settings')}>
                            <Cog8ToothIcon size={width * 0.04} color="black" />
                            <Text style={styles.menuText}>Settings</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation('CreateEvent')}>
                            <CalendarDaysIcon size={width * 0.04} color="black" />
                            <Text style={styles.menuText}>Create a Moment</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuItem1} onPress={() => handleNavigation('CreateFamily')}>
                            <UsersIcon size={width * 0.04} color="black" />
                            <Text style={styles.menuText}>Create a Link</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>
  {/* user connection list with event redirection components */}
            <View style={styles.content}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                        />
                    }
                >
                    <StoryList onRefreshComplete={() => setRefreshing(false)} />
                          {/* user post card component with horizontalscrolling  */}
                    <View>
                        <Text style={styles.sectionTitle}>Post</Text>
                        <HomepostCard />
                    </View>
  {/* discover button redirection  and memories card componet */}
                    <View>
                        <View style={styles.memoriesHeader}>
                            <Text style={styles.sectionTitle}>Memories for you</Text>
                            <TouchableOpacity style={styles.discoverButton} onPress={() => handleNavigation('Family')}>
                                <Text style={styles.discoverButtonText}>Discover</Text>
                            </TouchableOpacity>
                        </View>
                        <MemoriesCard />
                    </View>
  {/* user created or connected family list components  */}
                    <Text style={styles.sectionTitle}>Trending memories</Text>
                    <FamilyListCard />
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: height * 0.03,
        paddingHorizontal: width * 0.05,
    },
    welcomeText: {
        fontSize: width * 0.05,
        color: 'black',
        fontWeight: '300',
        flexShrink: 1,
    },
    headerIcons: {
        flexDirection: 'row',
    },
    iconButton: {
        marginRight: width * 0.03,
        marginTop: height * 0.005,
    },
    modalBackground: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContainer: {
        width: width * 0.4,
        backgroundColor: '#EFEFF0',
        padding: width * 0.02,
        borderRadius: width * 0.02,
        marginTop: height * 0.07,
        marginRight: width * 0.02,
    },
    menuItem: {
        paddingVertical: height * 0.01,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuItem1: {
        paddingVertical: height * 0.01,
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuText: {
        fontSize: width * 0.03,
        color: 'black',
        marginLeft: width * 0.02,
    },
    content: {
        flex: 1,
        padding: width * 0.03,
       
    },
    sectionTitle: {
        fontSize: width * 0.045,
        color: 'black',
        fontWeight: 'bold',
        marginBottom: height * 0.01,
    },
    memoriesHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: height * 0.01,
    },
    discoverButton: {
        paddingVertical: height * 0.01,
        paddingHorizontal: width * 0.03,
        backgroundColor: '#E1E2E2',
        borderRadius: width * 0.025,
    },
    discoverButtonText: {
        fontSize: width * 0.035,
        color: 'black',
        textAlign: 'center',
    },
});

export default HomeScreen;



