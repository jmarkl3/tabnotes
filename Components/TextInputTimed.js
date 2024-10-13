import { useRef, forwardRef } from "react";
import { TextInput } from "react-native";

// const DataRow = forwardRef(({ dataObject, index, setSelectedIndex, viewingData, openCloseRow, selectedIndex, updateData }, ref) => {

const TextInputTimed = forwardRef(({onChangeText, style, placeholder, defaultValue, multiline, onPressIn}, ref) => {
    
    const timerRef = useRef()
    function textChanged(newText){
        
        if(timerRef.current)
            clearTimeout(timerRef)
        
        timerRef.current = setTimeout(()=>{
            onChangeText(newText)
        },500)
    }

    return (
        <TextInput 
            style={style}
            onChangeText={value=>textChanged(value)}
            placeholder={placeholder}
            defaultValue={defaultValue}
            multiline={multiline}
            ref={ref} 
            onPressIn={onPressIn}
        ></TextInput>
    )
})
export default TextInputTimed