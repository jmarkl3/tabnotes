import React, { useState, forwardRef, useRef, useEffect } from "react";
import { shouldDisplayRow, hasNestedRows, countLeadingTabs,countDigits } from "./Functions.js"
import { TextInput, View, TouchableOpacity, Text, StyleSheet, TouchableWithoutFeedback  } from "react-native";
import TextInputTimed from "./Components/TextInputTimed.js"

const DataRow = forwardRef(({ dataObject, index, setSelectedIndex, viewingData, openCloseRow, selectedIndex, updateData }, ref) => {
  // Count leading tabs and spaces for visual indentation
  const leadingTabs = countLeadingTabs(dataObject?.content || "");

  // Calculate the indent based on the number of tabs and spaces
  const indentWidth = (((leadingTabs) * 20)) + 15 + (countDigits(index + 1) * 8); // 20px per tab or 4 spaces

  // Check if this row should be displayed
  const displayRow = shouldDisplayRow(viewingData, index);

    const textInputRef = useRef()

    useEffect(()=>{
        if(selectedIndex == index){
            textInputRef.current.focus()
            setTimeout(()=>{
                textInputRef?.current?.setNativeProps({ selection: { start: 0, end: 0 } }); // Set the cursor at the beginning
            }, 100)

        }
    },[selectedIndex])

  // returns text with all of the tabs or spaces that are in intervals of 4 removed from the beginning
  function tabRemovedText(text) {
    // Regular expression to match tabs or groups of 4 spaces at the beginning of the string
    let regex = /^(?:\t| {4})+/;
    return text.replace(regex, "");
  }

  if (!displayRow) {
    return null; // Return null to hide the row
  }

  return (
        <View style={styles.container}>
            <Text style={{...styles.lineNumber, marginTop: 3}}>{(index + 1) + ": "}</Text>
            <TouchableOpacity  onPress={()=>{setSelectedIndex(index)}} style={{flex: 1 }}>
                {/* <TextInput
                    defaultValue={tabRemovedText(dataObject?.content)}

                    style={[styles.textInput, { marginLeft: indentWidth,}]} // Indent based on tabs and spaces
                    multiline={true} // Allows the text to extend downward
                    onPressIn={() => setSelectedIndex(index)}
                    ref={textInputRef}
                    onChange={e => updateData(e.nativeEvent.text, index)}
                    // ref={ref} // Attach ref here
                /> */}
                <TextInput
                    defaultValue={tabRemovedText(dataObject?.content)}
                                        // defaultValue={tabRemovedText(dataObject?.content)+" "+countLeadingTabs(dataObject?.content)}
                    // defaultValue={tabRemovedText(dataObject?.content)+" "+countLeadingTabs(dataObject?.content)+" "+index}
                    style={[styles.textInput, { marginLeft: indentWidth,}]} // Indent based on tabs and spaces
                    multiline={true} // Allows the text to extend downward
                    onPressIn={() => setSelectedIndex(index)}
                    ref={textInputRef}
                    onChangeText={value => updateData(value, index)}
                />
            </TouchableOpacity>
            {hasNestedRows(viewingData, index) && 
                <TouchableOpacity 
                    onPress={()=>openCloseRow(index, !dataObject?.open)}
                    style={{position: "absolute", right: 10, top: 2, height: 25, width: 25}}
                >
                    <Text style={{textAlign: "center", paddingTop: 3}}>
                        {dataObject?.open ? "▲":"▼"}
                    </Text>
                </TouchableOpacity>
            }
        </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row", // Arrange items in a row
    alignItems: "center", // Align items vertically centered
  },
  lineNumber: {
    position: "absolute", 
    top: 0,
    left: 2, // Leave space for the button
    zIndex: 2,
    paddingLeft: 5,
  },
  textInput: {
    flex: 1, // Take up the remaining width
    paddingTop: 0,
    marginVertical: 0,
    margin: 0,
    marginRight: 20,
    minHeight: 30,
  },
});

export default DataRow;
