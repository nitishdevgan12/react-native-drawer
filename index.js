import React from 'react';
import {
    Animated,
    Dimensions,
    TouchableOpacity,
    Platform,
    View,
    FlatList,
    Text
} from 'react-native';
import PropTypes from 'prop-types';
import MAIcon from 'react-native-vector-icons/MaterialIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {getStatusBarHeight} from './IPhoneXHelper';
import { isIphoneX } from '../../src/utilities/IPhoneXHelper';
const { width, height } = Dimensions.get('window')
const HEADER_HEIGHT = Platform.select({
    ios:  isIphoneX() ? 80 : 60,
    android: 50
})
export default class Header extends React.PureComponent {
    constructor(props){
        super(props);
        this.rotation = new Animated.Value(-90);
        this.state = {
        open: false,
        buttonDisabled: false,
        prevoiusSelectedIndex: 0,
        drawerData: [],
        }
    }
    onToggle = () => {
        const { open } = this.state
        if (!open) {
            this.setState(() => ({ open: true, buttonDisabled: true }), () => {
                this.props.willOpen()
                this.open()
            })
        } else {
            this.setState({buttonDisabled: true});
            this.props.willClose()
            this.close()
        }
    }
    open = () => {
        const { openFriction, openTension, openSpeed, openBounciness } = this.props
        const rotationAnimation = Animated.spring(this.rotation, {
            toValue: 0,
            useNativeDriver: true,
            friction: openFriction,
            tension: openTension,
            speed: openSpeed,
            bounciness: openBounciness
        })
        rotationAnimation.start(() => { () => this.setState({buttonDisabled: false}),() => this.props.didOpen()})
    }
    close = () => {
        const { closeFriction, closeTension, closeSpeed, closeBounciness } = this.props
        const rotationAnimation = Animated.spring(this.rotation, {
            toValue: -90,
            useNativeDriver: true,
            friction: closeFriction,
            tension: closeTension,
            speed: closeSpeed,
            bounciness: closeBounciness
        })
        rotationAnimation.start(() => {
            this.setState(() => ({ open: false, buttonDisabled: false }), () => {
                this.props.didClose()
            })
        })
    }
    onPressItem = (item) => {
        const { drawerData, prevoiusSelectedIndex } = this.state;
        const index = drawerData.findIndex((drawerItem) => (drawerItem.text === item.text));
        const selectedItem = drawerData[index];
        const previousSelectedItem = drawerData[prevoiusSelectedIndex];
        if (index > -1 && !selectedItem.isSelected) {
        previousSelectedItem.isSelected = false;   
        selectedItem.isSelected = true;
        }
        this.setState({drawerData, prevoiusSelectedIndex: index});
        this.onToggle();
        this.props.onPressDrawerItem(item);
    }
    componentDidMount(){
        const { renderContent } = this.props;
        if(Array.isArray(renderContent)){
        const drawerData = renderContent.map((item,index) => {
            if (index === 0) return { ...item, isSelected: true };
            return { ...item, isSelected: false };
        });
        this.setState({ drawerData });
    }
    }
    renderItem = ({ item }) => {
       return <TouchableOpacity style={{height: 45, flex: 1}} onPress={() => this.onPressItem(item)}>
     <View style={{height: 45, flex: 1,flexDirection: 'row',justifyContent: 'flex-start', alignItems: 'center'}}>
            <MaterialIcons name={item.iconName} color={item.isSelected ? this.props.selectedItemTextColor :this.props.unselectedItemTextColor } size={26}/>
          <Text style={{ fontSize: 16, color: item.isSelected ? this.props.selectedItemTextColor :this.props.unselectedItemTextColor, fontWeight: '600', paddingLeft: 15 }}>{item.text}</Text>
        </View>
        </TouchableOpacity>
    }
    renderDrawerContent = () => {
        return <View style={{flex: 1,alignItems: 'center', backgroundColor: '#3F3C4C'}}>
        <View style={{flex: 1,alignItems: 'stretch',justifyContent:'center', position: 'absolute', top: 120 }}>
          <FlatList 
            extraData={this.state}
            data={this.state.drawerData}
            renderItem={this.renderItem}
            keyExtractor={(item) => item.text}
          />
        </View>
      </View>
    }
    checkCustomizationDrawer = () => {
        const { renderContent } = this.props;
        if(Array.isArray(renderContent)){
        return renderContent.length > 0 ? this.renderDrawerContent() : null
        }
        return renderContent ? renderContent() : null;
    }
    render() {
        const { open } = this.state
        const { headerHeight, openButtonStyle, closeButtonStyle, openedHeaderStyle, closedHeaderStyle,
            openedHeaderContent, defaultOpenButtonIconColor, defaultCloseButtonIconColor, title,
            titleStyle, defaultOpenButtonIconSize, defaultCloseButtonIconSize, openButtonPosition, closeButtonPosition } = this.props
        const rotation = this.rotation.interpolate({
            inputRange: [-90, 0],
            outputRange: ['-90deg', '0deg']
        })
        const paddingTop = this.rotation.interpolate({
            inputRange: [-90, 0],
            outputRange: [-height, -height - headerHeight / 2]
        })
        const paddingLeft = this.rotation.interpolate({
            inputRange: [-90, 0],
            outputRange: [-width - headerHeight / 2, -width - headerHeight]
        })
        const openButtonContent = <MAIcon name="menu" size={defaultOpenButtonIconSize} color={defaultOpenButtonIconColor} />
        const closeButtonContent = <MAIcon name="close" size={defaultCloseButtonIconSize} color={defaultCloseButtonIconColor} />
        const openButton = (
            <View style={{ ...openButtonStyle, position: 'absolute', transform: [{ rotate: '90deg' }] }}>
                <TouchableOpacity style={{ padding: 12 }} disabled={this.state.buttonDisabled} onPress={this.onToggle}>
                    {this.props.openButtonContent || openButtonContent}
                </TouchableOpacity>
            </View>
        )
        const closeButton = (
            <TouchableOpacity  onPress={this.onToggle} style={{ ...closeButtonStyle, padding: 10, marginLeft: closeButtonPosition == 'left' ? 14 : width - 42, marginTop: isIphoneX() ? getStatusBarHeight() : 18 }}>
                {this.props.closeButtonContent || closeButtonContent}
            </TouchableOpacity>
        )
        const titleComponent = title ? (
            <View style={{ transform: [{ rotate: '90deg' }] }}>
                <Text style={{ fontSize: 18, color: '#000', ...titleStyle, width: width + headerHeight / 2, textAlign: 'center', paddingTop: isIphoneX() ? getStatusBarHeight() : 5 }}>{title}</Text>
            </View>
        ) : null
        return (
            <Animated.View style={{ backgroundColor: 'transparent',position: 'absolute', top: 0, left: 0, maxHeight: open ? height : headerHeight + 5, overflow: 'hidden' }}>
                <Animated.View style={{ height: height * 2 + headerHeight, width: width * 2 + headerHeight, transform: [{ translateY: paddingTop }, { translateX: paddingLeft }, { rotate: rotation }] }}>
                    <View style={{ flex: 1 }} />
                    <View style={{ flex: 1, flexDirection: 'row' }}>
                        <View style={{ flex: 1 }} />
                        <View style={{ width: headerHeight }}>
                            <View style={{ ...styles.header, ...styles.closedHeader, ...closedHeaderStyle, flex: 1, height: width }}>
                                {titleComponent}
                                {openButton}
                            </View>
                        </View>
                        <View style={{ flex: 1, backgroundColor: "#fff" }}>
                            <View style={{ flex: 1 }}>
                                {this.checkCustomizationDrawer()}
                            </View>
                            <View style={{ height: headerHeight, position: 'absolute',flexDirection: 'row', ...openedHeaderStyle, alignItems: 'center' }}>
                                {closeButton}
                                {openedHeaderContent}
                            </View>
                        </View>
                    </View>
                </Animated.View>
            </Animated.View>
        )
    }
}
const styles = {
    closedHeader: {
        shadowOpacity: 1,
        shadowRadius: 2,
        shadowOffset: { height: 0, width: 0 },
        elevation: 3,
        backgroundColor: '#fff',
    },
}
Header.propTypes = {
    headerHeight: PropTypes.number,
    onPressDrawerItem: PropTypes.func,
    renderContent: PropTypes.oneOfType([PropTypes.func,PropTypes.arrayOf(PropTypes.shape({
        text: PropTypes.string,
        color: PropTypes.string,
        iconName: PropTypes.string,
    })), PropTypes.func]),
    openButtonContent: PropTypes.element,
    closeButtonContent: PropTypes.element,
    openButtonStyle: PropTypes.object,
    closeButtonStyle: PropTypes.object,
    openedHeaderStyle: PropTypes.object,
    closedHeaderStyle: PropTypes.object,
    openedHeaderContent: PropTypes.element,
    defaultOpenButtonIconColor: PropTypes.string,
    defaultCloseButtonIconColor: PropTypes.string,
    defaultOpenButtonIconSize: PropTypes.number,
    defaultCloseButtonIconSize: PropTypes.number,
    title: PropTypes.string,
    titleStyle: PropTypes.object,
    openFriction: PropTypes.number,
    openTension: PropTypes.number,
    openSpeed: PropTypes.number,
    openBounciness: PropTypes.number,
    closeFriction: PropTypes.number,
    closeTension: PropTypes.number,
    closeSpeed: PropTypes.number,
    selectedItemTextColor: PropTypes.string,
    unselectedItemTextColor: PropTypes.string,
    closeBounciness: PropTypes.number,
    openButtonPosition: PropTypes.oneOf(['left', 'right']),
    closeButtonPosition: PropTypes.oneOf(['left', 'right']),
};
Header.defaultProps = {
    headerHeight: HEADER_HEIGHT,
    onPressDrawerItem: () => {},
    willOpen: () => {},
    didOpen: () => {},
    willClose: () => {},
    didClose: () => {},
    openButtonStyle: {},
    closeButtonStyle: {},
    selectedItemTextColor: '#2FCACE',
    unselectedItemTextColor: '#fff',
    defaultOpenButtonIconColor: "#373737",
    defaultCloseButtonIconColor: "#000",
    defaultOpenButtonIconSize: 26,
    defaultCloseButtonIconSize: 30,
    openButtonPosition: 'left',
    closeButtonPosition: 'left',
}
