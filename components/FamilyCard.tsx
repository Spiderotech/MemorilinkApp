import React from 'react';
import { Image, Text, TouchableOpacity, View, Dimensions, StyleSheet } from 'react-native';
import { ArchiveBoxXMarkIcon } from 'react-native-heroicons/outline';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const FamilyCard = ({ family, onDeletePress }) => {
    const navigation = useNavigation();
    const cardWidth = width * 0.25;
    const cardHeight = cardWidth * 1.2;
    const screenWidth = Dimensions.get('window').width;

    return (
        <TouchableOpacity 
            style={[styles.card, { width: cardWidth, height: cardHeight }]}
            onPress={() => navigation.navigate('Familylist', { familyId: family.family_id })}
        >
            <TouchableOpacity 
                style={styles.deleteButton}
                onPress={onDeletePress}
            >
                <ArchiveBoxXMarkIcon size={screenWidth * 0.03} color="black" />
            </TouchableOpacity>
            
            <View style={styles.imageContainer}>
                <TouchableOpacity style={styles.imageWrapper}>
                    <Image source={{ uri: family?.attachment_url }} style={styles.image} />
                </TouchableOpacity>
                <Text style={styles.familyName}>
                    {family.name}
                </Text>
                <Text style={styles.familyConnections}>
                    {family.members.length} Connections
                </Text>
            </View>
            <View style={styles.membersContainer}>
                <View style={styles.membersWrapper}>
                    {family.members.slice(0, 3).map((member, index) => (
                        <Image
                            key={index}
                            source={member.member_profile_image?{ uri: member.member_profile_image }:require('../assets/profile.png')}
                            style={[styles.memberImage, { left: index * (width * 0.04) }]}
                        />
                    ))}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#E6D8B6',
        margin: width * 0.035,
        borderRadius: 12,
        alignItems: 'center',
        paddingVertical: width * 0.02,
    },
    deleteButton: {
        position: 'absolute',
        top: 7,
        right: 7,
        width: width * 0.05,
        height: width * 0.05,
        borderRadius: 50,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 10,
    },
    imageWrapper: {
        alignItems: 'center',
        marginHorizontal: 8,
    },
    image: {
        width: width * 0.11,
        height: width * 0.11,
        borderRadius: 50,
    },
    familyName: {
        color: 'black',
        fontWeight: '600',
        fontSize: 8,
        marginTop: 5,
    },
    familyConnections: {
        color: '#848488',
        fontWeight: '400',
        fontSize: 5,
    },
    membersContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 5,
        width: '100%',
    },
    membersWrapper: {
        width: '50%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    memberImage: {
        width: width * 0.05,
        height: width * 0.05,
        borderWidth: 2,
        borderColor: 'white',
        borderRadius: 50,
        position: 'absolute',
    },
});

export default FamilyCard;
