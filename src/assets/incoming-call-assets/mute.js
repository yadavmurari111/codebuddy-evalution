import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { Line, Path, Rect, Svg } from 'react-native-svg'
import Animated, { Easing, interpolate, useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated'
const AnimatedLine = Animated.createAnimatedComponent(Line)
const Mute = () => {
    const rWidth = 30
    const rHeight = 55
    const rX = 50 - (rWidth / 2)
    const rY = rWidth / 2
    const pathY = rY + (rHeight * 0.6)
    const standWidth = 10
    const standHeight = 10
    const standX = 50 - (standHeight / 2)
    const standY = 75
    const color = 'grey'
    const animatedValue = useSharedValue(0)
    const animatedProps = useAnimatedProps(() => {
        const animateLine = interpolate(animatedValue.value, [0, 1], [90, 10])
        return {
            x2: animateLine,
            y2: animateLine,
        }
    })


    return (
        <TouchableOpacity activeOpacity={1} style={{ width: '100%', height: '100%', padding: 15 }} onPress={() => {
            let val = Number(!Boolean(animatedValue.value))
            animatedValue.value = withTiming(val, { duration: 300, easing: Easing.elastic(0.9) })
        }}>
            <Svg viewBox='0 0 100 100'>
                <Rect fill={color} x={rX} y={10} ry={rY} width={rWidth} height={rHeight} />
                <Path d={`M${rX - 8},${pathY} C27,80 73,80 ${rX + rWidth + 8},${pathY}`} fill={'none'} stroke={color} strokeWidth={7} />
                <Rect fill={color} x={standX} y={standY} width={standWidth} height={standHeight} />
                <Rect fill={color} x={standX - 10} y={standY + (standHeight)} ry={(standHeight - 2) / 2} width={30} height={standHeight - 2} />
                <AnimatedLine animatedProps={animatedProps} x1={10} y1={10} stroke={color} strokeWidth={7} />
            </Svg>
        </TouchableOpacity>
    )
}

export default Mute