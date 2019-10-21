/*jshint esversion: 8*/

(() => {
  'use strict';

  module.exports.schema = {
    id: '/ws/darksky/model/dataPoint',
    title: "Data Point",
    description: "Information of a particular weather phenomenon",
    "$schema": "http://json-schema.org/draft-04/schema#",
    type: 'object',
    properties: {
      apparentTemperature: {
        type: 'number',
        description: 'The apparent (or “feels like”) temperature in degrees Fahrenheit.'
      },
      apparentTemperatureHigh: {
        type: 'number',
        description: 'The daytime high apparent temperature.'
      },
      apparentTemperatureHighTime: {
        format: 'date-time',
        description: 'The UNIX time representing when the daytime high apparent temperature occurs.'
      },
      apparentTemperatureLow: {
        type: 'number',
        description: 'The overnight low apparent temperature.'
      },
      apparentTemperatureLowTime: {
        format: 'date-time',
        description: 'The UNIX time representing when the overnight low apparent temperature occurs.'
      },
      apparentTemperatureMax: {
        type: 'number',
        description: 'The maximum apparent temperature during a given date.'
      },
      apparentTemperatureMaxTime: {
        format: 'date-time',
        description: 'The UNIX time representing when the maximum apparent temperature during a given date occurs.'
      },
      apparentTemperatureMin: {
        type: 'number',
        description: 'The minimum apparent temperature during a given date.'
      },
      apparentTemperatureMinTime: {
        format: 'date-time',
        description: 'The UNIX time representing when the minimum apparent temperature during a given date occurs.'
      },
      cloudCover: {
        type: 'number',
        description: 'The percentage of sky occluded by clouds.',
        minimum: 0,
        maximum: 1
      },
      dewPoint: {
        type: 'number',
        description: 'The dew point in degrees Fahrenheit.'
      },
      humidity: {
        type: 'number',
        description: 'The relative humidity.',
        minimum: 0,
        maximum: 1
      },
      icon: {
        type: 'string',
        description: 'A machine-readable text summary of this data point, suitable for selecting an icon for display.',
        enum: [
          "clear-day",
          "clear-night",
          "rain",
          "snow",
          "sleet",
          "wind",
          "fog",
          "cloudy",
          "partly-cloudy-day",
          "partly-cloudy-night"
        ]
      },
      moonPhase: {
        type: 'number',
        description: 'The fractional part of the lunation number during the given day: a value of 0 corresponds to a new moon, 0.25 to a first quarter moon, 0.5 to a full moon, and 0.75 to a last quarter moon. (The ranges in between these represent waxing crescent, waxing gibbous, waning gibbous, and waning crescent moons, respectively.)',
        minimum: 0,
        maximum: 1
      },
      nearestStormBearing: {
        type: 'number',
        description: 'The approximate direction of the nearest storm in degrees, with true north at 0° and progressing clockwise. (If nearestStormDistance is zero, then this value will not be defined.)',
        minimum: 0,
        maximum: 360
      },
      nearestStormDistance: {
        type: 'number',
        description: 'The approximate distance to the nearest storm in miles. (A storm distance of 0 doesn’t necessarily refer to a storm at the requested location, but rather a storm in the vicinity of that location.)'
      },
      ozone: {
        type: 'number',
        description: 'The columnar density of total atmospheric ozone at the given time in Dobson units.'
      },
      precipAccumulation: {
        type: 'number',
        description: 'The amount of snowfall accumulation expected to occur, in inches. (If no snowfall is expected, this property will not be defined.)'
      },
      precipIntensity: {
        type: 'number',
        description: 'The intensity (in inches of liquid water per hour) of precipitation occurring at the given time. This value is conditional on probability (that is, assuming any precipitation occurs at all).'
      },
      precipIntensityError: {
        type: 'number',
        description: 'The standard deviation of the distribution of precipIntensity. (We only return this property when the full distribution, and not merely the expected mean, can be estimated with accuracy.)'
      },
      precipIntensityMax: {
        type: 'number',
        description: 'The maximum value of precipIntensity during a given day.'
      },
      precipIntensityMaxTime: {
        format: 'date-time',
        description: 'The UNIX time of when precipIntensityMax occurs during a given day.'
      },
      precipProbability: {
        type: 'number',
        description: 'The probability of precipitation occurring, between 0 and 1, inclusive.',
        minimum: 0,
        maximum: 1
      },
      precipType: {
        type: 'string',
        description: 'The type of precipitation occurring at the given time.',
        enum: [
          "rain",
          "snow",
          "sleet"
        ]
      },
      pressure: {
        type: 'number',
        description: 'The sea-level air pressure in millibars.'
      },
      summary: {
        type: 'string',
        description: 'A human-readable text summary of this data point.'
      },
      sunriseTime: {
        format: 'date-time',
        description: 'The UNIX time of when the sun will rise during a given day.'
      },
      sunsetTime: {
        format: 'date-time',
        description: 'The UNIX time of when the sun will set during a given day.'
      },
      temperature: {
        type: 'number',
        description: 'The air temperature in degrees Fahrenheit.'
      },
      temperatureHigh: {
        type: 'number',
        description: 'The daytime high temperature.'
      },
      temperatureHighTime: {
        format: 'date-time',
        description: 'The UNIX time representing when the daytime high temperature occurs.'
      },
      temperatureLow: {
        type: 'number',
        description: 'The overnight low temperature.'
      },
      temperatureLowTime: {
        format: 'date-time',
        description: 'The UNIX time representing when the overnight low temperature occurs.'
      },
      temperatureMax: {
        type: 'number',
        description: 'The maximum temperature during a given date.'
      },
      temperatureMaxTime: {
        format: 'date-time',
        description: 'The UNIX time representing when the maximum temperature during a given date occurs.'
      },
      temperatureMin: {
        type: 'number',
        description: 'The minimum temperature during a given date.'
      },
      temperatureMinTime: {
        format: 'date-time',
        description: 'The UNIX time representing when the minimum temperature during a given date occurs.'
      },
      time: {
        format: 'date-time',
        description: 'The UNIX time at which this data point begins. minutely data point are always aligned to the top of the minute, hourly data point objects to the top of the hour, and daily data point objects to midnight of the day, all according to the local time zone.'
      },
      uvIndex: {
        type: 'number',
        description: 'The UV index.'
      },
      uvIndexTime: {
        format: 'date-time',
        description: 'The UNIX time of when the maximum uvIndex occurs during a given day.'
      },
      visibility: {
        type: 'number',
        description: 'The average visibility in miles.',
        minimum: 0,
        maximum: 10
      },
      windBearing: {
        type: 'number',
        description: 'The direction that the wind is coming from in degrees, with true north at 0° and progressing clockwise. (If windSpeed is zero, then this value will not be defined.)',
        minimum: 0,
        maximum: 360
      },
      windGust: {
        type: 'number',
        description: 'The wind gust speed in miles per hour.'
      },
      windGustTime: {
        format: 'date-time',
        description: 'The time at which the maximum wind gust speed occurs during the day.'
      },
      windSpeed: {
        type: 'number',
        description: 'The wind speed in miles per hour.'
      }
    },
    additionalProperties: false
  };
})();