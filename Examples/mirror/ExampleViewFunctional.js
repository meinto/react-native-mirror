import React from 'react'
import {
  View,
  Text, 
  ScrollView,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native'


const Ex = () => {
  return (
    <View style={styles.container}>
      <ScrollView>
        {[
          ['#0288D1', '#03A9F4', '#B3E5FC'],
          ['#303F9F', '#3F51B5', '#C5CAE9'],
          ['#0097A7', '#00BCD4', '#B2EBF2'],
          ['#5D4037', '#795548', '#D7CCC8'],
        ].map((colors, i) => {
          return (
            <ScrollView
              key={i}
              horizontal={true}
              pagingEnabled={true}
              contentContainerStyle={styles.innerScrollView}
            >
              {colors.map((color, pageIndex) => {
                return (
                  <View
                    key={pageIndex}
                    style={[styles.pageStyle, {
                      backgroundColor: color,
                    }]}
                  >
                    <TouchableWithoutFeedback>
                      <View
                        ref={node => {
                          this.references['ref-' + i + '-' + pageIndex] = node
                        }}
                        style={styles.button}
                      >
                        <Text style={styles.text}>{'PRESS ME!!!'}</Text>
                      </View>
                    </TouchableWithoutFeedback>
                  </View>
                )
              })}
            </ScrollView>
          )
        })}
      </ScrollView>
    </View>
  )
}

const PADDING = 10
const BORDER = 1

const styles = {
  container: {
    borderWidth: BORDER,
    borderColor: '#212121',
    padding: PADDING,
  },
  innerScrollView: {
    height: Dimensions.get('window').height / 2 - PADDING - 24,
  },
  pageStyle: {
    width: Dimensions.get('window').width / 2 - PADDING * 2 - BORDER * 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    borderRadius: 2,
    padding: PADDING,
  },
  text: {
    color: '#fefefe',
  },
}

export default Ex