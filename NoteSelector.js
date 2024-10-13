import { useState, useEffect } from "react";
import { View, KeyboardAvoidingView, ScrollView, Text } from "react-native";
import NoteTile from "./NoteTile.js"
import AsyncStorage from '@react-native-async-storage/async-storage';
import { dateString } from "./Functions.js"
import RNFS from 'react-native-fs';

export default function NoteSelector({setSelectedNoteData}){
    
    const [notes, setNotes] = useState([])

    useEffect(()=>{
        loadNotes()
    },[])

    async function loadNotes() {
      try {
        const notes = await AsyncStorage.getItem('notes');
        let loadedNotes = notes ? JSON.parse(notes) : []; // Parse if found, or return empty array
        setNotes(loadedNotes)
      } catch (error) {
        console.error('Failed to load notes', error);
        setNotes([]);
      }
    }
    // TODO: Create a new note txt file and put the file path in the meta data before saving it
    async function addNote() {
        try {
            // Get the current date and time using your dateString function
            const dateTime = dateString();
            
            // Define the file path and name
            const fileName = `New Note ${dateTime}.txt`;
            const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
            
            // Create the new note object with title and unique ID
            const newNote = {
                id: Date.now().toString(), // unique id based on current time
                title: `New Note ${dateTime}`,
                content: "", // Empty content initially
                lastUpdated: dateString(),
                filePath: filePath, // Save the file path in the note's metadata
            };
            
            // Create the new text file
            await RNFS.writeFile(filePath, newNote.content, 'utf8');
    
            // Retrieve the existing notes from AsyncStorage
            const storedNotes = await AsyncStorage.getItem('notes');
            let existingNotes = storedNotes ? JSON.parse(storedNotes) : [];
            
            // Append the new note to the existing notes
            existingNotes.push(newNote);
            
            // Save the updated notes back to AsyncStorage
            await AsyncStorage.setItem('notes', JSON.stringify(existingNotes));
            
            // Update the state to reflect the new list of notes
            setNotes(existingNotes);
            
            // Set the new note as the selected note
            setSelectedNoteData(newNote);
        } catch (error) {
            console.error('Failed to add new note', error);
        }
    }
      
    return (
        <KeyboardAvoidingView style={{marginBottom: 40}}>
            <Text style={{borderBottomWidth: 1, borderBottomColor: "black", marginTop: 30, textAlign: "center", paddingBottom: 10, fontSize: 20}}>Note App</Text>
            <ScrollView>
                <View style={{paddingTop: 10, flexDirection: "row", flexWrap: "wrap",  justifyContent: "center", }}>
                    <NoteTile addNote={addNote}></NoteTile>
                    {notes.map(noteData => (
                        <NoteTile noteData={noteData} setSelectedNoteData={setSelectedNoteData} loadNotes={loadNotes}></NoteTile>
                    ))}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}