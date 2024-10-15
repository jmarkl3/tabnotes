import { useState, useEffect, useRef } from "react"
import { ScrollView, View, KeyboardAvoidingView, TouchableOpacity, Text, StyleSheet, Alert } from "react-native";
import DataRow from "./DataRow.js"
import { countLeadingTabs } from "./Functions.js"
import NoteEdit from "./NoteEdit.js";
import NoteEditWithTTS from "./NoteEditWithTTS.js";
import NoteSelector from "./NoteSelector.js";

/*

    To add

    Menus: 
        Menu in the note selector menu 
            (currently it just deletes the note when clicked)

        Note edit menu
            Inport Export as .txt files
            Open settings menu

    Reading each line with tts

    Saving format of string

    Misc Secondary
        If pressing back in an empty row the row is deleted
        The loading is slow and starts from nothing every time chancing screens, could load it every time opening a new screen but to update what is already in global state so it doesn't show noting at first 

    when adding a new line to the bottomthe scroll scrolls down to show it
        maybe when the selected row id changes can have the scroll bar scroll it into view

    Settings
        App Settings
            Enter button crates a new line instead of just adding a newline character
                alt + enter creates a new row even in button newline mode
            Light and dark theme
            Text size
            Ask or not before delteing a line setting
        Note/line settings
            (settings set for an individual line)
            Can set a line to be skipped or read
            Can have a percent chance it will be read so sometimes it is read and other times not adding randomity to readings


*/
const initialData = [
    {
        content: "Hello this is a line of text, Hello this is a line of text, Hello this is a line of text, Hello this is a line of text, Hello this is a line of text, Hello this is a line of text, Hello this is a line of text, Hello this is a line of text, Hello this is a line of text, Hello this is a line of text",
        open: true, 
    },
    {
        content: "  Hello this is a line of text",
        open: true, 
    },
    {
        content: "  Hello this is a line of text",
        open: true, 
    },
    {
        content: "      Hello this is a line of text",
        open: true, 
    },
    {
        content: "Hello this is a line of text",
        open: true, 
    },
    {
        content: "  Hello this is a line of text",
        open: true, 
    },
]
export default function App (){
    
    const [selectedNoteData, setSelectedNoteData] = useState()

    return (
        <View style={{flex: 1}}>
            {selectedNoteData ? 
                <NoteEditWithTTS selectedNoteData={selectedNoteData} back={()=>setSelectedNoteData()}></NoteEditWithTTS>
                // <NoteEdit selectedNoteData={selectedNoteData} back={()=>setSelectedNoteData()}></NoteEdit>
                :
                <NoteSelector setSelectedNoteData={setSelectedNoteData}></NoteSelector>
            }
        </View>
    )

}
