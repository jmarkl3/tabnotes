import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function Section({ section, breadcrumb, toggleBreadcrumb, updateContent, level = 0, setSelectedSection}) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  function pressedSection(sectionID){
    console.log("pressed section", sectionID)
  }
  return (
    <TouchableOpacity onPress={()=>pressedSection(section.id)} style={{}}>

        <View style={[styles.sectionContainer, ]}>
        {/* Row for Circle and Arrow */}
        {/* <View style={styles.iconRow}> */}
            {/* Left Circle for Breadcrumb */}
            <TouchableOpacity style={styles.circle} onPress={() => toggleBreadcrumb(section)}>
            <Text style={styles.circleText}>•</Text>
            </TouchableOpacity>

            {/* Conditionally render Right Arrow to Toggle Subcontent */}
            {section.children && section.children.length > 0 && (
            <TouchableOpacity onPress={toggleOpen} style={styles.arrow}>
                <Text>{isOpen ? '▼' : '▶'}</Text>
            </TouchableOpacity>
            )}
        {/* </View> */}

        {/* Content Input */}
        <TextInput
            style={styles.contentInput}
            value={section.content}
            onPressIn={()=>setSelectedSection(section.id)}
            onChangeText={(text) => updateContent(section.id, text)}
            placeholder="Enter content"
            multiline
        />

        {/* Subcontent Display */}
        {isOpen && (
            <View style={styles.subContent}>
            {/* Render Subsections with increased level */}
            {section.children && section.children.map((child) => (
                <Section
                    key={child.id}
                    section={child}
                    breadcrumb={breadcrumb}
                    toggleBreadcrumb={toggleBreadcrumb}
                    updateContent={updateContent}
                    level={level + 1}
                    setSelectedSection={setSelectedSection}
                />
            ))}
            </View>
        )}
        </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    // marginBottom: 10,
    backgroundColor: "#f0f0f0",
    paddingLeft: 10,
    borderRadius: 5,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    position: "absolute",
    top: 5,
    left: 5,
    zIndex: 2,
  },
  circleText: {
    color: 'white',
    fontSize: 12,
  },
  arrow: {
    fontSize: 18,
    position: "absolute",
    top: 5,
    right: 5,
    zIndex: 2,
    height: 30,
    width: 30,
  },    
  contentInput: {
    flex: 1,
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingHorizontal: 0, // Keep this for horizontal padding
    paddingVertical: 0, // Set this to 0 to remove vertical padding
    marginTop: 0, // Ensure no additional margin at the top
    // backgroundColor: "blue",
    marginLeft: 20,
    marginRight: 20,
  },
  subContent: {
    // paddingTop: 10,
    paddingLeft: 10,
  },
});
