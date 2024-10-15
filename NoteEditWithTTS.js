import { useState, useEffect, useRef } from "react"
import { ScrollView, View, KeyboardAvoidingView, TouchableOpacity, Text, StyleSheet, Alert, TextInput } from "react-native";
import { countLeadingTabs } from "./Functions.js"
import AsyncStorage from '@react-native-async-storage/async-storage';
import TextInputTimed from "./Components/TextInputTimed.js"
import { dateString, arrayToText, textToArray } from "./Functions.js"
import DataRow from "./DataRow.js"
import Button from "./Components/Button.js"
import * as FileSystem from 'expo-file-system';
// import * as RNFS from 'react-native-fs';
// import RNFS from 'react-native-fs';
import * as Clipboard from 'expo-clipboard';
import * as Speech from 'expo-speech'; // TTS module from Expo
 
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
let emptyLine =   {
    content: "",
    open: true, 
}
export default function NoteEditWithTTS ({back, selectedNoteData}){

    const [data, setData] = useState([emptyLine])
    const [noteTitle, setNoteTitle] = useState("")
    const [viewingData, setViewingData] = useState([...testNoteData])
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [showMenu, setShowMenu] = useState(false)
    
    const [showImporter, setShowIporter] = useState()
    const [importerText, setImporterText] = useState()
    const textInputRefs = useRef([])
    const textInporterRef = useRef([])

    useEffect(()=>{
        if(!selectedNoteData || !selectedNoteData?.id) return

        loadTitle()   
        loadNote() 
    },[selectedNoteData])

    useEffect(()=>{
        // This updates the viewing data based on the new data, the viewing data is what is displayed 
        setViewingData(data)

        // TODO: put this on a times with a ref for the data and timout so it only updates on app close or after a second of inactivity, so it is not constantly updating
        updateStorage(data)

        // TODO update the data in the persistant file
        // let stringToSave = arrayToText(data)
        // updateData


    },[data])

    // #region Storage: loading and updating

    // TODO: this currently saves the data just to state, need it to save it to persistant storage somehow (will do that in use effect)
    function updateData(newContent, index){
        if(index !== 0 && !index) return
        if(data.length < index) return
        
        let tempData = [...viewingData]
        
        let currentLeadingTabs = countLeadingTabs(tempData[index].content)
        
        tempData[index].content = '\t'.repeat(currentLeadingTabs) + newContent

        setData(tempData)
    }

    // This saves the array into app storage, this is in a different place than the meta data
    async function updateStorage(newData){
        let processedArray = processArray(newData)
        // console.log("saving: ", processedArray)
        try {
            await AsyncStorage.setItem('note-'+selectedNoteData.id, processedArray);
        }
        catch{
            console.error("Error loading note with id: "+selectedNoteData.id)
        }

        // The last updated datetime in metadata is used to sort notes in the note selector page
        updateLastUpdated()

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
      
    async function loadNote(){
        try {
            const retrievedDataString = await AsyncStorage.getItem('note-'+selectedNoteData.id);
            let processedData = processArrayReverse(retrievedDataString)
            // console.log("loaded: ", processedData)
            setData(processedData) 
        } catch (error) {
            console.error('Error loading data from storage:', error);
            return null;
        }

    }

    function processArray(array){
        if(!array || !Array.isArray(array)) return "[]"
        return JSON.stringify(array);
    }
    function processArrayReverse(loadedString){
        if(!loadedString) return [emptyLine]
        return JSON.parse(loadedString)
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

        let tempData = [...viewingData];
        tempData.splice(indexToDelete, 1);  // Remove the selected row

        setData(tempData);
        return

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
    
    // #region Extra functions
    /*
        LOG  File path: file:///data/user/0/host.exp.exponent/files/Download/exportedFile.txt
        ERROR  Error exporting file: [Error: Call to function 'ExponentFileSystem.writeAsStringAsync' has been rejected.
        → Caused by: java.io.FileNotFoundException: /data/user/0/host.exp.exponent/files/Download/exportedFile.txt: open failed: ENOENT (No such file or directory)]

    */

    async function copyAllToClipboard(){
        let textFromArrays = data.map(dataObject => dataObject.content).join("\n");
        await Clipboard.setStringAsync(textFromArrays)
    }
    async function viewAllAsPlainText(){

    }
    function importFromPlainText(text){

    }
    function importAdditionalFromPlainText(text){

    }

    async function exportFile() {
        console.log("in export file");
    
        try {
            // Prepare text content from your data
            let textFromArrays = data.map(dataObject => dataObject.content).join("\n");
            console.log("textFromArrays: \n", textFromArrays);
    
            // Create a valid file name
            const fileName = `note_${selectedNoteData.id}_${dateString()}.txt`;
    
            // Define the path for the app's document directory
            // const fileUri = `${FileSystem.documentDirectory}${fileName}`;
            // const fileUri = `${RNFS.DocumentDirectoryPath}${fileName}`;
            // const fileUri = `${FileSystem.documentDirectory}Download/exportedFile.txt`;

            // console.log("File path:", fileUri);
    
            // Write the file to the app's document directory
            // await FileSystem.writeAsStringAsync(fileUri, textFromArrays);
            // RNFS.wri?teFile(fileUri, textFromArrays, 'utf8')
            // // Write the file
            // await FileSystem.writeAsStringAsync(fileUri, textFromArrays, {
            //     encoding: FileSystem.EncodingType.UTF8
            // });

            await Clipboard.setStringAsync(textFromArrays)

            // console.log(`File successfully exported to: ${filePath}`);
    
                // // Share the file to allow access (e.g., to save it in Downloads)
                // await Sharing.shareAsync(filePath);
        } catch (error) {
            console.error('Error exporting file:', error);
        }
    }

    // Instead of converting it to a readable text file this exports it as a stringified array that can be loaded back in with the meta data of the lines, can also be processed before exporting it
    async function exportDataToFile(){
        try {
            // Convert the note data to a string format (assuming noteData is an object)
            const fileContent = JSON.stringify(noteData, null, 2); // Pretty-printed JSON
    
            // Define the path where the file will be saved
            // const filePath = `${RNFS.DownloadDirectoryPath}/note_${selectedNoteData.id}_${dateString()}.txt`;
    
            // Write the file
            // await RNFS.writeFile(filePath, fileContent, 'utf8');
    
            console.log(`File exported to: ${filePath}`);
        } catch (error) {
            console.error('Error exporting file:', error);
        }
    }
    

 

    function openViewer(){
        let textFromArrays = data.map(dataObject => dataObject.content).join("\n");
        setImporterText(textFromArrays || "")
        setShowIporter(true)
        setShowMenu()
    }
    function openImporter(){
        setImporterText("")
        setShowIporter(true)
        setShowMenu()
    }
       
    // Copies the text from the input form and converts it into anaarray, which it appends to the current array
    function importFromText(){

        const lines = importerText.split('\n');

        // Convert each line into an object with content and open status
        const newItems = lines.map(line => ({
            content: line, 
            open: true
        }));

        // Filter out any empty lines
        // const filteredItems = newItems.filter(item => item.content);


        // Append the new items to the current array
        let tempData = [...data]
        tempData = [...tempData, ...newItems]
        console.log("updated data: ", tempData)
        setData(tempData)

    }
    async function copyFromImporter(){
        await Clipboard.setStringAsync(importerText || "");
    }

    async function copyToClipboard(){
        let textFromArrays = data.map(dataObject => dataObject.content).join("\n");
        await Clipboard.setStringAsync(textFromArrays || "");
    }

    function foldAll(){
        let tempData = []
        data.forEach(lineObject => {
            let toAdd = {...lineObject}
            toAdd.open = false
            tempData.push(toAdd)
        })
        setData(tempData)
    }
    function openAll(){
        let tempData = []
        data.forEach(lineObject => {
            let toAdd = {...lineObject}
            toAdd.open = true
            tempData.push(toAdd)
        })
        setData(tempData)
    }

    // #endregion 


    // #region TTS

    const isPlayingRef = useRef()
    const speakingIndex = useRef(0)

    function startTTS(){
        // If its already running stop it
        if(isPlayingRef.current){
            pauseTTS() 
        }
        // Set the starting index and the playintRef flag variable
        speakingIndex.current = 0
        isPlayingRef.current = true

        speakLine()

    }
    function startTTSFromCurrentRow(){
        // If its already running stop it
        if(isPlayingRef.current){
            pauseTTS()
        }

        // Set the starting index and the playintRef flag variable
        speakingIndex.current = selectedIndex
        isPlayingRef.current = true
        
        speakLine()
    }
    function pauseTTS(){
        isPlayingRef.current = false
        Speech.pause()
        Speech.stop()
    }
    function speakLine(){
        let textToSpeak
        if(speakingIndex.current > data.length)
            speakingIndex = 0
        
        textToSpeak = data[speakingIndex.current].content
        
        speakText(textToSpeak)

        // speakingIndex.current++

    }

    function speakText(textToSpeak = "hello"){

        Speech.speak(textToSpeak, {
            onDone: () => {
                if (isPlayingRef.current) {
                    // A 2 second timer between
                    setTimeout(()=>{
                        speakingIndex.current++;
                        speakLine(); // Continue reading the next line
                    },2000)
                }
            }
        });
        return


        Speech.speak(textToSpeak, {
            language: 'en',
            pitch: 1.0,
            rate: 1.0,
          });


    }
    // #region TTS
    return (
        <View style={{marginTop: 40, flex: 1, backgroundColor: '#f4f4f4',}}>
            <KeyboardAvoidingView keyboardVerticalOffset={120} style={{marginBottom: 80, paddingBottom: 20}}>
                
                {/* Top bar with title and back butotn */}
                <View style={{borderBottomWidth: 1, borderBottomColor: "black", borderTopWidth: 1, borderTopColor: "black", marginBottom: 10, flexDirection: "row"}}>
                    <TouchableOpacity onPress={back} style={{width: 50, borderRightWidth: 1, borderRightColor: "black"}}>
                        <Text style={{textAlign: "center"}}>{"<-"}</Text>
                    </TouchableOpacity>
                    <TextInput placeholder={"Note Title"} defaultValue={noteTitle} style={{ paddingLeft: 20, }} onChangeText={value=>updateNoteTitle(value)}></TextInput>
                </View>

                <ScrollView style={{}}>
                    {viewingData.map((dataObject, index) => (
                        <DataRow 
                            dataObject={dataObject} 
                            index={index} 
                            updateData={updateData}
                            setSelectedIndex={setSelectedIndex}
                            ref={(el) => (textInputRefs.current[index] = el)} // Assign ref
                            viewingData={viewingData}
                            openCloseRow={openCloseRow}
                            key={"note-"+selectedNoteData.id+"-row-"+index}
                            selectedIndex={selectedIndex}
                        ></DataRow>
                    ))}
                </ScrollView>
            </KeyboardAvoidingView>
            
            {/* Menu */}
            {showMenu && 
                <View 
                    style={{
                        position: "absolute",
                        right: 0,
                        bottom: 45,
                        height: "100%",
                        paddingTop: 40,
                        backgroundColor: "white",
                        borderColor: "black",
                        borderWidth: 1,
                        width: 250,
                        zIndex: 3,
                        marginTop: 150, 
                    }}
                >
                    <View style={{ borderBottomWidth: 1, borderBottomColor: "black", paddingBottom: 5 }}><Text style={{textAlign: "center"}}>Note Menu</Text></View>
                    <Button onPress={copyToClipboard}>Copy To clipboard</Button>
                    <Button onPress={openViewer}>View As Text</Button>
                    <Button onPress={openImporter}>Import From Text</Button>
                    <Button onPress={foldAll}>Fold All</Button>
                    <Button onPress={openAll}>Open All</Button>
                    <Button onPress={()=>speakText()}>Speak</Button>
                    <Button onPress={()=>startTTS()}>Start TTS (From Start)</Button>
                    <Button onPress={()=>startTTSFromCurrentRow()}>Start TTS (From Current Line)</Button>
                    <Button onPress={()=>pauseTTS()}>Pause TTS</Button>
                    <Button onPress={()=>setShowMenu()}>Close Menu</Button>
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
            
            {showImporter && 
                <View
                    style={{
                        position: "absolute",
                        height: 500,
                        width: "90%",
                        backgroundColor: "white",
                        borderColor: "black",
                        borderWidth: 1,
                        top: "5%",
                        left: "5%",
                        borderRadius: 10,
                        overflow: "hidden",
                    }}
                >
                    <TextInput
                        defaultValue={importerText}
                        multiline
                        style={{
                            height: 410,
                            padding: 5,
                            borderBottomColor: "black",
                            borderBottomWidth: 1,
                        }}
                        ref={textInporterRef}
                        onChangeText={setImporterText}
                    ></TextInput>
                    <Button onPress={()=>setShowIporter()}>Close</Button>
                    {/* Copy this from the text input instead of just the arrray */}
                    <Button onPress={copyFromImporter}>Copy</Button>
                    <Button onPress={importFromText}>Import</Button>
                </View>
            }
            
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
