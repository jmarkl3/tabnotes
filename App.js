import { useState, useEffect, useRef } from "react"
import { ScrollView, View, KeyboardAvoidingView, TouchableOpacity, Text, StyleSheet, Alert } from "react-native";
import DataRow from "./DataRow.js"
import { countLeadingTabs } from "./Functions.js"
import NoteEdit from "./NoteEdit.js";
import NoteSelector from "./NoteSelector.js";

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
                <NoteEdit selectedNoteData={selectedNoteData} back={()=>setSelectedNoteData()}></NoteEdit>
                :
                <NoteSelector setSelectedNoteData={setSelectedNoteData}></NoteSelector>
            }
        </View>
    )

}
