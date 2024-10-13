import { useState, useEffect, useRef } from "react"
import { ScrollView, View, KeyboardAvoidingView, TouchableOpacity, Text, StyleSheet, Alert, TextInput } from "react-native";
import DataRow from "./DataRow.js"
import { countLeadingTabs } from "./Functions.js"
import AsyncStorage from '@react-native-async-storage/async-storage';
import TextInputTimed from "./Components/TextInputTimed.js"
import { dateString, arrayToText, textToArray } from "./Functions.js"

const testNoteData = [
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
export default function NoteEdit ({back, selectedNoteData}){

    const [data, setData] = useState([...testNoteData])
    const [noteTitle, setNoteTitle] = useState("")
    const [viewingData, setViewingData] = useState([...testNoteData])
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [showMenu, setShowMenu] = useState(false)
    const textInputRefs = useRef([])

    useEffect(()=>{
        if(!selectedNoteData || !selectedNoteData?.id) return

        loadTitle()   
        loadNote() 
    },[selectedNoteData])

    useEffect(()=>{
        setViewingData(data)

        // TODO update the data in the persistant file
        let stringToSave = arrayToText(data)
        // updateData


    },[data])

    // #region 

    // TODO: this currently saves the data just to state, need it to save it to persistant storage somehow (will do that in use effect)
    function updateData(newContent, index){
        if(!index) return
        if(data.length < index) return
        
        let tempData = [...viewingData]
        
        let currentLeadingTabs = countLeadingTabs(tempData[index].content)
        
        tempData[index].content = '\t'.repeat(currentLeadingTabs) + newContent

        updateLastUpdated()
        
        // TODO: update the actual file
        setData(tempData)
    }

    // TODO: updates the lastUpdated attribute of the note meta data in the async storage with to the return value of the dateString function
    async function updateLastUpdated() {
        try {
            // Step 1: Retrieve the current notes from AsyncStorage
            const storedNotes = await AsyncStorage.getItem('notes');
            let existingNotes = storedNotes ? JSON.parse(storedNotes) : [];
    
            // Step 2: Find the note to update based on the provided noteId
            const noteIndex = existingNotes.findIndex(note => note.id === selectedNoteData?.id);
            
            if (noteIndex !== -1) {
                // Step 3: Update the lastUpdated attribute
                existingNotes[noteIndex].lastUpdated = dateString();
    
                // Step 4: Save the updated notes back to AsyncStorage
                await AsyncStorage.setItem('notes', JSON.stringify(existingNotes));
            } else {
                console.error("Note not found");
            }
        } catch (error) {
            console.error('Failed to update last updated timestamp', error);
        }
    }

    async function updateNoteTitle(newTitle) {
        try {
            // Retrieve the existing notes from AsyncStorage
            const storedNotes = await AsyncStorage.getItem('notes');
            let existingNotes = storedNotes ? JSON.parse(storedNotes) : [];
    
            // Find the note with the given ID and update its title
            const noteIndex = existingNotes.findIndex(note => note.id === selectedNoteData?.id);
            if (noteIndex !== -1) {
                existingNotes[noteIndex].title = newTitle;

                // Save the updated notes back to AsyncStorage
                await AsyncStorage.setItem('notes', JSON.stringify(existingNotes));
    
                // Update the state to reflect the changes
                // setNotes(existingNotes);
            } else {
                console.warn(`Note with ID ${selectedNoteData?.id} not found`);
            }
        } catch (error) {
            console.error('Failed to update note title', error);
        }
    }

    async function loadTitle() {
        try {
            // Retrieve the notes from AsyncStorage
            const storedNotes = await AsyncStorage.getItem('notes');
            let notes = storedNotes ? JSON.parse(storedNotes) : [];
        
            // Find the note by its ID
            const note = notes.find(note => note.id === selectedNoteData?.id);
        
            if (note) {
                setNoteTitle(note.title);
            } else {
            console.error(`Note with ID ${selectedNoteData?.id} not found`);
                setNoteTitle("");
            }
        } catch (error) {
            console.error('Failed to load the title', error);
            setNoteTitle("");
        }
    }
      
    // TODO using selectedNoteData load the note from storage
    async function loadNote(){

    }
    // #endregion 

    // #region editing lines 

    // This function removes a tab (indentation) from the beginning of the content (if there is one)
    function tabString(index, left) {
        let indexToTab = index || selectedIndex;
        if (viewingData.length <= indexToTab) return;  // Ensure index is within bounds

        let stringToModify = viewingData[indexToTab].content
        let nSpaces = countLeadingSpaces(stringToModify)

        if (left) {
            // First, get the number of leading spaces
            let spacesToRemove = nSpaces % 4; // If nSpaces is 7, spacesToRemove will be 3
        
            // Find the index of the first non-space, non-tab character
            let firstNonSpaceIndex = findFirstNonSpaceOrTab(stringToModify);
        
            // If there are spaces before the first non-space/tab character, remove up to 4
            if (nSpaces > 0 && spacesToRemove > 0) {
                // Replace up to `spacesToRemove` spaces
                stringToModify = stringToModify.substring(0, firstNonSpaceIndex).replace(new RegExp(` {${spacesToRemove}}`), "") 
                                + stringToModify.substring(firstNonSpaceIndex);
            } else if (nSpaces >= 4) {
                // If there are 4 or more spaces, remove exactly 4 spaces
                stringToModify = stringToModify.replace(/^ {4}/, "");
            } else if (nSpaces === 0) {
                // If no spaces, attempt to remove a tab
                stringToModify = stringToModify.replace("\t", "");
            }
        
        }else{
            let unevenSpaces = nSpaces % 4 // So if there are 7 spaces this will remove 3
            let spacesToAdd = 4 - unevenSpaces
            
            if(spacesToAdd > 0){
                stringToModify = " ".repeat(spacesToAdd) + stringToModify
            }
            else{
                stringToModify = "\t" + stringToModify
            }
        }

        let tempData = [...viewingData]
        tempData[indexToTab].content = stringToModify
        setData(tempData)

    }
    function findFirstNonSpaceOrTab(str) {
        for (let i = 0; i < str.length; i++) {
            if (str[i] !== ' ' && str[i] !== '\t') {
                return i;
            }
        }
        return -1; // Return -1 if no non-space or tab character is found
    }
    function countLeadingSpaces(str) {
        let firstNonSpaceIndex = findFirstNonSpaceOrTab(str); // Find where the first non-space/tab character is
        let leadingSpaces = 0;
    
        // Count the number of spaces in the substring before the first non-space/tab character
        for (let i = 0; i < firstNonSpaceIndex; i++) {
            if (str[i] === ' ') {
                leadingSpaces++;
            }
        }
    
        return leadingSpaces; // Return the number of leading spaces
    }

    // Move// Moves the selected index up in the array
    function moveRow(moveDirection = -1, index) {
        // The index of the object to move
        let fromIndex = index || selectedIndex;
        if (fromIndex < 0 || fromIndex > viewingData.length) return;  // Ensure it's not the first element
        
        // Get the index to move the selected index to 
        const toIndex = fromIndex + moveDirection
        if (toIndex < 0 || toIndex > viewingData.length) return;  // Ensure it's not the first element

        // Swap the two
        let tempData = [...viewingData];
        const [item] = tempData.splice(fromIndex, 1);
        tempData.splice(toIndex, 0, item);

        setData(tempData);  // Update the state with the new data array

        // Set the selectedIndex state to the new index
        setSelectedIndex(toIndex)

        // Focus on the row at the index the object was moved to 
        // focusOnRow(toIndex)

 
    }
    function openCloseRow(index, setToOpen) {
        let tempData = [...viewingData]; // Create a copy of the current data
        if (tempData[index]) {
            tempData[index].open = setToOpen; // Set the open property based on the argument
            setData(tempData); // Update the state with the modified data
        }
    }

    // Asks the user if they want to delete the row and if so deletes it
    function deleteRow(index) {
        let indexToDelete = index || selectedIndex;
        if (indexToDelete < 0 || indexToDelete >= viewingData.length) return;  // Ensure index is within bounds


        Alert.alert(
          "Delete Row",
          "Are you sure you want to delete this row?",
          [
            {
              text: "Cancel",
              style: "cancel"
            },
            {
              text: "Delete",
              onPress: () => {
                let tempData = [...viewingData];
                tempData.splice(indexToDelete, 1);  // Remove the selected row

                setData(tempData);

                // Adjust selectedIndex after deletion
                if (indexToDelete >= tempData.length) {
                    setSelectedIndex(tempData.length - 1);  // Move the selection to the last item if the last was deleted
                } else {
                    setSelectedIndex(indexToDelete);  // Stay at the same position
                }
              }
            }
          ],
          { cancelable: true }
        );
    }
    function addRow(index) {
        let indexToAdd = index || selectedIndex;
        if (indexToAdd < 0 || indexToAdd > viewingData.length) return;  // Ensure index is within bounds
    
        let tempData = [...viewingData];
    
        // Get the content of the selected row to preserve indentation
        const selectedContent = tempData[indexToAdd]?.content || "";
        
        // Determine the number of tabs/spaces at the beginning
        const tabsCount = countLeadingTabs(selectedContent);
    
        // Create a new data object for the new row with preserved indentation
        const indentation = '\t'.repeat(tabsCount); // Create a string of tabs
        const newRow = { content: indentation+"", id: Date.now(), open: true }; // New row with same indentation
    
        // Insert the new row at the specified index
        tempData.splice(indexToAdd + 1, 0, newRow);  // Insert after the selected row
        setData(tempData);  // Update the state with the new data array
        setSelectedIndex(indexToAdd + 1)

         // Focus on the new TextInput using the unique ID
        setTimeout(() => {
            const newRowIndex = indexToAdd + 1; // Calculate the index of the new row
            if (textInputRefs.current[newRowIndex]) {
                textInputRefs.current[newRowIndex].focus(); // Focus the new TextInput
            }
        }, 0); // Ensure the focus is set after rendering
    }
    
    // #endregion editing lines 
    

    return (
        <View style={{marginTop: 40, flex: 1, backgroundColor: '#f4f4f4',}}>
            <KeyboardAvoidingView keyboardVerticalOffset={80} style={{marginBottom: 40}}>
                
                {/* Top bar with title and back butotn */}
                <View style={{borderBottomWidth: 1, borderBottomColor: "black", borderTopWidth: 1, borderTopColor: "black", marginBottom: 10, flexDirection: "row"}}>
                    <TouchableOpacity onPress={back} style={{width: 50, borderRightWidth: 1, borderRightColor: "black"}}>
                        <Text style={{textAlign: "center"}}>{"<-"}</Text>
                    </TouchableOpacity>
                    <TextInputTimed placeholder={"Note Title"} defaultValue={noteTitle} style={{ paddingLeft: 20, }} onChangeText={value=>updateNoteTitle(value)}></TextInputTimed>
                </View>

                <ScrollView>
                    {viewingData.map((dataObject, index) => (
                        <DataRow 
                            dataObject={dataObject} 
                            index={index} 
                            updateData={updateData}
                            setSelectedIndex={setSelectedIndex}
                            ref={(el) => (textInputRefs.current[index] = el)} // Assign ref
                            viewingData={viewingData}
                            openCloseRow={openCloseRow}
                            key={"data-row-"+index}
                            selectedIndex={selectedIndex}
                        ></DataRow>
                    ))}
                </ScrollView>
            </KeyboardAvoidingView>
            
            {/* Menu */}
            {/* Menu */}
            {showMenu && 
                <View 
                    style={{
                        position: "absolute",
                        right: 0,
                        bottom: 45,
                        height: "100%",
                        backgroundColor: "grey",
                        width: 250,
                        zIndex: 3,
                        marginTop: 150, 
                    }}
                >
                 
                </View>
            }
            
            {/* Bottom Butons */}
            <View style={styles.bottomButtonContainer}>
                <TouchableOpacity onPress={()=>deleteRow()} style={styles.bottomButton}>
                    <Text style={styles.bottomButonText}>X</Text>
                </TouchableOpacity>
                {/* <TouchableOpacity onPress={()=>tabLeft()} style={styles.bottomButton}> */}
                <TouchableOpacity onPress={()=>tabString(selectedIndex, true)} style={styles.bottomButton}>
                    <Text style={styles.bottomButonText}>{"<"}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>tabString(selectedIndex)} style={styles.bottomButton}>
                {/* <TouchableOpacity onPress={()=>tabRight()} style={styles.bottomButton}> */}
                    <Text style={styles.bottomButonText}>{">"}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>addRow()} style={styles.bottomButton}>
                    <Text style={styles.bottomButonText}>{"+"}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>moveRow()} style={styles.bottomButton}>
                    <Text style={styles.bottomButonText}>▲</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>moveRow(1)} style={styles.bottomButton}>
                    <Text style={styles.bottomButonText}>▼</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>setShowMenu(!showMenu)} style={styles.bottomButton}>
                    <Text style={styles.bottomButonText}>≡</Text>
                </TouchableOpacity>
            </View>

        </View>
    )

}

const styles = StyleSheet.create({
    bottomButtonContainer: {
        flexDirection: "row",
        justifyContent: "center",
        position: "absolute",
        bottom: 0,
        borderTopWidth: 1, // Set the width of the top border
        borderTopColor: "black", // Set the color of the top border
        backgroundColor: "white",
        flex: 1,
        width: "100%",
        paddingBottom: 5,
    },  
    bottomButton: {
        backgroundColor: "lightblue",
        borderRadius: 5,
        padding: 5,
        margin: 5,
        minWidth: 40,
    },
    bottomButonText: {
        textAlign: "center",
    }
})
