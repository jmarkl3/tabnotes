import { useState } from "react"
import { ScrollView, Text, TouchableOpacity, View, Alert  } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Button from "./Components/Button.js"

// import RNFS from 'react-native-fs';

export default function NoteTile({noteData, setSelectedNoteData, addNote, loadNotes}){

    const [showMenu, setShowMenu] = useState()

    // Ask for confirmation before deleting the note
    function askToDeleteNote(noteData) {
        Alert.alert(
            'Delete Note',
            `Are you sure you want to delete the note titled "${noteData.title}"?`,
            [
                {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel pressed'),
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    onPress: () => deleteNote(noteData.id),
                    style: 'destructive',
                },
            ],
            { cancelable: true }
        );
    }
    // Delete note with id noteData.id TODO: Show a confirmation for this before deleting a whole note
    async function deleteNote(noteId) {
        // Step 1: Retrieve existing notes from AsyncStorage
        try {
            const storedNotes = await AsyncStorage.getItem('notes'); // Make sure 'notes' is your key
            let notes = JSON.parse(storedNotes) || [];
    
            // Step 2: Filter out the note to be deleted
            notes = notes.filter(note => note.id !== noteId);
    
            // Step 3: Save the updated notes back to AsyncStorage
            await AsyncStorage.setItem('notes', JSON.stringify(notes));
            
            // Step 4: Delete the actual note data
            await AsyncStorage.removeItem('note-'+noteId);
            
            console.log(`Note with ID ${noteId} deleted successfully.`);
            
            // This reloads so the displayed notes reflect the actual storage (without the deleted note)
            loadNotes()

        } catch (error) {
            console.error('Error deleting note:', error);
        }

    }
    

    return (
        <>
            {addNote ? 
                
                <TouchableOpacity key={"note-tile-"+"new"} onPress={addNote}>
                    <View style={{height: 110, width: 110, borderWidth: 1, borderColor: "black", padding: 5, margin: 5, }}>
                        <Text style={{textAlign: "center",}}>
                            {"New Note"}
                        </Text>
                    </View>
                </TouchableOpacity>
                :
                // Normal note tile
                <TouchableOpacity key={"note-tile-"+noteData.id} onPress={()=>setSelectedNoteData(noteData)}>
  
                    {/* The note title */}
                    <View style={{height: 110, width: 110, borderWidth: 1, borderColor: "black", padding: 5, margin: 5, display: "inline-block", }}>
                        <Text style={{textAlign: "center"}}>
                            {noteData.title}
                        </Text>
                    </View>

                    {/* The options button */}
                    <TouchableOpacity  
                        onPress={(event) => {
                            event.stopPropagation(); // Prevents the outer onPress from being called
                            setShowMenu(true); // Call deleteNote with the correct note ID
                        }} 
                        style={{height: 30, width: 30, position: "absolute", bottom: 5, right: 5, zIndex: 2, borderWidth: 1, borderColor: "black"}}
                    >
                        <Text style={{textAlign: "center", fontSize: 20}}>
                            {"≡"}
                        </Text>
                    </TouchableOpacity>

                    {/* The Menu */}
                    {showMenu && 
                        <View style={{height: 108, width: 108, zIndex: 2, backgroundColor: "white", position: "absolute", top: 6, right: 6}}>
                            <ScrollView>
                                <Button onPress={()=>setShowMenu()}>Cancel</Button>
                                <Button onPress={()=>setShowMenu()}>Test</Button>
                                <Button onPress={()=>askToDeleteNote(noteData)}>Delete</Button>
                            </ScrollView>
                        </View>
                    }

                </TouchableOpacity>
            }
        </>
    )
}