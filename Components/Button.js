import {Text, TouchableOpacity, View } from "react-native"

export default function Button({children, text, style, textStyle, onPress = ()=>{}}){
    return (
        <TouchableOpacity onPress={onPress} style={style}>
            <Text style={{textAlign: "center", width: "100%", paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: "black", ...textStyle}}>{text || children}</Text>
        </TouchableOpacity>
    )
}