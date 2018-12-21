import React from "react"

import { ApolloProvider, Mutation } from "react-apollo"
import ApolloClient, { gql } from "apollo-boost"
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Picker,
  Button,
} from "react-native"
import { Font } from "expo"
import { createIconSet } from "@expo/vector-icons"
import glyphMap from "../assets/fonts/glyphmap.json"
const CustomIcon = createIconSet(glyphMap, "font-awesome-pro")

const client = new ApolloClient({
  uri: "https://eu1.prisma.sh/alex-alexeev/lifestat-server/dev",
})

const FEED_QUERY = gql`
  query FeedQuery {
    feed {
      id
      text
      title
      isPublished
    }
  }
`
const CREATE_LOG_MUTATION = gql`
  mutation createLog($data: LifeLogCreateInput!) {
    createLifeLog(data: $data) {
      id
      motivation
      energy
      focus
    }
  }
`

export default class App extends React.Component {
  state = {
    fontLoaded: false,
    energy: "0",
    focus: "0",
    motivation: "0",
    isPickerShown: false,
    icon: "none",
    isSubmitted: false,
    recordsToday: 0,
  }
  async componentDidMount() {
    await Font.loadAsync({
      "font-awesome-pro": require("../assets/fonts/fa-solid-900.ttf"),
    })
    this.setState({ fontLoaded: true })
  }
  _onPressStat = icon => {
    this.setState({ isPickerShown: true, icon })
  }

  render() {
    const { motivation, energy, focus } = this.state
    return this.state.fontLoaded ? (
      <ApolloProvider client={client}>
        <View
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignContent: "center",
          }}
        >
          <View
            style={{
              display: "flex",
              alignSelf: "center",
              width: 200,
            }}
          >
            {this.state.recordsToday < 10 ? (
              <Text
                style={{ textAlign: "center", fontSize: 20, marginBottom: 30 }}
              >
                Submit {10 - this.state.recordsToday} more records to get your
                statistics
              </Text>
            ) : (
              <Text
                style={{ textAlign: "center", fontSize: 20, marginBottom: 30 }}
              >
                Chill out my dude, I need to analyze the data and will send you
                a notification when it is done.
              </Text>
            )}
          </View>
          {this.state.isSubmitted ? (
            <View
              style={{
                alignSelf: "center",
                display: "flex",
                width: 200,
              }}
            >
              <Text style={{ textAlign: "center" }}>
                Current status is sent to database, you will receive a
                notification to add next record in one hour, dude.
              </Text>
              <View style={{ alignItems: "center" }}>
                <TouchableOpacity
                  onPress={() => {
                    this.setState({ isSubmitted: false })
                  }}
                  style={{ marginTop: 20 }}
                >
                  <Text style={{ fontSize: 24, color: "#7200FF" }}>
                    I dont wanna wait!
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : !this.state.isPickerShown ? (
            <View>
              <View
                style={{
                  display: "flex",
                  alignSelf: "center",
                  width: 200,
                }}
              >
                <Text
                  style={{ textAlign: "center", marginBottom: 50, width: 200 }}
                >
                  Record your current energy, motivation and focus levels
                </Text>
              </View>
              <View
                style={{
                  justifyContent: "space-evenly",
                  flexDirection: "row",
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    this._onPressStat("energy")
                  }}
                >
                  <View
                    style={{
                      alignItems: "center",
                      height: 100,
                      justifyContent: "space-evenly",
                    }}
                  >
                    <CustomIcon name="battery-bolt" size={64} color="#9C4CFF" />
                    <Text style={styles.value}>{this.state.energy}</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    this._onPressStat("motivation")
                  }}
                >
                  <View
                    style={{
                      alignItems: "center",
                      height: 100,
                      justifyContent: "space-evenly",
                    }}
                  >
                    <CustomIcon name="fire" size={64} color="#7200FF" />
                    <Text style={styles.value}>{this.state.motivation}</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    this._onPressStat("focus")
                  }}
                >
                  <View
                    style={{
                      alignItems: "center",
                      height: 100,
                      justifyContent: "space-evenly",
                    }}
                  >
                    <CustomIcon name="eye" size={64} color="#5B00CC" />
                    <Text style={styles.value}>{this.state.focus}</Text>
                  </View>
                </TouchableOpacity>
              </View>
              <View style={{ alignItems: "center", marginTop: 30 }}>
                <Mutation mutation={CREATE_LOG_MUTATION}>
                  {addLog => (
                    <TouchableOpacity
                      onPress={() => {
                        addLog({
                          variables: {
                            data: {
                              motivation: Number(motivation),
                              energy: Number(energy),
                              focus: Number(focus),
                            },
                          },
                        })
                        this.setState({
                          isSubmitted: true,
                          recordsToday: this.state.recordsToday + 1,
                          energy: "0",
                          motivation: "0",
                          focus: "0",
                        })
                      }}
                    >
                      <Text style={{ fontSize: 24, color: "#7200FF" }}>
                        Submit
                      </Text>
                    </TouchableOpacity>
                  )}
                </Mutation>
              </View>
            </View>
          ) : (
            <View style={styles.bottom}>
              <Text>Set your current {this.state.icon} level</Text>
              <Picker
                selectedValue={this.state[this.state.icon]}
                style={{ height: 100, width: "100%" }}
                onValueChange={(itemValue, itemIndex) =>
                  this.setState({
                    [this.state.icon]: itemValue,
                    isPickerShown: false,
                  })
                }
              >
                {Array.from(Array(11).keys()).map((val: number, index) => (
                  <Picker.Item key={index} label={val.toString()} value={val} />
                ))}
              </Picker>
            </View>
          )}
        </View>
      </ApolloProvider>
    ) : null
  }
}

const styles = StyleSheet.create({
  bottom: {
    marginBottom: 120,
    alignItems: "center",
  },
  value: {
    fontSize: 20,
  },
})
