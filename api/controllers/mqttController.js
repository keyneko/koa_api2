const aedes = require('aedes')()
const Sensor = require('../models/sensor')
const SensorRecord = require('../models/sensorRecord')
// const { mqtt: logger } = require('../utils/logger')
// const { broadcastMessage } = require('../utils/socket')

async function authenticate(client, username, password, callback) {
  try {
    const apiKey = password.toString()
    const sensor = await Sensor.findByPk(client.id)

    if (sensor && sensor.apiKey === apiKey) {
      callback(null, true)
    } else {
      console.info(
        'MQTT authentication failed: Sensor not found or apiKey error',
      )

      callback(
        {
          returnCode: 4,
          returnMessage: 'Authentication failed',
        },
        false,
      )
    }
  } catch (error) {
    callback(error, false)
    console.error(error.message)
  }
}

async function updateOnlineStatus(sensorId, isOnline) {
  try {
    // Update the Sensor model's isOnline field
    const result = await Sensor.update(
      { isOnline },
      { where: { id: sensorId } },
    )
    console.info(sensorId + ' ' + (isOnline ? 'online' : 'offline'))
  } catch (error) {
    console.error('Error updating sensor online status: ')
    console.error(error.message)
  }
}

async function onClientConnected(client) {
  console.info('\n\nClient connected: ' + client.id)
  await updateOnlineStatus(client.id, true)
}

async function onClientDisconnect(client) {
  console.info('Client disconnected: ' + client.id)
  await updateOnlineStatus(client.id, false)
}

async function onSubscribe(subscriptions, client) {
  console.info('Client subscribed to: ')
  console.info(JSON.stringify(subscriptions))

  try {
    const sensor = await Sensor.findByPk(client.id)

    if (!sensor) {
      console.error('Sensor not found for client: ' + client.id)
      return
    }

    const existingSubscriptions = sensor.subscriptions || []

    subscriptions.forEach((newSub) => {
      const existingSubIndex = sensor.subscriptions.findIndex(
        (existingSub) => existingSub.topic === newSub.topic,
      )

      if (existingSubIndex !== -1) {
        existingSubscriptions[existingSubIndex] = newSub
      } else {
        existingSubscriptions.push(newSub)
      }
    })

    await Sensor.update(
      {
        subscriptions: existingSubscriptions,
      },
      {
        where: { id: client.id },
      },
    )

    // Respond to the client with the granted QoS
    aedes.publish({
      topic: '$SYS/' + client.id + '/granted',
      payload: JSON.stringify(subscriptions),
    })
  } catch (error) {
    console.error('Error handling subscribe: ')
    console.error(error.message)
  }
}

async function onUnsubscribe(subscriptions, client) {
  console.info('Client unsubscribed to: ')
  console.info(JSON.stringify(subscriptions))

  try {
    const sensor = await Sensor.findByPk(client.id)

    if (!sensor) {
      console.error('Sensor not found for client: ' + client.id)
      return
    }

    const existingSubscriptions = sensor.subscriptions || []

    subscriptions.forEach((unsubscribeTopic) => {
      const existingSubIndex = existingSubscriptions.findIndex(
        (existingSub) => existingSub.topic === unsubscribeTopic,
      )

      if (existingSubIndex !== -1) {
        existingSubscriptions.splice(existingSubIndex, 1)
      }
    })

    await Sensor.update(
      {
        subscriptions: existingSubscriptions,
      },
      {
        where: { id: client.id },
      },
    )
  } catch (error) {
    console.error('Error handling unsubscribe: ')
    console.error(error.message)
  }
}

async function onPublish(packet, client) {
  const topic = packet.topic
  console.info(`Received topic ${topic}`)

  if (client != null || client != undefined) {
    console.info(`Received from client ${client.id}: `)
    console.info(packet.payload.toString())

    /**
     * ===========================================
     * Terminal sensor category judgment
     */

    // Receive dht11 sensor status data
    if (topic.startsWith('dht11/status')) {
      processDht11Data(client, packet)
    }

    // Receive rgb led sensor status data
    if (topic.startsWith('rgb_led/status')) {
      processRgbLedData(client, packet)
    }
  }
}

async function publish(sensorId, packet) {
  try {
    // Publish a message to a client
    aedes.publish({
      qos: 0,
      retain: false,
      ...packet,
    })
  } catch (error) {
    console.error('Error publish data to client: ')
    console.error(error.message)
  }
}

/**
 * =============================================================
 * Data processing methods for various types of terminal sensors
 */

async function processDht11Data(client, packet) {
  try {
    const sensorId = client.id
    const payload = packet.payload.toString()
    let status

    try {
      status = JSON.parse(payload)
    } catch (error) {
      status = payload
    }

    const record = await SensorRecord.create({
      sensorId,
      status,
    })

    // broadcastMessage('newSensorDataArrived', payload)

    console.info(`Status data saved for client ${sensorId}`)
  } catch (error) {
    console.error('Error processing MQTT client status data: ')
    console.error(error.message)
  }
}

async function processRgbLedData(client, packet) {
  try {
    const sensorId = client.id
    const payload = packet.payload.toString()
    const status = payload

    const record = await SensorRecord.create({
      sensorId,
      status,
    })

    console.info(`Status data saved for client ${sensorId}`)
  } catch (error) {
    console.error('Error processing MQTT client status data: ')
    console.error(error.message)
  }
}

module.exports = {
  aedes,
  authenticate,
  onClientConnected,
  onClientDisconnect,
  onSubscribe,
  onUnsubscribe,
  onPublish,
  publish,
}
